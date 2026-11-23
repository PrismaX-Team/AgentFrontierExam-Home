import {escape, keepEnding, taskHref, filteredHref, levelLabels, taskTypeLabel} from './layout.mjs';
import {plateFor} from '../data/plates.mjs';
import {axisLabel, activityAliases} from '../data/taxonomy.mjs';
import {catalogueHero, collectionCounts} from './field-explorer.mjs';
import {groupId, taskCount, taskCoverage} from './coverage.mjs';

const labels = {
  en: {
    catalogue: 'Tasks',
    type: 'Task type', field: 'Field', level: 'Scientific level',
    briefs: 'Task briefs', clearSelection: 'Clear selection', filter: 'Filter tasks',
    search: 'Search', query: 'Title, field or task type', fields: 'All fields', types: 'All task types',
    levels: 'All levels', research: 'L2 and L3', apply: 'Apply filters',
    clear: 'Clear filters', rowClass: 'Field / task type', rowLevel: 'Level',
    pages: 'Task brief pages', pageList: 'Pages', previous: 'Previous', next: 'Next',
    explore: 'Explore all tasks', breadcrumb: 'Breadcrumb',
    version: 'Task package version', source: 'Source', input: 'Starting materials',
    deliverable: 'What the agent delivers', evidence: 'How success is assessed', significance: 'Scientific significance',
    picture: 'Image source', related: 'Related tasks', browse: 'Browse all tasks',
  },
  zh: {
    catalogue: '任务目录',
    type: '任务类型', field: '领域', level: '科学层级',
    briefs: '任务列表', clearSelection: '清除选择', filter: '筛选任务',
    search: '搜索', query: '题目、领域或任务类型', fields: '全部领域', types: '全部类型',
    levels: '全部层级', research: 'L2 和 L3', apply: '应用筛选',
    clear: '清除筛选', rowClass: '领域 / 任务类型', rowLevel: '层级',
    pages: '任务列表分页', pageList: '页码', previous: '上一页', next: '下一页',
    explore: '浏览全部任务', breadcrumb: '面包屑导航',
    version: '任务包版本', source: '来源', input: '起始材料',
    deliverable: '任务交付物', evidence: '验收依据', significance: '科学意义',
    picture: '图片来源', related: '相关任务', browse: '浏览全部任务',
  },
};

function choices(values, label) {
  return values.map(value => `<option value="${escape(value)}">${escape(label(value))}</option>`).join('');
}

function row(task, position, lang) {
  const t = labels[lang];
  const level = 'L' + task.level;
  const other = lang === 'zh' ? 'en' : 'zh';
  const translation = [task.translatedSearch, axisLabel(task.domain,other), axisLabel(task.workflow,other), levelLabels(other)[task.level]].filter(Boolean).join(' ');
  return `<li class="catalog-row" data-order="${position}" data-translation="${escape(translation)}" data-domain="${escape(task.domain)}" data-workflow="${escape(task.workflow || '')}" data-level="${task.level}">
    <a class="catalog-title" href="${taskHref(task)}" aria-labelledby="brief-${escape(task.id)}">
      <div class="catalog-copy"><h3 id="brief-${escape(task.id)}">${keepEnding(escape(task.title), lang)}</h3><p>${keepEnding(escape(task.summary), lang)}</p></div>
      <div class="catalog-meta"><span><span class="visually-hidden">${t.field} · </span>${escape(axisLabel(task.domain,lang))}</span>
        <span><span class="visually-hidden">${task.workflow ? t.type : t.level} · </span>${keepEnding(escape(taskTypeLabel(task,lang)), lang)}</span></div>
      <span class="catalog-row-level" title="${escape(levelLabels(lang)[task.level])}"><span class="entry-level-key">${t.rowLevel} </span>${level}</span>
    </a>
  </li>`;
}

