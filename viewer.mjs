import { createStadium } from './stadium.mjs';
import { duration, filmCamera, shots, matchAt } from './match.mjs';

const canvas=document.querySelector('#pitch'), stage=document.querySelector('#stage');
const play=document.querySelector('#play'), score=document.querySelector('#score');
const range=document.querySelector('#time'), clock=document.querySelector('#clock');
const chapter=document.querySelector('#chapter'), hint=document.querySelector('#hint');
const loading=document.querySelector('#loading'), touch=document.querySelector('#touch-flight');
const buttons=[...document.querySelectorAll('[data-mode]')];
const isReduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp=(u,a,b)=>Math.max(a,Math.min(b,u));
const directions=new Set(['KeyW','KeyA','KeyS','KeyD','KeyQ','KeyE','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','ShiftLeft','ShiftRight']);
const keys=new Set(), pointers=new Map();
let stadium,mode='director',playing=!isReduced,t=0,previous,needsDraw=true,renderSize;
let orbit={yaw:.66,pitch:.57,distance:59}, fly={eye:[-10,2.45,7],yaw:.90,pitch:-.015};
const stateAtStart=matchAt(0);

function orbitView() {
  const {yaw,pitch,distance}=orbit;
  const d=distance*Math.cos(pitch);
  return {eye:[d*Math.sin(yaw),.38+distance*Math.sin(pitch),d*Math.cos(yaw)],target:[0,.38,0],fov:46};
}
const forward=() => [Math.sin(fly.yaw)*Math.cos(fly.pitch),Math.sin(fly.pitch),Math.cos(fly.yaw)*Math.cos(fly.pitch)];
function flyView() {
  return {eye:fly.eye,target:forward().map((x,i)=>x+fly.eye[i]),fov:60};
}
function view() { return mode==='fly'?flyView():mode==='orbit'?orbitView():undefined; }

