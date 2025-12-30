<!-- frontend/pages/problem/[slug].vue -->
<script setup lang="ts">
  import { marked } from 'marked'
  import DOMPurify from 'dompurify'
  import type { SubmissionResult, Problem } from '../../../types/types'
  
  const route = useRoute()
  const config = useRuntimeConfig()
  
  // State management
  const userCode = ref('# بنویسید...')
  const result = ref<SubmissionResult | null>(null)
  const isLoading = ref(false)
  
  // 1. Fetch problem details from Hono
  const { data: problem, pending, error } = await useFetch<Problem>(`${config.public.apiBaseClient}/api/problems/${route.params.slug}`, {
    server: false,
    onResponse({ response }) {
      if (response.ok && response._data?.starterCode) {
        userCode.value = response._data.starterCode
      }
    }
  })
  
  // 2. Submit code to Backend
  const handleRun = async () => {
    if (!problem.value) return
    
    isLoading.value = true
    result.value = null
    try {
      const data = await $fetch<SubmissionResult>(`${config.public.apiBaseClient}/api/judge/submit`, {
        method: 'POST',
        body: {
          code: userCode.value,
          language: 'python', // We can make this dynamic later
          problemId: problem.value.id
        }
      })
      result.value = data
    } catch (err) {
      result.value = { 
        status: 'Error' as const,
        error: 'Error connecting to the execution engine.',
        results: []
      }
    } finally {
      isLoading.value = false
    }
  }
  
  // 3. UI Helpers
  const difficultyClass = (level: 'Easy' | 'Medium' | 'Hard') => {
    const map: Record<'Easy' | 'Medium' | 'Hard', string> = {
      'Easy': 'text-emerald-400 bg-emerald-400/10',
      'Medium': 'text-amber-400 bg-amber-400/10',
      'Hard': 'text-rose-400 bg-rose-400/10'
    }
    return map[level] || 'text-gray-400 bg-gray-400/10'
  }
  
  // 4. Markdown rendering (with HTML sanitization)
  const renderedDescription = computed(() => {
    if (!problem.value?.description) return ''
    const html = marked.parse(problem.value.description) as string
    return DOMPurify.sanitize(html)
  })
  </script>
  
  <template>
    <div class="h-screen flex flex-col bg-[#0d1117] text-gray-300 overflow-hidden" dir="rtl">
      <!-- Header -->
      <header class="h-14 border-b border-gray-800 flex items-center justify-between px-6 bg-[#161b22] shrink-0">
        <div class="flex items-center gap-6">
          <NuxtLink to="/" class="text-gray-400 hover:text-white transition">← بازگشت</NuxtLink>
          <h1 v-if="problem" class="text-lg font-semibold text-white">{{ problem.title }}</h1>
        </div>
        <div class="flex gap-3">
          <button 
            @click="handleRun" 
            :disabled="isLoading || pending"
            class="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-5 py-1.5 rounded-md font-bold transition-all shadow-lg shadow-emerald-900/20"
          >
            <span v-if="isLoading" class="animate-spin text-lg">↻</span>
            <span>اجرای کد</span>
          </button>
        </div>
      </header>
  
      <!-- Main Body -->
      <div class="flex-1 flex overflow-hidden">
        <!-- Right Pane: Description (Persian) -->
        <section class="w-1/2 overflow-y-auto border-l border-gray-800 p-8 custom-scrollbar">
          <div v-if="pending" class="animate-pulse space-y-4">
            <div class="h-4 bg-gray-800 rounded w-1/4"></div>
            <div class="h-8 bg-gray-800 rounded w-3/4"></div>
            <div class="h-32 bg-gray-800 rounded"></div>
          </div>
  
          <div v-else-if="problem">
            <span :class="difficultyClass(problem.difficulty)" class="px-2 py-1 rounded text-xs font-medium uppercase tracking-wider">
              {{ problem.difficulty }}
            </span>
            <h2 class="text-3xl font-bold mt-4 mb-6 text-white">{{ problem.title }}</h2>
            <div class="prose prose-invert max-w-none text-gray-300 leading-loose text-lg" v-html="renderedDescription"></div>
          </div>
        </section>
  
        <!-- Left Pane: Editor (English/Code) -->
        <section class="w-1/2 flex flex-col bg-[#0d1117]" dir="ltr">
          <!-- Editor Container -->
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
  
          <!-- Result Console -->
          <div class="h-64 bg-[#010409] p-5 font-mono text-sm overflow-y-auto custom-scrollbar">
            <h4 class="text-gray-500 text-xs mb-3 flex justify-between items-center uppercase tracking-widest">
              <span>Test Results</span>
              <span v-if="result" :class="result.status === 'Accepted' ? 'text-emerald-500' : 'text-rose-500'">
                {{ result.status }}
              </span>
            </h4>
            <div v-if="result">
              <!-- Runtime Error -->
              <div v-if="result.error" class="mb-4">
                <div class="text-rose-400 font-semibold mb-2">Runtime Error:</div>
                <pre class="text-rose-300 whitespace-pre-wrap text-xs">{{ result.error }}</pre>
              </div>
              
              <!-- Logs -->
              <div v-if="result.logs" class="mb-4">
                <div class="text-gray-400 font-semibold mb-2">Logs:</div>
                <pre class="text-gray-300 whitespace-pre-wrap text-xs">{{ result.logs }}</pre>
              </div>
              
              <!-- Test Results -->
              <div v-if="result.results && result.results.length > 0" class="space-y-3">
                <div 
                  v-for="(test, index) in result.results" 
                  :key="test.id || index"
                  class="border-l-2 pl-3"
                  :class="test.passed ? 'border-emerald-500' : 'border-rose-500'"
                >
                  <div class="flex items-center gap-2 mb-1">
                    <span :class="test.passed ? 'text-emerald-400' : 'text-rose-400'">
                      {{ test.passed ? '✓' : '✗' }}
                    </span>
                    <span class="text-gray-400 text-xs">Test Case {{ index + 1 }}</span>
                  </div>
                  <div v-if="!test.passed || test.actual" class="text-xs space-y-1 mt-2">
                    <div v-if="test.input && test.input !== '[Hidden]'">
                      <span class="text-gray-500">Input:</span>
                      <span class="text-gray-300 ml-2">{{ test.input }}</span>
                    </div>
                    <div v-if="test.expected && test.expected !== '[Hidden]'">
                      <span class="text-gray-500">Expected:</span>
                      <span class="text-emerald-300 ml-2">{{ test.expected }}</span>
                    </div>
                    <div v-if="test.actual && test.actual !== '[Hidden]'">
                      <span class="text-gray-500">Got:</span>
                      <span :class="[test.passed ? 'text-emerald-300' : 'text-rose-300', 'ml-2']">{{ test.actual }}</span>
                    </div>
                    <div v-if="test.error" class="text-rose-400 mt-1">
                      <span class="text-gray-500">Error:</span>
                      <span class="ml-2">{{ test.error }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-gray-600 italic mt-2">
              Write your solution and click "Run" to see the output.
            </div>
          </div>
        </section>
      </div>
    </div>
  </template>
  
  <style scoped>
  .custom-scrollbar::-webkit-scrollbar { width: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #30363d; border-radius: 10px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #484f58; }
  </style>