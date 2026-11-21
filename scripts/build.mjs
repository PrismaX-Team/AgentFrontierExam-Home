import {cp, mkdir, mkdtemp, readFile, rename, rm, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {page} from '../src/views/layout.mjs';
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
    for(const key of ['title','domain','workflow','summary','input','deliverable','evidence']) {
      if(typeof task[key]!=='string' || !task[key].trim()) throw new Error(`Missing ${key} on ${task.id}`);
    }
    if (![null,1,2,3].includes(task.level)) throw new Error(`Unknown scientific level on ${task.id}`);
    if (task.showcase!==undefined) {
      if (!Number.isInteger(task.showcase)||task.showcase<1||positions.has(task.showcase)) throw new Error('Invalid showcase order');
      positions.add(task.showcase);
    }
  }
}

export async function build() {
  const tasks = JSON.parse(await readFile(path.join(project,'src/data/tasks.json'),'utf8'));
  validate(tasks);
  const routes = [
    {route:'/', title:'Agent Frontier Exam', description:'A benchmark for AI agents in science, from demanding research workflows to verifiable breakthroughs.', home:true, body:homePage(tasks)},
    {route:'/tasks/', title:'Tasks', description:'Browse scientific task briefs by field or research activity.', catalog:true, body:catalogue(tasks)},
    ...tasks.map(t=>({route:`/tasks/${t.id}/`,title:t.title,description:t.summary,body:taskPage(t,tasks)})),
    {route:'/contribute/',title:'Contribute a scientific task',description:'Contribute a research workflow or a breakthrough question through Duanyan ReX.',community:true,body:contribute()},
    {route:'/contribute2/',title:'Contribute a task from your field',description:'Choose a scientific goal, define its evidence and submit a task through Duanyan ReX.',community:true,body:contribute('editorial')},
    {route:'/contribute/task-package/',title:'Task package guide',description:'Read an annotated Harbor example and prepare a scientific task package.',community:true,body:packageGuide()},
    {route:'/authorship/',title:'Authorship',description:'Contributor credit, the role of area chairs, and how to join Agent Frontier Exam.',community:true,body:authorship()},
  ];
  const stage=await mkdtemp(path.join(project,'.site-build-'));
  const previous=path.join(stage,'previous');
  const ready=path.join(stage,'ready');
  try {
    await cp(path.join(project,'src/assets'),path.join(ready,'assets'),{recursive:true});
    for(const route of routes) {
      const dir=path.join(ready,route.route);
      await mkdir(dir,{recursive:true});
      await writeFile(path.join(dir,'index.html'),page(route));
    }
    let replaced=false;
    try { await rename(output,previous);replaced=true; } catch(error) { if(error.code!=='ENOENT')throw error; }
    try { await rename(ready,output); }
    catch(error) {if(replaced) await rename(previous,output);throw error;}
  } finally {await rm(stage,{recursive:true,force:true});}
  return routes.map(r=>r.route);
}

if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const routes=await build();
  console.log(`Built ${routes.length} pages in dist/.`);
}
