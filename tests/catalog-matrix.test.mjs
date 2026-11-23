import {test} from 'node:test';
import assert from 'node:assert/strict';
import {catalogue, taskPage} from '../src/views/catalog.mjs';
import {levelNavigation} from '../src/views/coverage-levels.mjs';

test('in-progress research tiers are native disabled controls until that tier has a task', () => {
  for (const lang of ['en','zh']) {
    const byLevel = new Map([[1,[{}]]]);
    for (const level of [2,3]) {
      const pending = levelNavigation(byLevel,lang);
      const opening = pending.match(new RegExp(`<button\\b[^>]*data-tier="${level}"[^>]*>`))?.[0];
      assert.ok(opening);
      assert.match(opening,/\sdisabled[\s>]/);
      assert.doesNotMatch(opening,/\shref=/);
      byLevel.set(level,[{}]);
      const collected = levelNavigation(byLevel,lang);
      assert.match(collected,new RegExp(`<a\\b[^>]*data-tier="${level}"[^>]*href="\\?level=${level}#level-${level}"`));
    }
  }
});

test('a field and activity pair links to all its briefs, including without scripts', () => {
  const tasks = [
    {id:'a', title:'A', domain:'Earth science', workflow:'Simulation', summary:'A first brief.',level:1},
    {id:'b', title:'B', domain:'Physics', workflow:'Model validation', summary:'A second brief.',level:1},
    {id:'c', title:'C', domain:'Earth science', workflow:'Simulation', summary:'A third brief.',level:1},
  ];
  const html = catalogue(tasks);
  assert.match(html, /<h2 id="matrix-heading">Scientific Taskonomy<\/h2>/);
  const links = [...html.matchAll(/<a class="matrix-cell" href="([^"]+)"[^>]*><span class="matrix-mark"><span class="circle-count">(\d+)<\/span>/g)];
  assert.deepEqual(links.map(link => Number(link[2])).sort(), [1,2]);
  assert.deepEqual([...html.matchAll(/<a class="coverage-pair" href="([^"]+)"/g)].map(link => link[1]).sort(),links.map(link => link[1]).sort());
  assert.match(html, /id="field-earth-science" aria-labelledby="field-earth-science-name"/);
  const marks = [...html.matchAll(/class="matrix-cell"[^>]+--mark:([\d.]+)"/g)].map(match => Number(match[1])).sort();
  assert.ok(Math.abs((marks[0] / marks[1]) ** 2 - .5) < 1e-9);
  const [, href] = links.find(link => link[2] === '2');
  const {searchParams, hash} = new URL(href.replaceAll('&amp;','&'), 'https://example.invalid/tasks/');
  assert.equal(searchParams.get('domain'), 'Earth science');
  assert.equal(searchParams.get('workflow'), 'Simulation');
  assert.equal(searchParams.get('level'), '1');
  const group = html.split(`class="catalog-group" id="${hash.slice(1)}"`)[1].split('</ul>')[0];
  assert.match(group, /href="\/tasks\/a\/"/);
  assert.match(group, /href="\/tasks\/c\/"/);
  assert.doesNotMatch(group, /href="\/tasks\/b\/"/);
  assert.match(group, />Clear selection<\/a>/);
  assert.match(html, /class="catalog-level-filter" hidden/);
  assert.equal([...html.matchAll(/class="atlas-count">In progress<\/span>/g)].length,2);
  assert.doesNotMatch(html,/Tasks per circle|matrix-scale/);
  assert.match(html,/<th scope="col" class="matrix-tally">Tasks<\/th>/);
  for (const level of [2,3]) {
    const panel = html.split(`id="level-${level}"`)[1].split('</section>')[0];
    assert.ok(panel.includes(`role="img" aria-labelledby="evidence-${level}-caption"`));
    assert.ok(panel.includes(`<figcaption id="evidence-${level}-caption"><span>Schematic</span>`));
    assert.doesNotMatch(panel,/research-questions/);
  }
  const mapGroups = links.map(link => link[1].split('#')[1]).sort();
  assert.deepEqual([...html.matchAll(/data-coverage-group="([^"]+)"/g)].map(link => link[1]).sort(),mapGroups);
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
  assert.match(html, /data-workflow-total="Modelling and simulation">1<\/span>/);
  assert.doesNotMatch(html, /data-axis-domain="Physics"/);
  assert.match(html, /class="research-questions"[\s\S]*?<h4>物理学<\/h4>[\s\S]*?<a href="\/tasks\/second\/">任务乙<\/a>/);
  assert.equal([...html.matchAll(/class="atlas-count">建设中<\/span>/g)].length,1);
  assert.equal([...html.matchAll(/class="evidence-figure"/g)].length,2);
  assert.doesNotMatch(html,/圆点大小对应题数|matrix-scale/);
  assert.match(html, /<h2 id="matrix-heading">科学任务分类体系<\/h2>/);
  assert.match(html, /<details class="catalog-matrix" open><summary aria-labelledby="matrix-heading" aria-controls="matrix-grid"><\/summary>/);
  assert.doesNotMatch(html, /<img/);
  const brief = taskPage(tasks[1],tasks,'zh');
  assert.match(brief, /<dt>领域<\/dt><dd><a [^>]+>物理学<\/a>/);
  assert.match(brief, /href="\/tasks\/\?level=2#task-directory">L2 · 科学突破/);
  assert.match(brief, /class="brief-body metadata-only"/);
  assert.doesNotMatch(brief, /class="brief-section"/);
  assert.match(taskPage(tasks[0],tasks,'zh'), /href="\/tasks\/\?level=1#task-directory">L1 · 科研流程/);
});

test('shared activities stay scoped to L1 and research questions can have no workflow subtype', () => {
  const common = {domain:'Physics', workflow:'Simulation', summary:'A scientific brief.'};
  const tasks = [{...common,id:'workflow',title:'A workflow',level:1},
    {...common,id:'question',title:'An open question',level:2},
    {id:'discovery',title:'A new phenomenon',summary:common.summary,domain:'Astronomy',level:3}];
  const html = catalogue(tasks);
  assert.doesNotMatch(html,/In progress/);
  assert.deepEqual([...html.matchAll(/class="circle-count">(\d+)/g)].map(m => Number(m[1])),[1]);
  assert.deepEqual([...html.matchAll(/class="atlas-level-link" data-tier="(\d)" data-count="(\d+)"/g)].map(m => m.slice(1)),[['1','1'],['2','1'],['3','1']]);
  const nativeGroup = html.split('id="tasks-physics--simulation" data-directory-level="1"')[1].split('</ul>')[0];
  assert.match(nativeGroup,/href="\/tasks\/workflow\/"/);
  assert.doesNotMatch(nativeGroup,/href="\/tasks\/question\/"/);
  assert.match(html, /id="level-3"[\s\S]*?<h4>Astronomy<\/h4>[\s\S]*?href="\/tasks\/discovery\/"/);
  const researchOnly = catalogue(tasks.slice(1));
  assert.doesNotMatch(researchOnly,/class="matrix-cell"|>undefined<|NaN/);
  assert.match(researchOnly,/data-tier="1" data-count="0"/);
  assert.doesNotMatch(taskPage(tasks[2],tasks),/undefined|workflow=/);
});
