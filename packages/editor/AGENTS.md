# Editor package guide

These instructions extend the repository-level `AGENTS.md` for `packages/editor`.

- Treat `TrackDataType[]` as the serializable source of truth. Canvas nodes, audio nodes, and exported data must represent the same track and clip state.
- Keep timeline layout calculations centralized and consistent across `Timeline`, `Playhead`, `Track`, `Wave`, and `Workground`.
- Route generic rendering behavior into `@bmates/renderer`; keep audio and timeline semantics here.
- Decode and cache audio deliberately. Never attempt to restart an already-started `AudioBufferSourceNode`.
- Every editing command must be evaluated for selection state, history snapshots, `data-change`, duration recalculation, playback continuity, and audio-node cleanup.
- Preserve existing keyboard behavior across Windows/Linux Ctrl and macOS Command modifiers.
- Public editor APIs and types must be exported through `src/index.ts` and documented when changed.

Validate changes with:

```sh
pnpm --filter @bmates/renderer build
pnpm --filter @bmates/editor build
```

Manually check the affected workflow in the Studio demo, especially playback, drag/collision behavior, undo/redo, mute state, upload, and mixed export.
