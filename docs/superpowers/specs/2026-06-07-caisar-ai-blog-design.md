# caisar.ai — Personal Site + Blog (v1 Design)

**Status:** Approved (brainstorm), pending implementation plan
**Author:** Cesar (cesar@caisar.ai)
**Date:** 2026-06-07
**Domain:** caisar.ai (registered at Porkbun)

## Overview

A minimalist personal site at `caisar.ai` with an embedded blog. Front door for Cesar's professional brand; venue for essays on tech, AI, and politics. Optimized for fast load, readable typography, low maintenance burden, and "write a markdown file → push → it's live" publishing.

## Goals

- Communicate professionalism in <2 seconds of viewing.
- Zero-friction publishing: edit a `.md` file in any editor, `git push`, post is live in ~90 seconds.
- Cheap to run (free hosting tier, $0/mo recurring cost beyond domain renewal).
- Easy to extend later (add `/about`, RSS, newsletter, tag pages, interactive demos) without rewriting.
- Lighthouse mobile score ≥95 on every page at launch.

## Non-goals (v1)

- Comments, newsletter signup, search, full-text indexing.
- Tag/category index pages.
- Multi-author support.
- A CMS or web-based admin.
- Per-post hero images, illustrations, or custom layouts.

## Stack

| Layer        | Choice                                    |
|--------------|-------------------------------------------|
| Generator    | Astro 5 (static output)                   |
| Language     | TypeScript                                |
| Styling      | Tailwind 4 + `@tailwindcss/typography`    |
| Content      | Markdown + MDX (via `@astrojs/mdx`)       |
| Type/Fonts   | Inter Variable + JetBrains Mono (self-hosted via `@fontsource-variable/*`) |
| Code blocks  | Shiki (built into Astro), dual theme (`github-light` / `github-dark`) |
| Hosting      | Cloudflare Pages (free tier)              |
| DNS          | Cloudflare (nameservers moved from Porkbun) |
| Analytics    | Cloudflare Web Analytics (free, no cookies) |
| SEO          | `@astrojs/sitemap`, hand-rolled `robots.txt`, OG + Twitter meta in `BaseHead` |

## Architecture

Pure static site. No server, no API routes, no runtime. The pipeline is:

```
[edit .md/.mdx in editor]
      │
      ▼
[git push origin main]
      │
      ▼
[Cloudflare Pages clones repo → runs `npm run build` → publishes `dist/`]
      │
      ▼
[caisar.ai serves static HTML/CSS/JS from Cloudflare edge]
```

Every PR/non-`main` branch push gets a unique preview URL on `*.pages.dev`.

## File layout

```
caisar-ai/
├── astro.config.mjs            # integrations: mdx, sitemap, tailwind
├── package.json
├── tsconfig.json
├── README.md
├── public/
│   ├── favicon.svg
│   ├── robots.txt              # allow all, link to /sitemap-index.xml
│   └── og-default.png          # fallback Open Graph image
└── src/
    ├── content.config.ts        # Zod schema for the `posts` collection
    ├── content/posts/*.md{,x}   # essays, one file per post
    ├── components/
    │   ├── BaseHead.astro       # <head>: meta, OG, Twitter card, canonical, fonts
    │   ├── Header.astro         # name (link to /) + single nav item ("Writing")
    │   ├── Footer.astro         # © year + minimal links
    │   ├── PostCard.astro       # date + title + summary in list
    │   ├── ThemeToggle.astro    # ☀/☾ button, persists to localStorage
    │   └── FormattedDate.astro
    ├── layouts/
    │   ├── BaseLayout.astro     # wraps every page: BaseHead + Header + slot + Footer
    │   └── PostLayout.astro     # prose container + reading time + back link
    ├── pages/
    │   ├── index.astro          # homepage
    │   ├── writing/
    │   │   ├── index.astro      # chronological post list
    │   │   └── [...slug].astro  # individual post (uses PostLayout)
    │   └── 404.astro
    └── styles/global.css        # Tailwind base + prose overrides + CSS vars for theme
```

## Content model

A single `posts` collection. Schema enforced at build time — typos in `pubDate` or a missing `summary` fail the build before deploy.

