import {test} from 'node:test';
import assert from 'node:assert/strict';
import {catalogue} from '../src/views/catalog.mjs';

test('the script-free field map starts with the most diverse field and links to real matrix groups', () => {
  const field = 'Earth & ocean';
  const tasks = [];
  function add(domain,workflow,n) {
    for (let i=0;i<n;i++) tasks.push({id:'task-'+tasks.length,title:'Brief '+tasks.length,domain,workflow,summary:''});
  }
  add('Physics','Simulation',12);
  for (const activity of ['Simulation','Mapping','Imaging','Data analysis','Prediction','Measurement']) add(field,activity,1);
  add(field,'Data analysis',2);
  const html = catalogue(tasks);
  const plot = html.match(/<section class="field-explorer"[\s\S]*?<\/section>/)[0];
  assert.match(plot,/data-origin-name>Earth &amp; ocean<\/strong>/);
  assert.match(plot,/data-field-total>8 tasks</);
  assert.match(plot,/data-activity-total>6 activities</);
  const links = [...plot.matchAll(/<li><a href="([^"]+)"/g)].map(match=>match[1]);
  assert.equal(links.length,5);
  assert.match(links[0],/workflow=Data\+analysis/);
  for (const link of links) {
    assert.ok(html.includes('class="matrix-cell" href="'+link+'"'));
    const href = new URL(link.replaceAll('&amp;','&'),'https://example.invalid/tasks/');
    assert.equal(href.searchParams.get('domain'),field);
    assert.ok(html.includes('id="'+href.hash.slice(1)+'"'));
  }
  assert.ok(html.includes('id="activity-matrix"'));
  assert.doesNotMatch(catalogue([]),/class="field-explorer"/);
});
