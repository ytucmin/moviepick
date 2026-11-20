<script setup lang="ts">
const { nickname, login, logout } = useNickname()
const open = ref(false)
const draft = ref('')

function submit() {
  if (login(draft.value)) {
    draft.value = ''
    open.value = false
  }
}

function logoutAndClose() {
  logout()
  open.value = false
}

// 화면을 옮기면 패널을 닫는다
const route = useRoute()
watch(() => route.fullPath, () => (open.value = false))
</script>

<template>
  <div class="flex min-h-dvh flex-col bg-canvas">
    <!-- nav-bar: 모든 화면을 night 색으로 감싼다 (DESIGN.md) -->
    <header class="sticky top-0 z-40 bg-night">
      <div class="mx-auto flex h-14 max-w-[480px] lg:max-w-[1100px] items-center justify-between px-4">
        <NuxtLink to="/" class="flex items-center gap-2 text-on-dark">
          <span class="grid size-7 place-items-center rounded-full bg-primary text-xs font-ui text-on-primary">m</span>
          <span class="text-lg font-heading tracking-[0.3px]">MovieP1ck</span>
        </NuxtLink>
        <!-- 닉네임 로그인 (사용자 요청 · 이 브라우저에만 저장, PRD는 로그인 없음) -->
        <div class="relative" @keydown.esc="open = false">
          <button
            type="button"
            :aria-expanded="open"
            aria-controls="login-panel"
            class="flex h-9 max-w-[180px] items-center gap-1.5 rounded-pill border border-[rgba(175,178,206,0.36)] bg-[rgba(175,178,206,0.2)] px-4 text-sm font-ui text-on-dark hover:bg-[rgba(175,178,206,0.3)]"
            @click="open = !open"
          >
            <svg aria-hidden="true" viewBox="0 0 20 20" class="size-4 shrink-0" fill="none" stroke="currentColor" stroke-width="1.6">
              <circle cx="10" cy="7" r="3.2" />
              <path d="M3.8 16.5c1.2-2.9 3.5-4.3 6.2-4.3s5 1.4 6.2 4.3" stroke-linecap="round" />
            </svg>
            <span class="truncate">{{ nickname ? `${nickname}님` : '로그인' }}</span>
          </button>

          <div
            v-if="open"
            id="login-panel"
            class="absolute right-0 top-11 w-64 rounded-md bg-surface p-4 text-ink shadow-[0_4px_16px_rgba(23,23,33,0.12)]"
          >
            <form v-if="!nickname" @submit.prevent="submit">
              <label for="nickname" class="text-sm font-ui text-ink-secondary">닉네임으로 시작하기</label>
              <input
                id="nickname"
                v-model="draft"
                :maxlength="NICKNAME_MAX"
                autocomplete="nickname"
                placeholder="12자 이내"
                class="mt-2 h-11 w-full rounded-xl border border-fog bg-surface px-4 font-ui outline-none focus:border-primary"
              />
              <p class="mt-2 text-xs text-slate">이 브라우저에만 저장돼요. 비밀번호는 필요 없어요.</p>
              <PillButton class="mt-3" block :disabled="!draft.trim()" @click="submit">로그인</PillButton>
            </form>
            <div v-else>
              <p class="font-ui">{{ nickname }}님, 반가워요</p>
              <PillButton class="mt-3" variant="outline" block @click="logoutAndClose">로그아웃</PillButton>
            </div>
          </div>
        </div>
      </div>
    </header>

    <main class="mx-auto w-full max-w-[480px] lg:max-w-[1100px] flex-1 px-4 pb-16 pt-8">
      <slot />
    </main>

    <footer class="bg-night">
      <div class="mx-auto max-w-[480px] lg:max-w-[1100px] px-4 py-8 text-xs leading-relaxed tracking-[0.24px] text-fog">
        <p class="font-ui text-on-dark">MovieP1ck</p>
        <p class="mt-2">로그인하지 않아도, 좋아했던 영화 3편으로 취향을 찾아요.</p>
        <p class="mt-1">영화 정보는 직접 모은 목록이에요. 시청은 각 OTT에서 검색해 주세요.</p>
      </div>
    </footer>

    <AppToast />
  </div>
</template>