```ts
// src/content.config.ts
import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: ({ image }) => z.object({
    title: z.string().max(120),
    summary: z.string().max(280),
    pubDate: z.coerce.date(),
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    hero: image().optional(),
  }),
});

export const collections = { posts };
```

Rationale:

- **`summary` required:** forces a one-line hook before publishing. Powers the list page, OG previews, and meta descriptions.
- **`tags` free-form array:** taxonomy can grow organically without locking categories now. Tags render as small labels on the post; no tag-index pages in v1.
- **`draft: true`:** keeps WIP in the repo without publishing. Filtered out in production builds.
- **`pubDate` vs `updated`:** lets you honestly mark substantive edits ("Updated MMM YYYY") without faking the original date.

## URL structure

- `/` — homepage
- `/writing` — chronological post index
- `/writing/<slug>` — individual post (slug = filename, no date in URL)
- `/404` — custom 404 page

No dates in URLs (looks stale faster than the content does). Routes use Astro's default `directory` build format, which produces trailing-slash URLs (`/writing/`, `/writing/<slug>/`); internal links use the trailing-slash form so they match the generated sitemap and avoid an extra redirect hop.

## Pages

### `/` (Homepage)

- Big-but-not-huge name as `<h1>` (or just plain header).
- One-to-three-sentence bio. Placeholder during implementation; final copy provided by Cesar.
- A row of links: **LinkedIn · GitHub · Email**. (X/Twitter not included in v1 unless added before launch — see "Open items.")
- A "Latest writing" section: the 3 most recent non-draft posts, each as a `PostCard` (date + title + summary).
- Footer with `© {year} Cesar` and a link to `/writing`.

### `/writing`

- Reverse-chronological list of every non-draft post.
- Each entry: date · title (linked) · summary · tags as small labels.
- No pagination in v1 (unlikely to exceed 30 posts in year one; revisit then).

### `/writing/<slug>`

- Title, `pubDate` (and `updated` if set), reading time (computed at build from word count ÷ 220 wpm).
- Tags shown as small labels.
- Body rendered via `PostLayout.astro`: max prose width ~680px, `line-height: 1.7`, Tailwind Typography styling.
- Code blocks: Shiki dual-theme, no JS shipped for highlighting.
- "← Back to writing" link at the bottom.

### `/404`

- Same chrome as the rest of the site. Short message + link back to `/` and `/writing`.

## Visual treatment

- **Type:** Inter Variable for UI/body, JetBrains Mono for code. Self-hosted via `@fontsource-variable/inter` and `@fontsource-variable/jetbrains-mono`; no Google Fonts request, no FOIT.
- **Color:** Two palettes (light + dark). Neutral grays plus one accent (final hex chosen in implementation; recommend a muted blue or warm amber).
- **Theme switching:** Defaults to `prefers-color-scheme`. Manual override via `ThemeToggle.astro`, persisted to `localStorage`. The toggle script runs inline in `<head>` to prevent flash of incorrect theme on load.
- **Layout:** Single column, prose `max-width: 680px`, centered. Header has the name (links to `/`) and one nav item: "Writing." No logo, no avatar, no animation.
- **Code blocks:** Shiki, dual theme. Rendered server-side; no JS.
- **Prose styling:** Tailwind Typography with light overrides for headings, links, blockquotes, and inline code.
- **No images required on posts.** Posts can include images via MDX if desired, but the visual identity does not depend on them.

## Deploy & domain

### Repo

- GitHub. Recommend public to signal openness, but private works equally well.
- Default branch: `main`.

### Cloudflare Pages

- Framework preset: Astro.
- Build command: `npm run build`.
- Output directory: `dist`.
- Node version: 22 LTS (pin via `NODE_VERSION` env var in CF Pages).
- Production branch: `main`. Every other branch + every PR gets a preview URL on `*.pages.dev`.

### Domain wiring (Porkbun → Cloudflare)

1. Sign in to Cloudflare; add `caisar.ai` as a site (free plan).
2. Cloudflare provides two nameservers (e.g. `xxx.ns.cloudflare.com`).
3. In Porkbun → Domain Management → `caisar.ai` → Authoritative Nameservers, replace the Porkbun defaults with the two Cloudflare nameservers. Propagation: minutes to a few hours.
4. In Cloudflare Pages → project → Custom domains, add `caisar.ai` and `www.caisar.ai`. CF auto-creates the necessary DNS records; `www` gets a redirect to apex.
5. Enable **Always Use HTTPS** and **Automatic TLS** (defaults).
6. Cloudflare Web Analytics: enable once the domain is on CF. Auto-injected snippet, no extra config.

