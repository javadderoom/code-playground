<template>
  <div class="p-4 pt-4 lg:h-[320px]">
    <div class="h-full bg-black rounded-xl border border-slate-700/50 flex flex-col overflow-hidden shadow-2xl font-mono text-sm" dir="ltr">
      <div class="px-4 py-2 bg-[#1a1a1a] border-b border-white/10 flex items-center justify-between">
        <div class="flex items-center gap-1.5">
          <div class="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
          <div class="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
          <div class="w-3 h-3 rounded-full bg-[#27c93f]"></div>
          <span class="ml-4 text-[11px] text-slate-400 font-bold tracking-widest uppercase">Bash - Test Results</span>
        </div>
        <div class="flex items-center gap-3">
          <span v-if="result && failCount > 0" class="text-[10px] text-red-400 font-bold flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
            {{ failCount }} FAIL
          </span>
          <span v-else-if="result && passCount > 0" class="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            {{ passCount }} PASS
          </span>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto overflow-x-hidden p-5 text-sm leading-relaxed bg-[#0d0d0d] custom-scrollbar">
        <div v-if="result" class="space-y-6">
          <div
            v-for="(test, index) in result.results"
            :key="test.id || index"
            class="relative"
          >
            <div class="flex items-center gap-3 mb-3">
              <span class="text-green-500">➜</span>
              <span class="text-white font-bold">test_case_{{ String(index + 1).padStart(2, '0') }}</span>
              <span :class="test.passed ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : 'text-red-400 bg-red-500/10 border-red-500/30'" class="font-bold px-2 py-0.5 rounded border text-xs uppercase">
                {{ test.passed ? 'Passed' : 'Failed' }}
              </span>
              <span class="text-slate-600 text-[10px] ml-auto" v-if="test.time">time: {{ test.time }}ms</span>
            </div>

            <div class="ml-4 space-y-1.5 border-l border-slate-800 pl-4 py-1 text-xs">
              <div v-if="test.input && test.input !== '[Hidden]'" class="flex">
                <span class="w-24 text-slate-500 shrink-0 italic">input:</span>
                <span class="text-blue-300 font-bold">{{ test.input }}</span>
              </div>
              <div v-if="test.expected && test.expected !== '[Hidden]'" class="flex">
                <span class="w-24 text-slate-500 shrink-0 italic">expected:</span>
                <span class="text-green-400 font-bold">{{ test.expected }}</span>
              </div>
              <div v-if="test.actual && test.actual !== '[Hidden]'" class="flex">
                <span class="w-24 text-slate-500 shrink-0 italic">actual:</span>
                <span :class="test.passed ? 'text-emerald-300 font-bold' : 'text-red-400 font-bold underline decoration-red-500/30 decoration-wavy'">{{ test.actual }}</span>
              </div>
              <div v-if="test.error" class="mt-3 p-3 bg-red-950/20 border border-red-900/40 text-red-300 rounded-md">
                <div class="flex items-start gap-2">
                  <span class="text-red-500">!</span>
                  <span class="font-bold">AssertionError:</span>
                </div>
                <div class="mt-1 text-red-400/80 pl-4">{{ test.error }}</div>
              </div>
            </div>
          </div>

          <div v-if="result.error" class="p-3 bg-red-950/20 border border-red-900/40 text-red-300 rounded-md">
            <div class="flex items-start gap-2">
              <span class="text-red-500">!</span>
              <span class="font-bold">Runtime Error:</span>
            </div>
            <pre class="whitespace-pre-wrap text-xs mt-1 pl-4">{{ result.error }}</pre>
          </div>

          <div v-if="result.logs" class="p-3 bg-slate-900/40 border border-slate-700/40 text-slate-300 rounded-md">
            <div class="font-bold mb-1">Logs</div>
            <pre class="whitespace-pre-wrap text-xs">{{ result.logs }}</pre>
          </div>
        </div>

        <div v-else class="text-[color:var(--text-secondary)] italic mt-2">
          Write your solution and click "Run" to see the output.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SubmissionResult } from '../../types/types'
import { computed } from 'vue'

const props = defineProps<{
  result: SubmissionResult | null
}>()

const passCount = computed(() => props.result?.results?.filter((t) => t.passed).length ?? 0)
const failCount = computed(() => props.result?.results?.filter((t) => !t.passed).length ?? 0)
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #30363d; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #484f58; }
</style>
