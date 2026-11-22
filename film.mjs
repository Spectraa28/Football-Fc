import { createStadium } from './stadium.mjs';
import { goalTime } from './match.mjs';
import { filmSize } from './scene.mjs';

const art=document.querySelector('#world'), canvas=document.querySelector('#film');
const {width,height}=filmSize;
const layoutWidth=640, layoutHeight=360;
const field=await createStadium(art,{capture:true});
field.resize(width,height);
canvas.width=width;canvas.height=height;
const g=canvas.getContext('2d',{alpha:false,willReadFrequently:true});

const clamp=(value)=>Math.max(0,Math.min(1,value));
function text(value,x,y,color,font) {
  g.fillStyle=color;g.font=font;g.fillText(value,x,y);
}
function rect(x,y,w,h,color) {
  g.fillStyle=color;g.fillRect(x,y,w,h);
}
function score(scored) {
  const left=21,top=17;
  rect(left,top,134,26,'#111020');
  rect(left,top,42,2,'#ff715e');rect(left+92,top,42,2,'#5eddf7');
  text('EMB',left+9,top+17,'#ffa087','bold 11px monospace');
  text(scored?'1–0':'0–0',left+51,top+17,'#fff0c7','bold 13px monospace');
  text('TID',left+106,top+17,'#85eafd','bold 11px monospace');
}
function draw(t) {
  const state=field.draw(t);
  g.resetTransform();
  g.drawImage(art,0,0);
  g.scale(width/layoutWidth,height/layoutHeight);

  const open=clamp(t/.20)*clamp((2.23-t)/.41);
  if(open>0) {
    g.save();g.globalAlpha=open;
    const shade=g.createLinearGradient(0,248,0,layoutHeight);
    shade.addColorStop(0,'#100b2100');shade.addColorStop(1,'#100b21b2');rect(0,248,layoutWidth,112,shade);
    rect(24,281,32,3,'#ff925f');
    text('FLOODLIGHT',22,322,'#fff0cb','900 italic 38px system-ui');
    text('FC',269,322,'#ffba68','900 italic 38px system-ui');
    g.restore();
  }
  const hud=clamp((t-2.16)/.20)*clamp((22.3-t)/.43);
  if(hud>0) {
    g.save();g.globalAlpha=hud;score(state.scored);g.restore();
  }
  const goal=clamp((t-goalTime-.22)/.19)*clamp((21.70-t)/.7);
  if(goal>0) {
    g.save();g.globalAlpha=goal;
    rect(22,298,110,37,'#170f24e8');rect(22,298,5,37,'#ffca68');
    text('GOAL',35,326,'#ffe6a4','900 italic 24px system-ui');
    g.restore();
  }
  const tail=clamp((t-21.45)/.7);
  if(tail>0) {
    g.save();g.globalAlpha=tail;
    rect(23,296,163,35,'#141124f0');
    text('EMBER  1–0  TIDE',33,319,'#ffeece','bold 14px monospace');
    g.restore();
  }
}
window.film = {
  draw,
  async encode(first,count,fps) {
    for(let i=first;i<first+count;i++) {
      draw(i/fps);
      const data=g.getImageData(0,0,width,height).data;
      const r=await fetch('/frame',{method:'POST',body:data});
      if(!r.ok)throw Error(`Frame ${i}: ${r.status}`);
    }
  }
};
draw(0);
