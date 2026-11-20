import {escape, taskHref} from './layout.mjs';
import {pyramid} from './pyramid.mjs';
import {expertise} from './community.mjs';
import {plates} from '../data/plates.mjs';

function showcaseCard(task) {
  const art = plates[task.id];
  return `<article class="showcase-card"><a href="${taskHref(task)}">
    ${art ? `<div class="card-plate"><img src="/assets/plates/${art.file}" alt="${escape(art.alt)}" width="720" height="450" loading="lazy" decoding="async"></div>` : ''}
    <div class="card-content"><p class="eyeline">${escape(task.workflow)}</p><h3>${escape(task.title)}</h3>
      <p class="card-summary">${escape(task.summary)}</p></div></a></article>`;
}

export function homePage(tasks) {
  const selected = tasks.filter(task => task.showcase).sort((a,b)=>a.showcase-b.showcase);
  return `${pyramid(tasks)}
  <section class="home-section site-frame" id="showcase" aria-labelledby="showcase-heading">
    <div class="section-heading"><h2 id="showcase-heading">Task showcase</h2>
      <a class="text-link" href="/tasks/">Browse all tasks</a></div>
    <div class="showcase-grid">${selected.map(showcaseCard).join('\n')}</div>
  </section>
  <section class="home-contribute"><div class="site-frame invitation">
    <div><h2>Contribute a scientific task</h2><p>Bring a demanding research workflow or an open scientific question, together with a way to tell when it has been solved.</p></div>
    <a class="solid-link" href="/contribute/">How to contribute</a>
  </div></section>
  ${expertise()}`;
}
