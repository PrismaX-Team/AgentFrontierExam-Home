import {escape} from './layout.mjs';
import {axisLabel} from '../data/taxonomy.mjs';
import {intersectionHref} from './field-explorer.mjs';

const copy = {
  en: {title:'Scientific Taskonomy', map:'Number of tasks by field and task type', showMap:'Coverage map', index:'Field index', field:'Scientific field', type:'Task type', types:'Task types', tasks:'Tasks', scale:'Tasks per circle', back:'All fields', none:'No tasks in this field match the current filters.'},
  zh: {title:'科学任务分类体系', map:'按领域和任务类型统计的题量', showMap:'覆盖图', index:'领域索引', field:'科学领域', type:'任务类型', types:'任务类型数', tasks:'题数', scale:'圆点大小对应题数', back:'全部领域', none:'当前筛选下，该领域没有匹配的任务。'},
};

const slug = value => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export function groupId(field, activity) {
  return `tasks-${slug(field)}--${slug(activity)}`;
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
  return `href="${escape(intersectionHref(field.key,pair.type.key,pair.id))}" data-domain="${escape(field.key)}" data-workflow="${escape(pair.type.key)}" data-axis-label="${escape(axis)}" aria-label="${escape(axis + ' · ' + taskCount(pair.count,lang))}"`;
}

function coverageMap(fields, types, peak, lang) {
  const t = copy[lang];
  const zero = `<span class="visually-hidden">${taskCount(0,lang)}</span>`;
  const headers = fields.map(field => `<th scope="col" data-axis-domain="${escape(field.key)}"><a class="coverage-field-link" href="#${field.id}">
    <span>${field.name}</span><span class="field-quantity"><span data-domain-total="${escape(field.key)}">${field.total}</span><span class="visually-hidden"> ${t.tasks}</span><i class="coverage-chevron" aria-hidden="true"></i></span></a></th>`).join('');
  const rows = types.map((type,index) => {
    const cells = fields.map(field => {
      const pair = field.pairs[index];
      if (!pair) return `<td>${zero}</td>`;
      return `<td><a class="matrix-cell" ${pairLink(field,pair,lang)} style="--mark:${Math.sqrt(pair.count / peak)}"><span class="circle-count">${pair.count}</span></a><span class="visually-hidden" hidden>${taskCount(0,lang)}</span></td>`;
    }).join('');
    return `<tr><th scope="row" data-axis-workflow="${escape(type.key)}"><span class="coverage-row-name"><span>${type.name}</span><span data-workflow-total="${escape(type.key)}">${type.total}</span></span></th>${cells}</tr>`;
  }).join('\n');
  return `<div class="matrix-viewport" id="coverage-map" role="region" aria-label="${t.map}" tabindex="0"><table class="task-matrix" aria-label="${t.map}" style="--field-count:${fields.length}">
    <colgroup><col class="coverage-stub">${'<col>'.repeat(fields.length)}</colgroup>
    <thead><tr><th scope="col"><span class="coverage-row-name"><span>${t.type}</span><span>${t.tasks}</span></span></th>${headers}</tr></thead><tbody>${rows}</tbody></table></div>`;
}

function fieldIndex(fields, typeCount, lang) {
  const t = copy[lang];
  const rows = fields.map(field => {
    const breadth = field.pairs.filter(Boolean).length;
    return `<li><a class="coverage-index-row coverage-field-link" href="#${field.id}"><span class="coverage-name">${field.name}</span>
      <span class="coverage-breadth" style="--share:${breadth / typeCount}"><i class="coverage-bar" aria-hidden="true"></i><span data-field-types="${escape(field.key)}">${breadth}</span><span class="visually-hidden"> ${t.types}</span></span>
      <span class="field-quantity"><span data-domain-total="${escape(field.key)}">${field.total}</span><span class="visually-hidden"> ${t.tasks}</span><i class="coverage-chevron" aria-hidden="true"></i></span></a></li>`;
  }).join('\n');
  return `<div class="coverage-index"><div class="coverage-index-row coverage-labels" aria-hidden="true"><span>${t.field}</span><span>${t.types}</span><span>${t.tasks}</span></div><ul role="list">${rows}</ul></div>`;
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

export function taskCoverage(groups, counts, lang) {
  const t = copy[lang];
  const types = ranked(counts.types,lang);
  const fields = ranked(counts.fields,lang).map(field => ({
    ...field, id:'field-' + slug(field.key),
    pairs:types.map(type => {
      const id = groupId(field.key,type.key);
      const count = groups.get(id)?.length;
      return count ? {id,count,type} : null;
    }),
  }));
  const peak = Math.max(1,...Array.from(groups.values(), entries => entries.length));
  const stops = [...new Set([1, Math.ceil(peak / 2), peak])];
  const legend = stops.map(n => `<span><i aria-hidden="true" style="--mark:${Math.sqrt(n / peak)}"></i>${n}</span>`).join('');
  return `<section class="matrix-section" id="activity-matrix" aria-labelledby="matrix-heading">
    <div class="matrix-heading"><h2 id="matrix-heading">${t.title}</h2><div class="coverage-legend"><span>${t.scale}</span>${legend}</div>
      <a class="coverage-view coverage-show-map" href="#coverage-map" aria-label="${t.showMap}"><span>${t.showMap}</span><span>${lang === 'zh' ? t.showMap : 'Map'}</span></a>
      <a class="coverage-view coverage-show-index" href="#activity-matrix" aria-label="${t.index}"><span>${t.index}</span><span>${lang === 'zh' ? '索引' : 'Index'}</span></a></div>
    <details class="catalog-matrix" open><summary aria-labelledby="matrix-heading" aria-controls="matrix-grid"></summary>
      <div class="coverage-body" id="matrix-grid" data-peak="${peak}" data-type-count="${types.length}">
        <div class="coverage-overview">${coverageMap(fields,types,peak,lang)}${fieldIndex(fields,types.length,lang)}</div>
        ${fields.map(field => fieldDetail(field,lang)).join('\n')}
      </div>
    </details>
  </section>`;
}
