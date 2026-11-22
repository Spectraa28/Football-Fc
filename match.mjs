export const duration = 24;
export const pitch = { x: 21, z: 13, goalZ: 2.55, goalY: 1.73, goalDepth: 1.65 };

const ember = [
  ['Vale', 1, -19, 0, 'cap', 0xb96745, 0x281d39, 1.10],
  ['Ilex', 2, -13, -8, 'fade', 0x88452e, 0x211322, 1.06],
  ['Nico', 3, -15, -3, 'crop', 0xe79362, 0x835034, 1.02],
  ['Bram', 4, -14, 3, 'mohawk', 0xfbb683, 0xdf6451, 1.16],
  ['Rin', 5, -11, 8.8, 'bun', 0xf4ae83, 0x17142b, 0.94],
  ['Ayo', 6, -3, -1, 'afro', 0x925232, 0x24131e, 1.08],
  ['Paz', 8, -6, 4.8, 'band', 0xd18257, 0x342538, 1.11],
  ['Mako', 7, -4, 9.3, 'sweep', 0xe19569, 0xffd076, 1.07],
  ['Sol', 11, 2, -8.6, 'braid', 0x9b5539, 0x20162f, 0.98],
  ['Kestrel', 10, 3, 2.1, 'hawk', 0xdb8c5c, 0x342239, 1.17],
  ['Len', 9, 6.3, -3.8, 'beard', 0xb27656, 0x422631, 1.05],
];
const tide = [
  ['Miro', 1, 19, 0, 'beard', 0xedb080, 0x523039, 1.18],
  ['Noor', 2, 13, 7, 'hood', 0xbd7952, 0x25324e, 0.97],
  ['Kian', 3, 15, 2, 'crest', 0xb77a52, 0xeb8545, 1.07],
  ['Tess', 4, 14, -3.5, 'tail', 0xdc9979, 0x652c35, 1.05],
  ['Rio', 5, 11, -8, 'crop', 0x86503d, 0xd9e3aa, 0.93],
  ['Zed', 6, 6.3, 7.6, 'band', 0x6e3d30, 0x211e36, 1.08],
  ['Jo', 8, -2, -3, 'bun', 0xeeaa79, 0x533042, 1.00],
  ['Fenn', 7, 3, 3, 'fade', 0xe5ac78, 0x4a3333, 1.13],
  ['Uma', 10, -1, -8.4, 'puffs', 0x8e4631, 0x231025, 1.04],
  ['Reef', 9, -6.8, 1.6, 'sweep', 0xfac290, 0x74513f, 0.98],
  ['Ash', 11, -5.3, 8.8, 'braid', 0xaf6648, 0x2b1c45, 1.08],
];

export const roster = [ember, tide].flatMap((team, side) =>
  team.map(([name, number, x, z, hair, skin, tone, scale], i) =>
    ({ name, number, x, z, hair, skin, tone, scale, side, keeper: i === 0 })));

const routes = {
  5: [[0,-3,-1],[2.55,-2.7,.2],[3.35,-3.6,.7],[4.3,-3.3,1.8],[7.0,-.3,3.2],[11,4.5,2],[18,11,2.3],[22,12.5,2.8]],
  6: [[0,-6,4.8],[3.4,-5.5,4.5],[4.8,-4.7,5.2],[5.8,-3.2,5.2],[8.6,1.5,4.1],[12.7,6,4.4],[17,10.4,5]],
  7: [[0,-4,9.3],[4.8,-3,10.1],[6.25,-.3,10],[7.6,2.2,10.2],[9.5,6.8,9.9],[11.4,10.8,9.7],[13.4,13,8.7],[16.9,16.5,7.5],[19.5,17,5],[22,15.7,3.5]],
  8: [[0,2,-8.6],[5,4,-9],[8.1,7,-9.6],[10.45,9.8,-8.7],[11.5,12.8,-7.9],[13.5,15.3,-6.2],[16.5,17,-4.8],[21,15,-2]],
  9: [[0,3,2.1],[4.6,3.5,1.8],[8.7,7.2,.9],[11.6,10.3,.2],[13.7,11.1,.9],[15.3,14,-.35],[17.85,16.1,1.1],[18.9,17.6,1.4],[20.5,16.1,3.5],[22,14,4.1]],
  10: [[0,6.3,-3.8],[5.5,7.3,-4.7],[9.2,9.1,-3.2],[12.75,15.6,-2.3],[14.0,16.1,-2.3],[16.9,17.3,-2.8],[19.6,18.2,-4],[22,16,-1]],
  11: [[0,19.65,0],[11,19.4,0],[14,19.35,-.7],[17.7,19.75,.15],[18.6,19.95,.95],[19.05,20.2,1.8],[20.2,20,1.95],[22,19.75,1]],
  12: [[0,13,7],[6,10.5,8.6],[9.6,9.9,8.15],[12.9,12.5,7],[15.5,15,5.9],[19,17.5,5.1]],
  13: [[0,15,2],[7,12.9,3.2],[11.2,13,2.8],[15.7,15,1.5],[18.2,16.9,2.55],[23,17.1,2.8]],
  14: [[0,14,-3.5],[7.5,11.3,-2.7],[11.1,13.5,-4.2],[14.1,15.5,-3.75],[18.5,18.4,-2.3]],
  15: [[0,11,-8],[5.5,8.8,-8],[9.2,9.7,-6.4],[11.1,12,-6],[15.5,16.5,-5.65],[21,18.4,-5.3]],
  16: [[0,6.3,7.6],[4.6,3.2,6.7],[7.9,3.5,8.9],[9.4,5.4,8.5],[12,9,7.7],[16,13,5.1],[21,14.5,4]],
  17: [[0,-2,-3],[1.35,-2.9,-2.2],[2.65,-3.8,-1.8],[4.5,-4.8,-1.45],[7,-.25,1],[10.4,4.8,.7],[15,10.3,.3],[22,15,1.3]],
  18: [[0,3,3],[1.6,1.15,1.35],[3.6,.15,1.1],[6.6,1.1,2.85],[10.8,6.5,2.7],[16,11.3,.2],[21,12.4,1.35]],
  19: [[0,-1,-8.4],[4,-3,-6.3],[8.8,1.6,-7],[12.3,5.5,-5.4],[17,11.4,-4]],
  20: [[0,-6.8,1.6],[2.35,-6.6,1.7],[4,-5.9,1.6],[8,0,1.7],[14,8.2,1.5],[22,12,2.2]],
  21: [[0,-5.3,8.8],[2.4,-6.6,8.4],[5.5,-4.6,8.1],[9.2,1.2,7.2],[14,8.5,5.5],[21,13,5.5]],
};

