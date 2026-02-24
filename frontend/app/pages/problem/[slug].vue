<script setup lang="ts">
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import type { SubmissionResult } from '../../../types/types'
import { useRootStore } from '../../stores'
import ProblemSidebar from '../../../components/problem/ProblemSidebar.vue'
import ResultTerminal from '../../../components/problem/ResultTerminal.vue'
import FloatingHelpButton from '../../../components/problem/FloatingHelpButton.vue'
import SubmissionRewardOverlay from '../../../components/problem/SubmissionRewardOverlay.vue'

definePageMeta({ middleware: 'auth-client' })

const route = useRoute()
const rootStore = useRootStore()

const userCode = ref('# write your solution here')
const result = ref<SubmissionResult | null>(null)
const isLoading = ref(false)
const showRewardOverlay = ref(false)

const problem = computed(() => rootStore.state.problem)
const isProblemLoading = computed(() => rootStore.state.isProblemLoading)
const XP_TABLE = { Easy: 10, Medium: 30, Hard: 50 } as const
const COINS_TABLE = { Easy: 5, Medium: 15, Hard: 25 } as const

const rewardValues = computed(() => {
  const difficulty = (problem.value.difficulty ?? 'Easy') as keyof typeof XP_TABLE
  return {
    xp: XP_TABLE[difficulty] ?? XP_TABLE.Easy,
    coins: COINS_TABLE[difficulty] ?? COINS_TABLE.Easy
  }
})

const userRewardSnapshot = computed(() => {
  const rawUser = rootStore.state.user as { value?: any } | null | undefined
  const user = rawUser && typeof rawUser === 'object' && 'value' in rawUser ? rawUser.value : rawUser
  return {
    totalXp: Number(user?.xp ?? 0),
    totalCoins: Number(user?.coins ?? 0),
    streakDays: Number(user?.streakDays ?? 0)
  }
})

const submissionReward = computed(() => {
  const submission = result.value
  return {
    xpEarned: Number(submission?.xpEarned ?? 0),
    coinsEarned: Number(submission?.coinsEarned ?? 0),
    totalXp: Number(submission?.totalXp ?? userRewardSnapshot.value.totalXp),
    totalCoins: Number(submission?.totalCoins ?? userRewardSnapshot.value.totalCoins),
    streakDays: Number(submission?.streakDays ?? userRewardSnapshot.value.streakDays)
  }
})

const fireSubmitConfetti = async () => {
  if (!import.meta.client) return

  const { default: confetti } = await import('canvas-confetti')
  const options = {
    spread: 75,
    startVelocity: 42,
    gravity: 0.9,
    ticks: 240,
    zIndex: 200
  }

  confetti({
    ...options,
    particleCount: 120,
    origin: { y: 0.62, x: 0.25 },
    colors: ['#a855f7', '#06b6d4', '#facc15', '#fb923c']
  })

  confetti({
    ...options,
    particleCount: 120,
    origin: { y: 0.62, x: 0.75 },
    colors: ['#a855f7', '#06b6d4', '#facc15', '#fb923c']
  })
}

watch(
  () => rootStore.state.problem.starterCode,
  (starterCode) => {
    if (typeof starterCode === 'string' && starterCode.trim().length > 0) {
      userCode.value = starterCode
    }
  },
  { immediate: true }
)

onMounted(async () => {
  rootStore.ensureAuth?.()
  try {
    await rootStore.fetchProblem(route.params.slug as string)
  } catch (err) {
    console.error('Failed to fetch problem:', err)
  }
})

const handleRun = async () => {
  if (!rootStore.state.problem.id) return

  isLoading.value = true
  result.value = null
  showRewardOverlay.value = false
  try {
    result.value = await rootStore.runCode(userCode.value, 'python')
  } finally {
    isLoading.value = false
  }
}

const handleSubmit = async () => {
  if (!rootStore.state.problem.id) return

  isLoading.value = true
  result.value = null
  showRewardOverlay.value = false
  try {
    result.value = await rootStore.submitCode(userCode.value, 'python')
    if (result.value?.status === 'Accepted') {
      showRewardOverlay.value = true
      void fireSubmitConfetti()
    }
  } finally {
    isLoading.value = false
  }
}

