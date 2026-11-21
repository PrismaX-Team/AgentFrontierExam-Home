import {test} from 'node:test';
import assert from 'node:assert/strict';
import {catalogue} from '../src/views/catalog.mjs';

test('a field and activity pair links to all its briefs, including without scripts', () => {
  const tasks = [
    {id:'a', title:'A', domain:'Earth science', workflow:'Simulation', summary:'A first brief.'},
    {id:'b', title:'B', domain:'Physics', workflow:'Model validation', summary:'A second brief.'},
    {id:'c', title:'C', domain:'Earth science', workflow:'Simulation', summary:'A third brief.'},
  ];
  const html = catalogue(tasks);
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
});

test('briefs in separate native groups retain a single alphabetical order for paging', () => {
  const tasks = ['D','G','A','H','C','F','B','E'].map((title,i) => ({
    id:title.toLowerCase(), title, summary:'A short summary.', domain:i%2 ? 'Physics' : 'Medicine',
    workflow:'Simulation',
  }));
  const html = catalogue(tasks);
  const rows = [...html.matchAll(/<li class="catalog-row" data-order="(\d+)"[\s\S]*?<h3 id="brief-[^"]+">([^<]+)<\/h3>/g)];
  assert.equal(rows.length,8);
  assert.deepEqual(rows.sort((a,b)=>Number(a[1])-Number(b[1])).map(row=>row[2]),[...'ABCDEFGH']);
  assert.match(html, /<nav class="catalog-pager" aria-label="Task brief pages" hidden>/);
});
