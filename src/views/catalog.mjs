import {escape, taskHref, filteredHref, levelLabels} from './layout.mjs';
import {plateFor} from '../data/plates.mjs';
import {axisLabel, activityAliases} from '../data/taxonomy.mjs';
import {catalogueHero, collectionCounts, intersectionHref} from './field-explorer.mjs';

const labels = {
  en: {
    catalogue: 'Tasks', matrix: 'Field × task type matrix', matrixLabel: 'Number of tasks by field and task type',
    type: 'Task type', field: 'Field', level: 'Scientific level',
    total: 'Total', briefs: 'Task briefs', clearSelection: 'Clear selection', filter: 'Filter tasks',
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
    catalogue: '任务目录', matrix: '领域与任务类型矩阵', matrixLabel: '按领域和类型统计的任务数量',
    type: '任务类型', field: '领域', level: '科学层级',
    total: '合计', briefs: '任务列表', clearSelection: '清除选择', filter: '筛选任务',
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

function taskCount(count, lang) {
  return lang === 'zh' ? `${count} 道任务` : `${count} ${count === 1 ? 'task' : 'tasks'}`;
}

function groupId(field, activity) {
  const slug = value => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `tasks-${slug(field)}--${slug(activity)}`;
}

function choices(values, label) {
  return values.map(value => `<option value="${escape(value)}">${escape(label(value))}</option>`).join('');
}

function taskMatrix(domains, workflows, groups, counts, tasks, lang) {
  const t = labels[lang];
  const empty = `<span aria-hidden="true">·</span><span class="visually-hidden">${taskCount(0,lang)}</span>`;
  const rows = workflows.map(workflow => {
    const type = axisLabel(workflow,lang);
    const cells = domains.map(domain => {
      const id = groupId(domain, workflow);
      const count = groups.get(id)?.length ?? 0;
      if (!count) return `<td><span class="matrix-zero">${empty}</span></td>`;
      const axis = axisLabel(domain,lang) + ' · ' + type;
      return `<td><a class="matrix-cell" href="${escape(intersectionHref(domain,workflow,id))}" data-domain="${escape(domain)}" data-workflow="${escape(workflow)}" data-axis-label="${escape(axis)}" aria-label="${escape(taskCount(count,lang) + ' · ' + axis)}">${count}</a><span class="matrix-zero" hidden>${empty}</span></td>`;
    }).join('');
    return `<tr><th scope="row" data-axis-workflow="${escape(workflow)}">${escape(type)}</th>${cells}<td class="matrix-sum" data-workflow-total="${escape(workflow)}">${counts.types.get(workflow)}</td></tr>`;
  }).join('\n');
  const fieldHeaders = domains.map(domain => `<th scope="col" data-axis-domain="${escape(domain)}">${escape(axisLabel(domain,lang))}</th>`).join('');
  const fieldTotals = domains.map(domain => `<td class="matrix-sum" data-domain-total="${escape(domain)}">${counts.fields.get(domain)}</td>`).join('');
  const large = domains.length >= 15 || workflows.length >= 15;
  return `<section class="matrix-section" id="activity-matrix" aria-labelledby="matrix-heading">
    <details class="catalog-matrix"><summary><h2 id="matrix-heading"><span>${t.matrix}</span><span class="matrix-count" data-matrix-total>${taskCount(tasks.length,lang)}</span></h2></summary>
      <div class="matrix-viewport"${large ? ' data-large' : ''} role="region" aria-label="${t.matrixLabel}" tabindex="0">
        <table class="task-matrix" style="--matrix-field-span:${(domains.length+1)*5.25}rem" aria-label="${t.matrixLabel}">
          <thead><tr><th scope="col" class="matrix-stub">${t.type}</th>${fieldHeaders}<th scope="col">${t.total}</th></tr></thead>
          <tbody>${rows}</tbody><tfoot><tr><th scope="row">${t.total}</th>${fieldTotals}<td class="matrix-sum" data-grid-total>${tasks.length}</td></tr></tfoot>
        </table>
      </div>
    </details>
  </section>`;
}

function row(task, position, lang) {
  const t = labels[lang];
  const level = 'L' + task.level;
  const other = lang === 'zh' ? 'en' : 'zh';
  const translation = [task.translatedSearch, axisLabel(task.domain,other), axisLabel(task.workflow,other), levelLabels(other)[task.level]].filter(Boolean).join(' ');
  return `<li class="catalog-row" data-order="${position}" data-translation="${escape(translation)}" data-domain="${escape(task.domain)}" data-workflow="${escape(task.workflow)}" data-level="${task.level}">
    <a class="catalog-title" href="${taskHref(task)}" aria-labelledby="brief-${escape(task.id)}">
      <div class="catalog-copy"><h3 id="brief-${escape(task.id)}">${escape(task.title)}</h3><p>${escape(task.summary)}</p></div>
      <div class="catalog-meta"><span><span class="visually-hidden">${t.field} · </span>${escape(axisLabel(task.domain,lang))}</span>
        <span><span class="visually-hidden">${t.type} · </span>${escape(axisLabel(task.workflow,lang))}</span></div>
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
  const sortAxis = (a,b) => order.compare(axisLabel(a,lang),axisLabel(b,lang));
  const domains = [...counts.fields.keys()].sort(sortAxis);
  const workflows = [...counts.types.keys()].sort(sortAxis);
  const groups = Map.groupBy(ordered, task => groupId(task.domain,task.workflow));
  const taskGroups = [...groups].map(([id,entries]) => {
    const {domain,workflow} = entries[0];
    const groupLabel = escape(axisLabel(domain,lang) + ' · ' + axisLabel(workflow,lang));
    return `<div class="catalog-group" id="${id}">
      <div class="matrix-native-result"><p><strong>${groupLabel}</strong><br>${taskCount(entries.length,lang)}</p><a class="text-link" href="?#activity-matrix">${t.clearSelection}</a></div>
      <ul class="catalog-list" aria-label="${groupLabel}">${entries.map(task=>row(task,positions.get(task),lang)).join('\n')}</ul>
    </div>`;
  }).join('\n');
  return `<div class="page-frame site-frame" id="catalogue" data-lang="${lang}" data-level-names="${escape(JSON.stringify(levelLabels(lang)))}" data-type-aliases="${escape(JSON.stringify(activityAliases))}">
    ${catalogueHero(tasks,counts,lang)}
    ${taskMatrix(domains,workflows,groups,counts,tasks,lang)}
    <section class="catalog-directory" id="task-directory" aria-labelledby="directory-heading">
      <div class="directory-heading"><h2 id="directory-heading" tabindex="-1">${t.briefs}</h2></div>
      ${filters(domains,workflows,tasks,lang)}
      <div class="catalog-status"><div><p aria-live="polite" aria-atomic="true" data-results>${taskCount(tasks.length,lang)}</p>
        <a class="text-link" data-clear href="/tasks/" hidden>${t.clear}</a></div>
        <span class="catalog-column-label" aria-hidden="true">${t.rowClass}</span><span class="catalog-column-label" aria-hidden="true">${t.rowLevel}</span></div>
      ${taskGroups}
      <ul class="catalog-list" data-page-list aria-labelledby="directory-heading" hidden></ul>
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

function briefSection(title, text, id) {
  return text ? `<section class="brief-section"${id ? ` id="${id}"` : ''}><h2>${title}</h2><p>${escape(text)}</p></section>` : '';
}

function taskFigure(art, lang) {
  if (!art) return '';
  const credit = art.href ? ` <a href="${escape(art.href)}">${labels[lang].picture}</a>` : '';
  return `<figure class="brief-figure"><img src="/assets/plates/${art.file}" alt="${escape(art.alt)}" width="720" height="450"><figcaption>${escape(art.caption)}${credit}</figcaption></figure>`;
}

export function taskPage(task, tasks, lang = 'en') {
  const t = labels[lang], levels = levelLabels(lang);
  const order = new Intl.Collator(lang, {sensitivity:'base'});
  const related = tasks.filter(other=>other.id!==task.id && (other.domain === task.domain || other.workflow === task.workflow))
    .sort((a,b)=>Number(b.workflow===task.workflow)-Number(a.workflow===task.workflow) || order.compare(a.title,b.title)).slice(0,3);
  const art = plateFor(task.id,lang);
  const field = escape(axisLabel(task.domain,lang));
  const type = escape(axisLabel(task.workflow,lang));
  const fieldLink = `<a href="${filteredHref('domain',task.domain)}#task-directory">${field}</a>`;
  const level = `<a href="${filteredHref('level',task.level)}#task-directory">L${task.level} · ${escape(levels[task.level])}</a>`;
  const facts = [
    fact(t.field,fieldLink),
    fact(t.type,`<a href="${filteredHref('workflow',task.workflow)}#task-directory">${type}</a>`),
    fact(t.level,level),
    task.packageVersion ? fact(t.version,escape(task.packageVersion)) : '',
    task.sourceLabel ? fact(t.source,task.sourceUrl ? `<a href="${escape(task.sourceUrl)}">${escape(task.sourceLabel)}</a>` : escape(task.sourceLabel)) : '',
  ].join('');
  const sections = briefSection(t.input,task.input) + briefSection(t.deliverable,task.deliverable)
    + briefSection(t.evidence,task.evidence,'assessment') + briefSection(t.significance,task.significance);
  return `<article class="site-frame task-page">
    <nav aria-label="${t.breadcrumb}" class="breadcrumbs"><a href="/tasks/">${t.catalogue}</a><span aria-hidden="true">/</span>${fieldLink}</nav>
    <div class="brief-heading${art ? ' with-figure' : ''}"><header>
      <p class="eyeline">${type}</p><h1>${escape(task.title)}</h1><p class="brief-lede">${escape(task.summary)}</p></header>${taskFigure(art,lang)}</div>
    <div class="brief-body${sections ? '' : ' metadata-only'}"><dl class="brief-facts">${facts}</dl>
      ${sections ? `<div class="brief-reading">${sections}</div>` : ''}</div>
    <section class="related-section"><div class="section-heading"><h2>${related.length ? t.related : t.explore}</h2>
      <a class="text-link" href="/tasks/">${t.browse}</a></div>${related.length ? `<ul>${related.map(other=>`<li><a href="${taskHref(other)}">${escape(other.title)}</a><span>${escape(axisLabel(other.workflow,lang))}</span></li>`).join('')}</ul>` : ''}</section>
  </article>`;
}
