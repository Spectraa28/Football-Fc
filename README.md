# Floodlight FC

An original pixel-art soccer diorama with two full teams. Ember intercepts a pass, switches the field, and scores past Tide’s diving keeper. The film and live viewer play the same authored match.

## Open the viewer

Run these commands in this folder, then open <http://127.0.0.1:4173/>.

```sh
npm ci
npm start
```

- **Director** cuts between the nine authored cameras. Drag to take over.
- **Orbit** supports drag, wheel or pinch zoom, and arrow keys.
- **Free fly** supports drag to look, WASD to move, Q/E for height, and Shift for speed. Touch controls appear on touch screens.
- Scrub the timeline to replay any pass. Use the Pause button or press Space when the stadium has focus.

## Rebuild

```sh
npm run bake
npm test
npm run render
```

The bake uses `../shapeshift-labs-ink-studio` to generate the packed stadium splats. Three.js renders those splats alongside the voxel characters and stadium geometry. The supplied assets let the viewer run without rebaking.

The film renders at 960×540 and scales each art pixel to two output pixels per axis for the 1080p export. It uses Chrome or Chromium and FFmpeg. Set `CHROME_BIN` if the browser is installed at a custom path. The soundtrack is “Breathe Underwater” by KULA, using the default MP3 in the parent folder.
