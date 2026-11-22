import * as THREE from 'three';
import { plays, roster, goalTime, ballAt } from './match.mjs';
import { colors } from './scene.mjs';

export function boxLayer(scene, count, sportsLight = false) {
  const geometry = new THREE.BoxGeometry();
  const light = [1,.61,1.12,.48,.95,.72];
  const tint = [[1,.94,.96],[.74,.76,1],[1,1,.89],[.59,.58,1],[1,.95,.94],[.75,.87,1]];
  geometry.setAttribute('color',new THREE.Float32BufferAttribute(light.flatMap((value,i)=>
    Array.from({length:4},()=>tint[i].map(c=>Math.min(1,value*c+(sportsLight ? .055 : 0)))).flat()),3));
  const material = new THREE.MeshBasicMaterial({vertexColors:true});
  if(sportsLight) {
    material.onBeforeCompile=shader=>{
      const detailVaryings='varying vec3 blockPoint; varying vec3 blockSize; varying vec3 blockNormal;\n';
      shader.vertexShader=detailVaryings+shader.vertexShader.replace('#include <color_vertex>',`
        #include <color_vertex>
        blockSize=vec3(length(instanceMatrix[0].xyz),length(instanceMatrix[1].xyz),length(instanceMatrix[2].xyz));
        blockPoint=(position+.5)*blockSize;
        blockNormal=abs(normal);
        vec3 facing=normalize(mat3(instanceMatrix)*normal);
        float hot=floor(max(0.,dot(facing,normalize(vec3(.63,.83,-.6))))*4.)*.25;
        float cool=floor(max(0.,dot(facing,normalize(vec3(-.8,.29,.73))))*4.)*.25;
        float base=max(.0,facing.y);
        vColor.rgb=vColor.rgb*(vec3(.56,.45,.78)+vec3(.74,.61,.27)*hot+vec3(.13,.38,.62)*cool)
          +vec3(.062,.015,.005)*hot+vec3(.003,.027,.083)*cool+vec3(.021,.015,.014)*base;
      `);
      shader.fragmentShader=detailVaryings+shader.fragmentShader.replace('#include <color_fragment>',`
        #include <color_fragment>
        vec3 cell=floor(blockPoint*41.);
        float stitch=fract(dot(cell,vec3(.1271,.5179,.317)));
        float weave=fract(dot(floor(cell*.48),vec3(.737,.389,.193)));
        vec3 edge=min(blockPoint,blockSize-blockPoint)+blockNormal;
        float border=min(edge.x,min(edge.y,edge.z));
        float fabric=(stitch>.79?.13:stitch<.19?-.11:0.)+(weave>.63?.041:-.027);
        diffuseColor.rgb*=1.+fabric;
        diffuseColor.rgb+=vec3(.032,.020,.041)*(1.-step(.012,border));
      `);
    };
  }
  const mesh = new THREE.InstancedMesh(geometry,material,count);
  mesh.frustumCulled = false;
  scene.add(mesh);
  const object = new THREE.Object3D(), color = new THREE.Color();
  return {
    mesh, object,
    set(i,[x,y,z,w,h,d,c,a=0]) {
      object.position.set(x,y,z);
      object.scale.set(w,h,d);
      object.rotation.set(0,a,0);
      object.updateMatrix();
      mesh.setMatrixAt(i,object.matrix);
      mesh.setColorAt(i,color.setHex(c));
    }
  };
}

const digits = [
  '111101101101111','010110010010111','111001111100111','111001111001111','101101111001001',
  '111100111001111','111100111101111','111001010010010','111101111101111','111101111001111',
];

