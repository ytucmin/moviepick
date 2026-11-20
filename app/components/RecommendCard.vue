<script setup lang="ts">
import type { RecommendItem } from '#shared/types/movie'

const props = defineProps<{ item: RecommendItem; rank: number; wanted: boolean }>()
defineEmits<{ want: [] }>()

// 추천 이유에 쓰인 태그를 앞에 두고 3개까지 보여 준다 (R2-4)
const shownTags = computed(() => {
  const { matchedTags, movie } = props.item
  return [...new Set([...matchedTags, ...movie.tags])].slice(0, 3)
})

const tone = computed(() => genreTone(props.item.movie.genre))
</script>

<template>
  <!-- 휴대폰: 타일 왼쪽 / 넓은 화면: 타일 위, 카드 3장 나란히 -->
  <article class="flex gap-4 rounded-md bg-lavender p-4 lg:flex-col lg:p-5">
    <!-- 순위 포스터 타일 -->
    <NuxtLink
      :to="`/movie/${item.movie.id}`"
      :class="['relative flex aspect-[2/3] w-[104px] shrink-0 flex-col justify-between overflow-hidden rounded-sm p-2.5 lg:aspect-[4/3] lg:w-full lg:p-4', tone]"
      :aria-label="`추천 ${rank}위 ${item.movie.title} 자세히 보기`"
    >
      <span class="text-[13px] font-eyebrow tracking-[0.28px] opacity-80 lg:text-sm">{{ item.movie.genre }}</span>
      <span class="line-clamp-3 text-[17px] leading-tight font-heading lg:text-[23px]">{{ item.movie.title }}</span>
      <span aria-hidden="true" class="-mb-3 -ml-1 text-[64px] leading-none font-heading italic opacity-90 lg:text-[96px]">{{ rank }}</span>
    </NuxtLink>

    <div class="flex min-w-0 flex-1 flex-col">
      <NuxtLink :to="`/movie/${item.movie.id}`" class="group block">
        <p class="text-base font-eyebrow tracking-[0.28px] text-ink-secondary">추천 {{ rank }}</p>
        <h3 class="mt-1 text-[27px] leading-tight font-bold lg:text-[30px] tracking-[0.3px] text-ink group-hover:text-primary">
          {{ item.movie.title }}
          <span aria-hidden="true" class="text-lg text-ink-secondary group-hover:text-primary">›</span>
        </h3>
        <p class="mt-1.5 text-base text-ink-secondary">
          {{ item.movie.year }} · {{ item.movie.genre }} · {{ item.movie.runtime }}분
        </p>
        <p class="mt-3 text-[19px] leading-snug font-body text-ink">{{ item.reason }}</p>
      </NuxtLink>
      <div class="mt-3 flex flex-wrap gap-1.5">
        <TagChip v-for="t in shownTags" :key="t" :tag="t" on-card :highlight="item.matchedTags.includes(t)" class="text-base!" />
      </div>
      <div class="mt-auto pt-4">
        <PillButton size="sm" class="h-10! text-base!" :pressed="wanted" @click="$emit('want')">
          보고 싶어요
          <!-- 엄지 척: 담으면 채워진다 -->
          <svg aria-hidden="true" viewBox="0 0 20 20" class="size-4" :fill="wanted ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round">
            <path d="M2.5 9H6v7.5H2.5z" />
            <path d="M6 9l3-6c1.3 0 2.2 1 2.2 2.2V7.5h4.1a1.6 1.6 0 0 1 1.6 1.9l-1.1 5.6a1.8 1.8 0 0 1-1.8 1.5H6" />
          </svg>
        </PillButton>
      </div>
    </div>
  </article>
</template>
