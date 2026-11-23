(() => {
  'use strict';
  const root = document.getElementById('catalogue');
  if (!root) return;
  const zh = root.dataset.lang === 'zh';
  const overview = root.querySelector('.catalog-overview');
  const views = [...overview.querySelectorAll('input[name="distribution"]')];
  const form = root.querySelector('.catalog-controls');
  const counter = root.querySelector('[data-results]');
  const clear = root.querySelector('.catalog-status [data-clear]');
  const clearLabel = clear.textContent;
  const empty = root.querySelector('.catalog-empty');
  const pageList = root.querySelector('[data-page-list]');
  const pager = root.querySelector('.catalog-pager');
  const pageSize = 10;
  const section = root.querySelector('.matrix-section');
  const atlas = section.querySelector('.task-atlas');
  const tiers = [...atlas.querySelectorAll('.atlas-level-link')];
  const researchLists = [...atlas.querySelectorAll('.research-questions')];
  const coverage = section.querySelector('.coverage-body');
  const matrix = coverage.querySelector('.task-matrix');
  const fields = [...coverage.querySelectorAll('.coverage-detail')];
  const peak = Number(coverage.dataset.peak);
  const heading = root.querySelector('#directory-heading');
  const filters = ['q','domain','workflow','level'];
  const aliases = JSON.parse(root.dataset.typeAliases);
  const levelNames = JSON.parse(root.dataset.levelNames);
  const breakdown = new Map([...coverage.querySelectorAll('.coverage-pair')].map(link => [link.hash.slice(1),link]));
  const strips = new Map([...coverage.querySelectorAll('[data-coverage-group]')].map(mark => [mark.dataset.coverageGroup,mark]));
  const cells = [...matrix.querySelectorAll('.matrix-cell')].map(link => ({
    link, group:link.hash.slice(1), detail:breakdown.get(link.hash.slice(1)), zero:link.nextElementSibling,
    numeral:link.querySelector('.circle-count'), strip:strips.get(link.hash.slice(1)),
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
    return new URLSearchParams(window.afePreviewAddress?.search ?? (fileQuery ? location.hash.slice(2).split('#')[0] : location.search));
  }

  function currentAnchor() {
    if (window.afePreviewAddress) return window.afePreviewAddress.hash;
    if (location.protocol !== 'file:' || !location.hash.startsWith('#?')) return location.hash;
    const start = location.hash.indexOf('#',2);
    return start < 0 ? '' : location.hash.slice(start);
  }

  function readQuery() {
    const query = params();
    const view = views.find(input => input.value === query.get('view')) ?? views[0];
    view.checked = true;
    for (const key of filters) {
      const control = form.elements.namedItem(key);
      let value = query.get(key) || '';
      if (key === 'workflow' && !typeLabels.has(value) && Object.hasOwn(aliases,value)) value = aliases[value];
      control.value = control.options && ![...control.options].some(option => option.value === value) ? '' : value;
    }
    const requested = tiers.find(link => link.hash === currentAnchor());
    if (requested) form.elements.level.value = requested.dataset.tier;
    const number = query.get('page');
    currentPage = /^\d+$/.test(number) ? Math.max(1,Number(number)) : 1;
  }

  function setPage(query,page) {
    if (page > 1) query.set('page',String(page));
    else query.delete('page');
  }

  function queryFromForm() {
    const query = params();
    const view = views.find(input => input.checked).value;
    if (view === 'fields') query.delete('view');
    else query.set('view',view);
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
      if (url.protocol === 'file:') {
        const fragment = anchor ?? currentAnchor();
        url.hash = search + (fragment ? '#' + fragment.replace(/^#/,'') : '');
      }
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

  function updateMatrix(query, counts) {
    const {domain,workflow} = form.elements;
    const address = new URLSearchParams(query);
    address.delete('page');
    address.set('level','1');
    const breadth = new Map();
    for (const {link,group,detail,zero,numeral,strip} of cells) {
      const size = counts.groups.get(group) || 0;
      const field = link.dataset.domain, type = link.dataset.workflow;
      const mark = Math.sqrt(size / peak);
      strip.style.setProperty('--mark',mark);
      link.hidden = !size;
      zero.hidden = Boolean(size);
      detail.parentElement.hidden = !size;
      if (!size) continue;
      increment(breadth,field);
      link.style.setProperty('--mark',mark);
      detail.style.setProperty('--share',size / counts.fields.get(field));
      numeral.textContent = size;
      detail.querySelector('.pair-count').textContent = size;
      address.set('domain',field);
      address.set('workflow',type);
      for (const target of [link,detail]) {
        if (field === domain.value && type === workflow.value) target.setAttribute('aria-current','true');
        else target.removeAttribute('aria-current');
        target.setAttribute('aria-label',link.dataset.axisLabel + ' · ' + taskCount(size));
        target.setAttribute('href','?' + address + '#' + group);
      }
    }
    for (const header of matrix.querySelectorAll('[data-axis-domain]')) {
      header.toggleAttribute('data-selected',header.dataset.axisDomain === domain.value);
      header.style.setProperty('--field-share',(counts.fields.get(header.dataset.axisDomain) || 0) / Number(coverage.dataset.fieldPeak));
    }
    for (const header of matrix.querySelectorAll('[data-axis-workflow]')) {
      header.toggleAttribute('data-selected',header.dataset.axisWorkflow === workflow.value);
    }
    for (const total of coverage.querySelectorAll('[data-domain-total]')) total.textContent = counts.fields.get(total.dataset.domainTotal) || 0;
    for (const total of matrix.querySelectorAll('[data-workflow-total]')) total.textContent = counts.types.get(total.dataset.workflowTotal) || 0;
    for (const total of coverage.querySelectorAll('[data-field-types]')) total.textContent = breadth.get(total.dataset.fieldTypes) || 0;
    for (const panel of fields) {
      const total = panel.querySelector('[data-field-reading]');
      const n = counts.fields.get(total.dataset.fieldReading) || 0;
      total.textContent = taskCount(n);
      panel.querySelector('.coverage-detail-labels').hidden = !n;
      panel.querySelector('.coverage-empty').hidden = n > 0;
    }
  }

  function apply() {
    const words = normalize(form.elements.q.value).trim().split(/\s+/).filter(Boolean);
    const {domain,workflow,level} = form.elements;
    const counts = {groups:new Map(),fields:new Map(),types:new Map()};
    const matches = [];
    for (const row of rows) {
      row.element.hidden = true;
      const inLevel = !level.value || (level.value === 'research' ? ['2','3'].includes(row.level) : row.level === level.value);
      if (!inLevel || !words.every(word => row.text.includes(word))) continue;
      if (row.level === '1') {
        increment(counts.groups,row.group);
        increment(counts.fields,row.domain);
        increment(counts.types,row.workflow);
      }
      if ((!domain.value || row.domain === domain.value) && (!workflow.value || row.workflow === workflow.value)) matches.push(row.element);
    }
    const n = matches.length, last = Math.max(1,Math.ceil(n/pageSize));
    currentPage = Math.min(currentPage,last);
    const start = (currentPage-1)*pageSize, end = Math.min(n,start+pageSize);
    for (const element of matches.slice(start,end)) element.hidden = false;
    const query = queryFromForm();
    if (query.toString() !== params().toString()) storeQuery(query,false);
    for (const link of tiers) {
      const target = new URLSearchParams(query);
      target.delete('page');
      if (level.value !== link.dataset.tier) {target.delete('domain'); target.delete('workflow');}
      target.set('level',link.dataset.tier);
      link.setAttribute('href','?' + target + '#level-' + link.dataset.tier);
    }
    if (researchLists.length) {
      const matched = new Set(matches.map(item => item.querySelector('.catalog-title').getAttribute('href')));
      for (const block of researchLists) {
        for (const link of block.querySelectorAll('li a')) link.parentElement.hidden = !matched.has(link.getAttribute('href'));
        for (const list of block.querySelectorAll('ul')) list.parentElement.hidden = !list.querySelector('li:not([hidden])');
        block.hidden = !block.querySelector('li:not([hidden])');
      }
    }
    displayPager(last,query);
    // Only L1 activities belong on the workflow map. Its two axes stay available
    // when a particular field and activity are selected in the directory.
    updateMatrix(query,counts);
    const tier = tiers.find(link => link.dataset.tier === level.value);
    const uncollected = tier?.dataset.count === '0';
    root.toggleAttribute('data-empty-tier',uncollected);
    form.hidden = uncollected;
    counter.textContent = uncollected ? (zh ? '本版共 0 道 L' + level.value + ' 任务' : '0 published L' + level.value + ' tasks')
      : last <= 1 ? taskCount(n)
      : zh ? '第 ' + (start+1) + '–' + end + ' 条，共 ' + taskCount(n) : (start+1) + '–' + end + ' of ' + taskCount(n);
    clear.hidden = !(words.length || domain.value || workflow.value || level.value);
    clear.textContent = uncollected ? (zh ? '浏览全部任务' : 'Browse all tasks') : clearLabel;
    empty.hidden = n > 0 || uncollected;
    if (!empty.hidden) {
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

  overview.addEventListener('change',() => writeQuery(true,'',currentPage));
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
  function syncCoverageView() {
    const anchor = currentAnchor();
    const field = fields.find(panel => '#' + panel.id === anchor);
    const explicit = tiers.find(link => link.hash === anchor)?.dataset.tier;
    const workflowView = field || anchor === '#coverage-map';
    const selected = explicit || (!workflowView && ['2','3'].includes(form.elements.level.value) ? form.elements.level.value : '1');
    atlas.dataset.level = selected;
    for (const link of tiers) {
      if (link.dataset.tier === selected) link.setAttribute('aria-current','location');
      else link.removeAttribute('aria-current');
    }
    for (const panel of fields) panel.toggleAttribute('data-open',panel === field);
    coverage.toggleAttribute('data-field',Boolean(field));
    coverage.toggleAttribute('data-map',anchor === '#coverage-map');
  }

  let pointerCell, keyboardCell, reading;
  function trace(link, on) {
    if (!link) return;
    link.toggleAttribute('data-reading',on);
    const cell = link.parentElement;
    cell.parentElement.toggleAttribute('data-reading',on);
    for (const row of matrix.rows) row.cells[cell.cellIndex].toggleAttribute('data-reading',on);
  }
  function refreshReading() {
    const next = pointerCell || keyboardCell;
    if (next === reading) return;
    trace(reading,false);
    reading = next;
    trace(reading,true);
  }
  matrix.addEventListener('pointerover',event => {
    if (event.pointerType === 'touch') return;
    pointerCell = event.target.closest('.matrix-cell');
    refreshReading();
  });
  matrix.addEventListener('pointerleave',() => {pointerCell = null; refreshReading();});
  matrix.addEventListener('focusin',event => {pointerCell = null; keyboardCell = event.target.closest('.matrix-cell'); refreshReading();});
  matrix.addEventListener('focusout',event => {keyboardCell = event.relatedTarget?.closest('.matrix-cell'); refreshReading();});

  section.addEventListener('click',event => {
    const tier = event.target.closest('.atlas-level-link');
    if (tier && !modified(event)) {
      event.preventDefault();
      if (form.elements.level.value !== tier.dataset.tier) {
        form.elements.domain.value = '';
        form.elements.workflow.value = '';
      }
      form.elements.level.value = tier.dataset.tier;
      writeQuery(true,tier.hash);
      tier.focus({preventScroll:true});
      return;
    }
    const view = event.target.closest('.coverage-field-link,.coverage-back,.coverage-view');
    if (view && !modified(event)) {
      event.preventDefault();
      const previous = fields.find(panel => panel.hasAttribute('data-open'));
      storeQuery(params(),true,view.hash);
      const panel = fields.find(item => item.hasAttribute('data-open'));
      const returnLink = previous && [...section.querySelectorAll('.coverage-field-link')].find(link => link.hash === '#' + previous.id && link.getClientRects().length);
      const target = panel?.querySelector('h3') || returnLink || (view.hash === '#coverage-map' ? matrix.parentElement : section.querySelector('.coverage-show-map'));
      target.focus({preventScroll:true});
      const top = section.getBoundingClientRect().top;
      if (top < 0 || top > innerHeight / 2) section.scrollIntoView({block:'start'});
      return;
    }
    const link = event.target.closest('.matrix-cell,.coverage-pair');
    if (!link || modified(event)) return;
    event.preventDefault();
    form.elements.domain.value = link.dataset.domain;
    form.elements.workflow.value = link.dataset.workflow;
    form.elements.level.value = '1';
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
  window.addEventListener('afe:addresschange',syncCoverageView);
  window.addEventListener('hashchange',syncCoverageView);
  window.addEventListener('popstate',() => {readQuery(); apply(); syncCoverageView();});
  const initial = params();
  const anchor = currentAnchor();
  root.dataset.filtering = '';
  form.hidden = false;
  readQuery();
  apply();
  syncCoverageView();
  const directoryQuery = filters.some(key => initial.has(key)) || initial.has('page');
  if (directoryQuery && (!anchor || anchor === '#task-directory' || anchor.startsWith('#tasks-') || anchor.startsWith('#?'))) {
    heading.scrollIntoView({block:'start'});
  }
})();
