<script setup lang="ts">
const { message } = useToast()
</script>

<template>
  <div class="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-4" aria-live="polite">
    <Transition
      enter-from-class="opacity-0 translate-y-2"
      leave-to-class="opacity-0 translate-y-2"
      enter-active-class="transition duration-200"
      leave-active-class="transition duration-200"
    >
      <p
        v-if="message"
        class="max-w-sm rounded-md bg-night px-4 py-3 text-sm text-on-dark shadow-[0_4px_16px_rgba(23,23,33,0.18)]"
      >
        {{ message }}
      </p>
    </Transition>
  </div>
</template>
