<template>
  <div class="flex min-h-dvh flex-col bg-canvas">
    <!-- nav-bar: 모든 화면을 night 색으로 감싼다 (DESIGN.md) -->
    <header class="sticky top-0 z-40 bg-night">
      <div class="mx-auto flex h-14 max-w-[480px] items-center justify-between px-4">
        <NuxtLink to="/" class="flex items-center gap-2 text-on-dark">
          <span class="grid size-7 place-items-center rounded-full bg-primary text-xs font-ui text-on-primary">m</span>
          <span class="text-lg font-heading tracking-[0.3px]">MovieP1ck</span>
        </NuxtLink>
        <!-- 로그인 모양만 (사용자 요청, 동작 없음 · PRD는 로그인 없음) -->
        <div
          aria-hidden="true"
          class="flex h-9 select-none items-center gap-1.5 rounded-pill border border-[rgba(175,178,206,0.36)] bg-[rgba(175,178,206,0.2)] px-4 text-sm font-ui text-on-dark"
        >
          <svg viewBox="0 0 20 20" class="size-4" fill="none" stroke="currentColor" stroke-width="1.6">
            <circle cx="10" cy="7" r="3.2" />
            <path d="M3.8 16.5c1.2-2.9 3.5-4.3 6.2-4.3s5 1.4 6.2 4.3" stroke-linecap="round" />
          </svg>
          로그인
        </div>
      </div>
    </header>

    <main class="mx-auto w-full max-w-[480px] flex-1 px-4 pb-16 pt-8">
      <slot />
    </main>

    <footer class="bg-night">
      <div class="mx-auto max-w-[480px] px-4 py-8 text-xs leading-relaxed tracking-[0.24px] text-fog">
        <p class="font-ui text-on-dark">MovieP1ck</p>
        <p class="mt-2">로그인 없이, 좋아했던 영화 3편으로 취향을 찾아요.</p>
        <p class="mt-1">영화 정보는 직접 모은 목록이에요. 시청은 각 OTT에서 검색해 주세요.</p>
      </div>
    </footer>

    <AppToast />
  </div>
</template>
