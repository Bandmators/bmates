# Renderer package guide

These instructions extend the repository-level `AGENTS.md` for `packages/renderer`.

- Keep this package free of audio-editor, React, and application-specific behavior. It is a reusable Canvas 2D scene graph and event system.
- Preserve the `Stage -> Layer -> Container -> Node` ownership model and parent/child relationships.
- Keep hit testing, pointer coordinate conversion, scrolling, z-index ordering, and event bubbling consistent with one another.
- Any listener or animation frame created by a renderer object must be removable from its lifecycle cleanup.
- Avoid allocations and expensive traversal inside the animation loop when the work can be cached or performed after a state change.
- Export supported primitives through `src/index.ts` and the appropriate local barrel.

Validate changes with:

```sh
pnpm --filter @bmates/renderer build
```

For interaction changes, also verify mouse and touch input, nested hit testing, dragging outside the canvas, scrolling, resizing, and destruction/recreation in a browser.
