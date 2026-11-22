import {test} from 'node:test';
import assert from 'node:assert/strict';
import {catalogueHero, collectionCounts} from '../src/views/field-explorer.mjs';

test('the collection overview counts every brief and keeps GDPX separate from assigned disciplines', () => {
  const tasks = [
    {domain:'Earth science', workflow:'Modelling and simulation'},
    {domain:'Earth science', workflow:'Parameter inference and calibration'},
    {domain:'GDPX', suggestedDomain:'Physics', workflow:'Modelling and simulation'},
    {domain:'Physics', workflow:'Modelling and simulation'},
  ];
  const counts = collectionCounts(tasks);
  const en = catalogueHero(tasks, counts);
  assert.match(en, /<dt>Task briefs<\/dt><dd>4<\/dd>/);
  assert.match(en, /<dt>Scientific fields<\/dt><dd>2<\/dd>/);
  assert.match(en, /<dt>Task types<\/dt><dd>2<\/dd>/);
  assert.match(en, /1 GDPX task awaiting field assignment/);
  assert.match(en, /Modelling and simulation<\/span><span class="rank-count">3</);
  assert.match(en, /Individual levels await assignment/);
  assert.equal((en.match(/class="catalog-level-code"/g) || []).length,3);
  assert.doesNotMatch(en, /<svg|<canvas/);
  const zh = catalogueHero(tasks, counts, 'zh');
  assert.match(zh, /<dt>个科学领域<\/dt><dd>2<\/dd>/);
  assert.match(zh, /参数反演与校准/);
  assert.match(zh, /奠基性发现/);
});
