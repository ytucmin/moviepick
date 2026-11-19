/**
 * 영화 시트(CSV) → shared/data/movies.json 변환 (PRD §11 태그 작업)
 *
 * 사용법: npm run data
 * Google Sheets에서 "파일 → 다운로드 → CSV"로 받은 파일을 shared/data/movies.csv에 덮어쓴 뒤 실행해요.
 * 칸 이름: id, 제목, 다른 이름, 개봉 연도, 장르, 러닝타임, 태그, 인기
 * 여러 값(다른 이름, 태그)은 한 칸 안에 쉼표로 구분해요. 인기 칸은 "예"면 인기 영화예요.
 */
import { readFileSync, writeFileSync } from 'node:fs'

const CSV_PATH = new URL('../shared/data/movies.csv', import.meta.url)
const TAGS_PATH = new URL('../shared/data/tags.json', import.meta.url)
const OUT_PATH = new URL('../shared/data/movies.json', import.meta.url)

const COLUMNS = ['id', '제목', '다른 이름', '개봉 연도', '장르', '러닝타임', '태그', '인기'] as const
type Column = (typeof COLUMNS)[number]

interface MovieOut {
  id: string
  title: string
  aliases?: string[]
  year: number
  genre: string
  runtime: number
  tags: string[]
  popular?: boolean
}

/** 따옴표("...")로 감싼 칸과 칸 안의 쉼표·줄바꿈을 지원하는 CSV 읽기 */
function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"'
        i++
      } else if (ch === '"') {
        quoted = false
      } else {
        cell += ch
      }
    } else if (ch === '"') {
      quoted = true
    } else if (ch === ',') {
      row.push(cell)
      cell = ''
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else {
      cell += ch
    }
  }
  if (cell !== '' || row.length) {
    row.push(cell)
    rows.push(row)
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ''))
}

const splitList = (value: string) =>
  value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)

const text = readFileSync(CSV_PATH, 'utf8').replace(/^﻿/, '')
const [header, ...rows] = parseCsv(text)
if (!header) throw new Error('CSV 파일이 비어 있어요.')

const index = {} as Record<Column, number>
const missingColumns: string[] = []
for (const col of COLUMNS) {
  const at = header.findIndex((h) => h.trim() === col)
  if (at < 0) missingColumns.push(col)
  index[col] = at
}
if (missingColumns.length) {
  console.error(`✗ 시트 첫 줄에 이 칸이 없어요: ${missingColumns.join(', ')}`)
  process.exit(1)
}

const tagIds = new Set((JSON.parse(readFileSync(TAGS_PATH, 'utf8')) as { id: string }[]).map((t) => t.id))
const errors: string[] = []
const seenIds = new Set<string>()
const seenTitles = new Set<string>()
const movies: MovieOut[] = []

rows.forEach((cells, i) => {
  const line = i + 2 // 시트 줄 번호 (1번 줄은 칸 이름)
  const get = (col: Column) => (cells[index[col]] ?? '').trim()
  const where = `${line}번 줄${get('제목') ? ` (${get('제목')})` : ''}`

  const id = get('id')
  const title = get('제목')
  const genre = get('장르')
  const year = Number(get('개봉 연도'))
  const runtime = Number(get('러닝타임'))
  const tags = [...new Set(splitList(get('태그')))]
  const aliases = [...new Set(splitList(get('다른 이름')))].filter((a) => a !== title)

  if (!/^m\d{3,}$/.test(id)) errors.push(`${where}: id는 m001처럼 써 주세요 (지금: "${id}")`)
  else if (seenIds.has(id)) errors.push(`${where}: id ${id}가 이미 있어요`)
  if (!title) errors.push(`${where}: 제목이 비어 있어요`)
  else if (seenTitles.has(title)) errors.push(`${where}: 같은 제목이 이미 있어요`)
  if (!genre) errors.push(`${where}: 장르가 비어 있어요`)
  if (!Number.isInteger(year) || year < 1900 || year > 2100) errors.push(`${where}: 개봉 연도가 숫자가 아니에요`)
  if (!Number.isInteger(runtime) || runtime <= 0) errors.push(`${where}: 러닝타임은 분 단위 숫자로 써 주세요`)
  if (tags.length < 3 || tags.length > 6) errors.push(`${where}: 태그는 3~6개여야 해요 (지금 ${tags.length}개)`)
  for (const t of tags) if (!tagIds.has(t)) errors.push(`${where}: "${t}"는 tags.json에 없는 태그예요`)

  seenIds.add(id)
  seenTitles.add(title)
  movies.push({
    id,
    title,
    ...(aliases.length ? { aliases } : {}),
    year,
    genre,
    runtime,
    tags,
    ...(get('인기') === '예' ? { popular: true } : {}),
  })
})

if (errors.length) {
  console.error(`✗ 시트에서 고칠 곳이 ${errors.length}군데 있어요. movies.json은 바꾸지 않았어요.\n`)
  for (const e of errors) console.error(`  - ${e}`)
  process.exit(1)
}

// 한 줄에 영화 하나씩 써서 바뀐 곳을 보기 쉽게 해요
writeFileSync(OUT_PATH, `[\n${movies.map((m) => `  ${JSON.stringify(m)}`).join(',\n')}\n]\n`)
const popular = movies.filter((m) => m.popular).length
console.log(`✓ 영화 ${movies.length}편을 movies.json으로 바꿨어요 (인기 영화 ${popular}편)`)
