# Documentation app guide

These instructions extend the repository-level `AGENTS.md` for `apps/www`.

- This app documents the published packages; examples must use public APIs rather than repository-private internals.
- Keep MDX frontmatter valid: `title`, `order`, and `lastUpdatedDate` are required. Use `group` only when needed.
- Add or update navigation metadata when introducing a documentation page.
- Keep browser examples accessible, responsive, and compatible with the static GitHub Pages build.
- Do not hand-edit generated Contentlayer or Next.js output.
- When changing package APIs, update all affected snippets and terminology, not only one page.

Build the libraries before validating the documentation site:

```sh
pnpm build
pnpm --filter bmates-docs build
```

For visual changes, also run `pnpm --filter bmates-docs dev` and inspect desktop and mobile layouts.
