(() => {
  'use strict';
  const root = document.getElementById('catalogue');
  if (!root) return;
  const form = root.querySelector('.catalog-controls');
  const counter = root.querySelector('[data-results]');
  const clear = root.querySelector('.catalog-status [data-clear]');
  const empty = root.querySelector('.catalog-empty');
  const pageList = root.querySelector('[data-page-list]');
  const pager = root.querySelector('.catalog-pager');
  const pageSize = 6;
  const matrix = root.querySelector('.task-matrix');
  const matrixTotal = root.querySelector('[data-matrix-total]');
  const heading = root.querySelector('#directory-heading');
  const cells = [...matrix.querySelectorAll('.matrix-cell')].map(link => ({
    link, group: link.hash.slice(1), zero: link.nextElementSibling,
  }));
  const rows = [...root.querySelectorAll('.catalog-row')].map(element => ({
    element, group: element.closest('.catalog-group').id,
    text: [element.querySelector('h3').textContent,element.querySelector('.catalog-copy p').textContent,
      element.dataset.domain,element.dataset.workflow].join(' ').toLocaleLowerCase('en'),
  })).sort((a,b)=>Number(a.element.dataset.order)-Number(b.element.dataset.order));
  // Unscripted visitors read the native intersection groups. With pagination, use
  // the same rows in one title-ordered list. Shared intersections land at its heading.
  pageList.append(...rows.map(row=>row.element));
  const groupAnchors=document.createDocumentFragment();
  for (const group of root.querySelectorAll('.catalog-group')) {
    group.replaceChildren();
    groupAnchors.append(group);
  }
  heading.closest('.directory-heading').before(groupAnchors);
  pageList.hidden=false;
  // The one-file edition keeps the visible address in its outer document.
  // A browser opening the unpacked site also allows local history in fragments.
  function params() {
    const localFragment=location.protocol==='file:' && location.hash.startsWith('#?');
    return new URLSearchParams(window.afePreviewAddress?.search ?? (localFragment ? location.hash.slice(2) : location.search));
  }
  const levelNames = {...JSON.parse(root.dataset.levelNames),research:'AFE-research'};
  let requestedLevel = '';
  let currentPage = 1;
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
    const number = query.get('page');
    currentPage = /^\d+$/.test(number) ? Math.max(1,Number(number)) : 1;
  }

  function setPageParam(query, page) {
    if (page>1) query.set('page',String(page));
    else query.delete('page');
  }

  function displayPager(last, query) {
    pager.hidden=last<=1;
    if (pager.hidden) return;
    const address=new URLSearchParams(query);
    function target(link,page) {
      setPageParam(address,page);
      link.href='?'+address+'#task-directory';
      link.dataset.page=page;
    }
    for (const [link,page] of [[pager.querySelector('[data-previous]'),currentPage-1],[pager.querySelector('[data-next]'),currentPage+1]]) {
      if (page>=1 && page<=last) {
        target(link,page);
        link.removeAttribute('aria-disabled');
      } else {
        link.removeAttribute('href');
        delete link.dataset.page;
        link.setAttribute('aria-disabled','true');
      }
    }
    const numbers=last<=6 ? Array.from({length:last},(_,i)=>i+1)
      : [...new Set([1,currentPage-1,currentPage,currentPage+1,last].filter(n=>n>=1 && n<=last))].sort((a,b)=>a-b);
    const list=pager.querySelector('ol');
    list.replaceChildren();
    let previous=0;
    for (const page of numbers) {
      if (page-previous>1) {
        const gap=document.createElement('li');
        gap.textContent='…';gap.setAttribute('aria-hidden','true');list.append(gap);
      }
      const item=document.createElement('li'), link=document.createElement('a');
      target(link,page);
      link.textContent=page;
      link.setAttribute('aria-label','Page '+page);
      if (page===currentPage) link.setAttribute('aria-current','page');
      item.append(link);list.append(item);previous=page;
    }
  }
  function apply() {
    const q = form.elements.q.value.toLocaleLowerCase('en').trim().split(/\s+/).filter(Boolean);
    const {domain,workflow} = form.elements;
    const level = form.elements.namedItem('level')?.value || requestedLevel;
    const counts = new Map();
    const matches = [];
    let eligibleCount = 0;
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
      element.hidden = true;
      if (match) matches.push(element);
    }
    const count=matches.length, last=Math.max(1,Math.ceil(count/pageSize));
    currentPage=Math.min(currentPage,last);
    const start=(currentPage-1)*pageSize;
    for (const element of matches.slice(start,start+pageSize)) element.hidden=false;
    const query=params();
    const canonical=currentPage>1 ? String(currentPage) : null;
    if (query.get('page')!==canonical || query.getAll('page').length>1) {
      setPageParam(query,currentPage);
      storeQuery(query,false);
    }
    displayPager(last,query);
    // Search and level constrain counts across the whole matrix. Field and activity
    // select an intersection while leaving the other available cells navigable.
    matrixTotal.textContent = eligibleCount === rows.length
      ? rows.length + (rows.length===1 ? ' task' : ' tasks') : eligibleCount + ' of ' + rows.length + ' tasks';
    const cellQuery = new URLSearchParams(query);
    cellQuery.delete('page');
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
    counter.textContent = last>1
      ? (start+1)+'–'+Math.min(start+pageSize,count)+' of '+count+' tasks'
      : count + (count===1 ? ' task' : ' tasks');
    clear.hidden = !(q.length || domain.value || workflow.value || level);
    empty.hidden = count>0;
    if (!count) {
      const focus = level && !q.length && !domain.value && !workflow.value;
      empty.querySelector('h2').textContent = focus ? levelNames[level] : 'No matching tasks';
      empty.querySelector('p').textContent = focus
        ? 'This list includes tasks with a published level designation. Explore the full catalogue by field or research activity.'
        : 'Try another search term or clear the filters to return to the collection.';
    }
  }
  function storeQuery(next,push,group) {
    const search=next.toString() ? '?' + next.toString() : '';
    if(window.afePreviewAddress) {
      window.afePreviewAddress.setSearch(search,push);
    } else {
      const url=new URL(location.href);
      if(url.protocol==='file:') url.hash='?'+next;
      else {
        url.search=search;
        if (group!==undefined) url.hash=group;
      }
      if(url.href!==location.href) history[push ? 'pushState' : 'replaceState'](null,'',url);
    }
  }
  function writeQuery(push, group='', page=1) {
    const next = params();
    for (const field of ['q','domain','workflow','level']) {
      const control = form.elements.namedItem(field);
      const value = field==='level' ? control?.value || requestedLevel : control.value.trim();
      if (value) next.set(field,value);
      else next.delete(field);
    }
    currentPage=page;
    setPageParam(next,page);
    storeQuery(next,push,group);
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
  pager.addEventListener('click',event=>{
    const link=event.target.closest('a[data-page]');
    if(!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    writeQuery(true,'task-directory',Number(link.dataset.page));
    heading.focus({preventScroll:true});
    heading.scrollIntoView({block:'start'});
  });
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
  const initial=params();
  const sharedBriefs=initial.has('page') || (initial.has('domain') && initial.has('workflow'));
  root.dataset.filtering='';form.hidden=false;readQuery();apply();
  if(sharedBriefs && (!location.hash || location.hash==='#task-directory' || location.hash.startsWith('#tasks-') || location.hash.startsWith('#?'))) {
    heading.scrollIntoView({block:'start'});
  }
})();
