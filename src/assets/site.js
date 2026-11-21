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
  const bibtex = decodeURIComponent(citationDownload.getAttribute('href').split(',')[1]);
  const status = document.querySelector('[data-citation-status]');
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = 'Copy citation';
  button.title = 'Copy BibTeX citation';
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
        citationDownload.textContent = 'Download .bib';
        button.replaceWith(citationDownload);
        citationDownload.focus({preventScroll:true});
        status.textContent = 'Clipboard unavailable. Download the BibTeX citation.';
        citationDownload.click();
        return;
      }
    }
    clearTimeout(feedbackTimer);
    button.textContent = 'Copied';
    status.textContent = 'Citation copied to clipboard.';
    feedbackTimer = setTimeout(() => {
      button.textContent = 'Copy citation';
      status.textContent = '';
    }, 2400);
  });
}
