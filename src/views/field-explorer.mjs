import {escape, levelLabels} from './layout.mjs';
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

const descriptions = {
  en: [
    'Complete a defined piece of scientific work.',
    'Resolve an open scientific question.',
    'Establish a new phenomenon, mechanism or principle.',
  ],
  zh: [
    '完成一项具体的科研工作。',
    '解决一个尚未得到回答的科学问题。',
    '发现并验证新的现象、机制或原理。',
  ],
};

function ranking(counts, heading, lang) {
  const ordered = [...counts].sort(([a, n], [b, m]) => m - n || a.localeCompare(b, 'en')).slice(0, 3);
  if (!ordered.length) return '';
  const peak = ordered[0][1];
  return `<div class="catalog-ranking"><h2>${heading}</h2><ol>
    ${ordered.map(([name, count]) => `<li style="--share:${(count * 100 / peak).toFixed(2)}%">
      <span>${escape(axisLabel(name, lang))}</span><span class="rank-count">${count}</span></li>`).join('')}
  </ol></div>`;
}

function levelsOverview(tasks, lang) {
  const zh = lang === 'zh';
  const names = levelLabels(lang);
  const assigned = tasks.filter(task => task.level).length;
  let note = zh ? '层级取决于任务希望取得的科学成果。' : 'A level describes the scientific result a task seeks.';
  if (tasks.length && !assigned) note = zh ? '本版已按科研活动归类，逐题层级尚待评定。' : 'This edition records task types. Individual levels await assignment.';
  return `<section class="catalog-levels" aria-labelledby="catalog-level-heading">
    <header><h2 id="catalog-level-heading">${zh ? '科学层级' : 'Scientific levels'}</h2><p>${note}</p></header>
    <dl>${descriptions[lang].map((description, index) => `<div>
      <dt><span class="catalog-level-code">L${index + 1}</span> ${escape(names[index + 1])}</dt><dd>${description}</dd>
    </div>`).join('')}</dl>
  </section>`;
}

export function catalogueHero(tasks, {fields, types}, lang = 'en') {
  const zh = lang === 'zh';
  const disciplines = new Map(fields);
  const gdpx = disciplines.get('GDPX') ?? 0;
  disciplines.delete('GDPX');
  const measures = [
    [tasks.length, zh ? '道任务' : 'Task briefs'],
    [disciplines.size, zh ? '个科学领域' : 'Scientific fields'],
    [types.size, zh ? '种任务类型' : 'Task types'],
  ];
  const scopeNote = zh ? `另有 ${gdpx} 道 GDPX 任务计入总数，其领域单独归档。` : `The total includes ${gdpx} GDPX ${gdpx === 1 ? 'task' : 'tasks'} awaiting field assignment.`;
  return `<header class="tasks-hero">
    <div class="tasks-hero-copy"><h1>${zh ? '任务目录' : 'Tasks'}</h1>
      <p>${zh ? '从研究对象或研究方法出发，查找任务，了解它要回答的问题和需要提交的证据。' : 'Explore what scientific agents are asked to do, from measuring an observation to testing an explanation.'}</p>
      <a class="solid-link" href="#task-directory">${zh ? '浏览任务' : 'Browse task briefs'}</a>
    </div>
    <div class="catalog-overview">
      <dl class="catalog-measures">${measures.map(([number, label]) => `<div><dt>${label}</dt><dd>${number}</dd></div>`).join('')}</dl>
      <div class="catalog-rankings">
        ${ranking(disciplines, zh ? '题量最多的领域' : 'Leading fields', lang)}
        ${ranking(types, zh ? '题量最多的类型' : 'Leading task types', lang)}
      </div>
      ${gdpx ? `<p class="catalog-scope-note">${scopeNote}</p>` : ''}
    </div>
  </header>
  ${levelsOverview(tasks, lang)}`;
}
