# mefly.dev — Astro Rebuild Plan

## Overview

This document tracks the mefly.dev rebuild from Jekyll to Astro and the follow-up milestones. The repository is now Astro-only, and milestone notes below are kept as implementation history.

Stack: **Astro** (static output) + **React** (islands where interactivity is needed) + **TypeScript** + **Vite** (Astro uses Vite internally) + **pnpm** (package manager). Plain CSS modules for styling, no utility framework.

---

## Milestone 1 — Landing Page

**Goal:** A clean, minimal page whose only content is a centered row of large icons, one per app. Clicking an icon navigates to that app's page (a full-viewport iframe embed).

**Details:**
- No header, no footer, no sidebar. Zero chrome — the icons are the entire UI.
- App pages: full-viewport `<iframe>` with no surrounding framing or styling, as if the embedded page were opened directly.
- App entries are defined in a single config file (`src/apps.ts`) with fields: `id`, `label`, `iconUrl`, `iframeUrl?`, `iframeUrlLocal?`. Both iframe URLs are optional — absence encodes "not implemented" state.
- `iconUrl` points to the app's own favicon (e.g. `https://akhaisin.github.io/fpv-track-builder/favicon.svg`). Fetched and displayed as an `<img>` — no need to copy or bundle icons into this repo.
- Initial apps to include: **Track Builder** (`https://akhaisin.github.io/fpv-track-builder/`), **CSRF Tester**, **learning-react** (`https://akhaisin.github.io/learning-react/`).

**DEV vs PROD build behaviour:**
- `pnpm dev` sets `import.meta.env.DEV = true` at build/serve time — local URLs are used.
- `pnpm build` sets `import.meta.env.DEV = false` — production URLs are used. The built `dist/` is always production; `pnpm preview` serves it locally but with prod URLs.
- There is no runtime environment switching — the URL choice is baked into the output at build time.

**"Not implemented yet" behaviour (applies to AppIcon here, and NavMenu in M3):**

| `iframeUrl` | `iframeUrlLocal` | PROD | DEV |
|---|---|---|---|
| present | present | link → prod URL | link → local URL |
| present | absent | link → prod URL | link → prod URL |
| absent | present | disabled (no href) | link → local URL, visually marked |
| absent | absent | disabled (no href) | disabled (no href) |

- Disabled means the element renders without an `href` and has a distinct visual style (muted opacity, `cursor: default`, no hover effect).
- "Visually marked" in DEV means a small indicator (e.g. a dot or badge) signals the app has no prod deployment yet, but the local link is active.
- Initial apps to include: **Track Builder** (`https://akhaisin.github.io/fpv-track-builder/`), **CSRF Tester**, **learning-react** (`https://akhaisin.github.io/learning-react/`).

**Files to create:**
- `src/apps.ts` — app registry
- `src/pages/index.astro` — landing page
- `src/pages/apps/[id].astro` — dynamic app embed page
- `src/components/AppIcon.astro` — single icon link component
- `.github/workflows/deploy.yml` — build and deploy to GitHub Pages

**GitHub Actions workflow (`deploy.yml`):**
- Trigger: `push` to `main`.
- Steps: checkout → install pnpm → `pnpm install` → `pnpm build` → deploy `dist/` to GitHub Pages using `actions/deploy-pages`.
- Use `actions/configure-pages` to set the correct `base` path; Astro reads it automatically via `--site` / `astro.config.ts`.
- Cache pnpm store between runs (`actions/cache` keyed on `pnpm-lock.yaml`).
- GitHub Pages source must be set to **GitHub Actions** (not the legacy branch method) in repo Settings → Pages.

---

## Milestone 2 — Hash-based URL Sync

**Goal:** Keep the host page URL hash in sync with the embedded app's hash, so bookmarking and sharing the host URL preserves the embedded app's navigation state.

**Protocol (established in the legacy Jekyll site):**
- **Host → iframe:** on load and on `hashchange`, send `postMessage({ type: 'NAVIGATE_TO_HASH', hash: '...' }, iframeOrigin)`.
- **Iframe → host:** embedded app sends `postMessage({ type: 'HASH_CHANGED', hash: '...' })` when its hash changes; host updates `window.location.hash`.
- **Fallback:** polling `iframe.contentWindow.location.hash` every 200 ms for same-origin / local dev cases where postMessage is not fired.

**Implementation:**
- Port `assets/js/url-sync.js` as a client-side Astro script component (`src/components/UrlSync.astro`, `<script>` with `is:inline` or a `.ts` module).
- Add `<UrlSync />` to the app embed layout only when the app config has `urlSync: true`.
- Add `urlSync` boolean field to the app registry.

**Files to create / modify:**
- `src/components/UrlSync.astro`
- `src/apps.ts` — add `urlSync` field
- `src/pages/apps/[id].astro` — conditionally include `<UrlSync />`

---

## Milestone 3 — Overlay Navigation Menu & mefly-nav Package

