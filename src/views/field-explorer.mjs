import {escape, levelLabels} from './layout.mjs';
import {activityAliases, axisLabel} from '../data/taxonomy.mjs';
import {distributionArt} from './distribution-art.mjs';

export function intersectionHref(domain, workflow, id) {
  return '?' + new URLSearchParams({domain, workflow}) + '#' + id;
}

function tally(tasks, key) {
  const counts = new Map();
  for (const task of tasks) {
    const value = task[key];
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return counts;
}

export function collectionCounts(tasks) {
  return {fields: tally(tasks, 'domain'), types: tally(tasks, 'workflow'), levels: tally(tasks, 'level')};
}

function rankedEntries(counts, lang, sharedColor) {
  return [...counts].sort(([a,n], [b,m]) => m - n || a.localeCompare(b, 'en'))
    .map(([key,count], index) => ({key, count, label: axisLabel(key,lang), color: sharedColor ?? `var(--field-${index % 11 + 1})`}));
}

function compactText(full, short) {
  return full === short ? escape(full) :
    `<span class="chart-full">${escape(full)}</span><span class="chart-short">${escape(short)}</span>`;
}

const shortTypes = new Map(Object.entries(activityAliases).map(([short, full]) => [full, short]));
shortTypes.set('Binding pose prediction', 'Binding pose');
shortTypes.set('Candidate screening and ranking', 'Screening');
shortTypes.set('Scientific design and optimization', 'Design');
shortTypes.set('Figure and analysis reproduction', 'Reproduction');

function distributionPanel(view, entries, total, lang) {
  const zh = lang === 'zh';
  const rows = entries.map(({key, label, count, color}, index) => {
    const code = view === 'levels' ? `<span class="distribution-code">L${key}</span> ` : '';
    const short = view === 'levels' ? 'L' + key : view === 'types' && !zh ? shortTypes.get(key) : '';
    const spoken = (code ? `L${key} · ` : '') + label + (zh ? `，${count} 道任务` : `, ${count} ${count === 1 ? 'task' : 'tasks'}`);
    return `<li><button type="button" class="distribution-key" data-entry="${index}"${short ? ` data-short="${escape(short)}"` : ''} aria-label="${escape(spoken)}" disabled style="--swatch:${color}">
      <span class="distribution-name">${code}${escape(label)}</span><b class="distribution-count">${count}</b></button></li>`;
  }).join('');
  const capacity = view === 'levels' ? total : Math.max(0,...entries.map(entry => entry.count));
  const vessel = zh ? {fields:'满仓', types:'满格', levels:'满层'} : {fields:'Full sector', types:'Full well', levels:'Full tier'};
  const scale = zh ? `${vessel[view]}为 ${capacity} 道题` : `${vessel[view]} · ${capacity} ${capacity === 1 ? 'task' : 'tasks'}`;
  return `<div class="distribution-panel" id="chart-${view}" data-view="${view}" role="group" aria-labelledby="label-${view}">
    <figure class="distribution-instrument" aria-hidden="true">
      <div class="distribution-stage ruled-ground">${distributionArt(view,entries)}</div>
    </figure>
    <div class="distribution-register">
      <ul class="distribution-keys" role="list" aria-labelledby="count-${view}">${rows}</ul>
      <p class="distribution-scale">${scale}</p>
    </div>
  </div>`;
}

export function catalogueHero(tasks, counts, lang = 'en') {
  const zh = lang === 'zh';
  const fieldUnit = counts.fields.size === 1 ? 'field' : 'fields';
  const typeUnit = counts.types.size === 1 ? 'type' : 'types';
  const views = [
    {
      key:'fields', label: zh ? '科学领域' : 'Fields', short: zh ? '领域' : 'Fields',
      unit: zh ? '个领域' : fieldUnit, entries: rankedEntries(counts.fields,lang),
    },
    {
      key:'types', label: zh ? '任务类型' : 'Task types', short: zh ? '类型' : 'Types',
      unit: zh ? '种任务类型' : 'task ' + typeUnit, shortUnit: zh ? '种类型' : typeUnit,
      entries: rankedEntries(counts.types,lang,'var(--field-2)'),
    },
    {
      key:'levels', label: zh ? '科学层级' : 'Levels', short: zh ? '层级' : 'Levels', unit: zh ? '个层级' : 'levels',
      entries: Object.entries(levelLabels(lang)).map(([key,label]) => ({
        key, label, count:counts.levels.get(Number(key)) ?? 0, color:`var(--field-${key})`,
      })),
    },
  ];
  const radios = views.map(({key,label}, index) => `<input class="visually-hidden" type="radio" name="distribution"
    id="view-${key}" value="${key}" aria-controls="chart-${key}"${index === 0 ? ' checked' : ''} aria-label="${label}">`).join('');
  const labels = views.map(({key,label,short}) => `<label id="label-${key}" for="view-${key}">${compactText(label,short)}</label>`).join('');
  const headings = views.map(({key,entries,unit,shortUnit=unit}) =>
    `<span class="register-count" id="count-${key}">${entries.length} ${compactText(unit,shortUnit)}</span>`).join('');
  return `<header class="section-hero tasks-hero">
    <div class="tasks-hero-copy"><h1 class="section-title">${zh ? '任务目录' : 'Tasks'}</h1>
      <p>${zh ? '按研究领域或科研活动查找任务，了解每道题的科学问题与验收依据。' : 'Explore scientific tasks by field or activity, and see what evidence each one requires.'}</p>
      <a class="solid-link" href="#task-directory">${zh ? '浏览任务' : 'Browse task briefs'}</a>
    </div>
    <fieldset class="catalog-overview"><legend class="visually-hidden">${zh ? `任务分布，共 ${tasks.length} 道题` : `Distribution of ${tasks.length} ${tasks.length === 1 ? 'task' : 'tasks'}`}</legend>
      ${radios}
      <div class="distribution-head">
        <div class="chart-tools">
          <div class="chart-switch">${labels}</div>
          <p class="distribution-total"><strong>${tasks.length}</strong>
            <span class="distribution-total-label">${compactText(zh ? '任务总数' : 'Total tasks', zh ? '题' : 'total')}</span>
            <span class="distribution-selection" hidden><span data-full></span><span data-short></span></span></p>
        </div>
        <div class="register-heading">${headings}<span class="register-unit"><span>${zh ? '题数' : 'Tasks'}</span><span aria-hidden="true">#</span></span></div>
      </div>
      ${views.map(({key,entries}) => distributionPanel(key,entries,tasks.length,lang)).join('')}
    </fieldset>
  </header>`;
}
