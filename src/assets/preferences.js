(() => {
  'use strict';
  const root = document.documentElement;
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const themeKey = 'afe.home.theme';
  const languageKey = 'afe.home.language';
  const zh = root.lang.startsWith('zh');
  function read(key) {
    try { return localStorage.getItem(key); } catch { return null; }
  }
  function save(key, value) {
    try { localStorage.setItem(key, value); } catch { /* The current document still changes. */ }
  }
  let chosen = read(themeKey);
  let button;
  function apply() {
    const dark = chosen === 'dark' || (chosen !== 'light' && media.matches);
    root.dataset.theme = dark ? 'dark' : 'light';
    document.querySelector('meta[name="theme-color"]').content = dark ? '#20372b' : '#f6f4ed';
    if (button) {
      const label = dark ? (zh ? '切换到浅色模式' : 'Switch to light mode') : (zh ? '切换到深色模式' : 'Switch to dark mode');
      button.title = label;
      button.setAttribute('aria-label', label);
    }
    window.dispatchEvent(new Event('afe:themechange'));
  }
  // Set the palette before the first stylesheet paints, including on a direct brief URL.
  apply();
  media.addEventListener('change', apply);
  window.addEventListener('storage', event => {
    if (event.key === themeKey || event.key === null) { chosen = read(themeKey); apply(); }
  });
  window.addEventListener('pageshow', event => {
    if (event.persisted) { chosen = read(themeKey); apply(); }
  });

  if (root.hasAttribute('data-language-entry') && read(languageKey) === 'zh' && /^https?:$/.test(location.protocol)) {
    const target = new URL('./zh/', location.href);
    target.search = location.search;
    target.hash = location.hash;
    location.replace(target.href);
    return;
  }

  document.addEventListener('DOMContentLoaded', () => {
    button = document.querySelector('[data-theme-toggle]');
    button.hidden = false;
    button.addEventListener('click', () => {
      chosen = root.dataset.theme === 'dark' ? 'light' : 'dark';
      save(themeKey, chosen);
      apply();
    });
    apply();
    const language = document.querySelector('[data-language]');
    const translationPath = language.getAttribute('href');
    function updateLanguageLink() {
      const address = window.afePreviewAddress || location;
      language.setAttribute('href', translationPath + address.search + address.hash);
    }
    function saveLanguage() { updateLanguageLink(); save(languageKey, language.dataset.language); }
    updateLanguageLink();
    for (const event of ['focus', 'pointerdown', 'contextmenu']) language.addEventListener(event, updateLanguageLink);
    language.addEventListener('click', saveLanguage);
    window.addEventListener('popstate', updateLanguageLink);
    window.addEventListener('hashchange', updateLanguageLink);
    window.addEventListener('afe:addresschange', updateLanguageLink);
  });
})();