function useMode(name) {
  if(name===mode)return;
  if(name==='orbit') {
    const from=mode==='director' ? filmCamera(matchAt(t)).eye : fly.eye;
    const distance=clamp(Math.hypot(...from),27,108);
    orbit={ yaw:Math.atan2(from[0],from[2]),pitch:Math.max(.49,Math.asin(clamp(from[1]/distance,-1,1))),distance };
  }
  mode=name;
  for(const button of buttons) button.setAttribute('aria-pressed',String(button.dataset.mode===mode));
  touch.hidden=mode!=='fly';
  hint.textContent=mode==='fly'?'Drag to look · WASD to fly · Q/E for height':mode==='orbit'?'Drag to orbit · Scroll or pinch to zoom':'Drag to take the camera';
  needsDraw=true;
}
buttons.forEach(b=>b.onclick=()=>{useMode(b.dataset.mode);canvas.focus({preventScroll:true});});
function setPlaying(value) {
  playing=value;
  play.textContent=playing?'Pause':'Play';
}
setPlaying(playing);
play.onclick=()=>setPlaying(!playing);
range.oninput=()=>{t=Number(range.value);needsDraw=true;};
function updateHud(state) {
  const newScore=state.scored?'1–0':'0–0';
  if(score.textContent!==newScore)score.textContent=newScore;
  const shot=shots.findLast(([start])=>t>=start)[1];
  if(chapter.textContent!==shot)chapter.textContent=shot;
  if(document.activeElement!==range || playing) range.value=t;
  const text=`${t.toFixed(1).padStart(4,'0')} / ${duration.toFixed(1)}`;
  if(clock.value!==text)clock.value=text;
}
function onSize() {
  const {width,height}=stage.getBoundingClientRect();
  const rate=Math.min(.77,960/width,640/height);
  renderSize=[Math.max(120,Math.round(width*rate)),Math.max(120,Math.round(height*rate))];
  stadium.resize(...renderSize);
  needsDraw=true;
}
function moveFly(dt) {
  const has=(...codes)=>codes.some(c=>keys.has(c));
  const f=Number(has('KeyW','ArrowUp'))-Number(has('KeyS','ArrowDown'));
  const s=Number(has('KeyD','ArrowRight'))-Number(has('KeyA','ArrowLeft'));
  const v=Number(has('KeyE'))-Number(has('KeyQ'));
  if(!f&&!s&&!v)return;
  const pace=(has('ShiftLeft','ShiftRight')?17:7.1)*dt/Math.max(1,Math.hypot(f,s,v));
  const [x,y,z]=forward(), right=[-Math.cos(fly.yaw),0,Math.sin(fly.yaw)];
  fly.eye[0]=clamp(fly.eye[0]+(f*x+s*right[0])*pace,-43,43);
  fly.eye[1]=clamp(fly.eye[1]+(f*y+v)*pace,.62,72);
  fly.eye[2]=clamp(fly.eye[2]+(f*z+s*right[2])*pace,-38,38);
  needsDraw=true;
}
function tick(now) {
  const dt=previous===undefined?0:Math.min(.25,(now-previous)*.001);
  previous=now;
  if(playing) {t=(t+dt)%duration;needsDraw=true;}
  if(mode==='fly')moveFly(Math.min(dt,.05));
  if(needsDraw) {
    const pose=view()??filmCamera(matchAt(t));
    const aspect=renderSize[0]/renderSize[1];
    if(aspect<1.2&&mode!=='fly') {
      const firstShot=t<shots[1][0]||t>21.6||mode==='orbit';
      const widen=firstShot?Math.min(1.9,1.25/aspect):Math.min(1.3,1.1/aspect);
      pose.eye=pose.eye.map((x,i)=>pose.target[i]+(x-pose.target[i])*widen);
    }
    updateHud(stadium.draw(t,pose));
    needsDraw=false;
  }
  requestAnimationFrame(tick);
}
function zoom(ratio) {
  if(mode==='director')useMode('orbit');
  if(mode==='orbit')orbit.distance=clamp(orbit.distance*ratio,17,111);
  else fly.eye[1]=clamp(fly.eye[1]+Math.log(ratio)*5,.62,72);
  needsDraw=true;
}
canvas.addEventListener('wheel',e=>{e.preventDefault();zoom(Math.exp(e.deltaY*.0023));},{passive:false});
canvas.onpointerdown=e=>{
  if(e.button!==0)return;
  canvas.focus({preventScroll:true});
  canvas.setPointerCapture(e.pointerId);
  pointers.set(e.pointerId,[e.clientX,e.clientY]);
};
canvas.onpointermove=e=>{
  const old=pointers.get(e.pointerId);
  if(!old)return;
  const dx=e.clientX-old[0],dy=e.clientY-old[1];
  pointers.set(e.pointerId,[e.clientX,e.clientY]);
  if(pointers.size===2) {
    const other=[...pointers.entries()].find(([id])=>id!==e.pointerId)[1];
    const before=Math.hypot(old[0]-other[0],old[1]-other[1]);
    const after=Math.hypot(e.clientX-other[0],e.clientY-other[1]);
    if(before>8&&after>8)zoom(before/after);
  } else if(dx||dy) {
    if(mode==='director')useMode('orbit');
    if(mode==='orbit') {
      orbit.yaw-=dx*.007;
      orbit.pitch=clamp(orbit.pitch+dy*.005,.16,1.51);
    } else {
      fly.yaw-=dx*.006;
      fly.pitch=clamp(fly.pitch-dy*.005,-1.36,1.36);
    }
    needsDraw=true;
  }
};
canvas.onpointerup=canvas.onpointercancel=canvas.onlostpointercapture=e=>pointers.delete(e.pointerId);
canvas.onkeydown=e=>{
  if(e.code==='Space'){e.preventDefault();if(!e.repeat)setPlaying(!playing);}
  if(mode==='fly' && directions.has(e.code)) {e.preventDefault();keys.add(e.code);}
  if(mode==='orbit' && e.code.startsWith('Arrow')) {
    e.preventDefault();
    orbit.yaw+=(Number(e.code==='ArrowLeft')-Number(e.code==='ArrowRight'))*.08;
    orbit.pitch=clamp(orbit.pitch+(Number(e.code==='ArrowUp')-Number(e.code==='ArrowDown'))*.08,.16,1.51);
    needsDraw=true;
  }
};
window.addEventListener('keyup',e=>keys.delete(e.code));
window.addEventListener('blur',()=>keys.clear());
document.addEventListener('visibilitychange',()=>{if(document.hidden)keys.clear();});
for(const btn of touch.querySelectorAll('button')) {
  btn.onpointerdown=e=>{
    e.preventDefault();btn.setPointerCapture(e.pointerId);keys.add(btn.dataset.fly);
  };
  btn.onpointerup=btn.onpointercancel=btn.onlostpointercapture=()=>keys.delete(btn.dataset.fly);
}
try {
  stadium=await createStadium(canvas);
  onSize();
  hint.textContent='Drag to take the camera';
  updateHud(stateAtStart);
  loading.hidden=true;
  new ResizeObserver(onSize).observe(stage);
  requestAnimationFrame(tick);
  window.floodlight={ get mode(){return mode;}, get time(){return t;}, get flyPosition(){return [...fly.eye];}, get renderSize(){return [...renderSize];} };
} catch(error) {
  loading.textContent=error.message;
  play.disabled=range.disabled=true;
  buttons.forEach(button=>button.disabled=true);
  console.error(error);
}
