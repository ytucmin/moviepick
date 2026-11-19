# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 작업 규칙 (항상 지킬 것)

1. **기준 문서는 `PRD.md`예요.** PRD에 없는 기능은 만들지 않아요. 필요해 보이면 만들기 전에 먼저 물어봐요.
2. **한 번에 한 단계만 구현해요.** 한 단계가 끝나면 다음 단계로 넘어가지 말고 멈춰요.
3. **단계가 끝나면 두 가지를 알려 줘요.**
   - 바꾼 내용
   - 사용자가 브라우저에서 직접 확인하는 방법 (어느 주소에서, 무엇을 누르면, 무엇이 보여야 하는지)
4. **사용자가 "확인했다"고 말하면** 그 단계를 커밋하고 GitHub(`ytucmin/moviepick`, 공개 저장소, `main` 브랜치)에 올려요. 확인 전에는 커밋하거나 올리지 않아요.
5. **설명은 비개발자가 이해할 수 있는 한국어로 해요.** 전문 용어는 쉬운 말로 풀어서 써요.
6. **설치나 명령 실행이 필요하면** 실행하기 전에 무엇을 왜 하는지 한 줄로 먼저 설명해요.
7. **API 키, 토큰, 비밀번호 같은 비밀 값은** 코드, 커밋, 대화 어디에도 쓰지 않아요.

## 구현 단계 (PRD 기준 5단계)

진행할 때마다 상태를 고쳐 적어요. 화면 1·2와 추천 규칙은 첫 세팅 때 이미 만들어 두었기 때문에, 2~4단계는 PRD와 하나씩 맞춰 보고 빠진 것을 채우는 단계예요.

| 단계 | 내용 | PRD 근거 | 상태 |
| --- | --- | --- | --- |
| 1 | 영화 데이터: 150편 이상 목록, 태그 체계, 시트(CSV) → JSON 변환 스크립트 | §8, §10 일정 1, §11 태그 작업 | 완료 |
| 2 | 화면 1 영화 3편 고르기 점검 | §7 R1-1~R1-7, 예외 처리 | 완료 |
| 3 | 추천 규칙 점검 | §7 F2 규칙 1~7 | 대기 |
| 4 | 화면 2 결과 보기 점검 | §7 R2-1~R2-6, 예외 처리 | 대기 |
| 5 | 측정 이벤트 연결과 배포 | §9, §11 측정 이벤트, 배포 | 대기 (분석 도구 선택 필요) |

`/movie/[id]` 상세 화면은 PRD에 없지만 사용자가 따로 요청해서 만든 화면이에요. 지우거나 넓히기 전에 물어봐요.

헤더 오른쪽의 "로그인" 상자는 PRD(로그인 없음)와 다르지만 사용자가 모양만 요청한 것이에요. 누를 수 없고 아무 동작도 없어요. 실제 로그인 기능으로 바꾸기 전에 반드시 물어봐요.

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
- `npm run data` — convert `shared/data/movies.csv` (the editable movie sheet) into `shared/data/movies.json`; validates ids, tags (3–6, must exist in `tags.json`), year/runtime and refuses to write on errors. Edit the CSV, never the JSON by hand.
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
