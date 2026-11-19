<script setup lang="ts">
/**
 * DESIGN.md 버튼. 한 화면에 solid primary는 하나만 쓰고, 나머지는 반투명 pill.
 * primary: button-primary · tint: button-tint-light · outline: button-outline-light
 */
const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'tint' | 'outline'
    size?: 'md' | 'sm'
    block?: boolean
    pressed?: boolean
  }>(),
  { variant: 'tint', size: 'md', block: false, pressed: false },
)

const variantClass = computed(() => {
  switch (props.variant) {
    case 'primary':
      return 'bg-primary text-on-primary rounded-xl hover:bg-[#4757d6] disabled:bg-primary/35 disabled:text-on-primary/90'
    case 'outline':
      return 'bg-[rgba(112,115,147,0.1)] border border-[rgba(112,115,147,0.22)] text-ink rounded-pill hover:bg-[rgba(112,115,147,0.16)] disabled:opacity-45'
    default:
      return props.pressed
        ? 'bg-primary/20 text-primary rounded-pill ring-1 ring-primary/40'
        : 'bg-primary/10 text-ink rounded-pill hover:bg-primary/15 disabled:opacity-45'
  }
})

const sizeClass = computed(() =>
  props.size === 'sm' ? 'h-9 px-4 text-sm tracking-[0.07px]' : 'h-11 px-5 text-base',
)
</script>

<template>
  <button
    type="button"
    :aria-pressed="variant === 'tint' && pressed ? 'true' : undefined"
    :class="[
      'inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap leading-none font-ui transition-colors',
      variantClass,
      sizeClass,
      block && 'w-full',
    ]"
  >
    <slot />
  </button>
</template>
