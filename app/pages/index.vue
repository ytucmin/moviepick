<script setup lang="ts">
import { allMovies, popularMovies } from '#shared/utils/catalog'
import { searchMovies } from '#shared/utils/search'

useHead({ title: 'moviepick — 영화 3편 고르기' })

const { picked, pickedIds, isFull, has, add, remove } = usePicks()
const { show } = useToast()

const query = ref('')
const results = computed(() => searchMovies(query.value, allMovies).slice(0, 8))
const noResult = computed(() => query.value.trim() !== '' && results.value.length === 0)

const slots = computed(() => Array.from({ length: MAX_PICKS }, (_, i) => picked.value[i]))

onMounted(() => track('pick_start', { picked: pickedIds.value.length }))

// 검색 결과 없음: 입력이 멈춘 뒤 한 번만 기록
let noResultTimer: ReturnType<typeof setTimeout> | undefined
watch(noResult, (empty) => {
  clearTimeout(noResultTimer)
  if (empty) noResultTimer = setTimeout(() => track('search_no_result', { query: query.value.trim() }), 800)
})

function addMovie(id: string) {
  if (isFull.value) {
    show('3편을 모두 골랐어요. 바꾸려면 하나를 빼 주세요')
    return
  }
  if (add(id)) query.value = ''
}

function goResult() {
  track('result_view', { movieIds: [...pickedIds.value] })
  navigateTo('/result')
}
</script>

<template>
  <div>
    <p class="text-sm font-eyebrow uppercase tracking-[0.28px] text-ink-secondary">Step 1 · 고르기</p>
    <h1 class="mt-3 text-[30px] leading-[1.15] font-heading tracking-[0.42px] text-ink">
      좋아했던 영화<br />3편을 골라 주세요
    </h1>
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
          class="h-full min-w-0 flex-1 bg-transparent font-ui text-ink outline-none placeholder:text-slate"
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

      <p v-if="isFull && query" class="mt-3 text-sm text-ink-secondary">
        3편을 모두 골랐어요. 다른 영화를 넣으려면 아래에서 하나를 빼 주세요.
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
    <section v-if="!query" class="mt-6">
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

    <!-- 고른 영화 슬롯 (R1-1, R1-4) -->
    <section class="mt-10">
      <div class="flex items-baseline justify-between">
        <h2 class="text-lg font-heading text-ink">고른 영화</h2>
        <p class="font-ui text-ink-secondary" aria-live="polite">
          <span class="text-primary">{{ picked.length }}</span> / {{ MAX_PICKS }}
        </p>
      </div>
      <ol class="mt-4 space-y-2">
        <PickSlot v-for="(m, i) in slots" :key="m?.id ?? `empty-${i}`" :index="i" :movie="m" @remove="m && remove(m.id)" />
      </ol>
    </section>

    <!-- 하단 고정 CTA (R1-5) -->
    <div class="h-20" aria-hidden="true" />
    <div class="fixed inset-x-0 bottom-0 z-30 border-t border-fog/60 bg-canvas/95 backdrop-blur">
      <div class="mx-auto max-w-[480px] px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))]">
        <PillButton variant="primary" block :disabled="!isFull" @click="goResult">
          {{ isFull ? '내 취향 보기' : `${MAX_PICKS - picked.length}편 더 골라 주세요` }}
        </PillButton>
      </div>
    </div>
  </div>
</template>
