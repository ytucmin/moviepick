import { describe, expect, it } from 'vitest'
import { allMovies } from '../shared/utils/catalog'
import { searchMovies } from '../shared/utils/search'

const titles = (q: string) => searchMovies(q, allMovies).map((m) => m.title)

describe('searchMovies', () => {
  it('제목 포함 검색', () => {
    expect(titles('올드')).toContain('올드보이')
  })

  it('띄어쓰기 무시', () => {
    expect(titles('셔터아일')).toEqual(['셔터 아일랜드'])
  })

  it('초성 검색', () => {
    expect(titles('ㄴㄹㅊㅇ')).toEqual(['나를 찾아줘'])
  })

  it('다른 이름(영문) 검색, 대소문자 무시', () => {
    expect(titles('gone girl')).toEqual(['나를 찾아줘'])
  })

  it('앞부분이 일치하는 제목을 먼저', () => {
    expect(titles('인')[0]).toMatch(/^인/)
  })

  it('없는 영화와 빈 검색어', () => {
    expect(titles('존재하지않는영화')).toEqual([])
    expect(titles('   ')).toEqual([])
  })
})
