# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**moviepick** (영화 취향 찾기): pick 3 liked movies → one-line taste keyword + 3 recommendations with reasons. Specs:

- `PRD.md` — source of truth for behavior. Requirement IDs (R1-x screen 1, R2-x screen 2, F2 rules) are referenced in code comments; cite them when changing behavior.
- `DESIGN.md` — Mercury design tokens (YAML front matter). Mirrored as Tailwind v4 `@theme` tokens in `app/assets/css/main.css`.

User-facing copy is Korean; keep PRD wording exactly. Hard constraints: static site only — no backend, DB, login, external movie API, or AI/LLM calls. Recommendations are rule-based and must stay deterministic.

## Commands

Node is installed at `C:\Program Files\nodejs` (via winget). If `npm` isn't found in a shell, refresh PATH first:
`$env:Path = [Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [Environment]::GetEnvironmentVariable('Path','User')`

- `npm run dev` — dev server (port 3000; also `.claude/launch.json` config "moviepick")
- `npm run generate` — static build to `.output/public`
- `npm test` — Vitest (`tests/`); single file: `npx vitest run tests/recommend.test.ts`; single test: `npx vitest run -t "PRD 시나리오"`
- `npx nuxt typecheck` — vue-tsc type check
- If tests fail with "tsconfig.app.json not found", run `npx nuxt prepare` (generates `.nuxt/`).

## Architecture

Nuxt 4, `ssr: false` (pure SPA). Two source roots:

- `shared/` — framework-free logic, importable from app code as `#shared/...` and from tests by relative path (tests can't resolve `#shared`, so files inside `shared/` import each other relatively).
  - `data/movies.json`, `data/tags.json` — the catalog. Tag ids are Korean strings (`반전결말`); each tag has `label` (chip), `phrase` (used inside sentences) and `category`. `tests/recommend.test.ts` validates every movie has 3–6 known tags.
  - `utils/recommend.ts` — pure `recommend(selected, movies, phrase?)` implementing PRD F2. Ordering ties: tags by first appearance in the selected movies; movies by score → `popular` → list order. Sentences use es-hangul `josa` for 와/과, 을/를, 이/가.
  - `utils/search.ts` — substring search on title + `aliases` (spaces ignored), and 초성 search when the query is all choseong.
- `app/` — UI.
  - `composables/usePicks.ts` — single `useState` store for picked ids, keyword feedback and wanted ids; `result` is computed from picks. State survives navigation so "다시 고르기" keeps picks (R2-6); it is not persisted across reloads.
  - `composables/useTrack.ts` — `track()` for the 6 PRD analytics events; currently `console.debug` only (analytics tool undecided).
  - Pages = the 3 screens: `/` pick (R1), `/result` (R2, redirects to `/` without 3 picks), `/movie/[id]` detail (shows which picked movies share each overlapping tag).

## Design rules (DESIGN.md)

- Only one solid `PillButton variant="primary"` per screen; everything else is `tint`/`outline` translucent pills.
- Font weights via token classes `font-body` (360), `font-ui` (420), `font-heading` (480), `font-eyebrow` (500); never bold. Inter + Pretendard (Hangul fallback).
- Depth from fill color (`bg-lavender` cards, `rounded-md`), not shadows/borders. Night (`bg-night`) header/footer frame every page.
- Mobile-first 480px column; touch targets ≥44px (`h-11`). Pages with a fixed bottom CTA add their own `h-20` spacer.
