import {cp, mkdir, mkdtemp, readFile, readdir, rename, rm, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {crc32} from 'node:zlib';
import {localizedPath, page} from '../src/views/layout.mjs';
import {homePage} from '../src/views/home.mjs';
import {catalogue, taskPage} from '../src/views/catalog.mjs';
import {contribute, packageGuide, authorship} from '../src/views/community.mjs';

export const project = fileURLToPath(new URL('../',import.meta.url));
export const output = path.join(project,'dist');

function validate(tasks) {
  const seen = new Set();
  const positions = new Set();
  for (const task of tasks) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(task.id) || seen.has(task.id))
      throw new Error(`Invalid or duplicate task ID ${task.id}`);
    seen.add(task.id);
    const required = ['title','domain','summary'];
    if (task.level === 1 || (task.workflow != null && task.workflow !== '')) required.push('workflow');
    for(const key of required) {
      if(typeof task[key]!=='string' || !task[key].trim()) throw new Error(`Missing ${key} on ${task.id}`);
    }
    for (const key of ['title','summary','input','deliverable','evidence','significance']) {
      if (task[key] && !task.zh?.[key]?.trim()) throw new Error(`Missing Chinese ${key} on ${task.id}`);
    }
    if (![1,2,3].includes(task.level)) throw new Error(`Unknown scientific level on ${task.id}`);
    if (task.showcase!==undefined) {
      if (!Number.isInteger(task.showcase)||task.showcase<1||positions.has(task.showcase)) throw new Error('Invalid showcase order');
      positions.add(task.showcase);
    }
  }
}

function sitePages(archive, lang) {
  const zh = lang === 'zh';
  const tasks = archive.map(task => {
    const alternate = zh ? task : task.zh;
    return {...task, ...(zh ? task.zh : {}), translatedSearch: alternate.title + ' ' + alternate.summary};
  });
  return [
    {route:'/', title:'Agent Frontier Exam', description:zh ? '评测 AI 智能体开展科研的能力，从复杂的科研流程到可独立验证的科学突破。' : 'A benchmark for AI agents in science, from demanding research workflows to verifiable breakthroughs.', home:true, body:homePage(tasks,lang)},
    {route:'/tasks/', title:zh ? '科研任务' : 'Tasks', description:zh ? '按研究领域和科研活动浏览任务简报。' : 'Browse task briefs by scientific field and research activity.', catalog:true, body:catalogue(tasks,lang)},
    ...tasks.map(t => ({route:`/tasks/${t.id}/`, title:t.title, description:t.summary, body:taskPage(t,tasks,lang)})),
    {route:'/contribute/', title:zh ? '共建科研任务' : 'Contribute a scientific task', description:zh ? '通过端砚 ReX 提交科研流程题或科学突破题。' : 'Contribute a research workflow or a breakthrough question through Duanyan ReX.', community:true, body:contribute(lang)},
    {route:'/contribute/task-package/', title:zh ? '任务包指南' : 'Task package guide', description:zh ? '通过带注释的 Harbor 示例了解科研任务包的结构和准备方法。' : 'Read an annotated Harbor example and prepare a scientific task package.', community:true, body:packageGuide(lang)},
    {route:'/authorship/', title:zh ? '参与与署名' : 'Authorship', description:zh ? '了解 Agent Frontier Exam 的共建署名、领域主席职责与参与方式。' : 'Contributor credit, the role of area chairs, and how to join Agent Frontier Exam.', community:true, body:authorship(lang)},
  ].map(route => ({...route, lang}));
}

export async function build() {
  const tasks = JSON.parse(await readFile(path.join(project,'src/data/tasks.json'),'utf8'));
  validate(tasks);
  const routes = ['en','zh'].flatMap(lang => sitePages(tasks,lang));
  const stage=await mkdtemp(path.join(project,'.site-build-'));
  const previous=path.join(stage,'previous');
  const ready=path.join(stage,'ready');
  try {
    const assets = path.join(ready,'assets');
    await cp(path.join(project,'src/assets'),assets,{recursive:true});
    // Pages caches styles and scripts across deployments. New markup must
    // request fresh bytes when its corresponding style or behaviour changes.
    const assetUrls = new Map();
    for (const name of await readdir(assets)) {
      if (!/\.(css|js)$/.test(name)) continue;
      const url = '/assets/' + name;
      const version = crc32(await readFile(path.join(assets,name))).toString(36);
      assetUrls.set(url, url + '?v=' + version);
    }
    for(const route of routes) {
      const dir=path.join(ready,localizedPath(route.route,route.lang));
      await mkdir(dir,{recursive:true});
      await writeFile(path.join(dir,'index.html'),page(route,assetUrls));
    }
    // Existing review bookmarks converge on the chosen contribution guide.
    const retired = path.join(ready,'contribute2');
    await mkdir(retired);
    await writeFile(path.join(retired,'index.html'), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Contribute · Agent Frontier Exam</title><script>location.replace((location.protocol === 'file:' ? '../contribute/index.html' : '../contribute/') + location.search + location.hash)</script><meta http-equiv="refresh" content="0;url=../contribute/"></head><body><a href="../contribute/">Contribute to Agent Frontier Exam</a></body></html>`);
    let replaced=false;
    try { await rename(output,previous);replaced=true; } catch(error) { if(error.code!=='ENOENT')throw error; }
    try { await rename(ready,output); }
    catch(error) {if(replaced) await rename(previous,output);throw error;}
  } finally {await rm(stage,{recursive:true,force:true});}
  return routes.map(r=>localizedPath(r.route,r.lang));
}

if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const routes=await build();
  console.log(`Built ${routes.length} pages in dist/.`);
}
