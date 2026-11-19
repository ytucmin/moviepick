import moviesData from '../data/movies.json'
import tagsData from '../data/tags.json'
import type { Movie, Tag, TagId } from '../types/movie'

export const allMovies: Movie[] = moviesData as Movie[]
export const allTags: Tag[] = tagsData as Tag[]

const tagMap = new Map(allTags.map((t) => [t.id, t]))
const movieMap = new Map(allMovies.map((m) => [m.id, m]))

export function getTag(id: TagId): Tag | undefined {
  return tagMap.get(id)
}

export function tagLabel(id: TagId): string {
  return tagMap.get(id)?.label ?? id
}

export function tagPhrase(id: TagId): string {
  return tagMap.get(id)?.phrase ?? id
}

export function getMovie(id: string): Movie | undefined {
  return movieMap.get(id)
}

export const popularMovies: Movie[] = allMovies.filter((m) => m.popular)