Reversibility: nameserver changes are reversible by pasting the original Porkbun nameservers back into Porkbun's panel.

## Local development

- `npm run dev` — Astro dev server at `http://localhost:4321`, hot-reload on `.md`/`.mdx`/`.astro` save.
- `npm run build` — production build to `dist/`.
- `npm run preview` — serves `dist/` locally; matches production output.
- `npm run check` — `astro check` (TS + content collection schema).

## Acceptance criteria (v1 done)

1. `https://caisar.ai` resolves and serves the homepage over HTTPS with a valid TLS cert.
2. Homepage shows: name, bio, social/email links, and the 3 most recent posts.
3. `/writing` lists all non-draft posts in reverse chronological order with title, date, summary, and tags.
4. `/writing/<slug>` renders an MDX post with Shiki-highlighted code blocks and respects dark/light mode.
5. Theme toggle persists across page loads and does not flash incorrect theme on first paint.
6. Lighthouse mobile score ≥95 on `/`, `/writing`, and a sample post (verified locally via `npm run build && npm run preview`).
7. At least one real post is live (not Lorem ipsum) so first-time visitors see actual content.
8. Cloudflare Web Analytics confirmed receiving pageviews from the live domain.
9. The "add a new post" workflow works end-to-end: create `src/content/posts/<slug>.md`, write content with required frontmatter, `git push origin main`, post is live within ~90 seconds.
10. `sitemap-index.xml` and `robots.txt` are served and reference the canonical domain.

## Out of scope for v1 (each cheap to add later)

- **RSS feed** (~10 lines via `@astrojs/rss`).
- **Tag index pages** (`/writing/tag/<tag>`).
- **Search** (Pagefind, ~50 lines).
- **Newsletter signup** (Buttondown / ConvertKit embed).
- **Comments** (Giscus).
- **`/about` page.**
- **`/now` or `/projects` page.**
- **Custom per-post OG images** (Satori / `@vercel/og`).
- **Reading-time refinements** (e.g. handling code-heavy posts differently).
- **Webmentions, microformats.**

## Open items (confirm before or during implementation)

- **Bio copy** for the homepage (1–3 sentences). Placeholder until provided.
- **Social links to surface:** spec assumes LinkedIn + GitHub + `mailto:cesar@caisar.ai`. Confirm exact URLs; decide whether to add X/Twitter or anything else.
- **Accent color:** muted blue vs. warm amber vs. something else. Pick during implementation.
- **GitHub repo visibility:** public or private.
- **Initial post:** at least one real essay needs to exist at launch. Topic and rough draft TBD.

## Verification & testing

This is a static content site; "testing" is light by design:

- **Build is the test.** `npm run build` failing on a malformed frontmatter / missing field / broken MDX is the primary correctness gate. CI on every PR (Cloudflare Pages preview build acts as CI).
- **`astro check`** runs in the `npm run check` script; should be green before merging to `main`.
- **Lighthouse** run locally before each significant visual change.
- **Manual smoke test** on the preview URL before merging anything user-visible.

No unit tests in v1 — there's no business logic to test. Reconsider if/when interactive components arrive (an MDX widget, a newsletter signup, etc.).

## Risks

- **Nameserver migration window.** Brief DNS propagation gap when moving from Porkbun to Cloudflare. Mitigate by doing it before the site has any meaningful traffic.
- **`@fontsource-variable/*` size.** Inter Variable is ~70KB compressed. Acceptable; revisit if Lighthouse complains.
- **Cloudflare free-tier limits.** 500 builds/month, 100k requests/day on Workers. Way above any plausible v1 usage.
- **Drift between local dev and Cloudflare build.** Pin Node version in CF Pages env (`NODE_VERSION=22`) to keep local and CI identical.

## Next step

Hand off to the `writing-plans` skill to break this design into a step-by-step implementation plan with concrete tasks, ordering, and verification checkpoints.
