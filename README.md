# caisar.ai

Personal site + blog at https://caisar.ai. See `docs/superpowers/specs/2026-06-07-caisar-ai-blog-design.md` for design rationale.

## Local development

```bash
npm install      # first time only
npm run dev      # http://localhost:4321
npm run build    # production build to dist/
npm run preview  # serve dist/ locally to validate the prod build
npm run check    # astro check (TS + content schema validation)
```

## Adding a post

1. Create `src/content/posts/<slug>.mdx` with required frontmatter (see schema in `src/content.config.ts`).
2. Write content.
3. `git push origin main` — Cloudflare Pages auto-deploys in ~60-90 seconds.

## Deployment

`main` → production at https://caisar.ai. Any other branch / PR → preview URL at `https://<branch>.<project>.pages.dev`.
