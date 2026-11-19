<script setup lang="ts">
import type { Movie } from '#shared/types/movie'

defineProps<{ movie: Movie; picked: boolean; full: boolean }>()
defineEmits<{ add: [] }>()
</script>

<template>
  <li class="flex items-center gap-3 py-3">
    <div class="min-w-0 flex-1">
      <p class="truncate font-ui text-ink">{{ movie.title }}</p>
      <p class="mt-1 text-sm text-ink-secondary">{{ movie.year }} · {{ movie.genre }}</p>
    </div>
    <PillButton size="sm" :disabled="picked || full" @click="$emit('add')">
      {{ picked ? '고른 영화' : '+ 추가' }}
    </PillButton>
  </li>
</template>