export const plays = [
  { start: 1.30, end: 2.93, from: 17, to: 5, arc: .12, title: 'Interception' },
  { start: 4.32, end: 5.13, from: 5, to: 6, arc: .06, title: 'Outlet pass' },
  { start: 5.88, end: 7.33, from: 6, to: 7, arc: .09, title: 'Down the wing' },
  { start: 9.56, end: 11.26, from: 7, to: 8, arc: 1.69, title: 'Switch of play' },
  { start: 12.23, end: 13.28, from: 8, to: 10, arc: .12, title: 'Into the box' },
  { start: 14.04, end: 15.31, from: 10, to: 9, arc: .06, title: 'The cutback' },
  { start: 18.22, end: 18.94, from: 9, goal: [22.40, 1.26, -1.75], arc: .53, title: 'The finish' },
];

export const goalTime = plays.at(-1).end;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const blend = (a, b, t) => a.map((value, i) => lerp(value, b[i], t));
const ease = v => { const u = clamp(v); return u * u * (3 - 2 * u); };
const look = (dx, dz) => Math.atan2(dx, dz);

function position(i, time) {
  const p = roster[i];
  const keys = routes[i] || [[0,p.x,p.z],[5,p.x+.4,p.z+.4],[12,p.x+(p.keeper ? .3 : 3),p.z-.25],[20,p.x+(p.keeper ? .7 : 5),p.z+.2]];
  const t = Math.max(0, time);
  const j = keys.findIndex(k => k[0] > t);
  if (j < 0) return keys.at(-1).slice(1);
  const a = keys[j - 1], b = keys[j], prev = keys[Math.max(0,j - 2)], next = keys[Math.min(keys.length - 1,j + 1)];
  const span = b[0] - a[0], u = (t - a[0]) / span;
  return [1, 2].map(k => {
    const m0 = (b[k] - prev[k]) / (b[0] - prev[0]) * span;
    const m1 = (next[k] - a[k]) / (next[0] - a[0]) * span;
    return lerp(a[k], b[k], ease(u)) + u*(1-u)*((1-u)*m0-u*m1);
  });
}

function touch(i, t, target, offset = .40) {
  const [x,z] = position(i,t);
  const length = Math.hypot(target[0]-x,target[1]-z) || 1;
  return [x+(target[0]-x)*offset/length,.153,z+(target[1]-z)*offset/length];
}

export function ballAt(t) {
  t = clamp(t, 0, duration);
  const next = plays.find(p => t < p.end);
  const prev = plays.findLast(p => p.end <= t);
  let ball, owner = next?.from ?? null;
  if (next) {
    const from = position(next.from,next.start);
    const to = next.goal ? [next.goal[0],next.goal[2]] : position(next.to,next.end);
    if (t >= next.start) {
      owner = null;
      const u = clamp((t-next.start)/(next.end-next.start));
      const progress = 1 - (1-u)*(1-u*.26);
      const a = touch(next.from,next.start,to);
      const b = next.goal || touch(next.to,next.end,from);
      ball = blend(a,b,progress);
      ball[1] += Math.sin(Math.PI*progress)*next.arc;
    } else {
      const a = touch(owner,t,to,.39+.085*Math.sin(t*8.5));
      const origin = prev ? position(prev.from,prev.start) : to;
      const caught = touch(owner,prev?.end ?? 0,origin);
      const settle = prev ? ease((t-prev.end)/.27) : 1;
      ball = blend(caught,a,settle);
    }
  } else {
    const goal = plays.at(-1).goal, u = t-goalTime;
    ball = [goal[0]-.72*ease(u/.65), .153+(goal[1]-.153)*Math.exp(-u*2.6), goal[2]+.37*ease(u/.9)];
  }
  return { t, ball, owner, next, prev, scored: t >= goalTime };
}

