import { describe, expect, it } from 'vitest'
import { objectParticle } from '../shared/utils/particle'
import { allMovies } from '../shared/utils/catalog'

describe('objectParticle (QA-02)', () => {
  it.each([
    ['1917', '을'], // 천구백십칠
    ['1987', '을'],
    ['127 시간', '을'],
    ['블레이드 러너 2049', '를'], // 사십구
    ['너의 이름은.', '을'],
    ['맘마 미아!', '를'],
    ['신세계', '를'],
    ['살인의 추억', '을'],
    ['10', '을'], // 십
  ])('%s → %s', (title, expected) => {
    expect(objectParticle(title)).toBe(expected)
  })

  it('모든 영화 제목에 대해 을 또는 를을 돌려준다', () => {
    for (const m of allMovies) expect(['을', '를'], m.title).toContain(objectParticle(m.title))
  })
})
