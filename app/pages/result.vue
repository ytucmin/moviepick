<script setup lang="ts">
import { josa } from 'es-hangul'
import { tagPhrase } from '#shared/utils/catalog'

useHead({ title: 'MovieP1ck — 내 취향' })

const { picked, result, feedback, isWanted, want } = usePicks()
const { show } = useToast()

// 3편을 고르지 않고 들어오면 화면 1로
if (!result.value) await navigateTo('/', { replace: true })

// 취향 키워드 문장: 태그 문구만 강조해서 보여 준다 (R2-2)
const keywordParts = computed<{ text: string; em?: boolean; br?: boolean }[]>(() => {
  const tags = result.value?.keywordTags ?? []
  const [a, b] = tags.map(tagPhrase)
  if (!a) return []
  // "좋아하는 사람이에요"는 항상 새 줄에 한 덩어리로 (사용자 요청)
  const ending = { text: '좋아하는 사람이에요', br: true }
  if (!b) return [{ text: '당신은 ' }, { text: a, em: true }, { text: josa.pick(a, '을/를') }, ending]
  return [
    { text: '당신은 ' },
    { text: a, em: true },
    { text: `${josa.pick(a, '와/과')} ` },
    { text: b, em: true },
    { text: josa.pick(b, '을/를') },
    ending,
  ]
})

function sendFeedback(value: 'yes' | 'no') {
  feedback.value = value
  track('keyword_feedback', { value, keywordTags: result.value?.keywordTags })
}

function onWant(id: string, title: string) {
  if (!isWanted(id)) {
    want(id)
    track('want_click', { movieId: id })
  }
  show(`「${title}」${josa.pick(title, '을/를')} 보고 싶은 영화에 담았어요. OTT에서 검색해 보세요`)
}

function repick() {
  track('repick')
  navigateTo('/')
}
</script>

<template>
  <!-- shortcut: 넓은 화면 배치 전까지 가운데 좁은 기둥 유지, 화면 2 웹 배치 때 제거 -->
  <div v-if="result" class="lg:mx-auto lg:max-w-[480px]">
    <!-- 고른 3편 (R2-1) -->
    <p class="text-sm font-eyebrow uppercase tracking-[0.28px] text-ink-secondary">Step 2 · 내 취향</p>
    <ul class="mt-3 flex flex-wrap gap-1.5" aria-label="고른 영화">
      <li v-for="m in picked" :key="m.id" class="rounded-pill bg-[rgba(112,115,147,0.1)] px-3 py-1.5 text-sm font-ui text-ink">
        {{ m.title }}
      </li>
    </ul>

    <!-- 취향 키워드 (R2-2) -->
    <section class="mt-8">
      <p v-if="result.diverse" class="mb-3 text-[15px] text-ink-secondary">고르신 3편은 취향이 다양하네요!</p>
      <!-- 취향 태그는 크게(38px), 나머지 문장은 조금 작게 (사용자 요청) -->
      <h1 class="text-[26px] leading-[1.35] font-bold tracking-[0.42px] text-ink">
        <template v-for="(p, i) in keywordParts" :key="i">
          <span v-if="p.em" class="text-[38px] text-primary">{{ p.text }}</span>
          <template v-else-if="p.br"><br /><span class="whitespace-nowrap">{{ p.text }}</span></template>
          <template v-else>{{ p.text }}</template>
        </template>
      </h1>

      <!-- 맞아요 / 아니에요 (R2-3) -->
      <div class="mt-5 flex items-center gap-2">
        <PillButton size="sm" :pressed="feedback === 'yes'" @click="sendFeedback('yes')">맞아요</PillButton>
        <PillButton size="sm" :pressed="feedback === 'no'" @click="sendFeedback('no')">아니에요</PillButton>
        <p v-if="feedback" class="ml-1 text-sm text-ink-secondary">알려 주셔서 고마워요</p>
      </div>
    </section>

    <!-- 추천 3편 (R2-4, R2-5) -->
    <section class="mt-12">
      <h2 class="text-lg font-heading text-ink">이 취향이라면, 이 영화</h2>
      <p class="mt-1 text-sm text-ink-secondary">카드를 누르면 자세히 볼 수 있어요</p>

      <div class="mt-5 space-y-3">
        <RecommendCard
          v-for="(item, i) in result.items"
          :key="item.movie.id"
          :item="item"
          :rank="i + 1"
          :wanted="isWanted(item.movie.id)"
          @want="onWant(item.movie.id, item.movie.title)"
        />
      </div>

      <div v-if="result.tooFew" class="mt-4 rounded-md bg-surface-tint px-5 py-5 text-center">
        <p class="font-ui text-ink">비슷한 영화를 {{ result.items.length }}편만 찾았어요</p>
        <p class="mt-2 text-sm text-ink-secondary">영화 1편을 바꿔 보세요</p>
      </div>
    </section>

    <!-- 다시 고르기 (R2-6) -->
    <div class="mt-10">
      <PillButton variant="outline" block @click="repick">다시 고르기</PillButton>
      <p class="mt-2 text-center text-xs text-slate">고른 3편은 그대로 남아 있어요</p>
    </div>
  </div>
</template>
