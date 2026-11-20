(() => {
  'use strict';
  const root=document.getElementById('afe-v01-site-preview');
  const frame=root.querySelector('iframe');
  const archive=JSON.parse(root.querySelector('[data-archive]').textContent);
  const origin='https://afe.invalid';
  let current;

  // This bridge is installed in each freshly mounted document. Ordinary links,
  // browser history, in-page anchors and catalogue filters share the same URL.
  function bridge(route,origin) {
    let base=new URL(route,origin);
    window.afePreviewAddress={
      search:base.search,
      setSearch(search,push) {
        if(base.search===search) return;
        base.search=search;this.search=search;
        parent.postMessage({afePreview:'search',href:base.href,push},'*');
      },
    };
    document.addEventListener('click',event=>{
      const link=event.target.closest('a[href]');
      if(!link || event.defaultPrevented) return;
      const url=new URL(link.getAttribute('href'),base);
      if(url.origin!==origin) {
        if(url.protocol==='https:' || url.protocol==='http:') {link.target='_blank';link.rel='noopener noreferrer';}
        return;
      }
      event.preventDefault();
      parent.postMessage({afePreview:'visit',href:url.href},'*');
    });
    window.addEventListener('DOMContentLoaded',()=>{
      if(base.hash)document.getElementById(decodeURIComponent(base.hash.slice(1)))?.scrollIntoView();
    });
  }
  function mount(path) {
    let url;
    try {url=new URL(path,origin);} catch {url=new URL('/',origin);}
    if(url.origin!==origin || !Object.hasOwn(archive.pages,url.pathname)) url=new URL('/',origin);
    current=url;
    const doc=new DOMParser().parseFromString(archive.pages[url.pathname],'text/html');
    const asset=raw=>new URL(raw,url).pathname;
    for(const link of doc.querySelectorAll('link[rel="stylesheet"]')) {
      const style=doc.createElement('style');style.textContent=archive.css[asset(link.getAttribute('href'))];link.replaceWith(style);
    }
    for(const img of doc.querySelectorAll('img[src]')) {
      img.setAttribute('src',archive.images[asset(img.getAttribute('src'))]);
    }
    const install=doc.createElement('script');
    install.textContent='('+bridge.toString()+')('+JSON.stringify(url.pathname+url.search+url.hash).replaceAll('<','\\u003c')+','+JSON.stringify(origin)+')';
    doc.body.append(install);
    for(const file of [...doc.querySelectorAll('script[src]')]) {
      const code=doc.createElement('script');code.textContent=archive.js[asset(file.getAttribute('src'))];file.remove();doc.body.append(code);
    }
    frame.title=doc.title;frame.srcdoc='<!doctype html>'+doc.documentElement.outerHTML;
    if(document.documentElement.hasAttribute('data-afe-file'))document.title=doc.title;
  }
  function record(url,push) {
    const route=url.pathname+url.search+url.hash;
    try {history[push?'pushState':'replaceState'](null,'','#'+route);} catch { /* An inline preview can disallow history changes. */ }
  }
  window.addEventListener('message',event=>{
    if(event.source!==frame.contentWindow || !['visit','search'].includes(event.data?.afePreview)) return;
    let url;try {url=new URL(event.data.href,origin);} catch {return;}
    if(url.origin!==origin || !Object.hasOwn(archive.pages,url.pathname)) return;
    if(event.data.afePreview==='search') {
      if(current.pathname===url.pathname){record(url,event.data.push);current=url;}
    } else {
      record(url,true);mount(url.pathname+url.search+url.hash);
    }
  });
  const locationRoute=()=>location.hash.startsWith('#/')?location.hash.slice(1):'/';
  window.addEventListener('popstate',()=>mount(locationRoute()));
  mount(locationRoute());
})();
