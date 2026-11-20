<script setup lang="ts">
import { allMovies, popularMovies } from '#shared/utils/catalog'
import { searchMovies } from '#shared/utils/search'

useHead({ title: 'MovieP1ck — 영화 3편 고르기' })

const { picked, pickedIds, isFull, has, add, remove } = usePicks()

const query = ref('')
// R1-2: 제목에 그 글자가 들어간 영화를 모두 보여 준다
const results = computed(() => searchMovies(query.value, allMovies))
const noResult = computed(() => query.value.trim() !== '' && results.value.length === 0)

const slots = computed(() => Array.from({ length: MAX_PICKS }, (_, i) => picked.value[i]))

onMounted(() => track('pick_start', { picked: pickedIds.value.length }))

// 검색 결과 없음: 입력이 멈춘 뒤 한 번만 기록
let noResultTimer: ReturnType<typeof setTimeout> | undefined
watch(noResult, (empty) => {
  clearTimeout(noResultTimer)
  if (empty) noResultTimer = setTimeout(() => track('search_no_result', { query: query.value.trim() }), 800)
})

// 3편을 다 채우면 추가 버튼이 꺼져 있어서 여기까지 오지 않는다
function addMovie(id: string) {
  if (add(id)) query.value = ''
}

function goResult() {
  track('result_view', { movieIds: [...pickedIds.value] })
  navigateTo('/result')
}
</script>

