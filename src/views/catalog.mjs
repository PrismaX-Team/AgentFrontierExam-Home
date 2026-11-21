import {escape, taskHref, filteredHref, levelNames} from './layout.mjs';
import {plates} from '../data/plates.mjs';
import {catalogueHero, intersectionHref} from './field-explorer.mjs';

const order = new Intl.Collator('en', {sensitivity:'base'});

function choices(values) {
  return values.map(value => `<option value="${escape(value)}">${escape(value)}</option>`).join('');
}

function groupId(field, activity) {
  const slug = value => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `tasks-${slug(field)}--${slug(activity)}`;
}

function taskCount(count) {
  return `${count} ${count === 1 ? 'task' : 'tasks'}`;
}

function taskMatrix(domains, workflows, groups) {
  const empty = '<span aria-hidden="true">·</span><span class="visually-hidden">0 tasks</span>';
  const rows = workflows.map(workflow => {
    const cells = domains.map(domain => {
      const id = groupId(domain, workflow);
      const count = groups.get(id)?.length ?? 0;
      if (!count) return `<td><span class="matrix-zero">${empty}</span></td>`;
      return `<td><a class="matrix-cell" href="${escape(intersectionHref(domain,workflow,id))}" data-domain="${escape(domain)}" data-workflow="${escape(workflow)}" aria-label="${escape(taskCount(count) + ' · ' + domain + ' · ' + workflow)}">${count}</a><span class="matrix-zero" hidden>${empty}</span></td>`;
    }).join('');
    return `<tr><th scope="row" data-axis-workflow="${escape(workflow)}">${escape(workflow)}</th>${cells}</tr>`;
  }).join('\n');
  const large = domains.length > 15 || workflows.length > 15;
  return `<div class="matrix-viewport"${large ? ' data-large' : ''} role="region" aria-labelledby="matrix-heading" tabindex="0">
    <table class="task-matrix" style="--matrix-field-span:${domains.length*5}rem" aria-label="Task counts by scientific field and research activity">
      <thead><tr><th scope="col" class="matrix-stub">Research activity</th>${domains.map(domain => `<th scope="col" data-axis-domain="${escape(domain)}">${escape(domain)}</th>`).join('')}</tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`;
}

function row(task, position) {
  return `<li class="catalog-row" data-order="${position}" data-domain="${escape(task.domain)}" data-workflow="${escape(task.workflow)}" data-level="${task.level ?? ''}">
    <a class="catalog-title" href="${taskHref(task)}" aria-labelledby="brief-${escape(task.id)}">
      <div class="catalog-copy"><h3 id="brief-${escape(task.id)}">${escape(task.title)}</h3><p>${escape(task.summary)}</p></div>
      <div class="catalog-meta"><span><span class="visually-hidden">Field, </span>${escape(task.domain)}</span>
        <span><span class="visually-hidden">Research activity, </span>${escape(task.workflow)}</span></div>
    </a>
  </li>`;
}

export function catalogue(tasks) {
  const ordered = [...tasks].sort((a,b)=>order.compare(a.title,b.title) || order.compare(a.id,b.id));
  const positions = new Map(ordered.map((task,index) => [task,index]));
  const domains = [...new Set(tasks.map(t=>t.domain))].sort(order.compare);
  const workflows = [...new Set(tasks.map(t=>t.workflow))].sort(order.compare);
  const groups = Map.groupBy(ordered, task => groupId(task.domain,task.workflow));
  const assigned = [...new Set(tasks.map(t=>t.level).filter(Boolean))].sort();
  const levelSelect = assigned.length ? `<label><span id="filter-level">Scientific level</span><select name="level" aria-labelledby="filter-level"><option value="">All levels</option>${assigned.map(l=>`<option value="${l}">L${l} · ${levelNames[l]}</option>`).join('')}</select></label>` : '';
  const taskGroups = [...groups].map(([id, entries]) => {
    const {domain,workflow} = entries[0];
    return `<div class="catalog-group" id="${id}">
      <div class="matrix-native-result"><p><strong>${escape(domain)} · ${escape(workflow)}</strong><br>${taskCount(entries.length)}</p><a class="text-link" href="?#activity-matrix">Clear selection</a></div>
      <ul class="catalog-list" aria-label="${escape(domain + ' · ' + workflow)}">${entries.map(task=>row(task,positions.get(task))).join('\n')}</ul>
    </div>`;
  }).join('\n');
  return `<div class="page-frame site-frame" id="catalogue" data-level-names="${escape(JSON.stringify(levelNames))}">
    ${catalogueHero(domains,groups)}
    <section class="matrix-section" id="activity-matrix" aria-labelledby="matrix-heading">
      <div class="matrix-heading"><h2 id="matrix-heading">Field × activity</h2>
        <p><span data-matrix-total>${taskCount(tasks.length)}</span> <span aria-hidden="true">·</span> ${domains.length} fields <span aria-hidden="true">·</span> ${workflows.length} activities</p></div>
      ${taskMatrix(domains,workflows,groups)}
    </section>
    <section class="catalog-directory" id="task-directory" aria-labelledby="directory-heading">
    <div class="directory-heading"><h2 id="directory-heading" tabindex="-1">Task briefs</h2><a class="text-link" href="#activity-matrix">Back to matrix</a></div>
    <form class="catalog-controls" role="search" aria-label="Filter tasks" method="get" action="/tasks/" hidden>
      <label class="catalog-search">Search tasks<input type="search" name="q" placeholder="Title, field or research activity" autocomplete="off"></label>
      <label><span id="filter-field">Field</span><select name="domain" aria-labelledby="filter-field"><option value="">All fields</option>${choices(domains)}</select></label>
      <label><span id="filter-activity">Research activity</span><select name="workflow" aria-labelledby="filter-activity"><option value="">All activities</option>${choices(workflows)}</select></label>
      ${levelSelect}<button type="submit" class="visually-hidden">Apply filters</button>
    </form>
    <div class="catalog-status"><p aria-live="polite" aria-atomic="true" data-results>${tasks.length} tasks</p>
      <a class="text-link" data-clear href="/tasks/" hidden>Clear filters</a></div>
    ${taskGroups}
    <ul class="catalog-list" data-page-list aria-labelledby="directory-heading" hidden></ul>
    <nav class="catalog-pager" aria-label="Task brief pages" hidden>
      <a class="page-step" data-previous rel="prev">Previous</a>
      <ol aria-label="Pages"></ol>
      <a class="page-step" data-next rel="next">Next</a>
    </nav>
    <section class="catalog-empty" hidden><h2></h2><p></p><a class="text-link" href="/tasks/" data-clear>Explore all tasks</a></section>
    </section></div>`;
}