const renderedDescription = computed(() => {
  if (!problem.value.description) return ''
  return DOMPurify.sanitize(marked.parse(problem.value.description) as string)
})
</script>

<template>
  <div class="min-h-[calc(100vh-4rem)] pb-16 md:pb-0 flex flex-col bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] overflow-x-hidden" dir="rtl">
    <main class="flex-1 flex flex-col lg:flex-row min-w-0">
      <ProblemSidebar
        :problem="problem"
        :is-loading="isProblemLoading"
        :rendered-description="renderedDescription"
        :reward-values="rewardValues"
      />

      <section class="flex-1 min-w-0 flex flex-col bg-[color:var(--bg-primary)] order-1 lg:order-2" dir="ltr">
        <div class="p-3 md:p-4 md:pb-0 flex-1 flex flex-col min-h-[420px] md:min-h-[450px]">
          <div class="flex-1 rounded-2xl overflow-hidden flex flex-col shadow-xl bg-[#1e1e1e] border border-slate-800/60">
            <div class="flex items-center justify-between px-4 py-3 bg-[#252525] border-b border-white/5" dir="ltr">
              <div class="flex items-center gap-3">
                <div class="flex gap-1.5">
                  <div class="w-3 h-3 rounded-full bg-red-500/70"></div>
                  <div class="w-3 h-3 rounded-full bg-yellow-500/70"></div>
                  <div class="w-3 h-3 rounded-full bg-green-500/70"></div>
                </div>
                <div class="flex items-center gap-2 bg-[#1e1e1e] px-4 py-1.5 rounded-t-lg border-t-2 border-secondary ml-2">
                  <span class="material-icons text-sm text-yellow-500">code</span>
                  <span class="text-xs font-mono text-slate-300">solution.py</span>
                </div>
              </div>
            </div>

            <div class="flex-1 relative border-b border-gray-800">
              <MonacoEditor
                v-model="userCode"
                lang="python"
                :options="{ 
                  theme: 'vs-dark', 
                  fontSize: 16, 
                  lineNumbers: 'on',
                  minimap: { enabled: false },
                  automaticLayout: true,
                  padding: { top: 16 },
                  scrollBeyondLastLine: false,
                  fontFamily: 'JetBrains Mono, Menlo, Monaco, Courier New, monospace'
                }"
                class="absolute inset-0"
              />
            </div>

            <div class="p-3 md:p-4 bg-[#161616] flex justify-end border-t border-white/5" dir="ltr">
              <div class="flex w-full gap-2 sm:w-auto">
                <button
                  :disabled="isLoading || isProblemLoading"
                  class="cursor-pointer flex-1 sm:flex-none px-4 md:px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-bold transition-all flex items-center justify-center gap-2 text-sm"
                  @click="handleRun"
                >
                  <span v-if="isLoading" class="material-icons text-lg animate-spin">refresh</span>
                  <span v-else class="material-icons text-lg">play_arrow</span>
                  <span class="hidden sm:inline">Run</span>
                </button>
                <button
                  :disabled="isLoading || isProblemLoading"
                  class="cursor-pointer flex-1 sm:flex-none px-6 md:px-8 py-2.5 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-bold shadow-lg shadow-[0_0_15px_rgba(168,85,247,0.35)] transition-all flex items-center justify-center gap-2 text-sm"
                  @click="handleSubmit"
                >
                  <span v-if="isLoading" class="material-icons text-lg animate-spin">refresh</span>
                  <span v-else class="material-icons text-lg">check_circle</span>
                  <span>Submit</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <ResultTerminal :result="result" />
      </section>
    </main>

    <SubmissionRewardOverlay
      :open="showRewardOverlay"
      :problem-title="problem.title"
      :xp-earned="submissionReward.xpEarned"
      :coins-earned="submissionReward.coinsEarned"
      :total-xp="submissionReward.totalXp"
      :streak-days="submissionReward.streakDays"
      @close="showRewardOverlay = false"
    />

    <FloatingHelpButton />
  </div>
</template>