function playerDesign(p,i) {
  const kit = p.keeper ? (p.side ? 0xffb91e:0xa562ff) : p.side ? 0x10d9ff:0xff433d;
  const kitDark = p.keeper ? (p.side ? 0xb85027:0x6935ba) : p.side ? 0x2353bf:0xbe235b;
  const light = p.keeper ? (p.side ? 0xfff487:0xecceff) : p.side ? 0xc0ffed:0xffc452;
  const shorts = p.side ? 0x20327b:0x521956;
  const boots = [0xfbfbb9,0xffbc29,0x41e5ff,0xff459f,0xc8ff38,0xff9bdb][i%6];
  const skin = p.skin, hair = p.tone, width = .47+(i%5)*.023;
  const mid=(a,b,u)=>new THREE.Color(a).lerp(new THREE.Color(b),u).getHex();
  const skinLight=mid(skin,0xffcf8e,.22), skinShade=mid(skin,0x9b365b,.31);
  const hairLight=mid(hair,i%3===0?0x9b68cd:0xfca16a,.23);
  const face = [];
  const add = (...box) => face.push(box);
  add(0,.067,0,width,.49,.262,kit);
  add(0,-.136,0,width+.026,.141,.271,kitDark);
  add(0,.057,.137,.064,.434,.018,light);
  add(0,.276,.134,.171,.047,.037,kitDark);
  add(0,.297,.14,.146,.018,.040,light);
  add(-width*.37,.205,.138,.035,.075,.017,0xffebba);
  add(width*.34,.127,.140,.076,.062,.018,kitDark);
  add(0,-.279,-.005,.435,.24,.272,shorts);
  for(const side of [-1,1]) {
    for(let j=0;j<5;j++) {
      const along=side*(.225-(j%3)*.036);
      add(along,.203-j*.056,side*.135,.032,.025,.018,j===0||j===4?light:kitDark);
    }
    for(let j=0;j<3;j++) {
      add(side*(.192-j*.015),-.207-j*.035,.136,.024,.028,.012,j===0?light:kitDark);
      add(side*(width*.48-j*.069),.317,-.039,.030,.019,.205,j===0?light:kitDark);
    }
  }
  for(let n=0;n<5;n++) {
    const sx=width*.31+(n%2)*.020;
    add(sx,.182-Math.floor(n/2)*.022,.152,.019,.020,.009,n%3===0?light:0xfff3ba);
  }
  add(0,.342,0,.144,.116,.156,skin);
  add(0,.516,.012,.326,.337,.309,skin);
  add(0,.515,.17,.081,.083,.048,skinLight);
  add(0,.429,.175,.112,.022,.016,0x673744);
  add(0,.677,.002,.349,.118,.321,hair);
  add(0,.575,-.131,.344,.17,.094,hair);
  for(const side of [-1,1]) {
    add(side*.184,.523,.008,.063,.098,.086,skin);
    add(side*.082,.556,.173,.051,.031,.023,0x20172c);
    add(side*.087,.563,.185,.012,.013,.012,0xffe9c2);
    add(side*.085,.595,.165,.062,.015,.018,hair);
    add(side*.105,.493,.170,.077,.027,.015,skinLight);
    add(side*.137,.453,.17,.037,.039,.013,skinShade);
    add(side*.177,.543,.093,.031,.091,.034,skinShade);
    for(let j=0;j<4;j++) add(side*(.047+j*.033),.712+(j%2)*.019,-.077+j*.034,.024,.023,.068,hairLight);
  }
  if(i%5===2||i===7) {
    for(let n=0;n<5;n++) add((n-2)*.017,.493+(n%2)*.011,.184,.008,.008,.008,skinShade);
  }
  if(i%4===0) add(-.198,.503,.021,.025,.024,.028,light);
  switch(p.hair) {
    case 'afro':
      add(0,.747,-.015,.432,.157,.351,hair);
      add(-.142,.697,.027,.136,.119,.332,hair); add(.123,.702,.009,.162,.121,.364,hair); break;
    case 'mohawk': case 'hawk': case 'crest':
      add(p.hair==='hawk'?.047:0,.791,-.036,.118,.206,.270,hair);
      add(.007,.737,.103,.15,.113,.121,p.hair==='hawk'?0xfe904c:hair); break;
    case 'bun': case 'puffs':
      add(-.13,.778,-.078,.18,.171,.166,hair);
      if(p.hair==='puffs') add(.149,.769,-.068,.19,.179,.18,hair);
      else add(-.16,.731,-.105,.11,.040,.17,light);
      break;
    case 'sweep':
      add(.092,.687,.118,.226,.136,.127,hair);
      add(.163,.625,.144,.077,.121,.105,hair);
      add(-.043,.724,.036,.24,.054,.152,i===7?0xffdd87:hair); break;
    case 'braid': case 'tail':
      add(0,.7,-.195,.184,.122,.15,hair);
      add(.08,.54,-.192,.108,.24,.11,hair);
      add(.092,.422,-.21,.091,.092,.14,light);
      add(.115,.36,-.23,.087,.136,.106,hair); break;
    case 'hood': case 'cap':
      add(0,.659,.021,.385,.155,.338,hair);
      add(0,.642,.189,.32,.039,.136,i===0?light:hair);
      if(p.hair==='hood') for(const side of [-1,1]) add(side*.142,.577,.064,.105,.17,.239,hair);
      break;
    case 'band':
      add(0,.621,.021,.366,.044,.33,light); add(-.123,.708,.026,.131,.083,.21,hair); break;
    case 'beard':
      add(0,.437,.161,.239,.086,.055,hair);
      for(const side of [-1,1]) add(side*.103,.497,.144,.043,.1,.061,hair);
      break;
    case 'fade':
      add(0,.729,-.038,.28,.071,.247,hair); break;
    default:
      add(.041,.702,.052,.268,.060,.232,hair);
  }
  const number = String(p.number);
  for(const side of [-1,1]) for(const [j,digit] of [...number].entries()) {
    for(const [cell,bit] of [...digits[Number(digit)]].entries()) {
      if(bit==='1') add(side*((j-(number.length-1)/2)*.100+(cell%3-1)*.023),.135-Math.floor(cell/3)*.025,side*.144,.022,.024,.012,light);
    }
  }
  return { face, kit, kitDark, light, shorts, boots, width, skin };
}

