import {escape} from './layout.mjs';
import {axisLabel} from '../data/taxonomy.mjs';
import {collectionCounts, intersectionHref} from './field-explorer.mjs';
import {levelNavigation, researchPanels} from './coverage-levels.mjs';

const copy = {
  en: {title:'Scientific Taskonomy', map:'Number of tasks by field and task type', showMap:'Coverage map', index:'Field index', field:'Scientific field', type:'Task type', types:'Task types', tasks:'Tasks', back:'All fields', none:'No tasks in this field match the current filters.'},
  zh: {title:'科学任务分类体系', map:'按领域和任务类型统计的题量', showMap:'覆盖图', index:'领域索引', field:'科学领域', type:'任务类型', types:'任务类型数', tasks:'题数', back:'全部领域', none:'当前筛选下，该领域没有匹配的任务。'},
};

const slug = value => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export function groupId(field, activity, level = 1) {
  return level === 1 ? `tasks-${slug(field)}--${slug(activity)}` : `tasks-l${level}-${slug(field)}`;
}

export function taskCount(count, lang) {
  return lang === 'zh' ? `${count} 道任务` : `${count} ${count === 1 ? 'task' : 'tasks'}`;
}

function ranked(counts, lang) {
  return [...counts].sort(([a,n],[b,m]) => m - n || a.localeCompare(b,'en'))
    .map(([key,total]) => ({key, total, name:escape(axisLabel(key,lang))}));
}

function pairLink(field, pair, lang) {
  const axis = axisLabel(field.key,lang) + ' · ' + axisLabel(pair.type.key,lang);
  return `href="${escape(intersectionHref(field.key,pair.type.key,pair.id,1))}" data-domain="${escape(field.key)}" data-workflow="${escape(pair.type.key)}" data-axis-label="${escape(axis)}" aria-label="${escape(axis + ' · ' + taskCount(pair.count,lang))}"`;
}

function viewLink(view, lang) {
  const map = view === 'map';
  const label = map ? copy[lang].showMap : copy[lang].index;
  const short = lang === 'zh' ? (map ? '覆盖图' : '索引') : (map ? 'Map' : 'Index');
  return `<a class="coverage-view coverage-show-${view}" href="${map ? '#coverage-map' : '#activity-matrix'}" aria-label="${label}"><i aria-hidden="true"></i>${short}</a>`;
}

function coverageMap(fields, types, peak, lang) {
  const t = copy[lang];
  const zero = `<span class="visually-hidden">${taskCount(0,lang)}</span>`;
  const largest = fields[0]?.total || 1;
  const headers = fields.map(field => `<th scope="col" data-axis-domain="${escape(field.key)}" style="--field-share:${field.total / largest}"><a class="coverage-field-link" href="#${field.id}">
    <span class="matrix-field-name">${field.name}</span><span class="field-quantity"><span data-domain-total="${escape(field.key)}">${field.total}</span><span class="visually-hidden"> ${t.tasks}</span><i class="coverage-chevron" aria-hidden="true"></i></span></a></th>`).join('');
  const rows = types.map((type,index) => {
    const cells = fields.map(field => {
      const pair = field.pairs[index];
      if (!pair) return `<td>${zero}</td>`;
      return `<td><a class="matrix-cell" ${pairLink(field,pair,lang)} style="--mark:${Math.sqrt(pair.count / peak)}"><span class="matrix-mark"><span class="circle-count">${pair.count}</span></span></a><span class="visually-hidden" hidden>${taskCount(0,lang)}</span></td>`;
    }).join('');
    return `<tr><th scope="row" data-axis-workflow="${escape(type.key)}"><span class="coverage-row-name">${type.name}</span></th>
      <td class="matrix-tally"><span data-workflow-total="${escape(type.key)}">${type.total}</span></td>${cells}</tr>`;
  }).join('\n');
  return `<div class="matrix-viewport" id="coverage-map" role="region" aria-label="${t.map}" tabindex="0"><table class="task-matrix" aria-label="${t.map}" style="--field-count:${fields.length}">
    <colgroup><col class="coverage-stub"><col class="coverage-tally-col">${'<col>'.repeat(fields.length)}</colgroup>
    <thead><tr><th scope="col" aria-label="${t.type}"><div class="matrix-corner"><span class="matrix-axis-title">${t.type}</span>${viewLink('index',lang)}</div></th>
      <th scope="col" class="matrix-tally">${t.tasks}</th>${headers}</tr></thead><tbody>${rows}</tbody></table></div>`;
}

