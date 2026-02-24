<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-[90] overflow-hidden">
      <div class="absolute inset-0 bg-black/75 backdrop-blur-sm" @click="emit('close')"></div>

      <div
        dir="rtl"
        class="relative h-full w-full overflow-hidden bg-[color:var(--bg-secondary)]"
      >
        <div class="pointer-events-none absolute inset-0 overflow-hidden">
          <div class="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[color:var(--accent-purple)]/20 blur-3xl"></div>
          <div class="absolute -left-24 -bottom-24 h-64 w-64 rounded-full bg-[color:var(--accent-cyan)]/20 blur-3xl"></div>
        </div>

        <button
          type="button"
          class="absolute left-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/20 text-[color:var(--text-secondary)] transition-colors hover:text-[color:var(--text-primary)] md:left-4 md:top-4"
          aria-label="Close reward dialog"
          @click="emit('close')"
        >
          <span class="material-icons text-base">close</span>
        </button>

        <div class="absolute inset-0 overflow-y-auto overflow-x-hidden">
          <div class="mx-auto w-full max-w-4xl px-4 pt-4 pb-0 md:p-10">
          <div class="md:hidden flex flex-col">
            <div class="relative mb-6 flex justify-center">
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="h-44 w-44 rounded-full bg-primary/25 blur-3xl"></div>
              </div>
              <div class="relative flex h-44 w-44 items-center justify-center rounded-full border border-primary/30 bg-white/5">
                <span
                  class="material-icons leading-none text-[color:var(--coins)]"
                  style="font-size: 5rem; line-height: 1;"
                >emoji_events</span>
              </div>
            </div>

            <div class="mb-8 text-center">
              <h2 class="text-3xl font-black tracking-tight text-[color:var(--text-primary)]">قبولی ثبت شد</h2>
              <p class="mt-1 text-sm font-medium text-primary">ماموریت با موفقیت به پایان رسید</p>
            </div>

            <div class="w-full max-w-sm self-center space-y-3">
              <div class="flex items-center gap-3 rounded-2xl border border-[color:var(--coins)]/45 bg-gradient-to-l from-[color:var(--coins)]/25 to-[color:var(--coins)]/8 p-4 shadow-[0_0_20px_rgba(250,204,21,0.22)]">
                <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[color:var(--coins)] text-black">
                  <span class="material-icons text-2xl">emoji_events</span>
                </div>
                <div class="min-w-0">
                  <p class="truncate text-base font-bold text-[color:var(--text-primary)]">نشان منطق‌دان</p>
                  <p class="text-xs text-[color:var(--coins)]">جایگاه نشان‌ها به‌زودی فعال می‌شود</p>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="rounded-2xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-sm">
                  <div class="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--xp)]/20">
                    <span class="material-icons text-xl text-[color:var(--xp)]">grade</span>
                  </div>
                  <p class="text-lg font-black text-[color:var(--text-primary)]">+{{ safeXpEarned }}</p>
                  <p class="text-[10px] uppercase tracking-wider text-[color:var(--text-secondary)]">XP</p>
                </div>

                <div class="rounded-2xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-sm">
                  <div class="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--coins)]/20">
                    <span class="material-icons text-xl text-[color:var(--coins)]">paid</span>
                  </div>
                  <p class="text-lg font-black text-[color:var(--text-primary)]">+{{ safeCoinsEarned }}</p>
                  <p class="text-[10px] uppercase tracking-wider text-[color:var(--text-secondary)]">Coins</p>
                </div>
              </div>
            </div>

            <div class="mt-6 w-full max-w-sm self-center rounded-2xl border border-white/10 bg-white/5 p-5">
              <div class="mb-3 flex items-center justify-between">
                <div class="flex items-center gap-1.5">
                  <span class="text-xs text-[color:var(--text-secondary)]">سطح</span>
                  <span class="text-lg font-black text-[color:var(--text-primary)]">{{ fromLevel }}</span>
                </div>
                <div class="rounded-full bg-primary/20 px-2 py-0.5">
                  <span class="text-xs font-bold text-primary">{{ progressPercent }}%</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <span class="text-xs text-[color:var(--text-secondary)]">سطح</span>
                  <span class="text-lg font-black text-[color:var(--text-primary)]">{{ toLevel }}</span>
                </div>
              </div>

              <div class="mb-3 h-3 w-full overflow-hidden rounded-full bg-[color:var(--bg-primary)]/70">
                <div class="h-full rounded-full bg-gradient-to-l from-primary to-[color:var(--coins)]" :style="{ width: `${progressPercent}%` }"></div>
              </div>

              <div class="flex items-center justify-center gap-1.5 text-xs text-[color:var(--text-secondary)]">
                <span class="material-icons text-sm">trending_up</span>
                <span>{{ remainingXp }} XP تا مرحله بعدی</span>
              </div>
            </div>

            <button
              type="button"
              class="mt-5 w-full max-w-sm self-center cursor-pointer rounded-2xl bg-primary py-4 text-base font-bold text-white shadow-[0_8px_24px_rgba(168,85,247,0.3)] transition-colors hover:bg-primary/90"
              @click="emit('close')"
            >
              <span class="inline-flex items-center gap-2">
                <span>ادامه مسیر یادگیری</span>
                <span class="material-icons text-base">arrow_back</span>
              </span>
            </button>
          </div>

          <div class="hidden md:block">
            <div class="flex flex-col items-center text-center">
              <div class="mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-[color:var(--coins)]/40 bg-[color:var(--coins)]/10">
                <span class="material-icons text-4xl text-[color:var(--coins)]">emoji_events</span>
              </div>
              <h2 class="text-4xl font-black tracking-tight text-[color:var(--text-primary)]">قبولی ثبت شد</h2>
              <p class="mt-2 text-base text-[color:var(--text-secondary)]">
                مسئله
                <span class="font-bold text-[color:var(--text-primary)]">{{ titleLabel }}</span>
                با موفقیت قبول شد.
              </p>
              <p class="mt-1 text-sm text-[color:var(--text-secondary)]">{{ subtitle }}</p>
            </div>

            <div class="mt-8 grid grid-cols-3 gap-4">
              <div class="rounded-2xl border border-white/10 bg-white/5 p-5 text-center">
                <div class="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--xp)]/15">
                  <span class="material-icons text-3xl text-[color:var(--xp)]">grade</span>
                </div>
                <p class="text-2xl font-black text-[color:var(--text-primary)]">+{{ safeXpEarned }} XP</p>
                <p class="mt-1 text-xs uppercase tracking-widest text-[color:var(--text-secondary)]">Experience</p>
              </div>

              <div class="rounded-2xl border border-[color:var(--coins)]/45 bg-gradient-to-l from-[color:var(--coins)]/25 to-[color:var(--coins)]/8 p-5 text-center shadow-[0_0_30px_rgba(250,204,21,0.2)]">
                <div class="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--coins)] text-black">
                  <span class="material-icons text-3xl">emoji_events</span>
                </div>
                <p class="text-2xl font-black text-[color:var(--text-primary)]">نشان منطق‌دان</p>
                <p class="mt-1 text-xs uppercase tracking-widest text-[color:var(--coins)]">Badge Placeholder</p>
              </div>

              <div class="rounded-2xl border border-white/10 bg-white/5 p-5 text-center">
                <div class="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--coins)]/20">
                  <span class="material-icons text-3xl">paid</span>
                </div>
                <p class="text-2xl font-black text-[color:var(--text-primary)]">+{{ safeCoinsEarned }}</p>
                <p class="mt-1 text-xs uppercase tracking-widest text-[color:var(--text-secondary)]">Coins</p>
              </div>
            </div>

            <div class="mt-7 rounded-2xl border border-white/10 bg-white/5 p-5">
              <div class="mb-3 flex items-end justify-between gap-3">
                <div class="flex items-baseline gap-2">
                  <span class="text-sm text-[color:var(--text-secondary)]">لول</span>
                  <span class="text-2xl font-black text-[color:var(--text-primary)]">{{ fromLevel }}</span>
                </div>
                <span class="text-sm font-bold text-primary">{{ progressPercent }}%</span>
                <div class="flex items-baseline gap-2">
                  <span class="text-sm text-[color:var(--text-secondary)]">لول</span>
                  <span class="text-2xl font-black text-[color:var(--text-primary)]">{{ toLevel }}</span>
                </div>
              </div>

              <div class="h-3 w-full overflow-hidden rounded-full bg-[color:var(--bg-primary)]/70">
                <div
                  class="h-full rounded-full bg-gradient-to-l from-primary to-[color:var(--coins)] transition-all duration-700"
                  :style="{ width: `${progressPercent}%` }"
                ></div>
              </div>

              <p class="mt-3 text-center text-sm text-[color:var(--text-secondary)]">
                {{ remainingXp }} XP تا مرحله بعدی
              </p>
            </div>

            <div class="mt-7 flex justify-center">
              <button
                type="button"
                class="cursor-pointer rounded-xl bg-primary px-8 py-3 text-sm font-bold text-white shadow-[0_0_20px_rgba(168,85,247,0.35)] transition-colors hover:bg-primary/90"
                @click="emit('close')"
              >
                ادامه مسیر یادگیری
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'

