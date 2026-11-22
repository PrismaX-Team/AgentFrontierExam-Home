import assert from 'node:assert/strict';
import {readFile, realpath, stat} from 'node:fs/promises';
import path from 'node:path';
import {axisLabel} from '../src/data/taxonomy.mjs';

// Editors with a mounted archive can check its inventory and both classification views.
const archiveRoot = process.argv[2];
if (!archiveRoot) throw new Error('Usage: node scripts/check-archive.mjs <archive-directory>');

const tasks = JSON.parse(await readFile(new URL('../src/data/tasks.json', import.meta.url), 'utf8'));
const catalogue = new Map(tasks.map(task => [task.archiveKey, task]));
assert.equal(catalogue.size, tasks.length, 'Duplicate catalogue package keys');

const tsv = await readFile(path.join(archiveRoot, '逐题分类.tsv'), 'utf8');
const [heading, ...lines] = tsv.trimEnd().split(/\r?\n/);
const columns = heading.split('\t');
const seen = new Set();
const expandedFields = {
  生命: '生命科学', 材料: '材料科学', 地球: '地球科学', 物理: '物理学',
  天文: '天文学', 信息: '信息科学', GDPX待归类: 'GDPX',
};
function fullField(shortName) {
  return expandedFields[shortName] ?? shortName;
}
for (const line of lines) {
  const values = line.split('\t');
  assert.equal(values.length, columns.length, 'Malformed inventory row');
  const row = Object.fromEntries(columns.map((key, i) => [key, values[i]]));
  const key = row['题包'];
  assert.ok(key && !seen.has(key), `Duplicate or missing inventory key: ${key}`);
  seen.add(key);
  const task = catalogue.get(key);
  assert.ok(task, `Missing public brief for ${key}`);
  assert.equal(axisLabel(task.domain, 'zh'), fullField(row['主领域']), key);
  assert.equal(axisLabel(task.workflow, 'zh'), row['主要科学流程'], key);
  assert.equal(task.suggestedDomain ? axisLabel(task.suggestedDomain, 'zh') : '', fullField(row['待归类题的建议学科']), key);

  const original = await realpath(path.join(archiveRoot, row['归档相对路径']));
  assert.ok((await stat(original)).isDirectory(), key);
  assert.equal(path.basename(original), key);
  const domainCopy = path.join(archiveRoot, 'by_domain', row['主领域'], key);
  const activityCopy = path.join(archiveRoot, 'by_scientific_workflow', row['主要科学流程'], key);
  assert.deepEqual(await Promise.all([realpath(domainCopy), realpath(activityCopy)]), [original, original], key);
}
assert.equal(seen.size, catalogue.size, 'Catalogue contains packages absent from the archive');
console.log(`Matched ${seen.size} unique briefs to their packages, fields and primary activities.`);