function fieldIndex(fields, peak, lang) {
  const t = copy[lang];
  const rows = fields.map(field => {
    const breadth = field.pairs.filter(Boolean).length;
    const strip = field.pairs.map(pair => pair
      ? `<i data-coverage-group="${pair.id}" style="--mark:${Math.sqrt(pair.count / peak)}"></i>` : '<i></i>').join('');
    return `<li><a class="coverage-index-row coverage-field-link" href="#${field.id}"><span class="coverage-name">${field.name}</span>
      <span class="coverage-breadth"><span class="coverage-strip" aria-hidden="true">${strip}</span><span data-field-types="${escape(field.key)}">${breadth}</span><span class="visually-hidden"> ${t.types}</span></span>
      <span class="field-quantity"><span data-domain-total="${escape(field.key)}">${field.total}</span><span class="visually-hidden"> ${t.tasks}</span><i class="coverage-chevron" aria-hidden="true"></i></span></a></li>`;
  }).join('\n');
  return `<div class="coverage-index"><div class="coverage-index-row coverage-labels"><span class="index-axis"><span>${t.field}</span>${viewLink('map',lang)}</span><span>${t.types}</span><span>${t.tasks}</span></div><ul role="list">${rows}</ul></div>`;
}

function fieldDetail(field, lang) {
  const t = copy[lang];
  const rows = field.pairs.filter(Boolean).map(pair =>
    `<li><a class="coverage-pair" ${pairLink(field,pair,lang)} style="--share:${pair.count / field.total}"><span>${pair.type.name}</span>
      <i class="coverage-bar" aria-hidden="true"></i><span class="pair-count">${pair.count}</span><i class="coverage-chevron" aria-hidden="true"></i></a></li>`).join('\n');
  return `<section class="coverage-detail" id="${field.id}" aria-labelledby="${field.id}-name">
    <div class="coverage-detail-head"><a class="coverage-back" href="#activity-matrix"><i class="coverage-chevron" aria-hidden="true"></i>${t.back}</a>
      <div class="coverage-detail-title"><h3 id="${field.id}-name" tabindex="-1">${field.name}</h3><span class="coverage-total" data-field-reading="${escape(field.key)}">${taskCount(field.total,lang)}</span></div></div>
    <div class="coverage-detail-labels coverage-labels" aria-hidden="true"><span>${t.type}</span><span>${t.tasks}</span></div>
    <ul role="list">${rows}</ul><p class="coverage-empty" hidden>${t.none}</p>
  </section>`;
}

export function taskCoverage(tasks, groups, lang) {
  const t = copy[lang];
  const byLevel = Map.groupBy(tasks, task => task.level);
  const counts = collectionCounts(byLevel.get(1) ?? []);
  const types = ranked(counts.types,lang);
  const fields = ranked(counts.fields,lang).map(field => ({
    ...field, id:'field-' + slug(field.key),
    pairs:types.map(type => {
      const id = groupId(field.key,type.key);
      const count = groups.get(id)?.length;
      return count ? {id,count,type} : null;
    }),
  }));
  const peak = Math.max(1,...fields.flatMap(field => field.pairs.map(pair => pair?.count || 0)));
  return `<section class="matrix-section" id="activity-matrix" aria-labelledby="matrix-heading">
    <div class="matrix-heading"><h2 id="matrix-heading">${t.title}</h2></div>
    <details class="catalog-matrix" open><summary aria-labelledby="matrix-heading" aria-controls="matrix-grid"></summary>
      <div class="task-atlas" id="matrix-grid">${levelNavigation(byLevel,lang)}
        <div class="coverage-body" id="level-1" data-peak="${peak}" data-field-peak="${fields[0]?.total || 1}">
          <div class="coverage-overview"${fields.length ? '' : ' hidden'}>
            ${coverageMap(fields,types,peak,lang)}${fieldIndex(fields,peak,lang)}
          </div>${fields.map(field => fieldDetail(field,lang)).join('\n')}
          ${fields.length ? '' : `<p class="coverage-empty">${lang === 'zh' ? '本版共 0 道 L1 任务。' : '0 published L1 tasks.'}</p>`}
        </div>${researchPanels(byLevel,lang)}
      </div>
    </details>
  </section>`;
}
