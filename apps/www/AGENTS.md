# Documentation app guide

These instructions extend the repository-level `AGENTS.md` for `apps/www`.

- This app documents the published packages; examples must use public APIs rather than repository-private internals.
- Keep Docgo frontmatter valid. Every generated page needs `title`; add `description` for public entry points and use
  `order` only when source ordering is meaningful.
- Add or update navigation metadata when introducing a documentation page.
- Keep browser examples accessible, responsive, and compatible with the static Docgo/GitHub Pages build.
- Do not hand-edit generated Docgo output in `out`.
- When changing package APIs, update all affected snippets and terminology, not only one page.

Build the libraries before validating the documentation site:

```sh
pnpm build
pnpm --filter bmates-docs build
```

For interactive examples, use Docgo `ClientPreview` modules under `posts/previews`. For visual changes, also run
`pnpm --filter bmates-docs dev` and inspect desktop and mobile layouts.
