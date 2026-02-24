<template>
  <header
    dir="rtl"
    class="h-16 border-b border-border bg-[color:var(--bg-secondary)]/90 backdrop-blur-md sticky top-0 z-50 px-4 md:px-6 flex items-center justify-between"
  >
    <NuxtLink to="/" class="flex items-center gap-2 shrink-0 cursor-pointer">
      <span class="material-icons text-[color:var(--accent-cyan)] text-2xl">terminal</span>
      <span class="font-bold text-lg hidden sm:inline tracking-tight text-[color:var(--text-primary)]">CodeQuest</span>
    </NuxtLink>

    <nav class="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center justify-center gap-8 text-sm">
      <NuxtLink to="/" class="font-medium text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] transition-colors">
        خانه
      </NuxtLink>
      <NuxtLink to="/problem/sum-of-two-numbers" class="font-semibold text-primary border-b-2 border-primary pb-1">
        مسیر یادگیری
      </NuxtLink>
      <NuxtLink to="/problem/sum-of-two-numbers" class="font-medium text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] transition-colors">
        چالش‌ها
      </NuxtLink>
      <NuxtLink to="/problem/sum-of-two-numbers" class="font-medium text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] transition-colors">
        رتبه‌ها
      </NuxtLink>
    </nav>

    <div class="flex items-center gap-2 sm:gap-3 shrink-0">
      <div class="hidden sm:flex items-center gap-1.5 rounded-full bg-[color:var(--bg-primary)] border border-border px-3 py-1 text-xs font-bold text-[color:var(--text-primary)]">
        <span class="material-icons text-[15px] text-[color:var(--streak)]">local_fire_department</span>
        <span>{{ streakDays }}</span>
      </div>
      <div class="hidden sm:flex items-center gap-1.5 rounded-full bg-[color:var(--bg-primary)] border border-border px-3 py-1 text-xs font-bold text-[color:var(--coins)]">
        <span class="material-icons text-[15px]">paid</span>
        <span>{{ coins.toLocaleString() }}</span>
      </div>

      <button
        type="button"
        aria-label="Notifications"
        class="relative cursor-pointer size-9 rounded-full bg-[color:var(--bg-primary)] border border-border text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] transition-colors flex items-center justify-center"
      >
        <span class="material-icons text-[19px]">notifications</span>
        <span class="absolute top-1.5 right-1.5 size-2 rounded-full bg-[color:var(--error)]"></span>
      </button>

      <div ref="popupRef" class="relative flex items-center gap-3">
        <button
          type="button"
          class="cursor-pointer w-9 h-9 rounded-full bg-muted overflow-hidden border-2 border-primary flex items-center justify-center text-xs font-bold text-[color:var(--text-primary)]"
          aria-label="Open profile menu"
          @click.stop="toggleProfile"
        >
          {{ avatarInitial }}
        </button>

        <div
          v-if="isProfileOpen"
          class="absolute top-12 left-0 w-[20rem] max-w-[calc(100vw-1.5rem)] rounded-2xl border border-border bg-[color:var(--bg-secondary)] shadow-2xl shadow-black/30 overflow-hidden"
        >
          <div class="relative h-20 bg-gradient-to-l from-primary/30 to-secondary/20">
            <span class="absolute top-0 left-0 px-2 py-1 text-[10px] font-black tracking-widest bg-primary text-primary-foreground rounded-br-lg">
              PRO
            </span>
          </div>

          <div class="px-4 pb-4">
            <div class="-mt-7 flex items-end gap-3">
              <div class="relative">
                <div class="size-14 rounded-full border-2 border-[color:var(--bg-secondary)] bg-[color:var(--bg-primary)] flex items-center justify-center text-lg font-bold text-[color:var(--text-primary)]">
                  {{ avatarInitial }}
                </div>
                <!-- <span class="absolute bottom-0 right-0 size-3 rounded-full bg-[color:var(--success)] border border-[color:var(--bg-secondary)]"></span> -->
              </div>
              <div class="pb-0.5">
                <p class="font-bold text-[color:var(--text-primary)] leading-tight">{{ displayName }}</p>
                <!-- <p class="text-xs text-[color:var(--text-secondary)]">Streak {{ streakDays }} days</p> -->
              </div>
            </div>

            <div class="mt-4 space-y-2">
              <div class="flex items-center justify-between text-xs font-semibold text-[color:var(--text-secondary)]">
                <span>Progress to next level</span>
                <span class="text-primary">{{ nextLevelPercent }}%</span>
              </div>
              <div class="w-full h-2 rounded-full bg-muted overflow-hidden">
                <div class="h-full bg-primary" :style="{ width: `${nextLevelPercent}%` }"></div>
              </div>
            </div>

            <div class="mt-4 grid grid-cols-2 gap-2">
              <div class="rounded-lg border border-border bg-[color:var(--bg-primary)]/70 p-3 text-center">
                <span class="material-icons text-[color:var(--streak)]">local_fire_department</span>
                <p class="text-sm font-bold text-[color:var(--text-primary)]">{{ streakDays }} days</p>
                <p class="text-[10px] text-[color:var(--text-secondary)]">streak</p>
              </div>
              <div class="rounded-lg border border-border bg-[color:var(--bg-primary)]/70 p-3 text-center">
                <span class="material-icons text-[color:var(--coins)]">monetization_on</span>
                <p class="text-sm font-bold text-[color:var(--text-primary)]">{{ coins.toLocaleString() }}</p>
                <p class="text-[10px] text-[color:var(--text-secondary)]">coins</p>
              </div>
            </div>

            <div class="mt-4 flex items-center justify-between rounded-lg border border-border bg-[color:var(--bg-primary)]/70 p-1">
              <button
                type="button"
                class="cursor-pointer flex-1 rounded-md px-2 py-1.5 text-xs font-semibold transition-colors"
                :class="!isLight ? 'bg-[color:var(--bg-secondary)] text-[color:var(--text-primary)]' : 'text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]'"
                @click="setTheme('dark')"
              >
                Dark
              </button>
              <button
                type="button"
                class="cursor-pointer flex-1 rounded-md px-2 py-1.5 text-xs font-semibold transition-colors"
                :class="isLight ? 'bg-black/5 text-[color:var(--text-primary)]' : 'text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]'"
                @click="setTheme('light')"
              >
                Light
              </button>
            </div>

            <button
              type="button"
              class="cursor-pointer mt-3 w-full rounded-lg border border-border px-3 py-2 text-sm font-semibold text-[color:var(--text-secondary)] hover:text-[color:var(--error)] hover:border-[color:var(--error)] transition-colors flex items-center justify-center gap-2"
              @click="handleLogout"
            >
              <span class="material-icons text-base">logout</span>
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>

  <nav dir="rtl" class="md:hidden fixed bottom-0 inset-x-0 z-50 h-16 border-t border-border bg-[color:var(--bg-secondary)]/95 backdrop-blur-md px-4">
    <div class="h-full grid grid-cols-4 items-center">
      <NuxtLink to="/" class="flex flex-col items-center justify-center gap-0.5 text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] transition-colors">
        <span class="material-icons text-[20px]">home</span>
        <span class="text-[10px]">خانه</span>
      </NuxtLink>
      <NuxtLink to="/problem/sum-of-two-numbers" class="flex flex-col items-center justify-center gap-0.5 text-primary">
        <span class="material-icons text-[20px]">map</span>
        <span class="text-[10px] font-semibold">مسیر</span>
      </NuxtLink>
      <NuxtLink to="/problem/sum-of-two-numbers" class="flex flex-col items-center justify-center gap-0.5 text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] transition-colors">
        <span class="material-icons text-[20px]">emoji_events</span>
        <span class="text-[10px]">رتبه‌ها</span>
      </NuxtLink>
      <button
        type="button"
        class="flex flex-col items-center justify-center gap-0.5 text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] transition-colors"
        @click.stop="toggleProfile"
      >
        <span class="material-icons text-[20px]">person</span>
        <span class="text-[10px]">پروفایل</span>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">

