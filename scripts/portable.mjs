import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {build,output,project} from './build.mjs';

const destination=path.resolve(process.argv[2] || path.join(project,'dist-offline','agent-frontier-exam-v0.1.html'));
const routes=await build();
const pages={},images={},css={},js={};
const resources=new Map();
const mime={'.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.webp':'image/webp','.woff':'font/woff'};
async function inlineAsset(url) {
  if(!resources.has(url)) {
    const binary=await readFile(path.join(output,url));
    resources.set(url,'data:'+mime[path.extname(url)]+';base64,'+binary.toString('base64'));
  }
  return resources.get(url);
}
for(const route of routes){
  const html=await readFile(path.join(output,route,'index.html'),'utf8');
  pages[route]=html;
  for(const [,raw] of html.matchAll(/<(?:img[^>]+?src|script[^>]+?src|link[^>]+?href)="([^"]+)"/g)) {
    const url=new URL(raw,'https://afe.invalid'+route).pathname;
    if(url.endsWith('.css')) {
      if(css[url])continue;
      let contents=await readFile(path.join(output,url),'utf8');
      for(const hit of [...contents.matchAll(/url\(["']?([^)'"]+)["']?\)/g)]) {
        const target=new URL(hit[1],'https://afe.invalid'+url).pathname;
        contents=contents.replace(hit[0],'url("'+await inlineAsset(target)+'")');
      }
      css[url]=contents;
    } else if(url.endsWith('.js')) {
      js[url]??=await readFile(path.join(output,url),'utf8');
    } else if(mime[path.extname(url)]) {
      images[url]??=await inlineAsset(url);
    }
  }
}
const runtime=await readFile(fileURLToPath(new URL('./portable-viewer.js',import.meta.url)),'utf8');
const fontLicense=await readFile(path.join(output,'assets','Instrument-Serif-LICENSE.txt'),'utf8');
const favicon=images['/assets/afe-mark.svg'];
const archive=JSON.stringify({pages,images,css,js}).replaceAll('<','\\u003c');
const fragment=`<div id="afe-v01-site-preview"><iframe title="Agent Frontier Exam" width="100%" height="730" style="display:block;border:0;width:100%;background:#f6f4ed" referrerpolicy="no-referrer"></iframe><script type="application/json" data-archive>${archive}</script>
<script type="text/plain" data-font-license>${fontLicense}</script></div>
<script>${runtime}</script>`;
const document=`<!doctype html><html lang="en" data-afe-file><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Agent Frontier Exam</title><link rel="icon" type="image/svg+xml" href="${favicon}"><style>html,body,#afe-v01-site-preview,#afe-v01-site-preview iframe{width:100%;height:100%;margin:0}body{background:#f6f4ed}</style><noscript><style>#afe-v01-site-preview{display:none}body{box-sizing:border-box;padding:2rem;font:1rem/1.6 system-ui}</style></noscript></head><body><noscript><h1>Agent Frontier Exam</h1><p>For script-free reading, download the static ZIP from the <a href="https://github.com/PrismaX-Team/AgentFrontierExam-Home/releases/tag/v0.1.0">v0.1 release</a>, extract it and open index.html.</p></noscript>${fragment}</body></html>`;
await mkdir(path.dirname(destination),{recursive:true});await writeFile(destination,document);
if(process.argv[3]) await writeFile(path.resolve(process.argv[3]),fragment);
console.log(`Packed ${routes.length} pages into ${path.basename(destination)} (${Math.round(Buffer.byteLength(document)/1024)} KiB).`);
