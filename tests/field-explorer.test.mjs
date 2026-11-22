import {test} from 'node:test';
import assert from 'node:assert/strict';
import {catalogueHero, collectionCounts} from '../src/views/field-explorer.mjs';
import {distributionArt} from '../src/views/distribution-art.mjs';

const tasks = [
  {domain:'Earth science', workflow:'Modelling and simulation', level:1},
  {domain:'Earth science', workflow:'Parameter inference and calibration', level:2},
  {domain:'Energy', workflow:'Modelling and simulation', level:2},
  {domain:'Physics', workflow:'Modelling and simulation', level:1},
];

function registers(html) {
  return Object.fromEntries([...html.matchAll(/<div class="distribution-panel" id="chart-(\w+)"[\s\S]*?<ul class="distribution-keys"[^>]*>([\s\S]*?)<\/ul>/g)]
    .map(([,view,list]) => [view,[...list.matchAll(/class="distribution-name">([\s\S]*?)<\/span><b class="distribution-count">(\d+)<\/b>/g)]
      .map(([,name,count]) => [name.replace(/<[^>]+>/g,''), Number(count)])]));
}

test('all three registers publish every translated name and count, including empty levels', () => {
  const counts = collectionCounts(tasks);
  const names = {
    en: [['Earth science','Energy','Physics'], ['Modelling and simulation','Parameter inference and calibration'],
      ['L1 Scientific workflows','L2 Scientific breakthroughs','L3 Foundational discoveries']],
    zh: [['地球科学','能源','物理学'], ['建模计算与仿真','参数反演与校准'], ['L1 科研流程','L2 科学突破','L3 奠基性发现']],
  };
  for (const [lang,[fields,types,levels]] of Object.entries(names)) {
    const html = catalogueHero(tasks,counts,lang);
    assert.match(html,/id="view-fields" value="fields" aria-controls="chart-fields" checked/);
    assert.match(html,/id="view-types" value="types" aria-controls="chart-types"/);
    assert.match(html,/id="view-levels" value="levels" aria-controls="chart-levels"/);
    const result = registers(html);
    assert.deepEqual(result.fields,fields.map((name,i) => [name,[2,1,1][i]]));
    assert.deepEqual(result.types,types.map((name,i) => [name,[3,1][i]]));
    assert.deepEqual(result.levels,levels.map((name,i) => [name,[2,2,0][i]]));
    for (const values of Object.values(result)) assert.equal(values.reduce((n,[,count]) => n+count,0),4);
    assert.doesNotMatch(html,/Leading fields|题量最多|尚未确定/);
  }
});

test('each key has one selectable vessel, with liquid only where the count is positive', () => {
  for (const view of ['fields','types','levels']) {
    for (const counts of [[3,1,0],[0,2,0],[0,0,0]]) {
      const entries = counts.map((count,i) => ({key:String(i+1),label:'Sample',color:'var(--field-1)',count}));
      const svg = distributionArt(view,entries);
      assert.doesNotMatch(svg,/NaN|Infinity/);
      const pieces = svg.split(/<g data-art-index="\d+"/).slice(1);
      assert.equal(pieces.length,3);
      pieces.forEach((piece,i) => {
        assert.match(piece,/class="da-hit"/);
        assert.equal(piece.includes('class="da-liquid-surface"'),counts[i] > 0);
      });
    }
  }
});

test('liquid geometry follows proportions when records are added or the whole collection is scaled', () => {
  for (const view of ['fields','types','levels']) {
    const surfaces = counts => {
      const entries = counts.map((count,i) => ({key:String(i+1),label:'Sample',color:'var(--field-1)',count}));
      return [...distributionArt(view,entries).matchAll(/class="da-liquid-surface" d="([^"]+)"/g)].map(match => match[1]);
    };
    const original = surfaces([8,2,3]);
    assert.equal(original.length,3);
    assert.deepEqual(surfaces([16,4,6]),original);
    // The maximum and total stay the same; only the second and third fills change.
    const redistributed = surfaces([8,4,1]);
    assert.equal(redistributed[0],original[0]);
    assert.notEqual(redistributed[1],original[1]);
    assert.notEqual(redistributed[2],original[2]);
  }
});
