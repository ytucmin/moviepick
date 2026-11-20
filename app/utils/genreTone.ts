// 포스터 대신 장르 분위기로 색을 고른다 (외부 이미지 없음, PRD §5)
const DARK = ['스릴러', '미스터리', '범죄', '공포', '전쟁']
const SOFT = ['로맨스', '드라마', '뮤지컬', '애니메이션', '코미디']

export function genreTone(genre: string): string {
  if (DARK.includes(genre)) return 'bg-linear-to-br from-night to-primary text-on-dark'
  if (SOFT.includes(genre)) return 'bg-linear-to-br from-periwinkle to-lavender text-ink'
  return 'bg-linear-to-br from-primary to-periwinkle text-on-primary'
}
