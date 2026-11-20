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
