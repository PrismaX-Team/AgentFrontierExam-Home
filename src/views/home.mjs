import {escape, taskHref} from './layout.mjs';
import {pyramid} from './pyramid.mjs';
import {expertise} from './community.mjs';
import {plateFor} from '../data/plates.mjs';
import {axisLabel} from '../data/taxonomy.mjs';

function showcaseCard(task, lang) {
  const art = plateFor(task.id, lang);
  return `<article class="showcase-card"><a href="${taskHref(task)}">
    ${art ? `<div class="card-plate"><img src="/assets/plates/${art.file}" alt="${escape(art.alt)}" width="720" height="450" loading="lazy" decoding="async"></div>` : ''}
    <div class="card-content"><p class="eyeline">${escape(axisLabel(task.workflow, lang))}</p><h3>${escape(task.title)}</h3>
      <p class="card-summary">${escape(task.summary)}</p></div></a></article>`;
}

export function homePage(tasks, lang = 'en') {
  const zh = lang === 'zh';
  const selected = tasks.filter(task => task.showcase).sort((a,b)=>a.showcase-b.showcase);
  return `${pyramid(tasks, lang)}
  <section class="home-section site-frame" id="showcase" aria-labelledby="showcase-heading">
    <div class="section-heading"><h2 id="showcase-heading">${zh ? '任务展示' : 'Task showcase'}</h2>
      <a class="text-link" href="/tasks/">${zh ? '浏览全部任务' : 'Browse all tasks'}</a></div>
    <div class="showcase-grid">${selected.map(task => showcaseCard(task, lang)).join('\n')}</div>
  </section>
  <section class="home-contribute"><div class="site-frame invitation">
    <div><h2>${zh ? '共建科学任务' : 'Contribute a scientific task'}</h2><p>${zh
      ? '从你的研究中选取一项有挑战的科研工作，或一个尚待解答的科学问题，并说明怎样的证据足以证明智能体完成了它。'
      : 'Bring a demanding research workflow or an open scientific question, together with a way to tell when it has been solved.'}</p></div>
    <a class="solid-link" href="/contribute/">${zh ? '参与共建' : 'How to contribute'}</a>
  </div></section>
  ${expertise(lang)}`;
}
