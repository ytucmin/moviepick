<script setup lang="ts">
import { josa } from 'es-hangul'
import { getMovie, getTag } from '#shared/utils/catalog'

const route = useRoute()
const movie = computed(() => getMovie(String(route.params.id)))

useHead(() => ({ title: movie.value ? `moviepick — ${movie.value.title}` : 'moviepick' }))

const { picked, result, has, isWanted, want } = usePicks()
const { show } = useToast()

const recItem = computed(() => result.value?.items.find((i) => i.movie.id === movie.value?.id))
const rank = computed(() => (recItem.value ? result.value!.items.indexOf(recItem.value) + 1 : 0))

// 고른 영화와 겹치는 공통 태그별로, 그 태그를 가진 내 영화를 보여 준다
const overlaps = computed(() => {
  const m = movie.value
  const r = result.value
  if (!m || !r || has(m.id)) return []
  return r.commonTags
    .filter((t) => m.tags.includes(t))
    .map((t) => ({
      tag: t,
      phrase: getTag(t)?.phrase ?? t,
      from: picked.value.filter((p) => p.tags.includes(t)).map((p) => p.title),
    }))
})

// 태그를 분류별로 묶어서 보여 준다
const tagGroups = computed(() => {
  const groups = new Map<string, string[]>()
  for (const t of movie.value?.tags ?? []) {
    const cat = getTag(t)?.category ?? '기타'
    groups.set(cat, [...(groups.get(cat) ?? []), t])
  }
  return [...groups.entries()]
})

function onWant() {
  const m = movie.value
  if (!m) return
  if (!isWanted(m.id)) {
    want(m.id)
    track('want_click', { movieId: m.id, from: 'detail' })
  }
  show(`「${m.title}」${josa.pick(m.title, '을/를')} 보고 싶은 영화에 담았어요. OTT에서 검색해 보세요`)
}

function goBack() {
  navigateTo(result.value ? '/result' : '/')
}
</script>

<template>
  <div>
    <button
      type="button"
      class="-ml-2 inline-flex h-11 items-center gap-1 rounded-pill px-2 font-ui text-ink-secondary hover:text-ink"
      @click="goBack"
    >
      <span aria-hidden="true">‹</span> {{ result ? '결과로 돌아가기' : '처음으로' }}
    </button>

    <div v-if="!movie" class="mt-10 rounded-md bg-surface-tint px-5 py-10 text-center">
      <p class="font-ui text-ink">영화를 찾을 수 없어요</p>
      <NuxtLink to="/" class="mt-3 inline-block text-sm text-primary">영화 고르러 가기</NuxtLink>
    </div>

    <template v-else>
      <!-- 기본 정보 -->
      <header class="mt-4">
        <p class="text-sm font-eyebrow uppercase tracking-[0.28px] text-ink-secondary">
          {{ rank ? `Step 3 · 추천 ${rank}` : has(movie.id) ? '내가 고른 영화' : '영화 정보' }}
        </p>
        <h1 class="mt-3 text-[34px] leading-[1.15] font-heading tracking-[0.42px] text-ink">{{ movie.title }}</h1>
        <p v-if="movie.aliases?.length" class="mt-2 text-sm text-slate">{{ movie.aliases[0] }}</p>
      </header>

      <dl class="mt-6 grid grid-cols-3 divide-x divide-fog/70 rounded-md bg-surface py-4 text-center">
        <div>
          <dt class="text-xs tracking-[0.24px] text-slate">개봉</dt>
          <dd class="mt-1 font-ui text-ink">{{ movie.year }}</dd>
        </div>
        <div>
          <dt class="text-xs tracking-[0.24px] text-slate">장르</dt>
          <dd class="mt-1 font-ui text-ink">{{ movie.genre }}</dd>
        </div>
        <div>
          <dt class="text-xs tracking-[0.24px] text-slate">러닝타임</dt>
          <dd class="mt-1 font-ui text-ink">{{ movie.runtime }}분</dd>
        </div>
      </dl>

      <!-- 왜 추천했나요? -->
      <section v-if="overlaps.length" class="mt-8 rounded-md bg-lavender p-6">
        <h2 class="text-lg font-heading text-ink">왜 추천했나요?</h2>
        <p v-if="recItem" class="mt-2 text-[17px] leading-snug font-body text-ink">{{ recItem.reason }}</p>
        <ul class="mt-5 space-y-4">
          <li v-for="o in overlaps" :key="o.tag">
            <TagChip :tag="o.tag" highlight />
            <p class="mt-2 text-sm text-ink-secondary">
              <span class="text-ink">{{ o.phrase }}</span> — {{ o.from.join(', ') }}에도 있어요
            </p>
          </li>
        </ul>
      </section>

      <!-- 태그 -->
      <section class="mt-8">
        <h2 class="text-lg font-heading text-ink">이 영화의 취향 태그</h2>
        <dl class="mt-4 space-y-3">
          <div v-for="[cat, tags] in tagGroups" :key="cat" class="flex items-start gap-3">
            <dt class="w-20 shrink-0 pt-1 text-xs tracking-[0.24px] text-slate">{{ cat }}</dt>
            <dd class="flex flex-wrap gap-1.5">
              <TagChip v-for="t in tags" :key="t" :tag="t" :highlight="overlaps.some((o) => o.tag === t)" />
            </dd>
          </div>
        </dl>
      </section>

      <!-- 보고 싶어요 -->
      <div class="h-20" aria-hidden="true" />
      <div class="fixed inset-x-0 bottom-0 z-30 border-t border-fog/60 bg-canvas/95 backdrop-blur">
        <div class="mx-auto max-w-[480px] px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))]">
          <PillButton variant="primary" block @click="onWant">
            {{ isWanted(movie.id) ? '✓ 보고 싶은 영화에 담았어요' : '보고 싶어요' }}
          </PillButton>
        </div>
      </div>
    </template>
  </div>
</template>
