// Directory links also work when a downloaded copy is opened directly from disk.
if (location.protocol === 'file:') {
  const localDocument = anchor => {
    if (!anchor.hasAttribute('href')) return;
    const url = new URL(anchor.href, location.href);
    if (url.protocol==='file:' && url.pathname.endsWith('/')) {
      url.pathname += 'index.html';
      anchor.href=url;
    }
  };
  document.querySelectorAll('a[href]').forEach(localDocument);
  document.addEventListener('click', event => {
    const anchor=event.target.closest('a[href]');
    if(anchor) localDocument(anchor);
  }, true);
}

// A plain download also serves readers with scripting disabled.
const citationDownload = document.querySelector('[data-citation]');
if (citationDownload) {
  const zh = document.documentElement.lang.startsWith('zh');
  const copy = zh ? '复制引用' : 'Copy citation';
  const bibtex = decodeURIComponent(citationDownload.getAttribute('href').split(',')[1]);
  const status = document.querySelector('[data-citation-status]');
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = copy;
  button.title = zh ? '复制 BibTeX 引用' : 'Copy BibTeX citation';
  citationDownload.replaceWith(button);
  let feedbackTimer;

  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(bibtex);
    } catch {
      const selection = document.createElement('textarea');
      selection.value = bibtex;
      selection.readOnly = true;
      selection.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none';
      document.body.append(selection);
      selection.select();
      let copied = false;
      try { copied = document.execCommand('copy'); } catch { /* The download is still available. */ }
      selection.remove();
      button.focus({preventScroll:true});
      if (!copied) {
        citationDownload.textContent = zh ? '下载 .bib' : 'Download .bib';
        button.replaceWith(citationDownload);
        citationDownload.focus({preventScroll:true});
        status.textContent = zh ? '剪贴板不可用，请下载 BibTeX 引用。' : 'Clipboard unavailable. Download the BibTeX citation.';
        citationDownload.click();
        return;
      }
    }
    clearTimeout(feedbackTimer);
    button.textContent = zh ? '已复制' : 'Copied';
    status.textContent = zh ? '已将引用复制到剪贴板。' : 'Citation copied to clipboard.';
    feedbackTimer = setTimeout(() => {
      button.textContent = copy;
      status.textContent = '';
    }, 2400);
  });
}

const advisorViewport = document.querySelector('.cc-expert-viewport');
if (advisorViewport) {
  const rail = advisorViewport.querySelector('.cc-expert-rail');
  const list = rail.firstElementChild;
  const controls = advisorViewport.closest('.cc-expertise').querySelector('.cc-expert-controls');
  const motion = controls.querySelector('[data-expert-motion]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  // Only the original list participates in keyboard and screen-reader navigation.
  const mirror = list.cloneNode(true);
  mirror.setAttribute('aria-hidden', 'true');
  mirror.querySelectorAll('a').forEach(link => { link.tabIndex = -1; });
  list.after(mirror);
  controls.hidden = false;
  advisorViewport.setAttribute('data-sliding', '');

  const speed = 22; // pixels per second
  let animation;
  let enabled = true;
  let visible = false;
  let hovered = false;

  function updateMotion() {
    const cycle = list.getBoundingClientRect().width;
    const active = enabled && visible && !reduced.matches && !document.hidden &&
      !hovered && !advisorViewport.contains(document.activeElement);
    if (active && !animation) {
      const offset = advisorViewport.scrollLeft % cycle;
      advisorViewport.scrollLeft = 0;
      animation = rail.animate([{transform:'translateX(0)'}, {transform:'translateX(-50%)'}],
        {duration: cycle / speed * 1000, iterations: Infinity});
      animation.currentTime = offset / speed * 1000;
    } else if (!active && animation) {
      const offset = advisorViewport.getBoundingClientRect().left - rail.getBoundingClientRect().left;
      animation.cancel();
      animation = null;
      advisorViewport.scrollLeft = offset % cycle;
    }
  }

  function setEnabled(value) {
    enabled = value;
    motion.toggleAttribute('data-paused', !enabled);
    motion.title = enabled ? motion.dataset.pause : motion.dataset.play;
    motion.setAttribute('aria-label', motion.title);
    updateMotion();
  }

  function step(direction) {
    setEnabled(false);
    const cycle = list.getBoundingClientRect().width;
    const interval = cycle / list.children.length;
    const offset = advisorViewport.scrollLeft % cycle;
    const index = direction > 0 ? Math.floor((offset + 1) / interval) + 1 : Math.ceil((offset - 1) / interval) - 1;
    // From the first profile, step back through the join between the two lists.
    const start = index < 0 ? cycle : 0;
    advisorViewport.scrollLeft = start + offset;
    advisorViewport.scrollTo({left: start + index * interval, behavior: reduced.matches ? 'instant' : 'smooth'});
  }

  function applyMotionPreference() {
    motion.hidden = reduced.matches;
    updateMotion();
  }
  controls.querySelector('[data-expert-prev]').addEventListener('click', () => step(-1));
  controls.querySelector('[data-expert-next]').addEventListener('click', () => step(1));
  motion.addEventListener('click', () => setEnabled(!enabled));
  advisorViewport.addEventListener('pointerenter', event => { hovered = event.pointerType === 'mouse'; updateMotion(); });
  advisorViewport.addEventListener('pointerleave', () => { hovered = false; updateMotion(); });
  advisorViewport.addEventListener('pointerdown', event => { if (event.pointerType === 'touch') setEnabled(false); });
  advisorViewport.addEventListener('wheel', event => { if (event.deltaX || event.shiftKey) setEnabled(false); }, {passive:true});
  advisorViewport.addEventListener('focusin', updateMotion);
  advisorViewport.addEventListener('focusout', () => queueMicrotask(updateMotion));
  advisorViewport.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    step(event.key === 'ArrowLeft' ? -1 : 1);
  });
  document.addEventListener('visibilitychange', updateMotion);
  reduced.addEventListener('change', applyMotionPreference);
  applyMotionPreference();
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; updateMotion(); }).observe(advisorViewport);
}