function fact(label, content) {
  return `<div><dt>${label}</dt><dd>${content}</dd></div>`;
}

function briefSection(title, text, id) {
  return text ? `<section class="brief-section"${id ? ` id="${id}"` : ''}><h2>${title}</h2><p>${escape(text)}</p></section>` : '';
}

function taskFigure(task) {
  const art = plates[task.id];
  if (!art) return '';
  const caption = `${escape(art.caption)}${art.href ? ` <a href="${escape(art.href)}">Image source</a>` : ''}`;
  return `<figure class="brief-figure"><img src="/assets/plates/${art.file}" alt="${escape(art.alt)}" width="720" height="450"><figcaption>${caption}</figcaption></figure>`;
}

export function taskPage(task, tasks) {
  const related = tasks.filter(t=>t.id!==task.id && (t.domain === task.domain || t.workflow === task.workflow))
    .sort((a,b)=>Number(b.workflow===task.workflow)-Number(a.workflow===task.workflow) || order.compare(a.title,b.title)).slice(0,3);
  const facts = [
    fact('Field', `<a href="${filteredHref('domain',task.domain)}">${escape(task.domain)}</a>`),
    fact('Research activity', `<a href="${filteredHref('workflow',task.workflow)}">${escape(task.workflow)}</a>`),
    task.level ? fact('Scientific level', `L${task.level} · ${levelNames[task.level]}`) : '',
    task.packageVersion ? fact('Task package version', escape(task.packageVersion)) : '',
    task.sourceLabel ? fact('Source', task.sourceUrl ? `<a href="${escape(task.sourceUrl)}">${escape(task.sourceLabel)}</a>` : escape(task.sourceLabel)) : '',
  ].join('');
  return `<article class="site-frame task-page">
    <nav aria-label="Breadcrumb" class="breadcrumbs"><a href="/tasks/">Tasks</a><span aria-hidden="true">/</span><a href="${filteredHref('domain',task.domain)}">${escape(task.domain)}</a></nav>
    <div class="brief-heading${plates[task.id] ? ' with-figure' : ''}"><header>
      <p class="eyeline">${escape(task.workflow)}</p><h1>${escape(task.title)}</h1><p class="brief-lede">${escape(task.summary)}</p></header>${taskFigure(task)}</div>
    <div class="brief-body"><dl class="brief-facts">${facts}</dl>
      <div class="brief-reading">${briefSection('Starting materials',task.input)}${briefSection('What the agent delivers',task.deliverable)}${briefSection('How success is assessed',task.evidence,'assessment')}${briefSection('Scientific significance',task.significance)}</div>
    </div>
    <section class="related-section"><div class="section-heading"><h2>${related.length ? 'Related tasks' : 'Explore the collection'}</h2>
    <a class="text-link" href="/tasks/">Browse all tasks</a></div>${related.length ? `<ul>${related.map(r=>`<li><a href="${taskHref(r)}">${escape(r.title)}</a><span>${escape(r.workflow)}</span></li>`).join('')}</ul>` : ''}</section>
  </article>`;
}
