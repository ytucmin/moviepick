import { describe, expect, it } from 'vitest'
import { allMovies, getMovie } from '../shared/utils/catalog'
import { reasonSentence, recommend, tasteSentence } from '../shared/utils/recommend'
import type { Movie } from '../shared/types/movie'

const pick = (...ids: string[]) => ids.map((id) => getMovie(id)!)

function fake(id: string, tags: string[], popular = false): Movie {
  return { id, title: id, year: 2000, genre: '테스트', runtime: 100, tags, popular }
}

describe('recommend (PRD F2)', () => {
  it('PRD 시나리오: 나를 찾아줘 + 셔터 아일랜드 + 올드보이', () => {
    const r = recommend(pick('m001', 'm002', 'm003'), allMovies)
    expect(r.diverse).toBe(false)
    expect(r.commonTags).toEqual(['반전결말', '심리긴장감', '어두운분위기'])
    expect(r.keyword).toBe('당신은 반전 있는 결말과 숨막히는 심리 긴장감을 좋아하는 사람이에요')
    expect(r.items).toHaveLength(3)
    expect(r.items[0]!.movie.title).toBe('프레스티지')
    expect(r.items[0]!.reason).toBe('반전 있는 결말과 숨막히는 심리 긴장감이 겹쳐요')
    expect(r.tooFew).toBe(false)
  })

  it('고른 영화는 추천하지 않는다', () => {
    const selected = pick('m001', 'm002', 'm003')
    const r = recommend(selected, allMovies)
    const ids = r.items.map((i) => i.movie.id)
    for (const s of selected) expect(ids).not.toContain(s.id)
  })

  it('같은 입력이면 항상 같은 결과 (난수 없음)', () => {
    const a = recommend(pick('m007', 'm009', 'm020'), allMovies)
    const b = recommend(pick('m020', 'm009', 'm007').reverse(), allMovies)
    expect(recommend(pick('m007', 'm009', 'm020'), allMovies)).toEqual(a)
    expect(b.items.map((i) => i.movie.id)).toEqual(a.items.map((i) => i.movie.id))
  })

  it('공통 태그가 없으면 가장 많이 나온 태그 2개를 쓴다', () => {
    const selected = [fake('a', ['x', 'y']), fake('b', ['z']), fake('c', ['w'])]
    const pool = [...selected, fake('d', ['y']), fake('e', ['x', 'y']), fake('f', ['q'])]
    const r = recommend(selected, pool, (id) => id)
    expect(r.diverse).toBe(true)
    expect(r.commonTags).toEqual(['x', 'y'])
    expect(r.items.map((i) => i.movie.id)).toEqual(['e', 'd'])
  })

  it('점수 1점 이상이 3편 미만이면 찾은 만큼만 + tooFew', () => {
    const selected = [fake('a', ['x']), fake('b', ['x']), fake('c', ['y'])]
    const pool = [...selected, fake('d', ['x']), fake('e', ['q'])]
    const r = recommend(selected, pool, (id) => id)
    expect(r.items.map((i) => i.movie.id)).toEqual(['d'])
    expect(r.tooFew).toBe(true)
  })

  it('동점이면 대표작 → 목록 순서', () => {
    const selected = [fake('a', ['x']), fake('b', ['x']), fake('c', ['x'])]
    const pool = [...selected, fake('d', ['x']), fake('e', ['x'], true), fake('f', ['x'])]
    const r = recommend(selected, pool, (id) => id)
    expect(r.items.map((i) => i.movie.id)).toEqual(['e', 'd', 'f'])
  })
})

describe('문장 틀', () => {
  it('받침에 맞는 조사', () => {
    expect(tasteSentence(['해피엔딩', '성장'])).toBe('당신은 해피엔딩과 성장 이야기를 좋아하는 사람이에요')
    expect(tasteSentence(['감동'])).toBe('당신은 깊은 감동을 좋아하는 사람이에요')
    expect(reasonSentence(['사랑'])).toBe('사랑 이야기가 겹쳐요')
  })
})

describe('데이터', () => {
  it('모든 영화는 태그 3~6개, 태그는 tags.json에 있다', async () => {
    const { allTags } = await import('../shared/utils/catalog')
    const tagIds = new Set(allTags.map((t) => t.id))
    for (const m of allMovies) {
      expect(m.tags.length, m.title).toBeGreaterThanOrEqual(3)
      expect(m.tags.length, m.title).toBeLessThanOrEqual(6)
      for (const t of m.tags) expect(tagIds.has(t), `${m.title}: ${t}`).toBe(true)
    }
    expect(new Set(allMovies.map((m) => m.id)).size).toBe(allMovies.length)
  })
})
