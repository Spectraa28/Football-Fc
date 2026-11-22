import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { buildStadium } from './scene.mjs';
const require = createRequire(import.meta.url);
const studio = require('../shapeshift-labs-ink-studio');
const {world, ...scene} = buildStadium(studio.load());
assert.equal(world.data.length, world.count*16);
assert(world.count > 30000 && scene.structure.length > 4000);
assert([...world.data.subarray(0,16)].every(Number.isFinite));
for (const [file,data] of [['stadium.bin',Buffer.from(world.data.buffer, world.data.byteOffset, world.data.byteLength)],['stadium.json',JSON.stringify({...scene,count:world.count})]]) {
  writeFileSync(new URL(file,import.meta.url),data);
}
console.log(`Baked ${world.count.toLocaleString()} Ink Studio splats and ${scene.structure.length.toLocaleString()} stadium pieces.`);
