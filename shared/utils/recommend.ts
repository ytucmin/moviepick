import { josa } from 'es-hangul'
import type { Movie, RecommendItem, RecommendResult, TagId } from '../types/movie'
import { tagPhrase } from './catalog'

/** "A와 B" / "A" 형태로 이어 붙인다 */
function joinPhrases(ids: TagId[], phrase: (id: TagId) => string): string {
  const words = ids.map(phrase)
  if (words.length === 0) return ''
  if (words.length === 1) return words[0]!
  return `${josa(words[0]!, '와/과')} ${words[1]}`
}

export function tasteSentence(ids: TagId[], phrase: (id: TagId) => string = tagPhrase): string {
  if (ids.length === 0) return ''
  return `당신은 ${josa(joinPhrases(ids, phrase), '을/를')} 좋아하는 사람이에요`
}

export function reasonSentence(ids: TagId[], phrase: (id: TagId) => string = tagPhrase): string {
  if (ids.length === 0) return ''
  return `${josa(joinPhrases(ids, phrase), '이/가')} 겹쳐요`
}

/**
 * PRD F2 추천 규칙. 순수 함수이며 난수를 쓰지 않아 같은 입력이면 항상 같은 결과를 낸다.
 * 같은 개수일 때 태그 순서는 고른 영화에서 처음 나온 순서를 따른다.
 */
export function recommend(
  selected: Movie[],
  movies: Movie[],
  phrase: (id: TagId) => string = tagPhrase,
): RecommendResult {
  // 태그별 등장 횟수 (영화 안의 중복은 1번으로), 첫 등장 순서 유지
  const counts = new Map<TagId, number>()
  for (const movie of selected) {
    for (const tag of new Set(movie.tags)) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1)
    }
  }
  const byCount = [...counts.entries()]
    .map(([tag, count], order) => ({ tag, count, order }))
    .sort((a, b) => b.count - a.count || a.order - b.order)

  // 규칙 1: 2편 이상에 들어 있는 태그
  let commonTags = byCount.filter((e) => e.count >= 2).map((e) => e.tag)
  // 규칙 2: 없으면 가장 많이 나온 태그 2개
  const diverse = commonTags.length === 0
  if (diverse) commonTags = byCount.slice(0, 2).map((e) => e.tag)

  // 규칙 3~5: 나머지 영화 점수 → 동점이면 대표작(popular) 우선, 그다음 목록 순서
  const selectedIds = new Set(selected.map((m) => m.id))
  const scored = movies
    .map((movie, index) => {
      const matchedTags = commonTags.filter((t) => movie.tags.includes(t))
      return { movie, index, matchedTags, score: matchedTags.length }
    })
    .filter((c) => !selectedIds.has(c.movie.id) && c.score >= 1)
    .sort(
      (a, b) =>
        b.score - a.score ||
        Number(!!b.movie.popular) - Number(!!a.movie.popular) ||
        a.index - b.index,
    )
    .slice(0, 3)

  const items: RecommendItem[] = scored.map(({ movie, score, matchedTags }) => ({
    movie,
    score,
    matchedTags,
    // 규칙 7: 겹친 공통 태그 2개로 이유 문장
    reason: reasonSentence(matchedTags.slice(0, 2), phrase),
  }))

  // 규칙 6: 많이 겹친 순서로 최대 2개
  const keywordTags = commonTags.slice(0, 2)

  return {
    commonTags,
    diverse,
    keywordTags,
    keyword: tasteSentence(keywordTags, phrase),
    items,
    tooFew: items.length < 3,
  }
}
