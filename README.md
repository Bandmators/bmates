<p align="center">
  <a href="https://github.com/Bandmators"><img src="https://avatars.githubusercontent.com/u/157222787" width="150" height="150" alt="Bandmators" /></a>
</p>

<p align="center">
  <a href="https://www.repostatus.org/#active">
    <img src="https://www.repostatus.org/badges/latest/active.svg" alt="Project Status: Active" />
  </a>
  <a href="https://github.com/Bandmators/bmates/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/Bandmators/bmates" alt="MIT license" />
  </a>
</p>

<h1 align="center">BMates</h1>

BMates is an open-source, embeddable multitrack audio editor for the web. Build a custom audio workflow with project state,
Canvas waveform editing, Web Audio playback, and optional React composition.

## Packages

| Package                                                              | Responsibility                                                         | Use it when                                                |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------- |
| [`@bmates/core`](https://www.npmjs.com/package/@bmates/core)         | Framework-independent project state, validation, commands, and history | You need headless editing state or another UI framework.   |
| [`@bmates/renderer`](https://www.npmjs.com/package/@bmates/renderer) | Canvas scene graph, rendering loop, hit testing, and pointer events    | You are building a custom Canvas surface.                  |
| [`@bmates/editor`](https://www.npmjs.com/package/@bmates/editor)     | Timeline, waveform clips, interactions, playback, import, and export   | You need the browser audio editor without a prescribed UI. |
| [`@bmates/studio`](https://www.npmjs.com/package/@bmates/studio)     | React provider, hooks, and declarative editor composition              | You are integrating BMates in a React application.         |

The dependency direction is `renderer -> editor -> studio`. Core is shared project state and can be used on its own.

## Installation

Choose the highest-level package that fits your integration.

```sh
# React integration
pnpm add @bmates/studio

# Browser Canvas and Web Audio editor without React UI bindings
pnpm add @bmates/editor

# Headless project state
pnpm add @bmates/core
```

## Headless project state

Core keeps project data and history independent from Canvas, React, or browser audio APIs.

```ts
import { createProjectStore } from '@bmates/core';

const project = createProjectStore(initialTracks);

project.setTrackMute('drums', true);
project.moveClip('kick', { trackId: 'drums', start: 2 });
project.undo();

const exportedProject = project.getProject();
```

## Canvas editor

Editor mounts an interactive timeline on a canvas. Wait for `ready` before audio-dependent commands and destroy it when the
owner unmounts.

```ts
import { Editor } from '@bmates/editor';

const editor = new Editor(canvas, tracks);
await editor.ready;

await editor.play();
await editor.pause();

editor.destroy();
```

## React Studio

Studio is the convenient React entry point. The default component lets you supply your own track controls while BMates owns
the Canvas and audio lifecycle.

```tsx
import { BMates } from '@bmates/studio';

<BMates
  data={tracks}
  trackEl={({ muted, toggleMute, track }) => (
    <button onClick={toggleMute}>{muted ? `Unmute ${track.name}` : `Mute ${track.name}`}</button>
  )}
/>;
```

For complete UI control, compose one shared store around your own transport and track list.

```tsx
<BMates.Root defaultData={tracks} onDataChange={saveProject}>
  <div style={{ display: 'flex', height: 600 }}>
    <BMates.TrackList>
      {({ muted, toggleMute, track }) => (
        <button onClick={toggleMute}>{muted ? `Unmute ${track.name}` : `Mute ${track.name}`}</button>
      )}
    </BMates.TrackList>
    <BMates.Canvas style={{ flex: 1 }} />
  </div>
</BMates.Root>
```

## Project data

A project is an ordered array of tracks. Each track contains clips with a source URL, timeline start position, and group
index. Keep track and clip IDs unique. See the [documentation](https://bandmators.github.io/bmates/docs/getting-started/)
for the full type reference, import/export, playback, and extension guides.

## Development

This repository is a pnpm workspace. Use Node.js 20.19+ or 22.12+.

```sh
pnpm install
pnpm build
pnpm --filter bmates-docs build
```

The documentation source is in `apps/www/posts` and is built with Docgo.

## License

[MIT](LICENSE)
