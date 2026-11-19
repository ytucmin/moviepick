<script setup lang="ts">
import type { RecommendItem } from '#shared/types/movie'

const props = defineProps<{ item: RecommendItem; rank: number; wanted: boolean }>()
defineEmits<{ want: [] }>()

// 추천 이유에 쓰인 태그를 앞에 두고 3개까지 보여 준다 (R2-4)
const shownTags = computed(() => {
  const { matchedTags, movie } = props.item
  return [...new Set([...matchedTags, ...movie.tags])].slice(0, 3)
})
</script>

<template>
  <article class="rounded-md bg-lavender p-6">
    <NuxtLink :to="`/movie/${item.movie.id}`" class="group block">
      <p class="text-sm font-eyebrow tracking-[0.28px] text-ink-secondary">추천 {{ rank }}</p>
      <h3 class="mt-2 text-[22px] leading-tight font-heading tracking-[0.3px] text-ink group-hover:text-primary">
        {{ item.movie.title }}
        <span aria-hidden="true" class="text-base text-ink-secondary group-hover:text-primary">›</span>
      </h3>
      <p class="mt-2 text-sm text-ink-secondary">
        {{ item.movie.year }} · {{ item.movie.genre }} · {{ item.movie.runtime }}분
      </p>
      <p class="mt-4 text-[17px] leading-snug font-body text-ink">{{ item.reason }}</p>
    </NuxtLink>
    <div class="mt-4 flex flex-wrap gap-1.5">
      <TagChip v-for="t in shownTags" :key="t" :tag="t" on-card :highlight="item.matchedTags.includes(t)" />
    </div>
    <div class="mt-5">
      <PillButton size="sm" :pressed="wanted" @click="$emit('want')">
        {{ wanted ? '✓ 보고 싶어요' : '보고 싶어요' }}
      </PillButton>
    </div>
  </article>
</template>
