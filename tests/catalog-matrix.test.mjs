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
