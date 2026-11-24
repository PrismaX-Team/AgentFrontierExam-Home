import {contributorGroups} from '../data/contributors.mjs';
import {escape, keepEnding} from './layout.mjs';

export function contributors(lang = 'en') {
  const zh = lang === 'zh';
  const intro = zh ? '他们共同规划基准的研究方向、审核科学问题，并把各自领域的工作写成任务。'
    : 'Meet the researchers who set the benchmark’s direction, review scientific questions and write its tasks.';
  const correspondenceLabel = zh ? '学术通讯' : 'For scientific correspondence';
  const sections = contributorGroups.map(({id, title, members}) => {
    const entries = members.map(member => {
      const mark = member.handlesCorrespondence ? `<sup aria-hidden="true">*</sup><span class="visually-hidden"> (${correspondenceLabel})</span>` : '';
      const affiliations = member.affiliations.map(institution => `<span>${escape(institution[lang])}</span>`).join('');
      return `<li class="roster-entry">
        <span class="roster-name"><span lang="en">${escape(member.name)}</span>${mark}</span>
        ${affiliations ? `<span class="roster-affiliations">${affiliations}</span>` : ''}
      </li>`;
    }).join('');
    const note = members.some(member => member.handlesCorrespondence)
      ? `<p class="roster-note"><span aria-hidden="true">*</span> ${correspondenceLabel}</p>` : '';
    return `<section class="roster-section" id="${id}" aria-labelledby="${id}-heading">
      <header><h2 id="${id}-heading">${title[lang]}</h2>${note}</header>
      <ul class="roster-grid" role="list">${entries}</ul>
    </section>`;
  }).join('');
  return `<article class="site-frame section-landing cc-page roster">
    <header class="cc-hero roster-intro"><h1 class="section-title">${zh ? '贡献者' : 'Contributors'}</h1><p>${keepEnding(intro, lang)}</p></header>
    ${sections}
  </article>`;
}
