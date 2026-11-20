<script setup lang="ts">
import type { NuxtError } from '#app'

// 없는 주소(/movie/ 등)나 예기치 못한 오류일 때 서비스 화면 틀 안에서 한국어로 안내 (QA-03)
const props = defineProps<{ error: NuxtError }>()
const notFound = computed(() => props.error.statusCode === 404)

useHead({ title: notFound.value ? 'MovieP1ck — 페이지를 찾을 수 없어요' : 'MovieP1ck — 문제가 생겼어요' })

const goHome = () => clearError({ redirect: '/' })
</script>

<template>
  <NuxtLayout>
    <div class="mx-auto mt-10 max-w-[480px] rounded-md bg-surface-tint px-5 py-10 text-center">
      <p class="text-sm font-eyebrow tracking-[0.28px] text-ink-secondary">{{ error.statusCode }}</p>
      <h1 class="mt-2 text-2xl font-bold text-ink">
        {{ notFound ? '페이지를 찾을 수 없어요' : '잠시 문제가 생겼어요' }}
      </h1>
      <p class="mt-3 text-ink-secondary">
        {{ notFound ? '주소가 맞는지 확인하거나 처음부터 영화를 골라 주세요.' : '잠시 후 다시 시도해 주세요.' }}
      </p>
      <PillButton class="mt-6" variant="primary" @click="goHome">영화 고르러 가기</PillButton>
    </div>
  </NuxtLayout>
</template>
