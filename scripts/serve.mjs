import http from 'node:http';
import path from 'node:path';
import {readFile,stat} from 'node:fs/promises';
import {build,output} from './build.mjs';

const type={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.woff':'font/woff','.woff2':'font/woff2','.txt':'text/plain; charset=utf-8'};
const args=process.argv.slice(2);
function option(name,fallback){const i=args.indexOf(name);return i<0?fallback:args[i+1];}
const host=option('--host','127.0.0.1'),port=Number(option('--port',4173));
await build();
const server=http.createServer(async (req,res)=>{
  if (req.method!=='GET' && req.method!=='HEAD') {res.writeHead(405,{Allow:'GET, HEAD'}).end();return;}
  try {
    const url=new URL(req.url,'http://localhost');
    const file=path.resolve(output,'.'+decodeURIComponent(url.pathname));
    if(file!==output && !file.startsWith(output+path.sep)) {res.writeHead(404).end();return;}
    let target=file;
    if((await stat(file)).isDirectory()) {
      if(!url.pathname.endsWith('/')) {res.writeHead(308,{Location:url.pathname+'/'+url.search}).end();return;}
      target=path.join(file,'index.html');
    }
    const content=await readFile(target);
    res.writeHead(200,{'Content-Type':type[path.extname(target)]??'application/octet-stream','Content-Length':content.length});
    res.end(req.method==='HEAD'?undefined:content);
  } catch(error) {res.writeHead(error instanceof URIError?400:404).end();}
});
server.listen(port,host,()=>console.log(`Agent Frontier Exam is serving at http://${host}:${server.address().port}/`));