const clamp = x => Math.max(0,Math.min(1,x));
const mix = (a,b,u) => a+(b-a)*u;

export function createActors(scene) {
  const designs = roster.map(playerDesign);
  const count = designs.reduce((n,d)=>n+d.face.length+22,0);
  const layer = boxLayer(scene,count,true);
  layer.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

  const shadow = new THREE.InstancedMesh(new THREE.CircleGeometry(1,14), new THREE.MeshBasicMaterial({
    color:0x110d39, transparent:true, opacity:.45, depthWrite:false, polygonOffset:true,polygonOffsetFactor:-1
  }),roster.length+1);
  shadow.frustumCulled=false;
  shadow.renderOrder=1;
  scene.add(shadow);

  const ballGeo=new THREE.IcosahedronGeometry(.151,2);
  const v=ballGeo.getAttribute('position'), tile=[];
  const panelColors=[0xffffd7,0xfff9e4,0x283450,0xe8f6d9,0xffd354].map(c=>new THREE.Color(c));
  const patches=[[.05,1,0],[.84,.33,.41],[-.83,.35,-.4],[0,-.38,.92],[.22,-.43,-.87]];
  for(let i=0;i<v.count;i+=3) {
    const n=new THREE.Vector3().fromBufferAttribute(v,i).add(new THREE.Vector3().fromBufferAttribute(v,i+1)).add(new THREE.Vector3().fromBufferAttribute(v,i+2)).normalize();
    const dark=patches.some(([x,y,z])=>n.x*x+n.y*y+n.z*z>.925);
    const col=panelColors[dark?2:i%13===0?4:i%5===0?3:i%7===0?1:0].clone().multiplyScalar(.74+.26*clamp(n.y*.5+.5));
    for(let k=0;k<3;k++) tile.push(col.r,col.g,col.b);
  }
  ballGeo.setAttribute('color',new THREE.Float32BufferAttribute(tile,3));
  const ball = new THREE.Mesh(ballGeo,new THREE.MeshBasicMaterial({vertexColors:true}));
  scene.add(ball);

  const transform = new THREE.Object3D(), piece = new THREE.Object3D(), ground = new THREE.Object3D(), matrix = new THREE.Matrix4(), color = new THREE.Color();
  const q=new THREE.Quaternion(), up=new THREE.Vector3(0,1,0), aK=new THREE.Vector3(), bK=new THREE.Vector3();
  let idx=0, paint=true;
  function part(x,y,z,w,h,d,c,rx=0,rz=0) {
    piece.position.set(x,y,z);
    piece.scale.set(w,h,d);
    piece.rotation.set(rx,0,rz);
    piece.updateMatrix();
    matrix.multiplyMatrices(transform.matrix,piece.matrix);
    layer.mesh.setMatrixAt(idx,matrix);
    if(paint) layer.mesh.setColorAt(idx,color.setHex(c));
    idx++;
  }
  function bone(x,y,z,ox,oy,oz,w,d,c) {
    aK.set(x,y,z); bK.set(ox,oy,oz).sub(aK);
    const len=bK.length();
    q.setFromUnitVectors(up,bK.normalize());
    piece.quaternion.copy(q);
    piece.position.set((x+ox)/2,(y+oy)/2,(z+oz)/2);
    piece.scale.set(w,len+.03,d); piece.updateMatrix();
    matrix.multiplyMatrices(transform.matrix,piece.matrix);
    layer.mesh.setMatrixAt(idx,matrix);
    if(paint) layer.mesh.setColorAt(idx,color.setHex(c));
    idx++;
  }
  function stamp(i,x,z,width,depth,yaw=0) {
    ground.position.set(x,.041,z);
    ground.rotation.set(-Math.PI/2,0,yaw);
    ground.scale.set(width,depth,1);
    ground.updateMatrix();
    shadow.setMatrixAt(i,ground.matrix);
  }
  return function update({t,players,ball:xyz,scored}) {
    idx=0;
    for(const [i,p] of players.entries()) {
      const d=designs[i], { x,z,cheer,dive,kick,windup }=p;
      const active=clamp(p.speed/2.2);
      const phase=t*(9.6+active*1.8)+i*.68;
      const swing=Math.sin(phase);
      const bob=.043*active*(1-Math.cos(phase*2))+.06*cheer*(1-Math.cos(t*15+i));
      transform.position.set(x,1.02*roster[i].scale+bob-dive*.33,z);
      transform.rotation.set(.12*active-dive*.3,p.yaw,.08*swing*active+dive*1.27,'YXZ');
      transform.scale.setScalar(roster[i].scale);
      transform.updateMatrix();
      for(const cuboid of d.face) part(...cuboid);
      for(const side of [-1,1]) {
        const stride = side*swing*active;
        const strike = side === 1 ? kick : 0;
        const pull = side === 1 ? windup : 0;
        const hip=side*.112;
        const y=-.93+Math.max(0,stride)*.22+strike*.24+pull*.20;
        const foot=.039+stride*.38+strike*.68-pull*.42;
        const kneeZ=.033+stride*.115+strike*.35;
        bone(hip,-.335,.001,hip,-.59+strike*.13,kneeZ,.168,.169,d.shorts);
        bone(hip,-.59+strike*.13,kneeZ,hip,y+.148,foot,.117,.106,d.skin);
        bone(hip,y+.238,foot,hip,y+.042,foot,.124,.115,d.kit);
        part(hip,y+.174,foot,.128,.037,.121,d.light);
        part(hip,y,foot+.052,.154,.113,.257,d.boots,.16*stride-strike*.46);
        part(hip,y-.048,foot+.056,.158,.029,.268,0x2e2548);
        part(hip,y+.06,foot+.08,.125,.025,.079,d.light,.16*stride-strike*.46);
        const width=d.width*.51;
        const elbowX=side*(width+.065+cheer*.109+dive*.11);
        const elbowY=mix(-.045,.412,cheer)+dive*.23;
        const handX=side*(width+.081+cheer*.21+dive*.24);
        const handY=mix(-.272,.706,cheer)+dive*.30;
        const handZ=-stride*.31-kick*.22*side+dive*.12;
        part(side*(width-.002),.184,0,.165,.196,.213,d.kit,0,side*(.12+cheer));
        part(side*(width+.015),.102,0,.155,.035,.217,d.light,0,side*(.12+cheer));
        bone(side*width,.149,0,elbowX,elbowY,-stride*.15,.108,.111,d.skin);
        bone(elbowX,elbowY,-stride*.15,handX,handY,handZ,.101,.104,roster[i].keeper?d.light:d.skin);
      }
      stamp(i,x+.122,z+.15,.48+dive*.28,.29+.10*active,p.yaw);
    }
    layer.mesh.instanceMatrix.needsUpdate=true;
    if(paint) layer.mesh.instanceColor.needsUpdate=true;
    paint=false;
    if(idx!==count) throw Error('Player model size changed');
    ball.position.set(...xyz);
    ball.rotation.set(t*14,t*3.2,t*8.7);
    const radius=.148+xyz[1]*.055;
    stamp(roster.length,xyz[0]+xyz[1]*.14,xyz[2]+xyz[1]*.12,radius,radius*.72);
    shadow.instanceMatrix.needsUpdate=true;
  };
}

