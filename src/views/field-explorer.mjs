import {escape} from './layout.mjs';

export function intersectionHref(domain, workflow, id) {
  return '?' + new URLSearchParams({domain, workflow}) + '#' + id;
}

// Two oblique cross-sections keep the two kinds of node distinct even in print.
function ring(names, x, y, phase) {
  const rx = 44, ry = 78, skew = .39;
  const points = new Map(names.map((name, i) => {
    const angle = phase + 2 * Math.PI * i / names.length;
    const dy = ry * Math.sin(angle);
    return [name, {x: +(x + rx * Math.cos(angle) + skew * dy).toFixed(1), y: +(y + dy).toFixed(1)}];
  }));
  return {points, rim: `<ellipse cx="0" cy="0" rx="${rx}" ry="${ry}" transform="matrix(1 0 ${skew} 1 ${x} ${y})"/>`};
}

function nodes(points, active, radius) {
  return [...points].map(([name,{x,y}]) =>
    `<circle cx="${x}" cy="${y}" r="${radius}"${active.has(name) ? ' class="in-thread"' : ''}><title>${escape(name)}</title></circle>`
  ).join('');
}

function filament({domain, workflow}, fields, activities) {
  const a = fields.get(domain), b = activities.get(workflow);
  const span = Math.round((b.x - a.x) * .42);
  return `<path d="M ${a.x} ${a.y} C ${(a.x+span).toFixed(1)} ${a.y}, ${(b.x-span).toFixed(1)} ${b.y}, ${b.x} ${b.y}"><title>${escape(domain)} · ${escape(workflow)}</title></path>`;
}

function fieldNetwork(domains, workflows, groups) {
  if (!groups.size) return '';
  const pairs = [...groups.values()].map(entries => entries[0]);
  const byActivity = Map.groupBy(pairs, pair => pair.workflow);
  // Trace one shared practice, choosing a short label when several span the same number of fields.
  const [example, related] = [...byActivity].sort(([a,left],[b,right]) =>
    right.length - left.length || a.length - b.length || a.localeCompare(b,'en')
  )[0];
  const sampleFields = new Set(related.map(pair => pair.domain));
  const exampleFields = [...sampleFields].slice(0,2).sort((a,b) => a.localeCompare(b,'en'));
  const orderedActivities = [example, ...workflows.filter(name => name !== example)];
  const fields = ring(domains, 107, 119, -Math.PI * .58);
  const activities = ring(orderedActivities, 378, 91, Math.PI * .5);
  const ordinary = pairs.filter(pair => pair.workflow !== example);
  const trace = pair => filament(pair,fields.points,activities.points);
  const end = activities.points.get(example);
  const fieldRadius = Math.min(5, 76 / domains.length);
  const activityRadius = Math.min(4.4, 76 / workflows.length);
  return `<figure class="field-network">
    <svg viewBox="0 0 510 211" role="img" aria-labelledby="network-title network-description">
      <title id="network-title">Scientific fields and research activities in the task collection</title>
      <desc id="network-description">Filled dots are fields. Open dots are activities. Each line connects a field and an activity represented together in at least one task. Dark lines trace ${escape(example)}, including its use in ${escape(new Intl.ListFormat('en').format(exampleFields))}.</desc>
      <g class="network-rims" aria-hidden="true">${fields.rim}${activities.rim}</g>
      <g class="network-edges" stroke-opacity="${Math.min(1, Math.sqrt(24 / pairs.length)).toFixed(2)}">${ordinary.map(trace).join('')}</g>
      <g class="network-edges network-thread">${related.map(trace).join('')}</g>
      <g class="network-fields">${nodes(fields.points,sampleFields,fieldRadius)}</g>
      <g class="network-activities">${nodes(activities.points,new Set([example]),activityRadius)}</g>
      <path class="network-leader" d="M ${end.x} ${(end.y+activityRadius+3).toFixed(1)} V 209" aria-hidden="true"/>
    </svg>
    <figcaption>
      <span class="network-keys"><span class="network-field-key">Scientific fields</span><span class="network-activity-key">Research activities</span></span>
      <span class="network-label" aria-hidden="true">${escape(example)}</span>
    </figcaption>
  </figure>`;
}

export function catalogueHero(domains, workflows, groups) {
  return `<header class="tasks-hero">
    <div class="tasks-hero-copy"><h1>Tasks</h1>
      <p>Find a task by field or research activity. Each brief describes the goal, materials and evidence for success.</p>
      <div class="tasks-hero-links"><a class="solid-link" href="#task-directory">Browse task briefs</a><a class="text-link" href="#activity-matrix">View full matrix</a></div>
    </div>
    ${fieldNetwork(domains,workflows,groups)}
  </header>`;
}