function filters(domains, workflows, tasks, lang) {
  const t = labels[lang];
  const levels = levelLabels(lang);
  const assigned = Map.groupBy(tasks, task => String(task.level));
  const option = (code, name) => {
    const count = assigned.get(code)?.length ?? 0;
    return `<option value="${code}"${count ? '' : ' hidden'}>${escape(name)} (${count})</option>`;
  };
  return `<form class="catalog-controls" role="search" aria-label="${t.filter}" method="get" action="/tasks/" hidden>
    <label class="catalog-search">${t.search}<input type="search" name="q" placeholder="${t.query}" autocomplete="off"></label>
    <label>${t.field}<select name="domain"><option value="">${t.fields}</option>${choices(domains, field=>axisLabel(field,lang))}</select></label>
    <label>${t.type}<select name="workflow"><option value="">${t.types}</option>${choices(workflows, type=>axisLabel(type,lang))}</select></label>
    <label class="catalog-level-filter"${assigned.size < 2 ? ' hidden' : ''}>${t.level}<select name="level"><option value="">${t.levels}</option>${Object.entries(levels).map(([code,name]) => option(code,'L'+code+' · '+name)).join('')}<option value="research" hidden>${t.research}</option></select></label>
    <button type="submit" class="visually-hidden">${t.apply}</button>
  </form>`;
}

export function catalogue(tasks, lang = 'en') {
  const t = labels[lang];
  const order = new Intl.Collator(lang, {sensitivity:'base'});
  const ordered = [...tasks].sort((a,b)=>order.compare(a.title,b.title) || a.id.localeCompare(b.id,'en'));
  const positions = new Map(ordered.map((task,index) => [task,index]));
  const counts = collectionCounts(tasks);
  const nativeLevels = Object.keys(levelLabels(lang)).map(level =>
    `<p class="native-level-result" data-native-count="${level}">L${level} · ${taskCount(counts.levels.get(Number(level)) || 0, lang)} <a class="text-link" href="?#task-directory">${t.explore}</a></p>`).join('');
  const sortAxis = (a,b) => order.compare(axisLabel(a,lang),axisLabel(b,lang));
  const domains = [...counts.fields.keys()].sort(sortAxis);
  const workflows = [...counts.types.keys()].sort(sortAxis);
  const groups = Map.groupBy(ordered, task => groupId(task.domain,task.workflow,task.level));
  const taskGroups = [...groups].map(([id,entries]) => {
    const {domain,workflow,level} = entries[0];
    const groupLabel = escape(axisLabel(domain,lang) + ' · ' + (level === 1 ? axisLabel(workflow,lang) : levelLabels(lang)[level]));
    return `<div class="catalog-group" id="${id}" data-directory-level="${level}">
      <div class="matrix-native-result"><p><strong>${groupLabel}</strong><br>${taskCount(entries.length,lang)}</p><a class="text-link" href="?#activity-matrix">${t.clearSelection}</a></div>
      <ul class="catalog-list" aria-label="${groupLabel}">${entries.map(task=>row(task,positions.get(task),lang)).join('\n')}</ul>
    </div>`;
  }).join('\n');
  return `<div class="page-frame site-frame section-landing" id="catalogue" data-lang="${lang}" data-level-names="${escape(JSON.stringify(levelLabels(lang)))}" data-type-aliases="${escape(JSON.stringify(activityAliases))}">
    ${catalogueHero(tasks,counts,lang)}
    ${taskCoverage(ordered,groups,lang)}
    <section class="catalog-directory" id="task-directory" aria-labelledby="directory-heading">
      <div class="directory-heading"><h2 id="directory-heading" tabindex="-1">${t.briefs}</h2></div>
      ${filters(domains,workflows,tasks,lang)}
      <div class="catalog-register">
        <div class="catalog-status"><div><p aria-live="polite" aria-atomic="true" data-results>${taskCount(tasks.length,lang)}</p>${nativeLevels}
          <a class="text-link" data-clear href="/tasks/" hidden>${t.clear}</a></div>
          <span class="catalog-column-label" aria-hidden="true">${t.rowClass}</span><span class="catalog-column-label" aria-hidden="true">${t.rowLevel}</span></div>
        ${taskGroups}
        <ul class="catalog-list" data-page-list aria-labelledby="directory-heading" hidden></ul>
      </div>
      <nav class="catalog-pager" aria-label="${t.pages}" hidden>
        <a class="page-step" data-previous rel="prev">${t.previous}</a><ol aria-label="${t.pageList}"></ol>
        <a class="page-step" data-next rel="next">${t.next}</a>
      </nav>
      <section class="catalog-empty" hidden><h2></h2><p></p><a class="text-link" href="/tasks/" data-clear>${t.explore}</a></section>
    </section>
  </div>`;
}

