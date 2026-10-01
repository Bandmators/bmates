# @bmates/core

Framework-independent project state, validation, commands, and undo/redo history for BMates.

```ts
import { createProjectStore } from '@bmates/core';

const project = createProjectStore(initialTracks);
project.setTrackMute('drums', true);
project.moveClip('kick', { start: 2, trackId: 'drums' });
project.undo();

const unsubscribe = project.subscribe((snapshot, change) => {
  console.log(snapshot.project, snapshot.canUndo, change.source);
});
```

Snapshots are structurally immutable; use commands for mutations and `getProject()` for a mutable exported copy.
Commands validate IDs, time values, locked clips, and collisions, and every committed mutation can participate in
bounded undo/redo history.

The store does not access the DOM, Canvas, React, Web Audio, or browser globals. `@bmates/editor` adapts it to Canvas
and Web Audio, while `@bmates/studio` adapts it to React.
