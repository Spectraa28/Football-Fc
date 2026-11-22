import { pitch } from './match.mjs';

export const colors = {
  sky: 0x050617, violet: 0x31134d, ink: 0x0e1029,
  ember: 0xff4a36, tide: 0x0de5ff, lime: 0xc7ff39, amber: 0xffbd4a,
  white: 0xfff4be,
};
export const filmSize = { width: 960, height: 540 };
export const ground = { x: 30, z: 23 };
export const towers = [[-24,-16.5],[24,-16.5],[-24,16.5],[24,16.5]];
export const lampColors = [0x55ecff,0xffc068,0xff5b94,0x8c91ff];
const mix = (a,b,u) => a+(b-a)*u;
function tint(a,b,u) {
  return [16,8,0].reduce((rgb,bit) => rgb | Math.round(mix((a>>bit)&255,(b>>bit)&255,u))<<bit,0);
}

export function buildStadium({ makeBuilder }) {
  const B = makeBuilder(40717,Object.values(colors),{renderMetadata:false});
  const structure = [], net = [], flags = [];
  const rnd = B.R;
  const rr = (a,b) => mix(a,b,rnd());
  const pick = values => values[Math.floor(rnd()*values.length)];
  const rgb = value => [value>>16&255,value>>8&255,value&255];
  const box = (x,y,z,w,h,d,col,angle=0) => structure.push([x,y,z,w,h,d,col,angle]);
  const dot = (x,y,z,r,col,value=1,flags) => B.iso(x,y,z,r,rgb(col),value,flags);
  const flecks = (x,y,z,w,d,n,palette,r1,r2) => {
    for(let i=0;i<n;i++) dot(x+rr(-w,w),y+rr(0,.022),z+rr(-d,d),rr(r1,r2),pick(palette),rr(.53,1));
  };

  const {x,z,goalY,goalZ,goalDepth} = pitch;
  box(0,-.20,0,50,.37,34,0x292765);
  box(0,-.63,0,57,.43,43,0x282052);
  box(0,-1.24,0,60,.8,46,0x171635);
  box(0,-1.86,0,56,.52,43,0x1a0b32);
  for (const side of [-1,1]) {
    const edge = side > 0 ? 0xff4f8d : 0x2ef1ea;
    box(0,-.85,side*23.035,59,.068,.035,edge);
    box(side*30.045,-.85,0,.038,.068,45.4,side>0?0x6e52ff:0x3fc7ff);
    box(0,-1.48,side*23.048,59.2,.042,.064,0x48245d);
    box(side*30.05,-1.48,0,.055,.042,45.4,0x3f2a5b);
    for(let a=-27;a<=27;a+=3) {
      box(a,-1.18,side*23.045,2.35,.48,.15,side>0?0x371c51:0x232957);
      box(a-.76,-1.19,side*23.129,.36,.09,.024,edge);
      for(let j=0;j<6;j++) box(a-.29+j*.218,-1.21,side*23.13,.112,.14,.020,0x110e2e);
      for(let j=0;j<11;j++) dot(a+rr(-1.17,1.17),rr(-1.42,-.9),side*23.15,rr(.022,.082),pick([0x664582,0xa64ba7,0x42429c,edge]),.78);
    }
    for(let a=-20;a<=20;a+=2.5) {
      box(side*30.064,-1.205,a,.17,.49,1.97,0x362359);
      box(side*30.158,-1.299,a,.025,.042,1.38,side>0?0x9450cd:0x348ba9);
      box(side*30.15,-1.1,a-.61,.032,.12,.15,0xa46bb8);
    }
  }

  const turf0 = [0x1b773b,0x288f38,0x40a534,0x51a429,0x65ae2f,0x328e35];
  const turf1 = [0x063f3e,0x075646,0x10684f,0x15795a,0x11795b,0x095948];
  const blade = [0xb5fa2f,0x7beb32,0xd9f75a,0x2bd45d,0x6fff9f,0x35c99a,0xfcff8d];
  const blades = {wind:true};
  const stripes = 12, stripe = x*2/stripes;
  function wash(xp,zp,i,base) {
    const lens = (a,b,wx,wz) => Math.max(0,1-((xp-a)/wx)**2-((zp-b)/wz)**2)**2;
    const gold = lens(13,-7,25,15)*.78+lens(-6,10,18,10)*.48;
    const blue = lens(-14,-8,18,17)*.63+lens(16,8,15,13)*.31;
    const color=tint(tint(base,i%2?0xb3df34:0x58b541,gold),i%2?0x36bb83:0x0da097,blue);
    const grain=.5+.5*Math.sin(xp*1.21+Math.sin(zp*.71)*1.8)*Math.sin(zp*1.52-xp*.19);
    return tint(color,i%2 ? 0x073f32 : 0x082845,grain*.21);
  }
  box(0,-.047,0,48,.08,31,0x155541);
  for(let i=0;i<stripes;i++) {
    const xc = -x+(i+.5)*stripe;
    for(let j=0;j<20;j++) {
      const at=-z+(j+.5)*z/10;
      box(xc,-.029,at,stripe+.005,.056,z/10+.003,wash(xc,at,i,i%2?0x3e9a3b:0x0d614a));
    }
    for(let n=0;n<4050;n++) {
      const a=xc+rr(-.5,.5)*stripe,b=rr(-z,z);
      const flash = rnd();
      const col = flash<.072 ? pick(i%2?[0xe8ff6d,0xa1e93c,0x9de935]:[0x3df487,0x51de83]) : wash(a,b,i,pick(i%2?turf0:turf1));
      dot(a,rr(.006,.029),b,rr(.020,.080),col,rr(.65,1));
    }
    for(let n=0;n<1540;n++) {
      const a=xc+rr(-.5,.5)*stripe,b=rr(-z,z), h=rr(.034,.118);
      const tip=rnd()<.21 ? pick(blade) : wash(a,b,i,pick(i%2?turf0:turf1));
      B.axial(a,h*.39,b,[rr(-.27,.29),1,rr(-.27,.29)],h,rr(.009,.019),rgb(tip),rr(.75,1),blades);
    }
  }
  for(const edge of [-1,1]) {
    flecks(0,.01,edge*(z+.98),23.7,.91,1650,[0x17704b,0x1b9763,0x54da62,0xa4e745,0x0d5b57],.030,.085);
    flecks(edge*(x+1.28),.009,0,1.23,12.9,880,[0x1a7657,0x28a759,0x64d445,0x0d6367],.032,.090);
    box(0,.029,edge*15.02,46.9,.028,.070,edge>0?0xf65b89:0x2fdfd0);
    box(edge*23.55,.025,0,.043,.026,29.8,edge>0?0x659eff:0xec678c);
  }

  function paint(a,b,w=.075,col=0xd4ebc0) {
    const dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz);
    box((a[0]+b[0])/2,.046,(a[1]+b[1])/2,len+.014,.01,w,col,-Math.atan2(dz,dx));
    for(let n=0;n<Math.ceil(len*9);n++) {
      const u=rnd();
      dot(a[0]+dx*u+rr(-w,w)*dz/len,.056,a[1]+dz*u+rr(-w,w)*dx/len,rr(.013,.036),pick([col,0xfbffc9,0x8cdbab]),.78);
    }
  }
  const rectangle = (l,r,b,t,w) => {
    paint([l,b],[l,t],w); paint([r,b],[r,t],w);
    paint([l,b],[r,b],w); paint([l,t],[r,t],w);
  };
  function arc(xc,zc,r,a,b,w) {
    const n=Math.ceil(Math.abs(b-a)*r/.28);
    for(let i=0;i<n;i++) {
      const u=mix(a,b,i/n),v=mix(a,b,(i+1)/n);
      paint([xc+Math.cos(u)*r,zc+Math.sin(u)*r],[xc+Math.cos(v)*r,zc+Math.sin(v)*r],w);
    }
  }
  rectangle(-x,x,-z,z,.095);
  paint([0,-z],[0,z],.082);
  arc(0,0,3.57,0,Math.PI*2,.083);
  box(0,.056,0,.19,.013,.19,colors.white);
  for (const side of [-1,1]) {
    for(const [depth,width] of [[6.3,7.4],[2.1,4.15]]) {
      const inner=side*(x-depth),outer=side*x;
      paint([inner,-width],[inner,width]);
      paint([inner,-width],[outer,-width]); paint([inner,width],[outer,width]);
    }
    const spot=side*(x-4.37), angle=Math.acos((6.3-4.37)/3.57);
    arc(spot,0,3.57,side===1?Math.PI-angle:-angle,side===1?Math.PI+angle:angle,.076);
    box(spot,.057,0,.16,.015,.16,colors.white);
    arc(side*x,z,.49,side===1?Math.PI:Math.PI*1.5,side===1?Math.PI*1.5:Math.PI*2,.063);
    arc(side*x,-z,.49,side===1?Math.PI*.5:0,side===1?Math.PI:Math.PI*.5,.063);

    const back=x+goalDepth;
    for (const k of [-1,1]) {
      const e=k*goalZ;
      box(side*x,goalY/2,e,.100,goalY,.100,colors.white);
      box(side*back,goalY*.43,e,.055,goalY*.86,.058,0x87bfc1);
      box(side*(x+back)/2,goalY-.058,e,goalDepth,.067,.069,0xc9ecdf);
    }
    box(side*x,goalY,0,.105,.097,goalZ*2+.10,colors.white);
    box(side*back,goalY-.13,0,.063,.066,goalZ*2,0xb7dede);
    box(side*back,.071,0,.057,.058,goalZ*2,0x7da4aa);
    for(let i=0;i<=20;i++) {
      const v=mix(-goalZ,goalZ,i/20);
      net.push([side*x,goalY-.04,v, side*back,goalY-.13,v,side]);
      net.push([side*back,goalY-.13,v,side*back,.10,v,side]);
    }
    for(let i=0;i<=7;i++) {
      const y=.1+i*.216,xp=mix(x+.04,back,i/7);
      net.push([side*back,y,-goalZ,side*back,y,goalZ,side]);
      for(const k of [-1,1]) net.push([side*x,y,k*goalZ,side*back,y,k*goalZ,side]);
      net.push([side*xp,goalY-.04-i*.012,-goalZ,side*xp,goalY-.04-i*.012,goalZ,side]);
    }
    for(let i=1;i<6;i++) for(const k of [-1,1]) {
      const a=side*mix(x,back,i/6);
      net.push([a,.085,k*goalZ,a,goalY-.11,k*goalZ,side]);
    }
  }

  const crowd = [0xff4974,0xef33a5,0xff963c,0xffd471,0x75a0ff,0x25e5ff,0xef62e4,0x644ac0,0x9f67ff,0x3fc6b8,0xff7551,0x1ee28a];
  const skin = [0x6d455c,0xc18471,0xf1a578,0xba695f,0xe1a588,0xdca29b];
  function seat(x,y,z,facing,color) {
    box(x,y-.045,z,.33,.09,.34,0x3e2569);
    box(x,y+.07,z,.21,.21,.20,color);
    box(x,y+.25,z,.125,.14,.13,pick(skin));
    box(x,y+.325,z,.132,.05,.134,rnd()<.21?color:pick([0x34233d,0x3c3048,0x614363]));
    if(rnd()<.19) {
      const wave=rr(.03,.19);
      box(x+.145,y+.13+wave,z,.046,.16,.05,color);
      dot(x+.145,y+.25+wave,z+facing*.025,.039,pick(skin));
    }
    if(rnd()<.37) dot(x-.024,y+.279,z+facing*.062,.041,pick([0xffaa89,0xd37077,0xffca96]),.74);
    if(rnd()<.27) box(x,y+.145,z+facing*.104,.16,.035,.024,tint(color,0xffe1ac,.54));
  }

  for(const side of [-1,1]) {
    const rows=side===-1?8:3;
    for(let row=0;row<rows;row++) {
      const zs=side*(17.22+row*.72),y=.31+row*.34;
      box(0,y-.14,zs,51,.26,.745,row%2?0x33244d:0x2a2147);
      box(0,y-.051,zs-side*.362,51,.06,.032,row%2?0x64407f:0x3c3985);
      for(let n=0;n<98;n++) {
        const xp=-24.8+n*.51+(row%2)*.18;
        if(Math.abs(xp)<1.22||Math.abs(Math.abs(xp)-11.7)<.65||rnd()<.12) continue;
        const section = xp<0 ? [0,1,2,3,10,6] : [4,5,7,8,9,11];
        const col = rnd()<.81 ? crowd[pick(section)] : pick(crowd);
        seat(xp+rr(-.04,.04),y,zs+rr(-.048,.048),-side,col);
      }
      flecks(0,y+.013,zs,25,.30,55,[0xa34a8b,0xc0759e,0x8259b0,0x615b99],.035,.089);
    }
    for(const a of [-23.8,-11.7,0,11.7,23.8]) {
      for(let row=0;row<rows;row++) {
        const zs=side*(17.22+row*.72),y=.31+row*.34;
        box(a,y+.018,zs,1.14,.065,.71,0x4b4a74);
        box(a,y+.066,zs-side*.33,.96,.025,.044,a<0?0xff9b63:0x58ddea);
        if(row%2===0) {
          box(a-.57,y+.32,zs,.043,.49,.043,0x9d86ce);
          box(a-.57,y+.54,zs,.057,.045,.86,a<0?0xec77a2:0x63c7ef);
        }
      }
    }
    for(const at of [-21,-13,-5,3,11,19]) {
      const yc = .36+rows*.34;
      box(at,yc-.42,side*(16.87+rows*.72),5.5,.85,.21,0x251b3a);
      box(at,yc+.075,side*(16.87+rows*.72),5.5,.10,.24,pick([0xbd5b94,0xff886f,0x6350a6,0x2baab9]));
    }
  }

  for(const side of [-1,1]) {
    for(let row=0;row<5;row++) {
      const xs=side*(25.05+row*.80),y=.31+row*.37;
      box(xs,y-.15,0,.81,.29,32,row%2?0x30234c:0x242141);
      box(xs-side*.39,y-.051,0,.034,.055,32,0x5e3a6f);
      for(let n=0;n<60;n++) {
        const zp=-15.5+n*.52+row%2*.13;
        if(Math.abs(zp)<1.15||Math.abs(Math.abs(zp)-7.4)<.54||rnd()<.16)continue;
        seat(xs,y,zp,-side,pick(crowd.slice(side<0?3:0,side<0?12:10)));
      }
      for(const at of [-7.6,0,7.6]) {
        box(xs,y+.015,at,.79,.069,1.04,0x524468);
        box(xs-side*.374,y+.055,at,.042,.031,.92,0xd48276);
      }
    }
  }

  for (const side of [-1,1]) {
    const col=side<0?colors.ember:colors.tide;
    const dull=side<0?0x662f61:0x225c75;
    const xp=side*7.1;
    box(xp,.18,15.35,6.1,.32,1.35,0x181936);
    box(xp,.39,15.46,5.65,.12,.45,dull);
    box(xp,.69,15.91,5.7,.52,.095,dull);
    box(xp,1.57,15.45,6.16,.115,1.31,0x24234d);
    box(xp,1.65,14.82,6.15,.08,.105,col);
    box(xp,1.65,16.08,6.15,.065,.10,0x714377);
    for(let i=0;i<27;i++) {
      box(xp-2.93+i*.225,1.636,15.42,.078,.029,1.18,i%4===0?col:0x734492);
      if(i%4===0) dot(xp-2.93+i*.225,1.705,14.814,.043,col,1,{em:true});
    }
    for(const offset of [-2.91,0,2.91]) {
      box(xp+offset,.91,14.85,.095,1.39,.096,0x70b9be);
      box(xp+offset,.91,16.04,.095,1.39,.096,0x70b9be);
    }
    for (const offset of [-2.25,-1.18,.3,1.46]) seat(xp+offset,.65,15.46,1,col);
    for (const a of [xp-3.54,xp+3.52]) {
      box(a,.255,15.52,.42,.47,.44,0x4e517b);
      box(a,.512,15.52,.44,.073,.46,col);
    }
  }

  box(0,3.75,-22.7,47,.26,1.17,0x29264e);
  box(0,3.89,-22.15,47,.067,.035,0xe35498);
  box(0,4.22,-22.57,33,.12,1.04,0x454071);
  box(0,4.06,-22.0,33,.055,.058,0x6770a3);
  box(0,4.275,-22.12,47,.044,.056,0x8645ff);
  for(let a=-22;a<=22;a+=1.14) {
    const col=a<0?0xff5d87:0x32e5fa;
    box(a,4.08,-22.08,.53,.095,.065,col);
    box(a,3.96,-22.24,.091,.251,.35,0x67428c);
  }
  for(const x of [-22.8,-17,-11.7,-5.5,5.5,11.7,17,22.8]) {
    box(x,2.32,-22.68,.19,3.36,.21,0x484260);
    box(x,3.81,-22.38,.65,.11,.89,0x865573);
  }
  for(const a of [-16.4,-9.2,9.7,17.2]) {
    box(a,4.53,-22.12,.05,1.35,.05,0xb179a5);
    flags.push([a,5.18,-22.12,a<0?colors.ember:colors.tide]);
  }
  for(const side of [-1,1]) {
    for(const end of [-1,1]) {
      box(side*(x-.08),.54,end*(z-.07),.046,1.03,.046,0xdbd2b2);
      flags.push([side*(x-.08),1.055,end*(z-.07),side===end?0xffaa49:0xff6589]);
    }
  }
  for(const [i,[xp,zp]] of towers.entries()) {
    const glow=lampColors[i];
    box(xp,.16,zp,.82,.33,.80,0x242345);
    for(const dx of [-.21,.21]) for(const dz of [-.18,.18]) box(xp+dx,3.68,zp+dz,.070,7.2,.069,0x606b95);
    for(let y=.37;y<7.2;y+=.56) {
      box(xp,y,zp,.54,.06,.45,0x745988);
      box(xp-.23,y+.16,zp,.069,.31,.52,0x4f4c78);
      box(xp+.23,y+.16,zp,.069,.31,.52,0x4f4c78);
      box(xp+.258,y,zp+Math.sign(-zp)*.175,.035,.083,.093,tint(glow,0x2a194a,.35));
    }
    box(xp,7.39,zp,2.57,1.02,.32,0x31244c);
    box(xp,7.87,zp,2.64,.072,.42,glow);
    box(xp,7.37,zp-Math.sign(-zp)*.17,2.42,.14,.028,glow);
    box(xp,7.41,zp+Math.sign(-zp)*.19,2.43,.82,.12,0x684261);
    for(let i=0;i<6;i++)for(let j=0;j<2;j++) {
      const px=xp+(i-2.5)*.378,py=7.22+j*.37,pz=zp+Math.sign(-zp)*.27;
      box(px,py,pz,.319,.304,.058,glow);
      box(px,py,pz+Math.sign(-zp)*.034,.255,.236,.025,tint(glow,0xfffff0,.72));
      dot(px,py,pz+Math.sign(-zp)*.07,.235,tint(glow,0xfffff0,.43),.87,{em:true});
    }
  }

  for(const side of [-1,1]) {
    flecks(0,-.423,side*22.72,29,.18,480,[0x704383,0x3f3577,0xaa447c,0x5057a5],.052,.155);
    flecks(side*29.62,-.433,0,.23,22.4,470,[0x3d3975,0x6c5485,0x5a4f9b,0x482959],.048,.14);
    for(let i=0;i<250;i++) {
      const a=rr(-29.6,29.6),y=rr(-1.66,-.86);
      dot(a,y,side*23.01,rr(.043,.133),pick([0x433262,0x593976,0x222a63,0x733e67]),rr(.4,.83));
    }
  }
  const walkPavers=[0x2c2352,0x3b2a60,0x342656,0x443063,0x372a62,0x2d2e58];
  for(let i=0;i<29;i++) for(let j=0;j<3;j++) {
    const a=-26.3+i*1.88,b=19.31+j*.71;
    box(a,-.413,b,1.853,.045,.685,pick(walkPavers));
    if(j===2&&i%4===1) box(a,-.385,b-.145,.61,.014,.045,0xb351a9);
  }
  box(0,-.385,21.1,54,.025,.044,0xb162ad);
  box(0,-.387,19.09,53.6,.021,.049,0x615baa);
  flecks(0,-.381,20.0,26.5,1.06,1240,[0x523c78,0x754d90,0x504391,0x354368,0x9660a8],.016,.069);
  for(let a=-24;a<=24;a+=3) {
    box(a,-.18,21.36,.072,.41,.071,0x9162b1);
    box(a,.04,21.365,.118,.051,.114,0xf572b2);
  }
  box(0,-.013,21.36,49,.045,.057,0x664585);
  for(const side of [-1,1]) {
    for(let j=0;j<20;j++) {
      const a=-15.5+j*1.63;
      box(side*29.09,-.816,a,1.09,.033,1.59,pick(walkPavers));
      if(j%4===1) box(side*29.56,-.794,a,.054,.013,.53,side<0?0xb257aa:0x6b74df);
    }
    flecks(side*29.1,-.789,0,.51,15.8,420,[0x443668,0x685385,0x58509a],.018,.061);
  }
  const world=B.finish({name:'Floodlight FC'});
  return {world,structure,net,flags};
}
