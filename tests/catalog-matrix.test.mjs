import {test} from 'node:test';
import assert from 'node:assert/strict';
import {catalogue, taskPage} from '../src/views/catalog.mjs';

test('a field and activity pair links to all its briefs, including without scripts', () => {
  const tasks = [
    {id:'a', title:'A', domain:'Earth science', workflow:'Simulation', summary:'A first brief.',level:1},
    {id:'b', title:'B', domain:'Physics', workflow:'Model validation', summary:'A second brief.',level:1},
    {id:'c', title:'C', domain:'Earth science', workflow:'Simulation', summary:'A third brief.',level:1},
  ];
  const html = catalogue(tasks);
  assert.match(html, /<h2 id="matrix-heading">Scientific Taskonomy<\/h2>/);
  const links = [...html.matchAll(/<a class="matrix-cell" href="([^"]+)"[^>]*>(\d+)<\/a>/g)];
  assert.deepEqual(links.map(link => Number(link[2])).sort(), [1,2]);
  const [, href] = links.find(link => link[2] === '2');
  const {searchParams, hash} = new URL(href.replaceAll('&amp;','&'), 'https://example.invalid/tasks/');
  assert.equal(searchParams.get('domain'), 'Earth science');
  assert.equal(searchParams.get('workflow'), 'Simulation');
  const group = html.split(`class="catalog-group" id="${hash.slice(1)}"`)[1].split('</ul>')[0];
  assert.match(group, /href="\/tasks\/a\/"/);
  assert.match(group, /href="\/tasks\/c\/"/);
  assert.doesNotMatch(group, /href="\/tasks\/b\/"/);
  assert.match(group, />Clear selection<\/a>/);
  assert.match(html, /class="catalog-level-filter" hidden/);
});

test('briefs in separate native groups retain a single alphabetical order for paging', () => {
  const tasks = ['D','G','A','H','C','F','B','E'].map((title,i) => ({
    id:title.toLowerCase(), title, summary:'A short summary.', domain:i%2 ? 'Physics' : 'Medicine',
    workflow:'Simulation', level:1,
  }));
  const html = catalogue(tasks);
  const rows = [...html.matchAll(/<li class="catalog-row" data-order="(\d+)"[\s\S]*?<h3 id="brief-[^"]+">([^<]+)<\/h3>/g)];
  assert.equal(rows.length,8);
  assert.deepEqual(rows.sort((a,b)=>Number(a[1])-Number(b[1])).map(row=>row[2]),[...'ABCDEFGH']);
  assert.match(html, /<nav class="catalog-pager" aria-label="Task brief pages" hidden>/);
});

test('bilingual task types, totals, native links and level filters retain their own meanings', () => {
  const tasks = [
    {id:'first',title:'任务甲',summary:'研究案例。',domain:'Earth science',workflow:'Modelling and simulation',level:1},
    {id:'second',title:'任务乙',summary:'另一项研究。',domain:'Physics',workflow:'Modelling and simulation',level:2},
  ];
  const html = catalogue(tasks,'zh');
  assert.match(html, /<option value="Modelling and simulation">建模计算与仿真<\/option>/);
  assert.match(html, /<label class="catalog-level-filter">/);
  assert.match(html, /<option value="1">L1 · 科研流程 \(1\)<\/option>/);
  assert.match(html, /<option value="2">L2 · 科学突破 \(1\)<\/option>/);
  assert.match(html, /<option value="3" hidden>/);
  assert.match(html, /data-workflow-total="Modelling and simulation">2<\/td>/);
  assert.match(html, /data-domain-total="Physics">1<\/td>/);
  assert.match(html, /data-grid-total>2<\/td>/);
  assert.match(html, /<h2 id="matrix-heading">科学任务分类体系<\/h2><\/div>\s*<details class="catalog-matrix" open><summary aria-labelledby="matrix-heading" aria-controls="matrix-grid"><\/summary>/);
  assert.doesNotMatch(html, /<img/);
  const brief = taskPage(tasks[1],tasks,'zh');
  assert.match(brief, /<dt>领域<\/dt><dd><a [^>]+>物理学<\/a>/);
  assert.match(brief, /href="\/tasks\/\?level=2#task-directory">L2 · 科学突破/);
  assert.match(brief, /class="brief-body metadata-only"/);
  assert.doesNotMatch(brief, /class="brief-section"/);
  assert.match(taskPage(tasks[0],tasks,'zh'), /href="\/tasks\/\?level=1#task-directory">L1 · 科研流程/);
});
