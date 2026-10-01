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

`style` and `trackEl` are optional. Studio fills missing style values from
`DEFAULT_EDITOR_STYLE` and renders the track name by default. Downloads are WAV files.

Other frameworks besides React are currently in preparation.

## Composable React API

Use the compound API when your application needs to own the layout and controls. `BMates.Root` provides one editor
store to every child, while the track list and canvas remain independently composable views of that store.

```tsx
import { BMates, useBMatesSelector, useBMatesStore } from '@bmates/studio';

const Transport = () => {
  const editor = useBMatesStore();
  const isPlaying = useBMatesSelector(state => state.isPlaying);

  return <button onClick={() => void editor.togglePlayback()}>{isPlaying ? 'Pause' : 'Play'}</button>;
};

export const MyEditor = () => (
  <BMates.Root defaultData={data} onDataChange={project => save(project)}>
    <Transport />
    <div style={{ display: 'flex', height: 600 }}>
      <BMates.TrackList>
        {({ track, muted, toggleMute, remove }) => (
          <div className={'my-track'}>
            <span>{track.name}</span>
            <button onClick={toggleMute}>{muted ? 'Unmute' : 'Mute'}</button>
            <button onClick={remove}>Remove</button>
          </div>
        )}
      </BMates.TrackList>
      <BMates.Canvas style={{ flex: 1 }} />
    </div>
  </BMates.Root>
);
```

`defaultData` initializes the store and is intentionally uncontrolled. Create a store with `createBMatesStore` and pass
it through the `store` prop when the editor must be shared with components outside the React subtree. Use
`useBMatesSelector` for rendering state and `useBMatesStore` for commands such as playback, undo, mute, removal, and
export.

Studio uses `@bmates/core` as its project source of truth. A plugin or another framework can own that headless store
and pass it into Studio without duplicating project state:

```tsx
import { createProjectStore } from '@bmates/core';
import { BMates, createBMatesStore } from '@bmates/studio';

const projectStore = createProjectStore(data);
const studioStore = createBMatesStore({ projectStore });

<BMates.Root store={studioStore}>
  <BMates.Canvas />
</BMates.Root>;
```

Project commands, export, and undo/redo work without a mounted Canvas. Playback, audio import, audio export, and
download require `BMates.Canvas`, because those commands use the browser audio adapter.

Pass `project` with `onDataChange` for a conventional controlled editor. Use either the `project` prop or the
`BMates.Project` component tree as the declarative owner, not both at once.

### Declarative tracks and clips

Use `BMates.Project`, `BMates.Track`, and `BMates.Clip` when the React tree should describe the editor project. Entity
updates are reconciled by ID, so unchanged audio resources stay attached.

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

Track and clip IDs must be unique. Removing a component removes its editor entity. Changing a clip `src` reloads that
audio resource; changing other props preserves its decoded buffer. User edits still emit `onDataChange`, allowing the
application to persist the resulting project and feed updated props back when controlled behavior is desired.

Custom track and clip UI can subscribe directly with `useBMatesTrack(id)` and `useBMatesClip(id)`.

## Framework or Detailed customization

`@bmates/studio` is a library built for React based on `@bmates/editor`.
Use `@bmates/core` for framework-independent state and commands, and add `@bmates/editor` when you need the Canvas
and Web Audio adapter.

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
  [key: string]: any;
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

- @bmates/core
- @bmates/renderer
- @bmates/editor
- @bmates/studio
