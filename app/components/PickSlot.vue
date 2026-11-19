<script setup lang="ts">
import type { Movie } from '#shared/types/movie'

defineProps<{ index: number; movie?: Movie }>()
defineEmits<{ remove: [] }>()
</script>

<template>
  <li
    :class="[
      'flex min-h-14 items-center gap-3 rounded-md px-4 py-3',
      movie ? 'bg-lavender' : 'border border-dashed border-fog bg-surface',
    ]"
  >
    <span
      :class="[
        'grid size-7 shrink-0 place-items-center rounded-full text-sm font-ui',
        movie ? 'bg-primary text-on-primary' : 'bg-canvas text-slate',
      ]"
    >
      {{ index + 1 }}
    </span>
    <template v-if="movie">
      <div class="min-w-0 flex-1">
        <p class="truncate font-ui text-ink">{{ movie.title }}</p>
        <p class="mt-1 text-xs text-ink-secondary">{{ movie.year }} · {{ movie.genre }}</p>
      </div>
      <button
        type="button"
        class="-mr-2 grid size-11 shrink-0 place-items-center rounded-full text-ink-secondary hover:bg-surface/70"
        :aria-label="`${movie.title} 빼기`"
        @click="$emit('remove')"
      >
        ✕
      </button>
    </template>
    <p v-else class="text-sm text-slate">{{ index + 1 }}번째 영화를 골라 주세요</p>
  </li>
</template>
