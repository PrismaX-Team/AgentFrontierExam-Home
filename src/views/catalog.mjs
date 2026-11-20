import {escape, taskHref, filteredHref, levelNames} from './layout.mjs';
import {plates} from '../data/plates.mjs';

const order = new Intl.Collator('en', {sensitivity:'base'});

function choices(values) {
  return [...new Set(values.filter(Boolean))].sort(order.compare)
    .map(value => `<option value="${escape(value)}">${escape(value)}</option>`).join('');
}

function row(task) {
  return `<li class="catalog-row" data-domain="${escape(task.domain)}" data-workflow="${escape(task.workflow)}" data-level="${task.level ?? ''}">
    <a class="catalog-title" href="${taskHref(task)}"><h2>${escape(task.title)}</h2><p>${escape(task.summary)}</p></a>
    <span class="row-field">${escape(task.domain)}</span><span class="row-field">${escape(task.workflow)}</span>
  </li>`;
}

export function catalogue(tasks) {
  const ordered = [...tasks].sort((a,b)=>order.compare(a.title,b.title));
  const assigned = [...new Set(tasks.map(t=>t.level).filter(Boolean))].sort();
  const levelSelect = assigned.length ? `<label><span id="filter-level">Scientific level</span><select name="level" aria-labelledby="filter-level"><option value="">All levels</option>${assigned.map(l=>`<option value="${l}">L${l} · ${levelNames[l]}</option>`).join('')}</select></label>` : '';
  return `<div class="page-frame site-frame" id="catalogue">
    <header class="page-intro"><h1>Tasks</h1><p>Find a scientific task by field or research activity. Each brief describes the starting materials, the work an agent must deliver and the evidence used to assess it.</p></header>
    <form class="catalog-controls" role="search" aria-label="Filter tasks" method="get" action="/tasks/" hidden>
      <label class="catalog-search">Search tasks<input type="search" name="q" placeholder="Title, field or research activity" autocomplete="off"></label>
      <label><span id="filter-field">Field</span><select name="domain" aria-labelledby="filter-field"><option value="">All fields</option>${choices(tasks.map(t=>t.domain))}</select></label>
      <label><span id="filter-activity">Research activity</span><select name="workflow" aria-labelledby="filter-activity"><option value="">All activities</option>${choices(tasks.map(t=>t.workflow))}</select></label>
      ${levelSelect}<button type="submit" class="visually-hidden">Apply filters</button>
    </form>
    <div class="catalog-status"><p aria-live="polite" aria-atomic="true" data-results>${tasks.length} tasks</p>
      <a class="text-link" data-clear href="/tasks/" hidden>Clear filters</a></div>
    <div class="catalog-columns" aria-hidden="true"><span>Task</span><span>Field</span><span>Research activity</span></div>
    <ul class="catalog-list">${ordered.map(row).join('\n')}</ul>
    <section class="catalog-empty" hidden><h2></h2><p></p><a class="text-link" href="/tasks/" data-clear>Explore all tasks</a></section>
  </div>`;
}

function fact(label, content) {
  return `<div><dt>${label}</dt><dd>${content}</dd></div>`;
}

function briefSection(title, text) {
  return text ? `<section class="brief-section"><h2>${title}</h2><p>${escape(text)}</p></section>` : '';
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
      <div class="brief-reading">${briefSection('Starting materials',task.input)}${briefSection('What the agent delivers',task.deliverable)}${briefSection('How success is assessed',task.evidence)}${briefSection('Scientific significance',task.significance)}</div>
    </div>
    <section class="related-section"><div class="section-heading"><h2>${related.length ? 'Related tasks' : 'Explore the collection'}</h2>
    <a class="text-link" href="/tasks/">Browse all tasks</a></div>${related.length ? `<ul>${related.map(r=>`<li><a href="${taskHref(r)}">${escape(r.title)}</a><span>${escape(r.workflow)}</span></li>`).join('')}</ul>` : ''}</section>
  </article>`;
}