const XP_PER_LEVEL = 200

const props = defineProps<{
  open: boolean
  problemTitle?: string
  xpEarned?: number
  coinsEarned?: number
  totalXp?: number
  streakDays?: number
}>()

const emit = defineEmits<{
  close: []
}>()

const safeXpEarned = computed(() => Math.max(0, Number(props.xpEarned ?? 0)))
const safeCoinsEarned = computed(() => Math.max(0, Number(props.coinsEarned ?? 0)))
const safeTotalXp = computed(() => Math.max(0, Number(props.totalXp ?? 0)))

const previousTotalXp = computed(() => Math.max(0, safeTotalXp.value - safeXpEarned.value))
const fromLevel = computed(() => Math.floor(previousTotalXp.value / XP_PER_LEVEL) + 1)
const toLevel = computed(() => Math.floor(safeTotalXp.value / XP_PER_LEVEL) + 1)

const currentLevelXp = computed(() => safeTotalXp.value % XP_PER_LEVEL)
const progressPercent = computed(() => Math.round((currentLevelXp.value / XP_PER_LEVEL) * 100))
const remainingXp = computed(() => {
  if (currentLevelXp.value === 0) return XP_PER_LEVEL
  return XP_PER_LEVEL - currentLevelXp.value
})

const titleLabel = computed(() => (props.problemTitle && props.problemTitle.trim() ? props.problemTitle : 'چالش جاری'))
const subtitle = computed(() => {
  if (safeXpEarned.value > 0 || safeCoinsEarned.value > 0) {
    return 'پاداش این مسئله برای اولین حل موفق محاسبه شد.'
  }
  return 'این مسئله قبلا قبول شده بود و پاداش جدیدی ثبت نشد.'
})

const initialBodyOverflow = ref('')

watch(
  () => props.open,
  (isOpen) => {
    if (!import.meta.client) return
    const body = document.body
    if (isOpen) {
      initialBodyOverflow.value = body.style.overflow
      body.style.overflow = 'hidden'
      return
    }
    body.style.overflow = initialBodyOverflow.value
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  if (!import.meta.client) return
  document.body.style.overflow = initialBodyOverflow.value
})
</script>
