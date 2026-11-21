import path from 'node:path';
import assert from 'node:assert/strict';
import {readFile,stat,readdir} from 'node:fs/promises';
import {build,output,project} from './build.mjs';
import {plates} from '../src/data/plates.mjs';

const routes=await build();
const fake='https://example.invalid';
const pages=new Map();
for(const route of routes) {
  const html=await readFile(path.join(output,route,'index.html'),'utf8');
  assert.match(html,/<html lang="en">/);
  assert.equal((html.match(/<h1[ >]/g)||[]).length,1,`Missing or duplicate title on ${route}`);
  assert.doesNotMatch(html,/\/mnt\/shared-storage|LiveSciResearchBench|original_archive|TODO|PLACEHOLDER/);
  const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(new Set(ids).size,ids.length,`Duplicate id on ${route}`);
  pages.set(route,{html,ids:new Set(ids)});
}
for(const [route,{html}] of pages) {
  for(const [,raw] of html.matchAll(/\b(?:href|src|action)="([^"]+)"/g)) {
    const url=new URL(raw.replaceAll('&amp;','&'),fake+route);
    if(url.origin!==fake)continue;
    if(pages.has(url.pathname)) {
      if(url.hash)assert.ok(pages.get(url.pathname).ids.has(decodeURIComponent(url.hash.slice(1))),`Broken anchor ${raw} on ${route}`);
    } else {
      assert.ok(url.pathname.startsWith('/assets/'),`Unknown route ${raw} on ${route}`);
      assert.ok((await stat(path.join(output,url.pathname))).isFile(),`Missing asset ${raw}`);
    }
  }
}
const tasks=JSON.parse(await readFile(path.join(project,'src/data/tasks.json'),'utf8'));
const home=pages.get('/').html;
const config=JSON.parse(home.match(/<script type="application\/json" data-pyramid-content>([\s\S]*?)<\/script>/)[1]);
const pieceLevels = [1,1,1,1,1,1,1,2,2,2,2,3];
assert.equal(config.pieces.length,pieceLevels.length);
const cardImages = new Map([...home.matchAll(/<img data-task-art="([^"]+)" src="([^"]+)" alt="([^"]+)"/g)].map(hit => [hit[1],hit[2]]));
assert.equal(cardImages.size,new Set(config.pieces.map(piece=>piece.task?.id).filter(Boolean)).size);
for(const [index,piece] of config.pieces.entries()) {
  assert.ok(piece.task, 'Every pyramid piece should lead to an illustrated task');
  const task=tasks.find(item=>item.id===piece.task.id);
  assert.ok(task && plates[task.id] && cardImages.has(task.id),`Missing pyramid artwork for ${piece.task.id}`);
  assert.equal(new URL(cardImages.get(task.id),fake+'/').pathname,'/assets/plates/'+plates[task.id].file);
  assert.equal(piece.task.related,task.level!==pieceLevels[index],`Incorrect level label for ${task.id}`);
  for(const link of [piece.task?.href,piece.browse.href].filter(Boolean)) {
    const url=new URL(link,fake+'/');assert.ok(pages.has(url.pathname),`Broken pyramid link ${link}`);
    if(url.searchParams.has('workflow'))assert.ok(tasks.some(t=>t.workflow===url.searchParams.get('workflow')));
  }
}
for(const t of tasks.filter(t=>t.showcase)) {
  assert.ok(home.includes(t.title.replaceAll('&','&amp;')),`Missing showcase ${t.id}`);
  assert.ok(plates[t.id],`Missing artwork ${t.id}`);
}
const assets=path.join(output,'assets');
for(const name of (await readdir(assets)).filter(n=>n.endsWith('.css'))){
  const css=await readFile(path.join(assets,name),'utf8');
  for(const [,ref] of css.matchAll(/url\(["']?([^)'"]+)["']?\)/g)){
    if(!ref.startsWith('data:'))assert.ok((await stat(path.resolve(assets,ref))).isFile());
  }
}
console.log(`Verified ${routes.length} pages, ${tasks.length} catalogue entries, all showcase and pyramid routes, local links, anchors and assets.`);
