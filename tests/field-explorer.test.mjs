import {test} from 'node:test';
import assert from 'node:assert/strict';
import {catalogueHero, collectionCounts} from '../src/views/field-explorer.mjs';

test('field and task type distributions show every label and count in both languages', () => {
  const tasks = [
    {domain:'Earth science', workflow:'Modelling and simulation'},
    {domain:'Earth science', workflow:'Parameter inference and calibration'},
    {domain:'Energy', workflow:'Modelling and simulation'},
    {domain:'Physics', workflow:'Modelling and simulation'},
  ];
  const counts = collectionCounts(tasks);
  for (const [lang, fields, types] of [
    ['en', ['Earth science','Energy','Physics'], ['Modelling and simulation','Parameter inference and calibration']],
    ['zh', ['地球科学','能源','物理学'], ['建模计算与仿真','参数反演与校准']],
  ]) {
    const html = catalogueHero(tasks,counts,lang);
    assert.match(html, /id="view-fields" aria-controls="field-chart" checked/);
    assert.match(html, /for="view-fields">[^<]+ <span>3<\/span>/);
    assert.match(html, /for="view-activities">[^<]+ <span>2<\/span>/);
    assert.match(html, /<strong>4<\/strong>/);
    function entries(list) {
      const content = html.split(`<ul class="${list}"`)[1].split('</ul>')[0];
      return [...content.matchAll(/<span>([^<]+)<\/span><b>(\d+)<\/b>/g)].map(([,name,count]) => [name,Number(count)]);
    }
    assert.deepEqual(entries('field-legend'),fields.map((name,i) => [name,[2,1,1][i]]));
    assert.deepEqual(entries('activity-bars'),types.map((name,i) => [name,[3,1][i]]));
    assert.doesNotMatch(html,/Leading fields|Scientific levels|科学层级|题量最多|尚未确定/);
  }
});

test('each field takes its proportional arc and each type uses the same linear scale', () => {
  const tasks = ['A','A','A','B','C','D'].map((domain,i) => ({domain,workflow:i < 4 ? 'X' : 'Y'}));
  const html = catalogueHero(tasks,collectionCounts(tasks));
  assert.match(html, /var\(--field-1\) 0\.000deg [\d.]+deg,var\(--chart-paper\) 0 180\.000deg/);
  assert.match(html, /var\(--field-4\) 300\.000deg [\d.]+deg,var\(--chart-paper\) 0 360\.000deg/);
  assert.match(html, /--share:100\.00%"[\s>]*<span>X<\/span><b>4/);
  assert.match(html, /--share:50\.00%"[\s>]*<span>Y<\/span><b>2/);
});
