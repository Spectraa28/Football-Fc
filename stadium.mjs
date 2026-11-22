import * as THREE from 'three';
import { boxLayer, createActors, createParticles } from './actors.mjs';
import { matchAt, filmCamera, goalTime, plays } from './match.mjs';
import { colors, towers, lampColors } from './scene.mjs';

function makeSplats(geometry, pixelScale, isPaint=false) {
  const material=new THREE.ShaderMaterial({
    uniforms:{ pixels:{ value:pixelScale }, paint:{ value:isPaint }, time:{value:0} },
    defaultAttributeValues:{kind:[0]},
    vertexShader:`
      uniform float pixels;
      uniform float time;
      uniform bool paint;
      attribute float radius;
      attribute vec3 pigment;
      attribute float kind;
      varying vec3 ink;
      varying float grain;
      varying float form;
      varying float distanceToEye;
      void main() {
        vec3 point=position;
        form=kind;
        grain=fract(sin(dot(position,vec3(23.3,81.7,14.1)))*4513.1);
        if(kind==1.) {
          float wind=floor(time*15.)/15.;
          point.x+=sin(wind*2.9+position.z*.58+position.x*.45)*radius*.11;
          point.z+=cos(wind*2.3+position.x*.41)*radius*.084;
        }
        vec4 center=modelViewMatrix*vec4(point,1.);
        gl_Position=projectionMatrix*center;
        float size=(pixels*projectionMatrix[1][1]*radius)/max(.11,-center.z);
        float maxStamp=(kind==1.)?24.:((kind==2.||!paint)?41.:29.);
        gl_PointSize=radius<=0.?1.:clamp(size,1.,maxStamp);
        ink=radius<=0.||(kind==1. && size<1.1 && grain>.48)?vec3(-1.):pigment;
        distanceToEye=-center.z;
      }`,
    fragmentShader:`
      uniform bool paint;
      varying vec3 ink;
      varying float grain;
      varying float form;
      varying float distanceToEye;
      void main() {
        if(ink.r<0.) discard;
        vec2 uv=gl_PointCoord-.5;
        float shade;
        if(form==1.) {
          uv.x+=(grain-.52)*uv.y*.58;
          float stemWidth=.23*clamp((uv.y+.52)*2.4,.2,1.);
          if(abs(uv.x)>stemWidth||uv.y<-.47||uv.y>.37) discard;
          shade=uv.y<-.11?1.38:uv.y>.13?.48:.87;
          if(uv.x<-.09) shade*=.76;
        } else {
          uv.x+=(grain-.52)*uv.y*.38;
          float edge=max(abs(uv.x),abs(uv.y))*.60+length(uv)*.37;
          if(edge>.51 || (edge>.38 && grain>.77)) discard;
          shade=uv.y<-.17?1.19:uv.y>.21?.60:.92;
          if(uv.x<-.19) shade*=.82;
        }
        float distanceFade=smoothstep(29.,83.,distanceToEye);
        vec3 rgb=mix(ink*shade,vec3(.028,.015,.063),distanceFade*(paint?.14:.26));
        if(form==2.) rgb=ink*(1.08+shade*.22);
        gl_FragColor=vec4(rgb,1.);
        #include <colorspace_fragment>
      }`
  });
  const points=new THREE.Points(geometry,material);
  points.frustumCulled=false;
  return points;
}

function unpack(rows) {
  const n=rows.length/16;
  const xyz=new Float32Array(n*3),radius=new Float32Array(n),rgb=new Float32Array(n*3),kind=new Uint8Array(n);
  const color=new THREE.Color();
  for(let i=0;i<n;i++) {
    const at=i*16,p=rows[at+7]|0;
    xyz.set(rows.subarray(at,at+3),i*3);
    radius[i]=Math.sqrt(Math.max(rows[at+4],rows[at+8],rows[at+10]))*1.85;
    const flags=rows[at+11]|0;
    kind[i]=(flags&8192)?1:(flags&32)?2:0;
    color.setHex(((p&255)<<16)|(p&65280)|((p>>16)&255));
    color.multiplyScalar(.55+.45*Math.min(1,rows[at+3]));
    color.toArray(rgb,i*3);
  }
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.BufferAttribute(xyz,3));
  geometry.setAttribute('radius',new THREE.BufferAttribute(radius,1));
  geometry.setAttribute('pigment',new THREE.BufferAttribute(rgb,3));
  geometry.setAttribute('kind',new THREE.BufferAttribute(kind,1));
  return geometry;
}

