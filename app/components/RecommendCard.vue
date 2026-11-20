<script setup lang="ts">
import type { RecommendItem } from '#shared/types/movie'

const props = defineProps<{ item: RecommendItem; rank: number; wanted: boolean }>()
defineEmits<{ want: [] }>()

// 추천 이유에 쓰인 태그를 앞에 두고 3개까지 보여 준다 (R2-4)
const shownTags = computed(() => {
  const { matchedTags, movie } = props.item
  return [...new Set([...matchedTags, ...movie.tags])].slice(0, 3)
})

// 포스터 대신 장르 분위기로 색을 고른다 (외부 이미지 없음, PRD §5)
const DARK = ['스릴러', '미스터리', '범죄', '공포', '전쟁']
const SOFT = ['로맨스', '드라마', '뮤지컬', '애니메이션', '코미디']
const tone = computed(() => {
  const g = props.item.movie.genre
  if (DARK.includes(g)) return 'bg-linear-to-br from-night to-primary text-on-dark'
  if (SOFT.includes(g)) return 'bg-linear-to-br from-periwinkle to-lavender text-ink'
  return 'bg-linear-to-br from-primary to-periwinkle text-on-primary'
})
</script>

<template>
  <article class="flex gap-4 rounded-md bg-lavender p-4">
    <!-- 순위 포스터 타일 -->
    <NuxtLink
      :to="`/movie/${item.movie.id}`"
      :class="['relative flex aspect-[2/3] w-[104px] shrink-0 flex-col justify-between overflow-hidden rounded-sm p-2.5', tone]"
      :aria-label="`추천 ${rank}위 ${item.movie.title} 자세히 보기`"
    >
      <span class="text-[11px] font-eyebrow tracking-[0.28px] opacity-80">{{ item.movie.genre }}</span>
      <span class="line-clamp-3 text-[15px] leading-tight font-heading">{{ item.movie.title }}</span>
      <span aria-hidden="true" class="-mb-3 -ml-1 text-[64px] leading-none font-heading italic opacity-90">{{ rank }}</span>
    </NuxtLink>

    <div class="flex min-w-0 flex-1 flex-col">
      <NuxtLink :to="`/movie/${item.movie.id}`" class="group block">
        <p class="text-sm font-eyebrow tracking-[0.28px] text-ink-secondary">추천 {{ rank }}</p>
        <h3 class="mt-1 text-[20px] leading-tight font-bold tracking-[0.3px] text-ink group-hover:text-primary">
          {{ item.movie.title }}
          <span aria-hidden="true" class="text-base text-ink-secondary group-hover:text-primary">›</span>
        </h3>
        <p class="mt-1.5 text-sm text-ink-secondary">
          {{ item.movie.year }} · {{ item.movie.genre }} · {{ item.movie.runtime }}분
        </p>
        <p class="mt-3 text-[15px] leading-snug font-body text-ink">{{ item.reason }}</p>
      </NuxtLink>
      <div class="mt-3 flex flex-wrap gap-1.5">
        <TagChip v-for="t in shownTags" :key="t" :tag="t" on-card :highlight="item.matchedTags.includes(t)" />
      </div>
      <div class="mt-auto pt-4">
        <PillButton size="sm" :pressed="wanted" @click="$emit('want')">
          {{ wanted ? '✓ 보고 싶어요' : '보고 싶어요' }}
        </PillButton>
      </div>
    </div>
  </article>
</template>
