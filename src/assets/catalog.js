(() => {
  'use strict';
  const root = document.getElementById('catalogue');
  if (!root) return;
  const form = root.querySelector('form');
  const counter = root.querySelector('[data-results]');
  const clear = root.querySelector('.catalog-status [data-clear]');
  const empty = root.querySelector('.catalog-empty');
  const columns = root.querySelector('.catalog-columns');
  const rows = [...root.querySelectorAll('.catalog-row')].map(element => ({
    element, text: element.textContent.replace(/\s+/g,' ').toLocaleLowerCase('en'),
  }));
  // The one-file edition keeps the visible address in its outer document.
  // A browser opening the unpacked site also allows local history in fragments.
  function params() {
    const localFragment=location.protocol==='file:' && location.hash.startsWith('#?');
    return new URLSearchParams(window.afePreviewAddress?.search ?? (localFragment ? location.hash.slice(2) : location.search));
  }
  const levelNames = {1:'Scientific workflows',2:'Scientific breakthroughs',3:'Major scientific breakthroughs',research:'AFE-research'};
  let requestedLevel = '';
  function readQuery() {
    const query = params();
    for (const field of ['q','domain','workflow','level']) {
      const control = form.elements.namedItem(field);
      if (!control) continue;
      const value = query.get(field) || '';
      control.value = control.options && ![...control.options].some(o=>o.value===value) ? '' : value;
    }
    const level = query.get('level');
    requestedLevel = Object.hasOwn(levelNames,level) ? level : '';
  }
  function apply() {
    const q = form.elements.q.value.toLocaleLowerCase('en').trim().split(/\s+/).filter(Boolean);
    const {domain,workflow} = form.elements;
    const level = form.elements.namedItem('level')?.value || requestedLevel;
    let count = 0;
    for (const {element,text} of rows) {
      const item = element.dataset;
      const inLevel = !level || (level === 'research' ? ['2','3'].includes(item.level) : item.level===level);
      const match = inLevel && (!domain.value || domain.value===item.domain) &&
        (!workflow.value || workflow.value===item.workflow) && q.every(word=>text.includes(word));
      element.hidden = !match;
      if (match) count++;
    }
    counter.textContent = count + (count===1 ? ' task' : ' tasks');
    clear.hidden = !(q.length || domain.value || workflow.value || level);
    empty.hidden = count>0;
    columns.hidden = !count;
    if (!count) {
      const focus = level && !q.length && !domain.value && !workflow.value;
      empty.querySelector('h2').textContent = focus ? levelNames[level] : 'No matching tasks';
      empty.querySelector('p').textContent = focus
        ? 'This list includes tasks with a published level designation. Explore the full catalogue by field or research activity.'
        : 'Try another search term or clear the filters to return to the collection.';
    }
  }
  function writeQuery(push) {
    const next = params();
    for (const field of ['q','domain','workflow','level']) {
      const control = form.elements.namedItem(field);
      const value = control ? control.value.trim() : (field==='level' ? requestedLevel : '');
      if (value) next.set(field,value);
      else next.delete(field);
    }
    const search=next.toString() ? '?' + next.toString() : '';
    if(window.afePreviewAddress) {
      window.afePreviewAddress.setSearch(search,push);
    } else {
      const url=new URL(location.href);
      if(url.protocol==='file:') url.hash='?'+next;
      else url.search=search;
      if(url.href!==location.href) history[push ? 'pushState' : 'replaceState'](null,'',url);
    }
    apply();
  }
  form.addEventListener('input',event=>{
    if (event.target.name==='q') writeQuery(false);
  });
  form.addEventListener('change',event=>{
    if(event.target.tagName==='SELECT') {
      if(event.target.name==='level') requestedLevel=event.target.value;
      writeQuery(true);
    }
  });
  form.addEventListener('submit',event=>{event.preventDefault();writeQuery(false);});
  for(const link of root.querySelectorAll('[data-clear]')) link.addEventListener('click',event=>{
    if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey) return;
    event.preventDefault();form.reset();requestedLevel='';writeQuery(true);form.elements.q.focus();
  });
  window.addEventListener('popstate',()=>{readQuery();apply();});
  form.hidden=false;readQuery();apply();
})();