function bitmap(w,h,paint) {
  const c=document.createElement('canvas'); c.width=w;c.height=h;
  const context=c.getContext('2d');
  paint(context,w,h);
  const texture=new THREE.CanvasTexture(c);
  texture.colorSpace=THREE.SRGBColorSpace;
  texture.magFilter=texture.minFilter=THREE.NearestFilter;
  texture.generateMipmaps=false;
  return {context,texture};
}

function stadiumSigns(scene) {
  const board = (x,y,z,w,h,art,rotate=0) => {
    const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({
      map:art.texture,side:THREE.DoubleSide
    }));
    mesh.position.set(x,y,z); mesh.rotation.y=rotate; scene.add(mesh);
  };
  function ad(title, fill, ink, accent) {
    return bitmap(156,22,(g,w,h)=>{
      g.fillStyle=fill; g.fillRect(0,0,w,h);
      g.fillStyle=accent; g.fillRect(0,0,3,h); g.fillRect(w-3,0,3,h);
      g.fillStyle=ink; g.font='bold 12px monospace'; g.textAlign='center';
      g.fillText(title,w/2,15);
    });
  }

  const ads=[ad('FLOODLIGHT FC','#302249','#ffaf89','#ff5848'),ad('NIGHT FOOTBALL','#182e57','#acdeff','#31c6ea'),
    ad('AFTER HOURS','#55275a','#ffd5a0','#e74794'),ad('EMBER  /  TIDE','#21304a','#e2f996','#9cde43')];
  for(let i=0;i<8;i++) {
    const at=-22.05+i*6.3;
    board(at,.38,-16.37,5.89,.63,ads[i%ads.length]);
    if(i<2||i>5) board(at,.38,16.17,5.89,.63,ads[(i+2)%ads.length],Math.PI);
  }
  for(const side of [-1,1]) for(const end of [-1,1]) {
    board(side*24.03,.375,end*11.5,6.46,.61,ads[side===1?1:2],-side*Math.PI/2);
    board(side*24.03,.375,end*5.7,4.53,.61,ads[side===1?0:3],-side*Math.PI/2);
  }
  const sign = bitmap(300,56,(g,w,h)=>{
    g.fillStyle='#181327'; g.fillRect(0,0,w,h);
    g.fillStyle='#5c305b'; g.fillRect(2,2,w-4,2);g.fillRect(2,h-4,w-4,2);
    g.textAlign='center';g.font='900 26px monospace';g.fillStyle='#ffd183';g.fillText('FLOODLIGHT FC',w/2,37);
    g.fillStyle='#fa6a81'; g.fillRect(10,12,3,32);g.fillRect(w-13,12,3,32);
  });
  board(0,4.63,-22.01,10.5,1.75,sign);
  for(const [side,title,edge,ink] of [[-1,'EMBER','#ff497f','#ffcc75'],[1,'TIDE','#2adfff','#b9fff1']]) {
    const club=bitmap(196,32,(g,w,h)=>{
      g.fillStyle=side<0?'#431d57':'#20265f';g.fillRect(0,0,w,h);
      g.fillStyle=edge;g.fillRect(0,0,w,2);g.fillRect(0,h-2,w,2);
      for(let x=0;x<40;x+=4) for(let y=4;y<28;y+=4) {
        if((x+y*3)%17>9) {
          g.fillStyle=(x+y)%12===0?ink:edge;
          g.fillRect(x,y,3,3);g.fillRect(w-4-x,y,3,3);
        }
      }
      g.textAlign='center';g.fillStyle=ink;g.font='900 italic 22px system-ui';g.fillText(title,w/2,24);
    });
    board(side*14.2,4.30,-22.028,7.1,1.15,club);
  }
  const score=bitmap(168,30,()=>{});
  board(0,3.61,-22.018,6.7,1.14,score);
  let last;
  return function scoreAt(value) {
    if(last===value) return;
    last=value;
    const g=score.context;
    g.fillStyle='#101426';g.fillRect(0,0,168,30);
    g.fillStyle='#ff6558';g.fillRect(2,2,36,2);g.fillStyle='#43dbf5';g.fillRect(130,2,36,2);
    g.font='bold 13px monospace';g.textAlign='center';
    g.fillStyle='#ff8a72';g.fillText('EMB',24,22);g.fillStyle='#90eafa';g.fillText('TID',144,22);
    g.fillStyle='#fff3be';g.font='bold 21px monospace';
    g.fillText(value?'1–0':'0–0',84,24);
    score.texture.needsUpdate=true;
  };
}

