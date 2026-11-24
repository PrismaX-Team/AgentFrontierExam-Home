import {contributorGroups} from '../data/contributors.mjs';
import {escape} from './layout.mjs';

export function contributors(lang = 'en') {
  const zh = lang === 'zh';
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
    <header class="cc-hero roster-intro"><h1 class="section-title">${zh ? '贡献者' : 'Contributors'}</h1></header>
    ${sections}
  </article>`;
}
