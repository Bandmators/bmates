<p align="center">
	<a href="https://github.com/Bandmators"><img src="https://avatars.githubusercontent.com/u/157222787"  width="150" height="150"/></a>
</p>

<p align="center">
  <a href="https://github.com/Bandmators/bmates/tree/master/.github/workflows">
    <img src="https://img.shields.io/github/actions/workflow/status/Bandmators/bmates/deploy.yml" alt="Build Passing" />
  </a>
  <a href="https://github.com/Bandmators/bmates/blob/master/LICENSE.md">
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

Other frameworks besides React are currently in preparation.

## Framework or Detailed customization

`@bmates/studio` is a library built for React based on `@bmates/editor`.
If you want to use it in other frameworks, please utilize `@bmates/editor`.

```shell
# NPM
npm install @bmates/editor
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

- @bmates/renderer
- @bmates/editor
- @bmates/studio