import { useRootStore } from '../../app/stores'

const colorMode = useState<'dark' | 'light'>('color-mode', () => 'dark')
const isLight = computed(() => colorMode.value === 'light')
const rootStore = useRootStore()
const popupRef = ref<HTMLElement | null>(null)
const isProfileOpen = ref(false)
const user = computed(() => rootStore.state?.user ?? null)
const xp = computed(() => user.value?.xp ?? 0)
const coins = computed(() => user.value?.coins ?? 0)
const streakDays = computed(() => user.value?.streakDays ?? 0)
const nextLevelPercent = computed(() => Math.round((xp.value % 200) / 2))
const displayName = computed(() => user.value?.name || user.value?.username || 'Player')
const avatarInitial = computed(() => displayName.value.trim().charAt(0).toUpperCase() || 'U')

const applyThemeClass = () => {
  const root = document.documentElement
  root.classList.toggle('light', colorMode.value === 'light')
  root.classList.toggle('dark', colorMode.value !== 'light')
}

const handleClickOutside = (event: MouseEvent) => {
  if (!isProfileOpen.value || !popupRef.value) return
  const target = event.target as Node | null
  if (target && !popupRef.value.contains(target)) {
    isProfileOpen.value = false
  }
}

onMounted(() => {
  applyThemeClass()
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

const setTheme = (mode: 'dark' | 'light') => {
  colorMode.value = mode
  applyThemeClass()
}

const toggleProfile = () => {
  isProfileOpen.value = !isProfileOpen.value
}

const handleLogout = async () => {
  isProfileOpen.value = false
  rootStore.logout()
  await navigateTo('/login')
}
</script>
