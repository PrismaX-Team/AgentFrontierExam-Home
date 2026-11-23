import {escape, levelLabels, taskHref} from './layout.mjs';
import {axisLabel} from '../data/taxonomy.mjs';

// The three outlines follow the base, middle and tip of the AFE mark.
const slices = [
  'M3 33 16 27 29 33 16 39Z M3 33v3l13 6 13-6v-3 M16 39v3',
  'M7 22 16 18 25 22 16 26Z M7 22l-2 5 11 5 11-5-2-5 M16 26v6',
  'M16 5 9 17l7 3 7-3Z M16 5v15',
];
const ridges = ['M4 33.4 16 39l12-5.6M16 39v2', 'M7.8 22.4 16 26l8.2-3.6M16 26v4.7', 'M16 6.2v12.6'];

function levelMark(level) {
  return `<svg class="atlas-mark" viewBox="0 0 32 46" fill="none" stroke-linejoin="round" aria-hidden="true">${slices.map((d,i) =>
    `<path${i + 1 === level ? ' class="mark-selected"' : ''} d="${d}"/>`).join('')}<path class="mark-ridge" d="${ridges[level-1]}"/></svg>`;
}

export function levelNavigation(byLevel, lang) {
  const zh = lang === 'zh';
  const shortNames = ['Workflows','Breakthroughs','Discoveries'];
  const links = Object.entries(levelLabels(lang)).map(([level,name]) => {
    const n = byLevel.get(Number(level))?.length ?? 0;
    const unit = zh ? '道题' : n === 1 ? 'task' : 'tasks';
    const count = n + ' ' + unit;
    const pending = level !== '1' && !n;
    const status = pending ? (zh ? '建设中' : 'In progress') : count;
    const named = zh ? escape(name) : `<span class="tier-full">${escape(name)}</span><span class="tier-short">${shortNames[Number(level)-1]}</span>`;
    const label = [`L${level}`, name, status, ...(pending ? [count] : [])].join(' · ');
    return `<a class="atlas-level-link" data-tier="${level}" data-count="${n}" href="?level=${level}#level-${level}" aria-controls="level-${level}" aria-label="${escape(label)}">
      ${levelMark(Number(level))}<span class="atlas-code">L${level}</span><span class="atlas-level-name">${named}</span><span class="atlas-count">${status}</span></a>`;
  }).join('');
  return `<nav class="atlas-levels" aria-label="${zh ? '科学任务层级' : 'Scientific task levels'}">${links}</nav>`;
}

function evidenceFigure(level, zh) {
  const id = 'evidence-' + level;
  const caption = level === 2
    ? (zh ? '两种解释给出不同预测，一次观测便能区分它们。' : 'A measurement where two predictions diverge can distinguish between them.')
    : (zh ? '独立观测在同一位置检出了先前发现的特征。' : 'An independent observation detects the feature at the same position.');
  const marks = level === 2
    ? `<path class="figure-grid" d="M23 27H305M23 61H305M23 95H305M23 129H305"/>
       <path class="figure-axis" d="M23 17v112h282"/>
       <path class="figure-alternative" d="M23 109C72 107 103 92 139 79S232 76 294 89"/>
       <path class="figure-primary" d="M23 109C72 107 103 92 139 79S238 49 294 22"/>
       <path class="figure-guide" d="M239 18v111"/>
       <g class="figure-observation"><path d="M239 37v14m-4-14h8m-8 14h8"/><circle cx="239" cy="44" r="3.6"/></g>
       <text x="304" y="25">A</text><text x="304" y="93">B</text>`
    : `<rect class="figure-window" x="174" y="18" width="23" height="113" rx="2"/>
       <path class="figure-guide" d="M185.5 15v121"/>
       <path class="figure-grid" d="M20 61h300M20 123h300"/>
       <path class="figure-primary" d="M20 61l14-1 10 2 13-2 12 1 13-1 11 2 13-3 13 2 10-3 11 2 13-2 10-4 7-10 6-16 5-6 6 16 6 14 9 6 12 3 13-1 12 1 11-2 13 2 13-2 14 1 14-1"/>
       <path class="figure-repeat" d="M20 122l15 2 10-2 12 1 13-3 12 2 12-1 10 2 15-1 11-2 11 2 12-1 10-3 8-10 6-14 5-7 6 12 7 15 8 5 13 4 12-2 12 1 11-2 13 2 12-2 14 3 15-2"/>
       <text x="20" y="29">${zh ? '首次观测' : 'First observation'}</text><text x="20" y="92">${zh ? '独立观测' : 'Independent observation'}</text>`;
  return `<figure class="evidence-figure"><svg viewBox="0 0 330 146" role="img" aria-labelledby="${id}-caption">${marks}</svg>
    <figcaption id="${id}-caption"><span>${zh ? '示意' : 'Schematic'}</span> ${caption}</figcaption></figure>`;
}

function questionsByField(entries, lang) {
  if (!entries.length) return '';
  const groups = Map.groupBy(entries, task => task.domain);
  const fields = [...groups].sort(([a],[b]) => axisLabel(a,lang).localeCompare(axisLabel(b,lang),lang));
  const lists = fields.map(([field,tasks]) => `<div><h4>${escape(axisLabel(field,lang))}</h4>
    <ul role="list">${tasks.map(task => `<li><a href="${taskHref(task)}">${escape(task.title)}</a></li>`).join('')}</ul></div>`).join('');
  return `<div class="research-questions"><h3>${lang === 'zh' ? '各领域的研究问题' : 'Research questions by field'}</h3>${lists}</div>`;
}

export function researchPanels(byLevel, lang) {
  const zh = lang === 'zh';
  const goals = [
    {level:2, heading:zh ? '解答尚未解决的科学问题' : 'Resolve an open scientific question',
      evidence:zh ? '一项观测、比较或证明回答了已有研究留下的问题。其他团队可以独立检验支持这个结论的证据。'
        : 'An observation, comparison or proof answers a question that prior work left open. Another team can independently check the evidence for the conclusion.'},
    {level:3, heading:zh ? '<span>首次揭示</span><span>未知现象、</span><span>机制或原理</span>' : 'Discover a new phenomenon, mechanism or principle',
      evidence:zh ? '这项发现拓展了一个领域能够解释或预测的范围。独立团队可以检验这一发现，并将它与已知效应区分开来。'
        : 'The discovery changes what a field can explain or predict. Independent researchers can test the finding and distinguish it from known effects.'},
  ];
  return goals.map(({level, heading, evidence}) => {
    const entries = byLevel.get(level) ?? [];
    const criteria = `<a class="research-criteria" href="/contribute/#goal-l${level}"><span>${zh ? '查看共建标准' : 'Contribution criteria'}</span><i aria-hidden="true">→</i></a>`;
    return `<section class="research-level" data-tier="${level}" id="level-${level}" aria-labelledby="target-l${level}">
      <div class="research-spread"><div class="research-goal"><h3 id="target-l${level}">${heading}</h3>
        <p>${evidence}</p>${criteria}</div>
        ${evidenceFigure(level,zh)}</div>${questionsByField(entries,lang)}
    </section>`;
  }).join('');
}
