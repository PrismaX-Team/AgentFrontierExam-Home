(() => {
  'use strict';
  const root = document.getElementById('catalogue');
  if (!root) return;
  const form = root.querySelector('form');
  const counter = root.querySelector('[data-results]');
  const clear = root.querySelector('.catalog-status [data-clear]');
  const empty = root.querySelector('.catalog-empty');
  const columns = root.querySelector('.catalog-columns');
  const matrix = root.querySelector('.task-matrix');
  const matrixTotal = root.querySelector('[data-matrix-total]');
  const heading = root.querySelector('#directory-heading');
  const cells = [...matrix.querySelectorAll('.matrix-cell')].map(link => ({
    link, group: link.hash.slice(1), zero: link.nextElementSibling,
  }));
  const rows = [...root.querySelectorAll('.catalog-row')].map(element => ({
    element, group: element.closest('.catalog-group').id,
    text: element.textContent.replace(/\s+/g,' ').toLocaleLowerCase('en'),
  }));
  // The one-file edition keeps the visible address in its outer document.
  // A browser opening the unpacked site also allows local history in fragments.
  function params() {
    const localFragment=location.protocol==='file:' && location.hash.startsWith('#?');
    return new URLSearchParams(window.afePreviewAddress?.search ?? (localFragment ? location.hash.slice(2) : location.search));
  }
  const levelNames = {...JSON.parse(root.dataset.levelNames),research:'AFE-research'};
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
    const counts = new Map();
    let count = 0, eligibleCount = 0;
    for (const {element,group,text} of rows) {
      const item = element.dataset;
      const inLevel = !level || (level === 'research' ? ['2','3'].includes(item.level) : item.level===level);
      const eligible = inLevel && q.every(word=>text.includes(word));
      if (eligible) {
        counts.set(group,(counts.get(group) || 0)+1);
        eligibleCount++;
      }
      const match = eligible && (!domain.value || domain.value===item.domain) &&
        (!workflow.value || workflow.value===item.workflow);
      element.hidden = !match;
      if (match) count++;
    }
    // Search and level constrain counts across the whole matrix. Field and activity
    // select an intersection while leaving the other available cells navigable.
    matrixTotal.textContent = eligibleCount === rows.length
      ? rows.length + (rows.length===1 ? ' task' : ' tasks') : eligibleCount + ' of ' + rows.length + ' tasks';
    const cellQuery = params();
    for (const {link,group,zero} of cells) {
      const size = counts.get(group) || 0;
      const field = link.dataset.domain, activity = link.dataset.workflow;
      link.hidden = !size;
      zero.hidden = !!size;
      if (field===domain.value && activity===workflow.value && size) link.setAttribute('aria-current','true');
      else link.removeAttribute('aria-current');
      if (!size) continue;
      link.textContent = size;
      link.setAttribute('aria-label',size + (size===1 ? ' task' : ' tasks') + ' · ' + field + ' · ' + activity);
      cellQuery.set('domain',field);
      cellQuery.set('workflow',activity);
      link.setAttribute('href','?'+cellQuery+'#'+group);
    }
    for (const header of matrix.querySelectorAll('[data-axis-domain]')) {
      header.toggleAttribute('data-selected',header.dataset.axisDomain===domain.value);
    }
    for (const header of matrix.querySelectorAll('[data-axis-workflow]')) {
      header.toggleAttribute('data-selected',header.dataset.axisWorkflow===workflow.value);
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
  function writeQuery(push, group='') {
    const next = params();
    for (const field of ['q','domain','workflow','level']) {
      const control = form.elements.namedItem(field);
      const value = field==='level' ? control?.value || requestedLevel : control.value.trim();
      if (value) next.set(field,value);
      else next.delete(field);
    }
    const search=next.toString() ? '?' + next.toString() : '';
    if(window.afePreviewAddress) {
      window.afePreviewAddress.setSearch(search,push);
    } else {
      const url=new URL(location.href);
      if(url.protocol==='file:') url.hash='?'+next;
      else {
        url.search=search;
        url.hash=group;
      }
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
  matrix.addEventListener('click',event=>{
    const link=event.target.closest('.matrix-cell');
    if(!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    form.elements.domain.value=link.dataset.domain;
    form.elements.workflow.value=link.dataset.workflow;
    writeQuery(true,link.hash);
    heading.focus({preventScroll:true});
    heading.scrollIntoView({block:'start'});
  });
  for(const link of root.querySelectorAll('[data-clear]')) link.addEventListener('click',event=>{
    if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey) return;
    event.preventDefault();form.reset();requestedLevel='';writeQuery(true);form.elements.q.focus();
  });
  window.addEventListener('popstate',()=>{readQuery();apply();});
  root.dataset.filtering='';form.hidden=false;readQuery();apply();
})();
