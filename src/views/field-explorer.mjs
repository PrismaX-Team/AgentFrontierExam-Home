import {escape} from './layout.mjs';

const pageSize = 5;

function countLabel(count, singular, plural) {
  return count + ' ' + (count === 1 ? singular : plural);
}

export function intersectionHref(domain, workflow, id) {
  return '?' + new URLSearchParams({domain, workflow}) + '#' + id;
}

function fieldPlot(domains, groups) {
  if (!groups.size) return '';
  const fields = new Map(domains.map(domain => [domain, {domain, total: 0, activities: []}]));
  for (const [id, entries] of groups) {
    const {domain, workflow} = entries[0];
    const field = fields.get(domain);
    field.total += entries.length;
    field.activities.push({name: workflow, count: entries.length, href: intersectionHref(domain, workflow, id)});
  }
  const first = [...fields.values()].sort((a,b) => b.activities.length - a.activities.length || b.total - a.total)[0];
  const activities = first.activities.sort((a,b) => b.count-a.count || a.name.localeCompare(b.name,'en'));
  const links = activities.slice(0,pageSize).map(activity =>
    `<li><a href="${escape(activity.href)}" aria-label="${escape(activity.name + ', ' + countLabel(activity.count,'task','tasks') + ' in ' + first.domain)}"><i class="activity-port" aria-hidden="true"></i><span>${escape(activity.name)}</span><span class="field-count">${activity.count}</span></a></li>`
  ).join('');
  const options = domains.map(name =>
    `<option value="${escape(name)}"${name === first.domain ? ' selected' : ''}>${escape(name)}</option>`
  ).join('');
  return `<section class="field-explorer" aria-label="Explore the research activities in a scientific field" data-field-explorer data-page-size="${pageSize}">
    <div class="field-headings">
      <label for="explorer-field">Scientific field</label>
      <div><span>Research activity</span><span>Tasks</span></div>
    </div>
    <div class="field-plot">
      <canvas class="field-paths" aria-hidden="true" hidden></canvas>
      <div class="field-origin"><div class="field-switch">
        <strong data-origin-name>${escape(first.domain)}</strong><span class="field-chevron" aria-hidden="true" hidden></span>
        <select id="explorer-field" aria-controls="field-activities" hidden>${options}</select>
      </div><p class="field-size"><span data-field-total>${countLabel(first.total,'task','tasks')}</span> · <span data-activity-total>${countLabel(activities.length,'activity','activities')}</span></p><i class="origin-port" aria-hidden="true"></i></div>
      <ul class="field-activities" id="field-activities" aria-label="Research activities in ${escape(first.domain)}">${links}</ul>
    </div>
    <div class="field-pages" hidden><span data-field-range></span><button type="button" data-field-page="-1" aria-label="Previous activities">←</button><button type="button" data-field-page="1" aria-label="Next activities">→</button></div>
    <span class="visually-hidden" data-field-announcement aria-live="polite"></span>
  </section>`;
}

export function catalogueHero(domains, groups) {
  return `<header class="tasks-hero">
    <div class="tasks-hero-copy"><h1>Tasks</h1>
      <p>Each brief sets out what an agent receives, what it must produce and how researchers assess the result.</p>
      <div class="tasks-hero-links"><a class="solid-link" href="#task-directory">Browse task briefs</a><a class="text-link" href="#activity-matrix">View full matrix</a></div>
    </div>
    ${fieldPlot(domains,groups)}
  </header>`;
}
