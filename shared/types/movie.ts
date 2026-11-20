export type TagId = string

export interface Tag {
  id: TagId
  /** 칩에 보여 줄 짧은 이름 */
  label: string
  /** 칩 앞에 붙는 작은 그림 */
  emoji: string
  /** 문장 틀에 넣을 문구 (예: 반전결말 → "반전 있는 결말") */
  phrase: string
  category: string
}

export interface Movie {
  id: string
  title: string
  /** 검색용 다른 이름 */
  aliases?: string[]
  year: number
  genre: string
  /** 러닝타임 (분) */
  runtime: number
  tags: TagId[]
  /** 인기 영화 버튼에 노출, 동점일 때 우선 */
  popular?: boolean
}

export interface RecommendItem {
  movie: Movie
  score: number
  /** 이 영화와 겹친 공통 태그 (공통 태그 순서) */
  matchedTags: TagId[]
  reason: string
}

export interface RecommendResult {
  /** 2편 이상에 들어 있는 태그 (없으면 대체 태그 2개), 많이 겹친 순 */
  commonTags: TagId[]
  /** 공통 태그가 없어 규칙 2(가장 많이 나온 태그 2개)를 썼는지 */
  diverse: boolean
  keywordTags: TagId[]
  keyword: string
  items: RecommendItem[]
  /** 점수 1점 이상인 영화가 3편 미만 */
  tooFew: boolean
}
