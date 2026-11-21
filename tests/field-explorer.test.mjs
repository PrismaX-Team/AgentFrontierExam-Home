import {test} from 'node:test';
import assert from 'node:assert/strict';
import {catalogue} from '../src/views/catalog.mjs';

test('the static network shows each occupied matrix intersection once, across all fields', () => {
  const pairs = [
    ['Earth & ocean','Simulation'],['Physics','Simulation'],['Earth & ocean','Data quality'],['Energy','Imaging'],
    ['Physics','Simulation'],
  ];
  const tasks = pairs.map(([domain,workflow],i) => ({id:'task-'+i,title:'Brief '+i,domain,workflow,summary:''}));
  const html = catalogue(tasks);
  const figure = html.match(/<figure class="field-network">[\s\S]*?<\/figure>/)[0];
  const edges = [...figure.matchAll(/<path d="M [^"]+"><title>([^<]+)<\/title><\/path>/g)].map(m => m[1]).sort();
  assert.deepEqual(edges, ['Earth &amp; ocean · Data quality','Earth &amp; ocean · Simulation','Energy · Imaging','Physics · Simulation']);
  assert.equal((figure.match(/<circle /g) || []).length,6);
  assert.match(figure, /Dark lines trace Simulation/);
  assert.doesNotMatch(figure, /<(button|select|a|canvas)\b/);
  assert.doesNotMatch(catalogue([]), /class="field-network"/);
});