<template>
  <!-- 넓은 화면(lg 이상): 왼쪽 고르기 / 오른쪽 고른 영화. 휴대폰은 한 줄 그대로 -->
  <div class="lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-14">
  <div>
    <p class="text-sm font-eyebrow uppercase tracking-[0.28px] text-ink-secondary">Step 1 · 고르기</p>
    <div class="mt-3 flex items-center justify-between gap-3">
      <!-- 사용자 요청으로 굵게 (DESIGN.md 기준 500 초과) -->
      <h1 class="text-[34px] leading-[1.15] font-bold tracking-[0.42px] text-ink lg:text-[44px]">
        좋아했던 영화<br />3편을 골라 주세요
      </h1>
      <!-- 꾸밈 그림: 클래퍼보드 -->
      <svg aria-hidden="true" viewBox="0 0 72 72" class="size-20 shrink-0 lg:size-28">
        <circle cx="36" cy="38" r="32" fill="var(--color-lavender)" />
        <g transform="rotate(-14 22 26)">
          <rect x="12" y="20" width="44" height="9" rx="2" fill="var(--color-night)" />
          <path d="M18 20h6l-4 9h-6zM30 20h6l-4 9h-6zM42 20h6l-4 9h-6z" fill="var(--color-surface)" />
        </g>
        <rect x="12" y="32" width="44" height="26" rx="4" fill="var(--color-primary)" />
        <rect x="12" y="32" width="44" height="7" rx="2" fill="var(--color-night)" />
        <path d="M18 32h6l-3 7h-6zM30 32h6l-3 7h-6zM42 32h6l-3 7h-6z" fill="var(--color-surface)" />
        <rect x="18" y="45" width="20" height="3" rx="1.5" fill="var(--color-on-primary)" opacity=".85" />
        <rect x="18" y="51" width="12" height="3" rx="1.5" fill="var(--color-on-primary)" opacity=".55" />
        <path d="M60 12l1.6 3.4L65 17l-3.4 1.6L60 22l-1.6-3.4L55 17l3.4-1.6z" fill="var(--color-periwinkle)" />
      </svg>
    </div>
    <p class="mt-3 text-[17px] leading-[1.35] font-body text-ink-secondary">
      3편의 공통점으로 취향을 한 줄로 찾아 드리고, 이유가 붙은 영화 3편을 추천해요.
    </p>

    <!-- 검색 (R1-2, R1-6) -->
    <section class="mt-8">
      <label for="movie-search" class="sr-only">영화 제목 검색</label>
      <div class="flex h-[46px] items-center rounded-xl border border-fog bg-surface pl-5 pr-2 focus-within:border-primary">
        <span aria-hidden="true" class="mr-2 text-slate">⌕</span>
        <input
          id="movie-search"
          v-model="query"
          type="text"
          inputmode="search"
          enterkeyhint="search"
          autocomplete="off"
          placeholder="제목 또는 초성으로 검색 (예: ㄴㄹㅊㅇ)"
          class="h-full min-w-0 flex-1 bg-transparent font-ui text-ink outline-none placeholder:text-slate/60"
        />
        <button
          v-if="query"
          type="button"
          class="grid size-9 place-items-center rounded-full text-slate hover:bg-canvas"
          aria-label="검색어 지우기"
          @click="query = ''"
        >
          ✕
        </button>
      </div>

      <!-- 예외: 3편을 다 채운 뒤에는 추가 버튼을 끄고 하나를 빼라고 안내 -->
      <p v-if="isFull" class="mt-3 text-sm text-ink-secondary">
        3편을 모두 골랐어요. 다른 영화를 넣으려면 고른 영화에서 하나를 빼 주세요.
      </p>

      <ul v-if="results.length" class="mt-2 divide-y divide-fog/70 rounded-md bg-surface px-4">
        <MovieSearchItem
          v-for="m in results"
          :key="m.id"
          :movie="m"
          :picked="has(m.id)"
          :full="isFull"
          @add="addMovie(m.id)"
        />
      </ul>

      <div v-else-if="noResult" class="mt-3 rounded-md bg-surface-tint px-5 py-6 text-center">
        <p class="font-ui text-ink">아직 목록에 없는 영화예요</p>
        <p class="mt-2 text-sm text-ink-secondary">비슷하게 좋아했던 다른 영화를 골라 주세요</p>
      </div>
    </section>

    <!-- 인기 영화 바로 추가 (R1-7) -->
    <!-- 띄어쓰기만 입력해도 빈 검색으로 보고 인기 영화를 보여 준다 (QA-05) -->
    <section v-if="!query.trim()" class="mt-6">
      <h2 class="text-sm font-eyebrow tracking-[0.28px] text-ink-secondary">인기 영화</h2>
      <div class="mt-3 flex flex-wrap gap-2">
        <PillButton
          v-for="m in popularMovies"
          :key="m.id"
          size="sm"
          :pressed="has(m.id)"
          :disabled="!has(m.id) && isFull"
          @click="has(m.id) ? remove(m.id) : addMovie(m.id)"
        >
          {{ has(m.id) ? `✓ ${m.title}` : m.title }}
        </PillButton>
      </div>
    </section>

  </div>

    <!-- 고른 영화 슬롯 (R1-1, R1-4). 넓은 화면에서는 오른쪽에 고정 -->
    <section class="mt-10 lg:sticky lg:top-24 lg:mt-0 lg:rounded-md lg:bg-surface lg:p-6">
      <div class="flex items-baseline justify-between">
        <h2 class="text-lg font-heading text-ink">고른 영화</h2>
        <p class="font-ui text-ink-secondary" aria-live="polite">
          <span class="text-primary">{{ picked.length }}</span> / {{ MAX_PICKS }}
        </p>
      </div>
      <ol class="mt-4 space-y-2">
        <PickSlot v-for="(m, i) in slots" :key="m?.id ?? `empty-${i}`" :index="i" :movie="m" @remove="m && remove(m.id)" />
      </ol>
      <!-- 넓은 화면용 CTA (R1-5) -->
      <div class="mt-6 hidden lg:block">
        <PillButton variant="primary" block :disabled="!isFull" @click="goResult">내 취향 보기</PillButton>
      </div>
    </section>

    <!-- 휴대폰용 하단 고정 CTA (R1-5) -->
    <div class="h-20 lg:hidden" aria-hidden="true" />
    <div class="fixed inset-x-0 bottom-0 z-30 border-t border-fog/60 bg-canvas/95 backdrop-blur lg:hidden">
      <div class="mx-auto max-w-[480px] px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))]">
        <PillButton variant="primary" block :disabled="!isFull" @click="goResult">
          내 취향 보기
        </PillButton>
      </div>
    </div>
  </div>
</template>
