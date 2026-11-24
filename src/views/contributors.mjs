import {contributorGroups} from '../data/contributors.mjs';
import {escape} from './layout.mjs';

export function contributors(lang = 'en') {
  const zh = lang === 'zh';
  const sections = contributorGroups.map(({id, title, members}) => {
    const entries = members.map(member => {
      const field = id === 'area-committee' ? member.field?.[lang] : undefined;
      const affiliations = member.affiliations.map(institution => `<span>${escape(institution[lang])}</span>`).join('');
      return `<li class="roster-entry">
        <span class="roster-name" lang="en">${escape(member.name)}</span>
        ${affiliations ? `<span class="roster-affiliations">${affiliations}</span>` : ''}
        ${field ? `<span class="roster-field">${escape(field)}</span>` : ''}
      </li>`;
    }).join('');
    return `<section class="roster-section" id="${id}" aria-labelledby="${id}-heading">
      <h2 id="${id}-heading">${title[lang]}</h2>
      <ul class="roster-grid" role="list">${entries}</ul>
    </section>`;
  }).join('');
  return `<article class="site-frame section-landing cc-page roster">
    <header class="cc-hero roster-intro"><h1 class="section-title">${zh ? '贡献者' : 'Contributors'}</h1></header>
    ${sections}
  </article>`;
}
