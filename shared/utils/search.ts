import { getChoseong } from 'es-hangul'
import type { Movie } from '../types/movie'

const CHOSEONG_ONLY = /^[ㄱ-ㅎ]+$/

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '')
}

/**
 * 제목·다른 이름 포함 검색 + 초성 검색 ("ㄴㄹㅊㅇ" → 나를 찾아줘).
 * 제목이 검색어로 시작하는 영화를 먼저, 나머지는 목록 순서대로 돌려준다.
 */
export function searchMovies(query: string, movies: Movie[]): Movie[] {
  const q = normalize(query)
  if (!q) return []
  const choseongQuery = CHOSEONG_ONLY.test(q)

  const hits: { movie: Movie; prefix: boolean; index: number }[] = []
  movies.forEach((movie, index) => {
    const names = [movie.title, ...(movie.aliases ?? [])].map(normalize)
    let matched = false
    let prefix = false
    for (const name of names) {
      const target = choseongQuery ? getChoseong(name) : name
      const at = target.indexOf(q)
      if (at >= 0) {
        matched = true
        if (at === 0) prefix = true
      }
    }
    if (matched) hits.push({ movie, prefix, index })
  })

  return hits
    .sort((a, b) => Number(b.prefix) - Number(a.prefix) || a.index - b.index)
    .map((h) => h.movie)
}
