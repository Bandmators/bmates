# BMates contributor guide

This file is the shared operating guide for coding agents working in this repository.

## Product context

BMates is an open-source, embeddable multitrack audio editor for the web. It lets applications load audio clips, arrange waveform clips on a timeline, play or mute tracks, edit clip state, and export a mixed audio file.

The repository currently provides client-side libraries and documentation. Do not assume that authentication, cloud storage, a backend API, or real-time collaboration exists unless the task explicitly adds it.

## Repository map

This is a pnpm workspace. The dependency direction is:

```text
@bmates/renderer -> @bmates/editor -> @bmates/studio -> apps/www
```

- `packages/renderer`: framework-independent canvas scene graph, rendering loop, hit testing, and pointer event dispatch.
- `packages/editor`: audio-domain editor built on the renderer. It owns tracks, waveform clips, timeline interactions, playback, history, import, and export.
- `packages/studio`: React integration and the easiest public entry point. It owns the provider, hook, sidebar composition, and demo application.
- `apps/www`: Next.js and Contentlayer documentation site. Documentation pages live under `apps/www/posts/docs`.

Keep changes in the lowest appropriate layer. The renderer must not depend on editor or React concepts; the editor must not depend on Studio; Studio should compose public editor APIs instead of reaching into renderer internals.

## Setup and commands

Use Node.js 20 and pnpm. The lockfile is `pnpm-lock.yaml`; do not create npm or Yarn lockfiles.

```sh
pnpm install
pnpm dev
pnpm build
pnpm --filter @bmates/renderer build
pnpm --filter @bmates/editor build
pnpm --filter @bmates/studio build
pnpm --filter bmates-docs dev
pnpm --filter bmates-docs build
```

Run the narrowest relevant package build while iterating. Before finishing a cross-package or public-API change, run `pnpm build`; build the docs as well when documentation or its integrations changed.

There is currently no automated test suite and no root lint script. Do not report tests or lint as passing unless the command actually exists and was run. When adding behavior with nontrivial pure logic, prefer adding a test setup and focused tests rather than relying only on manual verification.

## Code conventions

- Follow the root TypeScript, ESLint, and Prettier configuration: strict TypeScript, two-space indentation, single quotes, semicolons, and a 120-character print width.
- Let Prettier maintain import grouping and ordering. Package imports come before third-party imports, followed by aliases and relative imports.
- Prefer explicit domain types from each package's `types` module. Avoid `any`, non-null assertions, and `@ts-ignore` in new code unless a browser or library boundary genuinely requires them; explain exceptional cases in code.
- Preserve the public barrel exports in each package's `src/index.ts` when adding a supported public API.
- Do not edit generated output such as `dist`, `.next`, or `.contentlayer`, and do not commit it unless a task explicitly requires generated artifacts.
- Keep public naming and documentation in English. Match the terminology already used by the API: editor, track, wave/clip, timeline, playhead, and workground.
- Avoid unrelated cleanup. Preserve existing behavior and API compatibility unless the task calls for a breaking change.

## Audio and editor invariants

Audio and canvas behavior is stateful. Check these invariants whenever editing `packages/editor` or `packages/renderer`:

- `TrackDataType.group`, `SongDataType.group`, the visual track order, and a `Wave` node's parent must stay synchronized. Group indexes should remain contiguous after moving or removing tracks.
- Clip time and canvas position are linked through the timeline scale. Update both `data.start` and the rendered `x` position when changing one of them.
- A Web Audio `AudioBufferSourceNode` can only be started once. Playback must create a fresh source while reusing the decoded `AudioBuffer`.
- Effective clip volume must respect both track mute and clip mute state.
- Mutations during playback should preserve the intended play/pause state and refresh duration where necessary.
- User-visible mutations must update exported data, create an undo snapshot where appropriate, and emit `data-change` so React consumers stay synchronized.
- Locked waves must not move. Moving a wave must not leave overlaps or orphaned nodes.
- Browser resources and lifecycle work must be cleaned up: animation frames, DOM listeners, audio nodes/contexts, and object URLs as applicable.
- Do not access `window`, `document`, Canvas, or Web Audio at module evaluation time; the packages must remain safe to import in a Next.js environment.

For interaction changes, manually exercise dragging within and between tracks, collision behavior, selection, undo/redo, mute combinations, playback from a nonzero playhead, stop/replay, upload, removal, export, and resize as relevant to the change.

## React and documentation

- Keep the `BMates` component usable through `BmatesProvider` and `useBMates`; do not create a second source of truth for editor state.
- Treat props and exported TypeScript types as public API. Update the root README, package README, and relevant MDX page when their behavior changes.
- Documentation files require `title`, `order`, and `lastUpdatedDate` frontmatter. Keep examples compilable against the current public API.
- UI changes should be checked at desktop width and at the configured mobile viewport.

## Contribution workflow

Before editing, read the affected package manifest and nearby implementation. After editing:

1. Review the diff for accidental API or generated-file changes.
2. Build every affected package in dependency order.
3. Run applicable tests or focused manual checks and state exactly what was verified.
4. Update documentation for public behavior or API changes.

Never run publishing or deployment commands unless the user explicitly requests them. If asked to commit, use the Conventional Commits format enforced by the repository's commitlint configuration.
