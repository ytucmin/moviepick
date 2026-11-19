# moviepick

좋아했던 영화 3편을 고르면 공통 취향을 한 줄로 찾아 주고, 이유가 붙은 영화 3편을 추천하는 웹서비스예요. 로그인·서버·AI 없이 규칙으로만 동작해요.

- 기획: [PRD.md](PRD.md)
- 디자인: [DESIGN.md](DESIGN.md)

## 화면

1. `/` — 영화 3편 고르기 (제목·초성 검색, 인기 영화)
2. `/result` — 취향 키워드 + 추천 3편
3. `/movie/[id]` — 영화 상세와 추천 이유

## 실행

Node.js 20 이상이 필요해요.

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # 추천 규칙·검색 테스트
npm run generate   # 정적 빌드 → .output/public
```

Nuxt 4 · Tailwind CSS 4 · es-hangul · Vitest