function fact(label, content) {
  return `<div><dt>${label}</dt><dd>${content}</dd></div>`;
}

function briefSection(title, text, lang, id) {
  return text ? `<section class="brief-section"${id ? ` id="${id}"` : ''}><h2>${title}</h2><p>${keepEnding(escape(text), lang)}</p></section>` : '';
}

function taskFigure(art, lang) {
  if (!art) return '';
  const credit = art.href ? ` <a href="${escape(art.href)}">${labels[lang].picture}</a>` : '';
  return `<figure class="brief-figure"><img src="/assets/plates/${art.file}" alt="${escape(art.alt)}" width="720" height="450"><figcaption>${escape(art.caption)}${credit}</figcaption></figure>`;
}

export function taskPage(task, tasks, lang = 'en') {
  const t = labels[lang], levels = levelLabels(lang);
  const order = new Intl.Collator(lang, {sensitivity:'base'});
  const sharedType = other => task.workflow ? other.workflow === task.workflow : other.level === task.level;
  const related = tasks.filter(other=>other.id!==task.id && (other.domain === task.domain || sharedType(other)))
    .sort((a,b)=>Number(sharedType(b))-Number(sharedType(a)) || order.compare(a.title,b.title)).slice(0,3);
  const art = plateFor(task.id,lang);
  const field = escape(axisLabel(task.domain,lang));
  const type = escape(taskTypeLabel(task,lang));
  const fieldLink = `<a href="${filteredHref('domain',task.domain)}#task-directory">${field}</a>`;
  const level = `<a href="${filteredHref('level',task.level)}#task-directory">L${task.level} · ${escape(levels[task.level])}</a>`;
  const facts = [
    fact(t.field,fieldLink),
    task.workflow ? fact(t.type,`<a href="${filteredHref('workflow',task.workflow)}#task-directory">${type}</a>`) : '',
    fact(t.level,level),
    task.packageVersion ? fact(t.version,escape(task.packageVersion)) : '',
    task.sourceLabel ? fact(t.source,task.sourceUrl ? `<a href="${escape(task.sourceUrl)}">${escape(task.sourceLabel)}</a>` : escape(task.sourceLabel)) : '',
  ].join('');
  const sections = briefSection(t.input,task.input,lang) + briefSection(t.deliverable,task.deliverable,lang)
    + briefSection(t.evidence,task.evidence,lang,'assessment') + briefSection(t.significance,task.significance,lang);
  return `<article class="site-frame task-page">
    <nav aria-label="${t.breadcrumb}" class="breadcrumbs"><a href="/tasks/">${t.catalogue}</a><span aria-hidden="true">/</span>${fieldLink}</nav>
    <div class="brief-heading${art ? ' with-figure' : ''}"><header>
      <p class="eyeline">${type}</p><h1>${keepEnding(escape(task.title), lang)}</h1><p class="brief-lede">${keepEnding(escape(task.summary), lang)}</p></header>${taskFigure(art,lang)}</div>
    <div class="brief-body${sections ? '' : ' metadata-only'}"><dl class="brief-facts">${facts}</dl>
      ${sections ? `<div class="brief-reading">${sections}</div>` : ''}</div>
    <section class="related-section"><div class="section-heading"><h2>${related.length ? t.related : t.explore}</h2>
      <a class="text-link" href="/tasks/">${t.browse}</a></div>${related.length ? `<ul>${related.map(other=>`<li><a href="${taskHref(other)}">${keepEnding(escape(other.title), lang)}</a><span>${escape(taskTypeLabel(other,lang))}</span></li>`).join('')}</ul>` : ''}</section>
  </article>`;
}
