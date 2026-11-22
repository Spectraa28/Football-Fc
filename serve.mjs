import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(fileURLToPath(import.meta.url));
const types={'.html':'text/html; charset=utf-8','.mjs':'text/javascript','.js':'text/javascript','.css':'text/css',
  '.json':'application/json','.png':'image/png','.mp4':'video/mp4','.bin':'application/octet-stream'};
export function serve({capture=false,onFrame}={}) {
  return createServer(async (req,res)=>{
    try {
      const url=new URL(req.url,'http://localhost');
      if(url.pathname==='/favicon.ico') {res.writeHead(204).end();return;}
      if(capture && req.method==='POST' && url.pathname==='/frame') {
        await onFrame(req);
        res.writeHead(204).end();
        return;
      }
      const path=url.pathname==='/'?'/index.html':decodeURIComponent(url.pathname);
      if(path==='/capture.html'&&!capture) {res.writeHead(404).end();return;}
      const file=resolve(root,'.'+path);
      if(!file.startsWith(root+sep)||!types[extname(file)]) {res.writeHead(404).end();return;}
      const info=await stat(file);
      if(!info.isFile()) {res.writeHead(404).end();return;}
      res.writeHead(200,{'Content-Type':types[extname(file)],'Content-Length':info.size});
      createReadStream(file).on('error',()=>res.destroy()).pipe(res);
    } catch(error) {res.writeHead(error.code==='ENOENT'?404:500).end();}
  });
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const port=Number(process.env.PORT??4173);
  serve().listen(port,'127.0.0.1',()=>console.log(`Floodlight FC · http://127.0.0.1:${port}`));
}