**Goal:** Build the `mefly-nav` standalone package (repo: `github.com/akhaisin/mefly-nav`) and wire it directly into mefly.dev. No intermediate local `NavMenu.tsx` — mefly.dev consumes the package from day one.

---

### mefly-nav package

**Repo:** `github.com/akhaisin/mefly-nav` (local path: `/home/ak/projects/mefly-nav`), installable without publishing to npm:
```
npm install github:akhaisin/mefly-nav
```
Pin a specific release with: `github:akhaisin/mefly-nav#v1.0.0`

**Components:**

`MeflyNav` — trigger + menu UI:
```tsx
// Host mode — mefly.dev renders this directly, passing items from src/apps.ts
<MeflyNav items={items} activeId="track-builder" />
```

`MeflyNavReceiver` — delegate mode for embedded apps; inert until `MEFLY_MENU` arrives via postMessage:
```tsx
// Delegate mode — embedded app; inert until MEFLY_MENU arrives via postMessage
<MeflyNavReceiver />
```

**Visual behaviour (inspired by react-tiny-fab):**
- Small circular/rounded trigger button fixed at bottom-left.
- On hover (desktop) or tap (mobile): vertical list of icon+label items slides out above the trigger.
- Items are standard anchors navigating to their mefly.dev URL.
- Closes on outside click or Escape.
- The current app's item is omitted or visually marked as active.

**Item shape:**
```ts
type MeflyNavItem = {
  id: string;
  label: string;
  iconUrl: string;   // URL to the app's favicon/icon image
  url: string;       // destination URL on mefly.dev
};
```

**postMessage protocol (delegate mode):**
```ts
// host → iframe, sent once after iframe 'load' event
{ type: 'MEFLY_MENU', activeId: string, items: MeflyNavItem[] }
```
`MeflyNavReceiver` validates `event.origin` is a trusted mefly.dev origin, then renders `<MeflyNav>` with the received items.

**`useHostSync`** — the hook currently living in `learning-react/src/hooks/useHostSync.ts`. Moves to this package verbatim. Embedded apps call it once; it handles both directions:
- Route changes → sends `HASH_CHANGED` to host
- Receives `NAVIGATE_TO_HASH` from host → updates `window.location.hash`

Must be called inside a React Router `<Router>` (uses `useLocation`).

**Host side (mefly.dev):** The existing `UrlSync.astro` component stays in mefly.dev — it is Astro-specific and contains no logic worth sharing. Only the embedded-app side moves to the package.

**Package structure:**
```
mefly-nav/
  src/
    useHostSync.ts       — URL hash sync hook (requires React Router)
    MeflyNav.tsx         — trigger + menu UI
    MeflyNavReceiver.tsx — postMessage listener; renders MeflyNav on MEFLY_MENU
    types.ts             — MeflyNavItem, exported
    index.ts             — re-exports all public API
  package.json
  tsconfig.json
  vite.config.ts         — lib mode build (esm + cjs outputs)
```

**Build:**
- Vite lib mode, outputs `dist/index.js` (ESM) and `dist/index.cjs`.
- TypeScript declarations via `vite-plugin-dts`.
- `react`, `react-dom`, and `react-router-dom` are `peerDependencies` — not bundled.

**Styling:** CSS modules, scoped to the component. No external CSS dependency.

---

### mefly.dev integration

**Design: configurable per-app menu ownership**

Two modes, selected per app via a `menuMode` field in `src/apps.ts`:

| Mode | Value | Behaviour |
|---|---|---|
| **Host renders** | `'host'` | Host injects a fixed-position `<MeflyNav>` overlay on top of the iframe. Simple. May visually conflict with bottom-left controls already present in the embedded page. |
| **Delegate to embedded page** | `'delegate'` | Host does NOT render a menu. After the iframe loads, host sends one postMessage with the full menu payload; the embedded app's `<MeflyNavReceiver>` renders its own trigger and menu. |

**Why this matters:** `learning-react` already has a GitHub repo link and a help button at the bottom-left — exactly where the host menu trigger would land. `delegate` mode lets learning-react absorb the menu items into its own layout without overlap. Track Builder and CSRF Tester have no such controls, so `'host'` is fine for them.

**Details:**
- Trigger (host mode): small fixed button, bottom-left, same shape/size as the GitHub link in AppLayout.tsx.
- Menu state: open on hover (desktop) / click (mobile). Closes on outside click / Escape.
- Menu content: icon + label list, generated from `src/apps.ts`, excluding the current app. Apply the same "not implemented yet" disabled/marked logic as AppIcon (defined in M1).
- Menu is shown on all app pages. Not shown on the landing page (user is already there).
- Add `menuMode: 'host' | 'delegate'` field to the app registry. Default: `'host'`.

**Embedded app migration (learning-react):**
- Remove `src/hooks/useHostSync.ts`, install `mefly-nav`, update import.
- Add `<MeflyNavReceiver />` for delegate-mode menu.

