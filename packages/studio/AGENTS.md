# Studio package guide

These instructions extend the repository-level `AGENTS.md` for `packages/studio`.

- This package is the React-facing integration layer. Compose `@bmates/editor` public APIs rather than duplicating editor logic.
- Keep a single `Editor` instance per mounted `BMates` component and clean it up on unmount.
- Keep React state synchronized through editor events. Do not mirror mutable editor state unless it is needed to render React UI.
- Treat `BMates`, `BmatesProvider`, `useBMates`, their props, and re-exported types as public API.
- Guard browser-only work so importing the package remains safe in SSR environments.
- Preserve caller-provided customization through `data`, `style`, and `trackEl`; avoid hard-coding product UI into the editor core.
- Revoke temporary object URLs and close locally created audio resources when ownership ends.

Validate changes with:

```sh
pnpm --filter @bmates/renderer build
pnpm --filter @bmates/editor build
pnpm --filter @bmates/studio build
```

Use the local Studio demo for manual checks at desktop and mobile widths.
