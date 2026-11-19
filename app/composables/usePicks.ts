import type { Movie } from '#shared/types/movie'
import { allMovies, getMovie } from '#shared/utils/catalog'
import { recommend } from '#shared/utils/recommend'

export const MAX_PICKS = 3

/** 고른 3편, 피드백, "보고 싶어요" 상태. 화면을 오가도 유지된다 (R2-6). */
export function usePicks() {
  const pickedIds = useState<string[]>('picked-ids', () => [])
  const feedback = useState<'yes' | 'no' | null>('keyword-feedback', () => null)
  const wantedIds = useState<string[]>('wanted-ids', () => [])

  const picked = computed<Movie[]>(() =>
    pickedIds.value.map((id) => getMovie(id)).filter((m): m is Movie => !!m),
  )
  const isFull = computed(() => pickedIds.value.length >= MAX_PICKS)
  const result = computed(() =>
    picked.value.length === MAX_PICKS ? recommend(picked.value, allMovies) : null,
  )

  const has = (id: string) => pickedIds.value.includes(id)

  function add(id: string): boolean {
    if (has(id) || isFull.value) return false
    pickedIds.value = [...pickedIds.value, id]
    feedback.value = null
    return true
  }

  function remove(id: string) {
    pickedIds.value = pickedIds.value.filter((x) => x !== id)
    feedback.value = null
  }

  const isWanted = (id: string) => wantedIds.value.includes(id)
  function want(id: string) {
    if (!isWanted(id)) wantedIds.value = [...wantedIds.value, id]
  }

  return { pickedIds, picked, isFull, result, has, add, remove, feedback, wantedIds, isWanted, want }
}