function environmentalDetails(scene, lamps, flagRows) {
  const lamp=bitmap(64,64,(g)=>{
    const radial=g.createRadialGradient(32,32,0,32,32,32);
    radial.addColorStop(0,'rgba(255,255,255,.64)');radial.addColorStop(.24,'rgba(255,255,255,.34)');
    radial.addColorStop(.57,'rgba(255,255,255,.09)');radial.addColorStop(1,'rgba(255,255,255,0)');
    g.fillStyle=radial;g.fillRect(0,0,64,64);
  });
  for(const [i,[x,z]] of lamps.entries()) {
    const color=lampColors[i];
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map:lamp.texture,color,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false
    }));
    sprite.position.set(x,7.42,z-Math.sign(z)*.36); sprite.scale.set(6.8,4.7,1);
    scene.add(sprite);
    const from=new THREE.Vector3(x,7.31,z-Math.sign(z)*.33);
    const to=new THREE.Vector3(x*.55,.6,z*.26),axis=from.clone().sub(to);
    const height=axis.length();
    const cone=new THREE.Mesh(new THREE.ConeGeometry(5.1,height,24,1,true),new THREE.ShaderMaterial({
      uniforms:{color:{value:new THREE.Color(color)},beamHeight:{value:height}},
      side:THREE.BackSide,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false,
      vertexShader:`
        varying vec3 local;
        void main(){local=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}
      `,
      fragmentShader:`
        varying vec3 local;
        uniform vec3 color;
        uniform float beamHeight;
        void main(){
          float falloff=clamp(local.y/beamHeight+.5,0.,1.);
          float streak=.64+.36*sin(18.*atan(local.z,local.x))*sin(falloff*5.);
          vec2 pixel=floor(gl_FragCoord.xy);
          float dither=fract(dot(pixel,vec2(.75487765,.56984029)));
          float density=smoothstep(0.,.35,falloff)*pow(falloff,1.56);
          float alpha=(.076+.014*dither)*density*streak;
          gl_FragColor=vec4(color,alpha);
          #include <colorspace_fragment>
        }`
    }));
    cone.position.copy(from).lerp(to,.5);
    cone.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),axis.normalize());
    scene.add(cone);
  }
  const flags=flagRows.map(([x,y,z,col],i)=>{
    const large=i<4;
    const geo=new THREE.PlaneGeometry(large?1.12:.42,large?.54:.26,7,3);
    geo.translate(large?.56:.21,large?-.22:-.112,0);
    const ink=new THREE.Color(col), pale=ink.clone().lerp(new THREE.Color(0xffe8ad),.59);
    const p=geo.getAttribute('position'), tile=[];
    for(let j=0;j<p.count;j++) {
      const c=p.getY(j)>-.08||(j%8===2||j%8===3)?pale:ink;
      tile.push(c.r,c.g,c.b);
    }
    geo.setAttribute('color',new THREE.Float32BufferAttribute(tile,3));
    const cloth=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide}));
    cloth.position.set(x,y,z);cloth.rotation.y=i*.22+.27;scene.add(cloth);
    return p;
  });
  return t => {
    for(const [i,p] of flags.entries()) {
      for(let j=0;j<p.count;j++) {
        const x=p.getX(j);
        p.setZ(j,Math.sin(x*7.5-t*(4.2+i*.15)+i)*x*.16);
      }
      p.needsUpdate=true;
    }
  };
}

