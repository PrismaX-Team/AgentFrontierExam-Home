(() => {
  'use strict';
  const root = document.getElementById('catalogue');
  if (!root) return;
  const zh = root.dataset.lang === 'zh';
  const form = root.querySelector('.catalog-controls');
  const counter = root.querySelector('[data-results]');
  const clear = root.querySelector('.catalog-status [data-clear]');
  const empty = root.querySelector('.catalog-empty');
  const pageList = root.querySelector('[data-page-list]');
  const pager = root.querySelector('.catalog-pager');
  const pageSize = 10;
  const matrix = root.querySelector('.task-matrix');
  const matrixTotal = root.querySelector('[data-matrix-total]');
  const heading = root.querySelector('#directory-heading');
  const filters = ['q','domain','workflow','level'];
  const aliases = JSON.parse(root.dataset.typeAliases);
  const levelNames = JSON.parse(root.dataset.levelNames);
  const cells = [...matrix.querySelectorAll('.matrix-cell')].map(link => ({
    link, group: link.hash.slice(1), zero: link.nextElementSibling,
  }));
  const fieldLabels = new Map([...form.elements.domain.options].map(option => [option.value, option.text]));
  const typeLabels = new Map([...form.elements.workflow.options].map(option => [option.value, option.text]));
  const normalize = value => value.normalize('NFKC').toLocaleLowerCase();
  const rows = [...root.querySelectorAll('.catalog-row')].map(element => {
    const {domain,workflow,level} = element.dataset;
    const text = normalize([
      element.querySelector('h3').textContent, element.querySelector('.catalog-copy p').textContent,
      element.dataset.translation, domain, workflow, fieldLabels.get(domain), typeLabels.get(workflow),
      levelNames[level] ? 'L' + level + ' ' + levelNames[level] : '',
    ].join(' '));
    return {element, group:element.closest('.catalog-group').id, text, domain, workflow, level};
  }).sort((a,b)=>Number(a.element.dataset.order)-Number(b.element.dataset.order));

  // Keep native intersection links readable without scripts. Enhanced pagination
  // reuses those same rows in one alphabetical list and retains every anchor.
  pageList.append(...rows.map(row => row.element));
  const anchors = document.createDocumentFragment();
  for (const group of root.querySelectorAll('.catalog-group')) {
    group.replaceChildren();
    anchors.append(group);
  }
  heading.closest('.directory-heading').before(anchors);
  pageList.hidden = false;
  let currentPage = 1;

  function taskCount(n) {
    return zh ? n + ' 道任务' : n + (n === 1 ? ' task' : ' tasks');
  }

  function params() {
    const fileQuery = location.protocol === 'file:' && location.hash.startsWith('#?');
    return new URLSearchParams(window.afePreviewAddress?.search ?? (fileQuery ? location.hash.slice(2) : location.search));
  }

  function readQuery() {
    const query = params();
    for (const key of filters) {
      const control = form.elements.namedItem(key);
      let value = query.get(key) || '';
      if (key === 'workflow' && !typeLabels.has(value) && Object.hasOwn(aliases,value)) value = aliases[value];
      control.value = control.options && ![...control.options].some(option => option.value === value) ? '' : value;
    }
    const number = query.get('page');
    currentPage = /^\d+$/.test(number) ? Math.max(1,Number(number)) : 1;
  }

  function setPage(query,page) {
    if (page > 1) query.set('page',String(page));
    else query.delete('page');
  }

  function queryFromForm() {
    const query = params();
    for (const key of filters) {
      const value = form.elements.namedItem(key).value.trim();
      if (value) query.set(key,value);
      else query.delete(key);
    }
    setPage(query,currentPage);
    return query;
  }

  function storeQuery(query,push,anchor) {
    const search = query.size ? '?' + query : '';
    if (window.afePreviewAddress) {
      window.afePreviewAddress.setSearch(search,push,anchor);
    } else {
      const url = new URL(location.href);
      if (url.protocol === 'file:') url.hash = '?' + query;
      else {
        url.search = search;
        if (anchor !== undefined) url.hash = anchor;
      }
      if (url.href !== location.href) history[push ? 'pushState' : 'replaceState'](null,'',url);
    }
    window.dispatchEvent(new Event('afe:addresschange'));
  }

  function displayPager(last,query) {
    pager.hidden = last <= 1;
    if (pager.hidden) return;
    const address = new URLSearchParams(query);
    function target(link,page) {
      setPage(address,page);
      link.href = '?' + address + '#task-directory';
      link.dataset.page = page;
    }
    for (const [link,page] of [[pager.querySelector('[data-previous]'),currentPage-1],[pager.querySelector('[data-next]'),currentPage+1]]) {
      if (page >= 1 && page <= last) {
        target(link,page);
        link.removeAttribute('aria-disabled');
      } else {
        link.removeAttribute('href');
        delete link.dataset.page;
        link.setAttribute('aria-disabled','true');
      }
    }
    const numbers = last <= 6 ? Array.from({length:last},(_,i)=>i+1)
      : [...new Set([1,currentPage-1,currentPage,currentPage+1,last].filter(n => n >= 1 && n <= last))].sort((a,b)=>a-b);
    const list = pager.querySelector('ol');
    list.replaceChildren();
    let previous = 0;
    for (const page of numbers) {
      if (page - previous > 1) {
        const gap = document.createElement('li');
        gap.textContent = '…';
        gap.setAttribute('aria-hidden','true');
        list.append(gap);
      }
      const item = document.createElement('li'), link = document.createElement('a');
      target(link,page);
      link.textContent = page;
      link.setAttribute('aria-label',zh ? '第 ' + page + ' 页' : 'Page ' + page);
      if (page === currentPage) link.setAttribute('aria-current','page');
      item.append(link);
      list.append(item);
      previous = page;
    }
  }

  function increment(counts,key) {
    counts.set(key,(counts.get(key) || 0) + 1);
  }

  function updateMatrix(query, counts, eligible) {
    const {domain,workflow} = form.elements;
    matrixTotal.textContent = eligible === rows.length ? taskCount(eligible)
      : zh ? taskCount(eligible) + ' / 共 ' + taskCount(rows.length) : eligible + ' of ' + taskCount(rows.length);
    const address = new URLSearchParams(query);
    address.delete('page');
    for (const {link,group,zero} of cells) {
      const size = counts.groups.get(group) || 0;
      const field = link.dataset.domain, type = link.dataset.workflow;
      link.hidden = !size;
      zero.hidden = Boolean(size);
      if (field === domain.value && type === workflow.value && size) link.setAttribute('aria-current','true');
      else link.removeAttribute('aria-current');
      if (!size) continue;
      link.textContent = size;
      link.setAttribute('aria-label',taskCount(size) + ' · ' + link.dataset.axisLabel);
      address.set('domain',field);
      address.set('workflow',type);
      link.setAttribute('href','?' + address + '#' + group);
    }
    for (const header of matrix.querySelectorAll('[data-axis-domain]')) {
      header.toggleAttribute('data-selected',header.dataset.axisDomain === domain.value);
    }
    for (const header of matrix.querySelectorAll('[data-axis-workflow]')) {
      header.toggleAttribute('data-selected',header.dataset.axisWorkflow === workflow.value);
    }
    for (const total of matrix.querySelectorAll('[data-domain-total]')) total.textContent = counts.fields.get(total.dataset.domainTotal) || 0;
    for (const total of matrix.querySelectorAll('[data-workflow-total]')) total.textContent = counts.types.get(total.dataset.workflowTotal) || 0;
    matrix.querySelector('[data-grid-total]').textContent = eligible;
  }

  function apply() {
    const words = normalize(form.elements.q.value).trim().split(/\s+/).filter(Boolean);
    const {domain,workflow,level} = form.elements;
    const counts = {groups:new Map(),fields:new Map(),types:new Map()};
    const matches = [];
    let eligible = 0;
    for (const row of rows) {
      row.element.hidden = true;
      const inLevel = !level.value || (level.value === 'research' ? ['2','3'].includes(row.level) : row.level === level.value);
      if (!inLevel || !words.every(word => row.text.includes(word))) continue;
      increment(counts.groups,row.group);
      increment(counts.fields,row.domain);
      increment(counts.types,row.workflow);
      eligible++;
      if ((!domain.value || row.domain === domain.value) && (!workflow.value || row.workflow === workflow.value)) matches.push(row.element);
    }
    const n = matches.length, last = Math.max(1,Math.ceil(n/pageSize));
    currentPage = Math.min(currentPage,last);
    const start = (currentPage-1)*pageSize, end = Math.min(n,start+pageSize);
    for (const element of matches.slice(start,end)) element.hidden = false;
    const query = queryFromForm();
    if (query.toString() !== params().toString()) storeQuery(query,false);
    displayPager(last,query);
    // The full matrix keeps alternative intersections available. Search and
    // level apply to its counts; choosing a field or type moves the list.
    updateMatrix(query,counts,eligible);
    counter.textContent = last <= 1 ? taskCount(n)
      : zh ? '第 ' + (start+1) + '–' + end + ' 条，共 ' + taskCount(n) : (start+1) + '–' + end + ' of ' + taskCount(n);
    clear.hidden = !(words.length || domain.value || workflow.value || level.value);
    empty.hidden = n > 0;
    if (!n) {
      empty.querySelector('h2').textContent = zh ? '未找到匹配的任务' : 'No matching tasks';
      empty.querySelector('p').textContent = zh ? '可以更换搜索词或清除筛选条件。' : 'Try another search term or clear the filters to explore the collection.';
    }
  }

  function writeQuery(push, anchor = '', page = 1) {
    currentPage = page;
    storeQuery(queryFromForm(),push,anchor);
    apply();
  }

  function focusDirectory() {
    heading.focus({preventScroll:true});
    heading.scrollIntoView({block:'start'});
  }

  function modified(event) {
    return event.ctrlKey || event.metaKey || event.shiftKey || event.altKey;
  }

  form.addEventListener('input',event => {
    if (event.target.name === 'q') writeQuery(false);
  });
  form.addEventListener('change',event => {
    if (event.target.tagName === 'SELECT') writeQuery(true);
  });
  form.addEventListener('submit',event => {
    event.preventDefault();
    writeQuery(false);
  });
  pager.addEventListener('click',event => {
    const link = event.target.closest('a[data-page]');
    if (!link || modified(event)) return;
    event.preventDefault();
    writeQuery(true,'task-directory',Number(link.dataset.page));
    focusDirectory();
  });
  matrix.addEventListener('click',event => {
    const link = event.target.closest('.matrix-cell');
    if (!link || modified(event)) return;
    event.preventDefault();
    form.elements.domain.value = link.dataset.domain;
    form.elements.workflow.value = link.dataset.workflow;
    writeQuery(true,link.hash);
    focusDirectory();
  });
  for (const link of root.querySelectorAll('[data-clear]')) link.addEventListener('click',event => {
    if (modified(event)) return;
    event.preventDefault();
    form.reset();
    writeQuery(true);
    form.elements.q.focus();
  });
  window.addEventListener('popstate',() => {readQuery(); apply();});
  const initial = params();
  const anchor = window.afePreviewAddress?.hash ?? location.hash;
  root.dataset.filtering = '';
  form.hidden = false;
  readQuery();
  apply();
  if (anchor === '#activity-matrix') root.querySelector('.catalog-matrix').open = true;
  if (initial.size && (!anchor || anchor === '#task-directory' || anchor.startsWith('#tasks-') || anchor.startsWith('#?'))) {
    heading.scrollIntoView({block:'start'});
  }
})();
