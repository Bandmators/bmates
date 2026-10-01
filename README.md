<p align="center">
	<a href="https://github.com/Bandmators"><img src="https://avatars.githubusercontent.com/u/157222787"  width="150" height="150"/></a>
</p>

<p align="center">
  <a href="https://www.repostatus.org/#active">
    <img src="https://www.repostatus.org/badges/latest/active.svg" alt="Project Status: Active – The project has reached a stable, usable state and is being actively developed." />
  </a>
  <a href="https://github.com/Bandmators/bmates/blob/master/LICENSE">
    <img src="https://img.shields.io/github/license/Bandmators/bmates" alt="license">
  </a>
</p>

<h1 align="center">@bmates</h1>

BMates is a powerful tool that helps users easily edit music.

With an intuitive interface and a variety of features, anyone can create audio projects effortlessly.

## Installation

BMates is available as a package on NPM for use:

```shell
# NPM
npm install @bmates/studio
```

## Create Component

Please import the BMates component.

```tsx
import { BMates } from '@bmates/studio';
```

Set the appropriate props for the BMates component.

```tsx
<BMates
  data={data}
  onError={error => console.error(error)}
  style={style}
  trackEl={({ track, muted, toggleMute }) => {
    return (
      <div className="track">
        <div>{track.name}</div>
        <ToggleMute muted={muted} onClick={toggleMute} />
      </div>
    );
  }}
/>
```

`style` and `trackEl` are optional. The component uses a complete default style and
a track-name renderer when they are omitted. Audio downloads use the WAV format.

When using `@bmates/editor` directly, await initialization before audio-dependent
commands and destroy the instance when its owner unmounts:

```tsx
const editor = new Editor(canvas, data);
await editor.ready;
await editor.play();

editor.destroy();
```

Other frameworks besides React are currently in preparation.

### Composable React API

Applications that own their editor UI can compose the canvas and track controls around one shared store:

```tsx
<BMates.Root defaultData={data} onDataChange={saveProject}>
  <div style={{ display: 'flex', height: 600 }}>
    <BMates.TrackList>
      {({ track, muted, toggleMute }) => (
        <button onClick={toggleMute}>{muted ? `Unmute ${track.name}` : `Mute ${track.name}`}</button>
      )}
    </BMates.TrackList>
    <BMates.Canvas style={{ flex: 1 }} />
  </div>
</BMates.Root>
```

Use `useBMatesSelector` to read editor state and `useBMatesStore` to run playback, history, editing, and export commands.
Project data and undo/redo are owned by the framework-independent `@bmates/core` store; Canvas and React are adapters
over that same state.

Tracks and clips can also be declared as React components. Mounting, updating, and unmounting these components
incrementally reconciles the Canvas and audio engine by ID.

```tsx
<BMates.Root>
  <BMates.Project>
    <BMates.Track id={'drums'} name={'Drums'}>
      <BMates.Clip id={'kick'} src={'/kick.wav'} start={0} instrument={'Kick'} />
      <BMates.Clip id={'snare'} src={'/snare.wav'} start={1} instrument={'Snare'} />
    </BMates.Track>
  </BMates.Project>

  <BMates.Canvas />
</BMates.Root>
```

Track and clip IDs must be unique within the project.

## Framework or Detailed customization

`@bmates/studio` is a library built for React based on `@bmates/editor`.
Use `@bmates/core` for headless state, validation, commands, and history in any framework. Add `@bmates/editor`
when the application needs the Canvas and Web Audio adapter.

```shell
# NPM
npm install @bmates/core @bmates/editor
```

We will support other frameworks soon.

## Data Configuration

This is the data configuration that serves as the foundation for the editor.

```tsx
type SongDataType<T extends string = string> = {
  id: string;
  start: number;
  long?: number;
  src: string;
  user: string;
  group: number;
  instrument: T;
  mute?: boolean;
  lock?: boolean;
  [key: string]: unknown;
};
type TrackDataType<T extends string = string> = {
  id: string;
  name: string;
  mute?: boolean;
  group: number;
  songs: SongDataType<T>[];
};
```

By providing values to the data props of the `<BMates />` component,
you can set the initial data for the editor.

The import and export functionalities also operate based on this type.

```tsx
const data: TrackDataType[] = [];

<BMates
  //...
  data={data}
/>;
```

## style

This is the style configuration that serves as the foundation for the editor.

```tsx
type EditorStyleType = {
  theme: {
    background: string;
    lineColor: string;
    strokeLineColor: string;
  };
  timeline: {
    gapHeight: number;
    gapWidth: number;
    timeDivde: number; // 5 or 10
    height: number; // 45 or 60;
    textY: number;
  };
  playhead: {
    color: string;
    width: number;
    height: number;
  };
  timeIndicator: {
    fill: string;
    font: string;
    top: number;
  };
  sidebar: {
    width: number;
    mobileWidth: number;
    mobileViewport: number;
  };
  wave: {
    height: number;
    borderRadius: number;
    margin: number;
    padding: number;
    disableAlpha: number;
    snapping: string;
    background: string;
    fill: string;
    border: string;
    predictionFill: string;
    selectedBorderColor: string;
  };
  context: {
    menuWidth: number;
    menuPadding: number;
    itemHeight: number;
    itemPadding: number;
  };
};
```

By providing values to the style props of the `<BMates />` component,
you can set the overall design of the editor.

The values passed will override the default values to apply styles.

```tsx
const style: EditorStyleType = {};

<BMates
  //...
  style={style}
/>;
```

## Packages

- [@bmates/core](https://www.npmjs.com/package/@bmates/core)
- [@bmates/renderer](https://www.npmjs.com/package/@bmates/renderer)
- [@bmates/editor](https://www.npmjs.com/package/@bmates/editor)
- [@bmates/studio](https://www.npmjs.com/package/@bmates/studio)
