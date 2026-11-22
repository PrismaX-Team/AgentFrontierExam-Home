import {escape} from './layout.mjs';
import {axisLabel} from '../data/taxonomy.mjs';

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
  return {fields: tally(tasks, 'domain'), types: tally(tasks, 'workflow')};
}

function distribution(counts) {
  return [...counts].sort(([a,n], [b,m]) => m - n || a.localeCompare(b, 'en'));
}

function fieldChart(entries, total, lang) {
  let cumulative = 0;
  const stops = [];
  const legend = entries.map(([name, count], i) => {
    const start = 360 * cumulative / total;
    cumulative += count;
    const end = 360 * cumulative / total;
    const color = `var(--field-${i % 11 + 1})`;
    // A fine gap inside each sector keeps the small fields distinct from their neighbours.
    const seam = Math.min(.62, (end - start) / 8);
    stops.push(`${color} ${start.toFixed(3)}deg ${(end - seam).toFixed(3)}deg`, `var(--chart-paper) 0 ${end.toFixed(3)}deg`);
    return `<li><i style="--swatch:${color}" aria-hidden="true"></i><span>${escape(axisLabel(name,lang))}</span><b>${count}</b></li>`;
  });
  const fill = stops.length ? `conic-gradient(${stops.join(',')})` : 'var(--line)';
  return `<div class="field-chart" id="field-chart" aria-labelledby="fields-label" role="group">
    <div class="field-ring" style="--ring:${fill}"><strong>${total}</strong><span>${lang === 'zh' ? '道任务' : (total === 1 ? 'task' : 'tasks')}</span></div>
    <ul class="field-legend" role="list" style="--rows:${Math.ceil(entries.length / 2)}">${legend.join('')}</ul>
  </div>`;
}

function activityChart(entries, lang) {
  const peak = Math.max(1, ...entries.map(([,count]) => count));
  const bars = entries.map(([name,count]) => `<li style="--share:${(100 * count / peak).toFixed(2)}%">
    <span>${escape(axisLabel(name,lang))}</span><b>${count}</b></li>`).join('');
  return `<div class="activity-chart" id="activity-chart" aria-labelledby="activities-label" role="group">
    <ul class="activity-bars" role="list" style="--rows:${Math.ceil(entries.length / 2)}">${bars}</ul></div>`;
}

export function catalogueHero(tasks, {fields, types}, lang = 'en') {
  const zh = lang === 'zh';
  return `<header class="tasks-hero">
    <div class="tasks-hero-copy"><h1>${zh ? '任务目录' : 'Tasks'}</h1>
      <p>${zh ? '按研究领域或科研活动查找任务，了解每道题的科学问题与验收依据。' : 'Explore scientific tasks by field or activity, and see what evidence each one requires.'}</p>
      <a class="solid-link" href="#task-directory">${zh ? '浏览任务' : 'Browse task briefs'}</a>
    </div>
    <fieldset class="catalog-overview"><legend class="visually-hidden">${zh ? '任务分布' : 'Task distribution'}</legend>
      <input class="visually-hidden" type="radio" name="distribution" id="view-fields" aria-controls="field-chart" checked>
      <input class="visually-hidden" type="radio" name="distribution" id="view-activities" aria-controls="activity-chart">
      <div class="chart-switch">
        <label id="fields-label" for="view-fields">${zh ? '科学领域' : 'Fields'} <span>${fields.size}</span></label>
        <label id="activities-label" for="view-activities">${zh ? '任务类型' : 'Task types'} <span>${types.size}</span></label>
      </div>
      ${fieldChart(distribution(fields),tasks.length,lang)}
      ${activityChart(distribution(types),lang)}
    </fieldset>
  </header>`;
}