function createNet(scene, strands) {
  const data=new Float32Array(strands.length*6);
  const lit=new Float32Array(data.length);
  const geometry=new THREE.BufferGeometry();
  const points=new THREE.BufferAttribute(data,3).setUsage(THREE.DynamicDrawUsage);
  const pigments=new THREE.BufferAttribute(lit,3).setUsage(THREE.DynamicDrawUsage);
  geometry.setAttribute('position',points);
  geometry.setAttribute('color',pigments);
  const lines = new THREE.LineSegments(geometry,new THREE.LineBasicMaterial({
    vertexColors:true,transparent:true,opacity:.48,depthWrite:false
  }));
  lines.frustumCulled=false;
  scene.add(lines);
  const base=new THREE.Color(0xb5ebef),spark=new THREE.Color(0xffaa48),color=new THREE.Color();
  const impact=plays.at(-1).goal;
  return t => {
    const age=t-goalTime;
    for(const [i,[x,y,z,u,v,w,side]] of strands.entries()) {
      const bulge=(p,q,s) => side<0||age<0||age>1.7 ? p :
        p+Math.max(0,(p-21)/1.65)*Math.exp(-age*3.8)*Math.sin(age*19)*(1-.45*Math.abs(q-1.2))*Math.exp(-Math.abs(s+1.3)*.6)*.41;
      data.set([bulge(x,y,z),y,z,bulge(u,v,w),v,w],i*6);
      const d=Math.hypot((x+u)/2-impact[0],(y+v)/2-impact[1],(z+w)/2-impact[2]);
      const pulse=side>0&&age>=0&&age<1.16 ? Math.max(0,1-Math.abs(d-age*5.6)*.84)*Math.exp(-age*1.33):0;
      color.copy(base).lerp(spark,pulse).multiplyScalar(1+pulse*1.3);
      color.toArray(lit,i*6);
      color.toArray(lit,i*6+3);
    }
    points.needsUpdate=pigments.needsUpdate=true;
  };
}

export async function createStadium(canvas, opts={}) {
  const [metadata,binary] = await Promise.all(['stadium.json','stadium.bin'].map(async (path,i)=>{
    const res=await fetch(path);
    if(!res.ok) throw Error(`Missing ${path}. Run npm run bake.`);
    return i ? new Float32Array(await res.arrayBuffer()):res.json();
  }));
  if(binary.length!==16*metadata.count) throw Error('Stadium data did not match its manifest');

  const renderer=new THREE.WebGLRenderer({canvas,antialias:false,alpha:false,powerPreference:'high-performance',
    preserveDrawingBuffer:!!opts.capture});
  renderer.setClearColor(colors.sky);
  const scene=new THREE.Scene(), camera=new THREE.PerspectiveCamera(46,16/9,.075,190);
  const sky=new THREE.Mesh(new THREE.SphereGeometry(110,22,12),new THREE.ShaderMaterial({
    side:THREE.BackSide, depthWrite:false,
    vertexShader:`varying vec3 world; void main(){ world=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader:`varying vec3 world; void main(){
      vec3 dir=normalize(world); float haze=exp(-abs(dir.y+.029)*10.);
      float band=floor(haze*25.)/25.;
      vec3 ink=mix(vec3(.0011,.0012,.009),vec3(.029,.007,.065),band*.77);
      ink+=vec3(.036,.003,.031)*pow(max(0.,dot(dir,normalize(vec3(-.2,.08,-1.)))),8.)*haze;
      ink+=vec3(.001,.011,.042)*pow(max(0.,dot(dir,normalize(vec3(.9,.10,.25)))),8.)*haze;
      gl_FragColor=vec4(ink,1.);
      #include <colorspace_fragment>
    }`
  }));
  sky.renderOrder=-20;scene.add(sky);
  const stands=boxLayer(scene,metadata.structure.length);
  metadata.structure.forEach((piece,i)=>stands.set(i,piece));
  const field=makeSplats(unpack(binary),270,true);scene.add(field);
  const actors=createActors(scene);
  const particles=createParticles(scene);
  const stamps=makeSplats(particles.geometry,270);scene.add(stamps);
  const net=createNet(scene,metadata.net);
  const flags=environmentalDetails(scene,towers,metadata.flags);
  const score=stadiumSigns(scene);

  function resize(width,height) {
    renderer.setSize(width,height,false);
    camera.aspect=width/height; camera.updateProjectionMatrix();
    field.material.uniforms.pixels.value=height;
    stamps.material.uniforms.pixels.value=height;
  }
  function draw(time, view) {
    const state=matchAt(time);
    const pose=view||filmCamera(state);
    camera.fov=pose.fov;
    camera.position.set(...pose.eye); camera.lookAt(...pose.target);camera.updateProjectionMatrix();
    sky.position.copy(camera.position).multiplyScalar(Math.max(0,1-70/Math.max(1,camera.position.length())));
    field.material.uniforms.time.value=time;
    actors(state);particles.update(state);net(time);flags(time);score(state.scored);
    renderer.render(scene,camera);
    return state;
  }
  return { resize, draw, renderer };
}