**Files to create / modify in mefly.dev:**
- `src/apps.ts` — add `menuMode` field
- `src/components/DelegateMenu.astro` — sends postMessage after iframe load; no visible UI on host
- `src/layouts/AppEmbed.astro` — shared layout for app pages; renders `<MeflyNav>` (from `mefly-nav`) or `<DelegateMenu>` based on `menuMode`
- `src/pages/apps/[id].astro` — switch to `AppEmbed` layout

---

## Milestone 4 — Articles

**Goal:** A page listing published articles. Each article is a Markdown file with frontmatter.

**Open design question — list vs cards:**
- **List:** title + date + optional one-line description. Dense, fast to scan.
- **Cards:** title + description + maybe a cover image. More visual weight, better for articles with distinct topics.

**Recommendation:** start with a simple list. Add card layout only if articles have meaningfully different visual identities (cover images, tags worth filtering on).

**Details:**
- Articles live in `src/content/articles/` as `.md` files with frontmatter: `title`, `date`, `description` (optional), `draft` (optional boolean).
- Draft articles are excluded from the list in production (`import.meta.env.PROD`).
- Article detail page renders the markdown body with minimal prose styling.
- Add "Articles" entry to `src/apps.ts` or a separate `src/nav.ts` that `MeflyNav` also reads.

**Files to create:**
- `src/content/config.ts` — Astro content collection schema
- `src/content/articles/*.md` — article files
- `src/pages/articles/index.astro` — article list
- `src/pages/articles/[slug].astro` — article detail
- `src/components/ArticleList.astro`

---

## Milestone 5 — Remove Jekyll Remnants

**Status:** Completed

**Goal:** Delete the old Jekyll site source that lived in this repo alongside the Astro build, leaving only the Astro project.

**Details:**
- Identify and remove Jekyll-specific files: `_config.yml`, `Gemfile`, `Gemfile.lock`, `_layouts/`, `_includes/`, `_posts/`, `_site/`, `assets/` (if only used by Jekyll), and any root-level `.html` / `.md` pages that belong to the Jekyll structure.
- Keep files that have been ported into Astro (`src/`, `public/`, `astro.config.ts`, CI workflow).
- Verify `pnpm build` still succeeds after removal.
- Commit as a standalone cleanup commit so the diff is easy to review.

**Result:** Legacy Jekyll files and directories were removed; Astro build remains green.

---

## Milestone 6 — Move Host-Side URL Sync to mefly-nav

**Goal:** Extract the host-page `postMessage` orchestration from `UrlSync.astro` into the `mefly-nav` package so that any host (not just Astro) can reuse it without copy-pasting.

**Background:** `UrlSync.astro` handles three concerns that are logically part of the `mefly-nav` protocol:
- On iframe load, send `NAVIGATE_TO_HASH` with the current host hash.
- On host `hashchange`, forward it to the iframe.
- On `HASH_CHANGED` from the iframe, mirror the embedded app's pathname/hash to the host URL hash.
- Fallback polling for same-origin / local-dev cases.

**Proposed API — exported plain function (no React required):**
```ts
import { setupHostSync } from 'mefly-nav/host';

// Call once after the iframe element is in the DOM.
const cleanup = setupHostSync('app-iframe');
// cleanup() removes all listeners if needed.
```

Options considered:
- **Plain JS function `setupHostSync(iframeId)`** — framework-agnostic, minimal. Preferred.
- **React component `<HostSync>`** — consistent with rest of library but carries React overhead for a script-level concern.
- **Web component `<mefly-host-sync>`** — declarative but heavier.

**Implementation notes:**
- Add a separate library entry point `mefly-nav/host` (add to `exports` in `package.json`) that ships no React — just DOM/`postMessage` logic.
- Move the `UrlSync.astro` inline script body into `src/setupHostSync.ts` in the mefly-nav repo, with `iframeId` as a parameter.
- `UrlSync.astro` becomes a thin wrapper: `import { setupHostSync } from 'mefly-nav/host'; setupHostSync('app-iframe');`.
- Bump mefly-nav minor version; update mefly.dev dependency.

---

## Cross-cutting notes

- **No JS framework overhead by default.** Only add `client:*` directives if a component genuinely needs client-side interactivity. `NavMenu` hover state may need it; everything else likely does not.
- **Package manager:** pnpm throughout — `pnpm install`, `pnpm build`, `pnpm dev`. Do not use npm or yarn.
- **TypeScript:** strict mode. All `.astro` files use `---` frontmatter with typed imports; all React islands are `.tsx`.
- **CSS:** plain CSS modules per component. No utility framework.
- **Deployment:** GitHub Pages via GitHub Actions (see M1 workflow). Add a `CNAME` file containing `mefly.dev` to the repo root so GitHub Pages preserves the custom domain after each deploy.
- **Astro config:** `output: 'static'`, `site: 'https://mefly.dev'`.
