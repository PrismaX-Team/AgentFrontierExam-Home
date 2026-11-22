import path from 'node:path';
import assert from 'node:assert/strict';
import {readFile,stat,readdir} from 'node:fs/promises';
import {build,output,project} from './build.mjs';
import {escape, localizedPath} from '../src/views/layout.mjs';
import {plates} from '../src/data/plates.mjs';

const routes = await build();
const fake = 'https://example.invalid';
const tasks = JSON.parse(await readFile(path.join(project,'src/data/tasks.json'),'utf8'));
const pages = new Map();
const referencedAssets = new Set();
for (const route of routes) {
  const html = await readFile(path.join(output,route,'index.html'),'utf8');
  const zh = route.startsWith('/zh/');
  assert.ok(html.includes(`<html lang="${zh ? 'zh-CN' : 'en'}"`), `Incorrect language on ${route}`);
  assert.equal((html.match(/<h1[ >]/g)||[]).length,1,`Missing or duplicate title on ${route}`);
  assert.doesNotMatch(html,/\/mnt\/shared-storage|LiveSciResearchBench|original_archive|TODO|PLACEHOLDER/);
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(new Set(ids).size,ids.length,`Duplicate id on ${route}`);
  const other = zh ? route.slice(3) : '/zh' + route;
  const switcher = html.match(/data-language="(?:en|zh)" href="([^"]+)"/);
  assert.equal(new URL(switcher[1],fake+route).pathname, other, `Wrong language switch on ${route}`);
  pages.set(route,{html, ids:new Set(ids), other});
}
for (const [route,{html,other}] of pages) {
  assert.ok(pages.has(other),`Missing translation of ${route}`);
  for (const [,raw] of html.matchAll(/\b(?:href|src|action)="([^"]+)"/g)) {
    const url = new URL(raw.replaceAll('&amp;','&'),fake+route);
    if (url.origin !== fake) continue;
    if (pages.has(url.pathname)) {
      assert.ok(url.pathname === other || route.startsWith('/zh/') === url.pathname.startsWith('/zh/'), `Unexpected language change at ${raw} on ${route}`);
      if (url.hash) assert.ok(pages.get(url.pathname).ids.has(decodeURIComponent(url.hash.slice(1))),`Broken anchor ${raw} on ${route}`);
    } else {
      assert.ok(url.pathname.startsWith('/assets/'),`Unknown route ${raw} on ${route}`);
      referencedAssets.add(url.pathname);
    }
  }
}
for (const asset of referencedAssets) assert.ok((await stat(path.join(output,asset))).isFile(),`Missing asset ${asset}`);
const retired = await readFile(path.join(output,'contribute2/index.html'),'utf8');
assert.match(retired, /http-equiv="refresh" content="0;url=\.\.\/contribute\/"/);

for (const lang of ['en','zh']) {
  const homeRoute = localizedPath('/',lang);
  const home = pages.get(homeRoute).html;
  const directory = pages.get(localizedPath('/tasks/',lang)).html;
  const config = JSON.parse(home.match(/<script type="application\/json" data-pyramid-content>([\s\S]*?)<\/script>/)[1]);
  const pieceLevels = [1,1,1,1,1,1,1,2,2,2,2,3];
  assert.equal(config.pieces.length,pieceLevels.length);
  const cardImages = new Map([...home.matchAll(/<img data-task-art="([^"]+)" src="([^"]+)" alt="([^"]+)"/g)].map(hit => [hit[1],hit[2]]));
  assert.equal(cardImages.size,new Set(config.pieces.map(piece=>piece.task?.id).filter(Boolean)).size);
  for (const [index,piece] of config.pieces.entries()) {
    assert.ok(piece.task, 'Every pyramid piece should lead to an illustrated task');
    const task = tasks.find(item=>item.id===piece.task.id);
    assert.ok(task && plates[task.id] && cardImages.has(task.id),`Missing pyramid artwork for ${piece.task.id}`);
    assert.equal(new URL(cardImages.get(task.id),fake+homeRoute).pathname,'/assets/plates/'+plates[task.id].file);
    assert.equal(piece.task.related,task.level!==pieceLevels[index],`Incorrect level label for ${task.id}`);
    for (const link of [piece.task.href,piece.browse.href]) {
      const url = new URL(link,fake+homeRoute);
      assert.ok(pages.has(url.pathname) && url.pathname.startsWith(localizedPath('/tasks/',lang)),`Broken pyramid link ${link}`);
      if (url.searchParams.has('workflow')) assert.ok(tasks.some(t=>t.workflow===url.searchParams.get('workflow')));
    }
  }
  for (const task of tasks) {
    const text = lang === 'zh' ? task.zh : task;
    assert.ok(directory.includes(`id="brief-${task.id}"`),`Missing directory entry ${task.id}`);
    const brief = pages.get(localizedPath(`/tasks/${task.id}/`,lang)).html;
    for (const [element, value] of [[/<h1>(.*?)<\/h1>/s, text.title], [/<p class="brief-lede">(.*?)<\/p>/s, text.summary]]) {
      const visible = brief.match(element)?.[1].replace(/<[^>]+>/g, '');
      assert.equal(visible, escape(value), `Missing brief text ${lang}/${task.id}`);
    }
    if (task.showcase) {
      assert.ok(home.includes(escape(text.title)),`Missing showcase ${task.id}`);
      assert.ok(plates[task.id],`Missing artwork ${task.id}`);
    }
  }
}
const assets = path.join(output,'assets');
for (const name of (await readdir(assets)).filter(n=>n.endsWith('.css'))) {
  const css = await readFile(path.join(assets,name),'utf8');
  for (const [,ref] of css.matchAll(/url\(["']?([^)'"]+)["']?\)/g)) {
    if (!ref.startsWith('data:')) assert.ok((await stat(path.resolve(assets,ref))).isFile());
  }
}
console.log(`Verified ${routes.length} English and Chinese pages, ${tasks.length} task pairs, pyramid destinations, local links, anchors, language switches and assets.`);
