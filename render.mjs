import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, rename } from 'node:fs/promises';
import { once } from 'node:events';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { duration } from './match.mjs';
import { filmSize } from './scene.mjs';
import { serve } from './serve.mjs';

const args=process.argv.slice(2),still=args[0]==='--stills';
const root=dirname(fileURLToPath(import.meta.url));
const fps=24,{width,height}=filmSize,frameSize=width*height*4;
const music=join(root,'..','breathe-underwater-kula-main-version-29120-03-31.mp3');
const output=join(root,'floodlight-fc.mp4'), temporary=join(root,'.floodlight-encoding.mp4');
let frames=0;

const encoder=still?null:spawn('ffmpeg',[
  '-hide_banner','-loglevel','error','-y','-f','rawvideo','-pixel_format','rgba',
  '-video_size',`${width}x${height}`,'-framerate',String(fps),'-i','pipe:0',
  '-ss','12','-i',music,'-map','0:v:0','-map','1:a:0',
  '-vf','scale=1920:1080:flags=neighbor','-c:v','libx264','-preset','fast','-crf','17','-pix_fmt','yuv420p',
  '-af',`volume=0.84,afade=t=in:d=0.4,afade=t=out:st=${duration-1.25}:d=1.25`,
  '-t',String(duration),'-c:a','aac','-b:a','256k','-movflags','+faststart',temporary
],{stdio:['pipe','inherit','inherit']});
let encodeError;
encoder?.stdin.on('error',error=>{encodeError=error;});
const done = encoder?once(encoder,'exit'):null;
const server=serve({capture:true,async onFrame(req) {
  if(!encoder||encodeError) throw encodeError||Error('Encoder is unavailable');
  const data=[];
  for await (const chunk of req) data.push(chunk);
  const frame=Buffer.concat(data);
  assert.equal(frame.length,frameSize);
  if(!encoder.stdin.write(frame)) await Promise.race([
    once(encoder.stdin,'drain'),
    done.then(()=>{throw Error('FFmpeg stopped before the last frame');})
  ]);
  frames++;
}});

let browser;
try {
  server.listen(0,'127.0.0.1');
  await once(server,'listening');
  const executablePath=process.env.CHROME_BIN || ['/opt/google/chrome/chrome','/usr/bin/chromium','/usr/bin/google-chrome'].find(existsSync);
  browser=await chromium.launch({
    executablePath,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']
  });
  const page=await browser.newPage({viewport:{width,height}});
  let browserError;
  page.on('pageerror',error=>{browserError??=error;});
  page.on('console',m=>{if(m.type()==='error')browserError??=new Error(m.text());});
  await page.goto(`http://127.0.0.1:${server.address().port}/capture.html`);
  await page.waitForFunction(()=>typeof window.film?.draw==='function');
  if(browserError)throw browserError;
  if(still) {
    const out=process.env.STILLS_DIR || '/tmp/floodlight-stills';
    await mkdir(out,{recursive:true});
    const times=args.slice(1).map(Number);
    for(const t of (times.length?times:[.85,2.9,4.4,7.7,10.34,13.4,16.8,18.87,19.45,21.17,23.65])) {
      await page.evaluate(t=>window.film.draw(t),t);
      await page.locator('#film').screenshot({path:join(out,`frame-${t.toFixed(2).padStart(5,'0')}.png`)});
      if(browserError)throw browserError;
    }
    console.log(out);
  } else {
    for(let i=0;i<duration*fps;i+=24) {
      await page.evaluate(({i,fps})=>window.film.encode(i,24,fps),{i,fps});
      if(browserError)throw browserError;
      console.log(`Rendered ${frames/fps}/${duration} s`);
    }
    encoder.stdin.end();
    const [code]=await done;
    assert.equal(code,0);
    assert.equal(frames,duration*fps);
    await rename(temporary,output);
    console.log(output);
  }
} finally {
  await browser?.close();
  server.close();
  if(encoder?.exitCode===null) encoder.kill();
}
