<!-- frontend/pages/problem/[slug].vue -->
<script setup>
  const route = useRoute()
  const config = useRuntimeConfig()
  
  // State management
  const userCode = ref('# بنویسید...')
  const result = ref(null)
  const isLoading = ref(false)
  
  // 1. Fetch problem details from Hono
  const { data: problem, pending, error } = await useFetch(`${config.public.apiBaseClient}/api/problems/${route.params.slug}`, {
    server: false
  })
  
  // 2. Submit code to Backend
  const handleRun = async () => {
    isLoading.value = true
    result.value = null
    try {
      const data = await $fetch(`${config.public.apiBaseClient}/api/submit`, {
        method: 'POST',
        body: {
          code: userCode.value,
          language: 'python', // We can make this dynamic later
          problemId: problem.value.id
        }
      })
      result.value = data
    } catch (err) {
      result.value = { stderr: 'Error connecting to the execution engine.' }
    } finally {
      isLoading.value = false
    }
  }
  
  // 3. UI Helpers
  const difficultyClass = (level) => {
    const map = {
      'Easy': 'text-emerald-400 bg-emerald-400/10',
      'Medium': 'text-amber-400 bg-amber-400/10',
      'Hard': 'text-rose-400 bg-rose-400/10'
    }
    return map[level] || 'text-gray-400 bg-gray-400/10'
  }
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
            <div class="prose prose-invert max-w-none text-gray-300 leading-loose text-lg">
              {{ problem.description }}
            </div>
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
              <span>Console Result</span>
              <span v-if="result" :class="result.code === 0 ? 'text-emerald-500' : 'text-rose-500'">
                Exit Status: {{ result.code }}
              </span>
            </h4>
            <div v-if="result">
              <pre v-if="result.stdout" class="text-emerald-400 whitespace-pre-wrap">{{ result.stdout }}</pre>
              <pre v-if="result.stderr" class="text-rose-400 whitespace-pre-wrap">{{ result.stderr }}</pre>
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