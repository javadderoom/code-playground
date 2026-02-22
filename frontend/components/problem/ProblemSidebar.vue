<template>
  <aside
    class="w-full lg:w-[380px] xl:w-[420px] p-4 md:p-6 overflow-y-auto border-l border-border bg-[color:var(--bg-secondary)] flex flex-col gap-6 order-2 lg:order-1 custom-scrollbar"
  >
    <div v-if="isLoading" class="animate-pulse space-y-4">
      <div class="h-4 bg-muted rounded w-1/4"></div>
      <div class="h-8 bg-muted rounded w-3/4"></div>
      <div class="h-32 bg-muted rounded"></div>
    </div>

    <template v-else-if="problem.id">
      <div class="flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <span :class="difficultyClass(problem.difficulty)" class="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border">
            سطح: {{ problem.difficulty }}
          </span>
          <span class="text-xs text-[color:var(--text-secondary)] font-mono">ID: #{{ problem.id }}</span>
        </div>
        <h1 class="text-xl md:text-2xl font-bold text-[color:var(--text-primary)]">{{ problem.title }}</h1>
        <div class="prose prose-invert max-w-none text-sm md:text-base text-[color:var(--text-secondary)] leading-relaxed" v-html="renderedDescription"></div>
      </div>

      <div class="space-y-4">
        <h3 class="font-bold flex items-center gap-2 text-sm text-[color:var(--text-primary)]">
          <span class="material-icons text-[color:var(--accent-cyan)] text-xl">lightbulb</span>
          مثال‌های آموزشی
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-3">
          <div
            v-for="(example, index) in examplesToShow"
            :key="`example-${index}`"
            class="bg-slate-50 dark:bg-black/30 p-4 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-xs space-y-2"
            dir="ltr"
          >
            <div class="flex justify-between"><span class="text-slate-400">Input:</span> <span class="text-slate-700 dark:text-slate-300">{{ example.input }}</span></div>
            <div class="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-2"><span class="text-slate-400">Output:</span> <span class="text-emerald-500 dark:text-emerald-400 font-bold">{{ example.output }}</span></div>
          </div>
        </div>
      </div>

      <div class="mt-auto pt-6 border-t border-border">
        <div class="p-5 rounded-2xl border border-white/10 relative overflow-hidden reward-gradient group">
          <div class="absolute -right-4 -bottom-4 opacity-15 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none">
            <span style="font-size: 60px;" class="material-icons text-[color:var(--text-primary)]">military_tech</span>
          </div>
          <h4 class="text-[10px] font-bold text-[color:var(--text-secondary)] mb-4 uppercase tracking-[0.2em]">پاداش موفقیت</h4>
          <div class="flex items-center gap-6">
            <div class="flex flex-col">
              <span class="text-xs text-[color:var(--text-secondary)]">امتیاز تجربه</span>
              <div class="flex items-center gap-1.5">
                <span class="material-icons text-[color:var(--xp)] text-xl">grade</span>
                <span class="font-bold text-[color:var(--text-primary)]">50+ XP</span>
              </div>
            </div>
            <div class="flex flex-col">
              <span class="text-xs text-[color:var(--text-secondary)]">سکه طلا</span>
              <div class="flex items-center gap-1.5">
                <span class="material-icons text-[color:var(--coins)] text-xl">paid</span>
                <span class="font-bold text-[color:var(--text-primary)]">10+</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </aside>
</template>

<script setup lang="ts">
import type { Problem } from '../../types/types'
import { computed } from 'vue'

type ParsedExample = { input: string; output: string }

const props = defineProps<{
  problem: Problem
  isLoading: boolean
  renderedDescription: string
}>()

const difficultyClass = (level: 'Easy' | 'Medium' | 'Hard') => {
  const map: Record<'Easy' | 'Medium' | 'Hard', string> = {
    Easy: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    Medium: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    Hard: 'text-rose-400 bg-rose-500/10 border-rose-500/30'
  }
  return map[level]
}

const fallbackExamples: ParsedExample[] = [
  { input: 'a=3, b=2', output: '5' },
  { input: 'a=10, b=20', output: '30' }
]

const examplesToShow = computed(() => {
  if (Array.isArray(props.problem.examples) && props.problem.examples.length > 0) {
    return props.problem.examples.slice(0, 2).map((example) => ({
      input: String(example.input ?? '').trim(),
      output: String(example.output ?? '').trim()
    }))
  }

  return fallbackExamples
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #30363d; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #484f58; }

.reward-gradient {
  background: linear-gradient(
    140deg,
    rgba(168, 85, 247, 0.20) 0%,
    rgba(168, 85, 247, 0.08) 40%,
    rgba(6, 182, 212, 0.12) 75%,
    rgba(6, 182, 212, 0.04) 100%
  );
}

:global(.light) .reward-gradient {
  background: linear-gradient(
    140deg,
    rgba(126, 34, 206, 0.14) 0%,
    rgba(126, 34, 206, 0.06) 40%,
    rgba(8, 145, 178, 0.12) 75%,
    rgba(8, 145, 178, 0.04) 100%
  );
}
</style>
