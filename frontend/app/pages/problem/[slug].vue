<template>
  <!-- Ensure h-screen and flex are working -->
  <div class="h-screen flex flex-col bg-[#0f172a] text-slate-200" dir="rtl">
    
    <!-- Navbar: Fixed Height -->
    <nav class="h-16 border-b border-slate-800 flex justify-between items-center px-6 bg-[#1e293b] shrink-0">
      <div class="flex items-center gap-6">
        <NuxtLink to="/" class="text-emerald-500 hover:text-emerald-400 font-bold">← لیست مسائل</NuxtLink>
        <h1 class="text-xl font-bold">{{ problem?.title }}</h1>
      </div>
      <button @click="submitCode" :disabled="loading" class="bg-emerald-600 hover:bg-emerald-500 px-8 py-2 rounded-lg font-bold transition-all disabled:opacity-50">
        {{ loading ? 'در حال پردازش...' : 'ارسال کد' }}
      </button>
    </nav>

    <!-- Content Area: Uses flex-1 to fill remaining space -->
    <div class="flex-1 flex overflow-hidden">
      
      <!-- Right Pane: Description -->
      <div class="w-1/2 p-8 overflow-y-auto border-l border-slate-800">
        <div v-if="problem">
          <span class="px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-emerald-400 mb-4 inline-block">
            {{ problem.difficulty }}
          </span>
          <h2 class="text-3xl font-bold mb-6">{{ problem.title }}</h2>
          <p class="text-lg leading-relaxed text-slate-300 whitespace-pre-wrap">{{ problem.description }}</p>
        </div>
      </div>

      <!-- Left Pane: Editor (LTR) -->
      <div class="w-1/2 flex flex-col bg-[#1e293b]" dir="ltr">
        <div class="flex-1 w-full relative min-h-[400px]">
          <!-- IMPORTANT: Use a wrapper with h-full -->
          <MonacoEditor
            v-model="userCode"
            lang="python"
            :options="{ 
              theme: 'vs-dark', 
              fontSize: 18, 
              minimap: { enabled: false },
              automaticLayout: true,
              scrollBeyondLastLine: false,
            }"
            class="absolute inset-0" 
          />
        </div>

        <!-- Terminal: Fixed Height -->
        <div class="h-64 bg-black p-4 font-mono border-t border-slate-800">
          <p class="text-slate-500 text-xs mb-2 uppercase tracking-widest">Console Output</p>
          <div class="overflow-y-auto h-48">
             <pre v-if="result" :class="result.code === 0 ? 'text-green-400' : 'text-red-400'" class="whitespace-pre-wrap">{{ result.stdout || result.stderr }}</pre>
             <p v-else class="text-slate-600 italic">...برای مشاهده نتیجه، کد را ارسال کنید</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
  
  <script setup>
  const route = useRoute()
  const config = useRuntimeConfig()


  const userCode = ref("# کد خود را اینجا بنویسید\nimport sys\n\ninput_data = sys.stdin.read().split()\n# logic here...")
  const loading = ref(false)
  const result = ref(null)
  
  // 1. Fetch all problems and find the one with matching slug
  const baseURL = process.server
    ? config.public.apiBaseSSR
    : config.public.apiBaseClient

  const { data: response } = await useFetch('/api/problems', {
    baseURL
  })

  const problems = computed(() => response.value?.problems || [])
  const problem = computed(() =>
    problems.value.find(p => p.slug === route.params.slug)
  )
  
  const difficultyClass = (d) => {
    if (d === 'Easy') return 'text-green-400 bg-green-900/30'
    if (d === 'Medium') return 'text-yellow-400 bg-yellow-900/30'
    return 'text-red-400 bg-red-900/30'
  }
  
  const submitCode = async () => {
    loading.value = true
    result.value = null
    try {
      const data = await $fetch('/api/judge/execute', {
        baseURL,
        method: 'POST',
        body: {
          language: 'python',
          version: '3.10.0',
          files: [{
            name: 'main.py',
            content: userCode.value
          }]
        }
      })
      result.value = data
    } catch (err) {
      result.value = { stderr: 'خطا در برقراری ارتباط با سرور', code: 1 }
    } finally {
      loading.value = false
    }
  }
  </script>
  
  <style>
  /* Custom Scrollbar for a "dark" look */
  ::-webkit-scrollbar { width: 8px; }
  ::-webkit-scrollbar-track { background: #0f172a; }
  ::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: #475569; }
  </style>