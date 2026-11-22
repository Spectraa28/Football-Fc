import assert from 'node:assert/strict';
import test from 'node:test';
import { ballAt, duration, filmCamera, goalTime, matchAt, pitch, plays, roster, shots } from './match.mjs';

test('every kick leaves its sender and reaches the receiver or scoring point', () => {
  const epsilon=.00001;
  const gap=(a,b)=>Math.hypot(...a.map((n,i)=>n-b[i]));
  for(const play of plays) {
    const before=ballAt(play.start-epsilon), kick=ballAt(play.start);
    assert.equal(before.owner,play.from);
    assert.equal(kick.owner,null);
    assert(gap(before.ball,kick.ball)<.13);
    const almost=ballAt(play.end-epsilon), arrived=ballAt(play.end);
    assert(gap(almost.ball,arrived.ball)<.003);
    if(play.goal) {
      assert(arrived.scored);
      assert(arrived.ball[0]>pitch.x && arrived.ball[0]<pitch.x+pitch.goalDepth);
      assert(Math.abs(arrived.ball[2])<pitch.goalZ && arrived.ball[1]<pitch.goalY);
    } else {
      assert.equal(arrived.owner,play.to);
      assert(!arrived.scored);
    }
  }
  assert(!ballAt(goalTime-.01).scored);
  assert(ballAt(goalTime).scored);
});

test('the two full teams and every camera stay finite through the match', () => {
  assert.equal(roster.length,22);
  assert.equal(new Set(roster.map(p=>p.name)).size,22);
  assert.equal(new Set(roster.map(p=>[p.hair,p.skin,p.scale].join())).size,22);
  for(const t of [...shots.map(([time])=>time),...Array.from({length:duration*4+1},(_,i)=>i/4)]) {
    const state=matchAt(t),camera=filmCamera(state);
    assert.equal(state.players.length,22);
    for(const player of state.players) {
      assert(Object.values(player).every(Number.isFinite));
      assert(Math.abs(player.x)<=pitch.x && Math.abs(player.z)<=pitch.z);
    }
    assert([...camera.eye,...camera.target,camera.fov,...state.ball].every(Number.isFinite));
    assert(camera.eye[1]>.62);
  }
});