export function createParticles(scene) {
  const ambience=265, impacts=360, paper=520, tracer=54;
  const size=ambience+impacts+paper+tracer;
  const p=new Float32Array(size*3),s=new Float32Array(size),c=new Float32Array(size*3);
  const geometry=new THREE.BufferGeometry();
  const position=new THREE.BufferAttribute(p,3).setUsage(THREE.DynamicDrawUsage);
  const radius=new THREE.BufferAttribute(s,1).setUsage(THREE.DynamicDrawUsage);
  const colorsAttr=new THREE.BufferAttribute(c,3).setUsage(THREE.DynamicDrawUsage);
  geometry.setAttribute('position',position);
  geometry.setAttribute('radius',radius);
  geometry.setAttribute('pigment',colorsAttr);
  const kinds=new Uint8Array(size);
  kinds.fill(2,ambience);
  geometry.setAttribute('kind',new THREE.BufferAttribute(kinds,1));
  const random=i=>{ const x=Math.sin(i*127.1+311.7)*43758.5453; return x-Math.floor(x); };
  const hues=[colors.ember,colors.amber,0xff69c1,colors.tide,colors.lime,0xffe7a9,0x8755ff,0x52ffb4].map(value=>new THREE.Color(value));
  const kickSpots=plays.map(play=>ballAt(play.start).ball);
  const params=Array.from({length:size},(_,i)=>[random(i+1),random(i+39),random(i+803),random(i+23),random(i+187),random(i+411)]);
  const update = state => {
    const t=state.t, goal=t-goalTime;
    const flight=state.next && t>=state.next.start && (state.next.arc>.5);
    const trail=flight ? Array.from({length:18},(_,j)=> {
      const time=t-(j+1)*.014;
      return time>=state.next.start ? ballAt(time).ball : null;
    }) : [];
    for(const [i,[a,b,d,e,f,h]] of params.entries()) {
      let x,y,z,r,pigment=i%hues.length;
      if(i<ambience) {
        x=(a-.5)*57+Math.sin(t*.17+d*15)*1.8;
        y=.11+b**2*7.85+Math.sin(t*.55+f*18)*.35;
        z=(e-.5)*47+Math.cos(t*.28+h*21)*1.33;
        r=(.012+.034*f)*(.22+.78*Math.abs(Math.sin(t*.76+h*19)));
      } else if(i<ambience+impacts) {
        const playID=(i-ambience)%plays.length;
        const play=plays[playID], [ax,,az]=kickSpots[playID];
        const u=t-play.start-a*.092, angle=d*Math.PI*2;
        const ring=.06+Math.max(0,u)*(1.1+e*2.85);
        x=ax+Math.cos(angle)*ring;z=az+Math.sin(angle)*ring;
        y=.048+Math.max(0,(.41+1.49*b)*u-u*u*(2.24+f*.58));
        r=u>0&&u<.58 ? (.018+.044*h)*(1-u/.58) : 0;
        pigment=[1,4,5,7][i%4];
      } else if(i<ambience+impacts+paper) {
        const u=goal-.16-a*.93;
        const side=i%2 ? 1:-1;
        x=14.6+(b-.5)*14 +(d-.5)*Math.max(0,u)*1.4;
        y=.12+(4.6+e*4.4)*u-(2.28-f*.48)*u*u;
        z=side*(12.9-a*2.1)-side*(1.35+d*3.6)*u+Math.sin(u*4+b*23)*.3;
        r=u>0&&y>.05 ? .029+h*.068 : 0;
      } else {
        const j=(i-ambience-impacts-paper)%18, offset=Math.floor((i-ambience-impacts-paper)/18);
        const point=trail[j];
        [x,y,z]=point||state.ball;
        x+=(b-.5)*offset*.10;y+=(d-.5)*offset*.075;z+=(e-.5)*offset*.10;
        r=point ? (.066-j*.0031)*(1-offset*.21):0;
        pigment=j<6?5:offset===2?3:1;
      }
      p.set([x,y,z],i*3); s[i]=r;
      const color=hues[pigment];
      c.set([color.r,color.g,color.b],i*3);
    }
    position.needsUpdate=radius.needsUpdate=colorsAttr.needsUpdate=true;
  };
  return {geometry,update};
}