export function matchAt(time) {
  const state = ballAt(time);
  const { t, ball, owner, next } = state;
  const players = roster.map((p,i) => {
    const [x,z] = position(i,t);
    const [a,b] = position(i,t-.035), [c,d] = position(i,t+.035);
    const dx = c-a, dz = d-b, speed = Math.hypot(dx,dz)/.07;
    const strike = plays.find(play => play.from === i && t > play.start-.34 && t < play.start+.39);
    let yaw = look(dx,dz);
    if (speed < .36 || i === owner || p.keeper || strike) {
      const receiving = next && next.to === i && t > next.start;
      if (strike) {
        const aim = strike.goal ? [strike.goal[0],strike.goal[2]] : position(strike.to,strike.end);
        yaw = look(aim[0]-x,aim[1]-z);
      } else if (i === owner && next) {
        const aim = next.goal ? [next.goal[0],next.goal[2]] : position(next.to,next.end);
        yaw = look(aim[0]-x,aim[1]-z);
      } else {
        const aim = receiving ? position(next.from,next.start) : [ball[0],ball[2]];
        yaw = look(aim[0]-x,aim[1]-z);
      }
    }
    const kick = strike ? Math.sin(Math.PI*clamp((t-strike.start+.18)/.42)) : 0;
    const windup = strike ? Math.sin(Math.PI*clamp((t-strike.start+.34)/.25)) : 0;
    const cheer = p.side === 0 && [7,8,9,10].includes(i) ? ease((t-19.2-i*.025)/.5) : 0;
    const dive = i === 11 ? ease((t-18.39)/.34) * (1-ease((t-19.4)/.96)) : 0;
    return { x,z,yaw,speed,kick,windup,cheer,dive };
  });
  return { ...state, players };
}

export const shots = [
  [0, 'Floodlights'], [2.25,'Read the pass'], [4.03,'First touch'], [5.42,'Open the wing'], [9.43,'Switch'],
  [12.08,'Inside the box'], [15.7,'One touch'], [18.19,'The finish'], [19.80,'Under the lights'],
];

export function filmCamera(state) {
  const {t, players} = state;
  const follow = (i, eye, aim, fov) => {
    const { x,z } = players[i];
    return { eye: [x+eye[0],eye[1],z+eye[2]], target: [x+aim[0],aim[1],z+aim[2]], fov };
  };
  const frame = (eye,target,fov) => ({ eye,target,fov });
  if (t < 2.25) {
    const u = ease(t/2.25);
    return frame(blend([37,32,48],[29,25,40],u),[0,.38,0],46);
  }
  if (t < 4.03) {
    const u = ease((t-2.25)/1.78);
    return follow(5, [lerp(5.65,4.25,u),lerp(2.35,2.20,u),lerp(7.2,5.8,u)], [lerp(.48,-.5,u),.79,lerp(-.65,.9,u)],43);
  }
  if (t < 5.42) {
    const u = ease((t-4.03)/1.39);
    return follow(5, [lerp(2.30,3.75,u),lerp(.84,1.30,u),lerp(-2.37,-1.67,u)], [lerp(-.17,-.75,u),lerp(.85,.49,u),lerp(.38,1.45,u)],50);
  }
  if (t < 9.43) {
    const u = ease((t-5.42)/4.01);
    return follow(7, [lerp(-5.9,-4.15,u),lerp(3.4,2.32,u),lerp(7.9,5.2,u)], [lerp(-2.4,.68,u),.68,lerp(-1.8,-.45,u)],47);
  }
  if (t < 12.08) {
    const u = ease((t-9.43)/2.65);
    return frame([lerp(20,22,u),lerp(21,18,u),lerp(15,8,u)], [lerp(7.2,11.4,u),.42,lerp(4.4,-3.2,u)],47);
  }
  if (t < 15.7) {
    const u = ease((t-12.08)/3.62);
    return frame([lerp(21,21.6,u),lerp(4.3,4.7,u),lerp(-12.8,-10,u)], [lerp(14.5,13.2,u),.61,lerp(-5.4,-1.1,u)],44);
  }
  if (t < 18.19) {
    const u = ease((t-15.7)/2.49);
    return follow(9, [lerp(-3.5,-2.9,u),lerp(2.45,2.0,u),lerp(-4.85,-4.1,u)], [lerp(1.3,2.1,u),.69,.12],48);
  }
  if (t < 19.8) {
    const u = ease((t-18.19)/1.61);
    return frame([lerp(23.9,24.7,u),lerp(2.3,2.8,u),lerp(-4.8,-4.65,u)], [lerp(17.6,20.1,u),.8,lerp(.65,-.69,u)],51);
  }
  const u = ease((t-19.8)/4.2);
  return frame(blend([32,12,15],[39,33,48],u),blend([12,.7,0],[0,.38,0],u),lerp(43,46,u));
}
