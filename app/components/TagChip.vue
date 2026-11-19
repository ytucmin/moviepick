<script setup lang="ts">
import { tagLabel } from '#shared/utils/catalog'

withDefaults(defineProps<{ tag: string; highlight?: boolean; onCard?: boolean }>(), {
  highlight: false,
  onCard: false,
})
</script>

<template>
  <span
    :class="[
      'inline-flex items-center rounded-xs px-2 py-1 text-xs font-ui leading-none tracking-[0.24px]',
      highlight
        ? 'bg-primary/12 text-primary'
        : onCard
          ? 'bg-surface/80 text-ink-secondary'
          : 'bg-lavender text-ink-secondary',
    ]"
  >
    #{{ tagLabel(tag) }}
  </span>
</template>
