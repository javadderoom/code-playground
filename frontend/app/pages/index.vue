<!-- frontend/pages/index.vue -->
<script setup lang="ts">
 const config = useRuntimeConfig()

// Use different API bases for server-side vs client-side
const baseURL = process.server
  ? config.public.apiBaseSSR
  : config.public.apiBaseClient

const { data: response, pending, error } = await useFetch('/api/problems', {
  baseURL
})
const problems = computed(() => (response.value as any)?.problems || [])
  </script>
  
  <template>
    <div class="p-8 bg-gray-900 min-h-screen text-white" dir="rtl">
      <h1 class="text-3xl font-bold text-emerald-400 mb-8">لیست مسائل</h1>
  
      <!-- Pending State -->
      <div v-if="pending" class="text-gray-400 animate-pulse">در حال دریافت لیست...</div>
      
      <!-- Error State -->
      <div v-else-if="error" class="text-red-400 p-4 bg-red-900/20 rounded">
         خطا در اتصال به بک‌انند: {{ error.message }}
      </div>
  
      <!-- Data State: Check for problems AND problems.length -->
      <div v-else-if="problems && Array.isArray(problems) && problems.length > 0" class="grid gap-4">
        <NuxtLink 
          v-for="p in problems" 
          :key="p.id" 
          :to="p?.slug ? `/problem/${p.slug}` : '#'"
          class="p-6 bg-gray-800 rounded-xl border border-gray-700 hover:border-emerald-500 transition-all"
        >
          <div v-if="p" class="flex justify-between items-center">
            <h2 class="text-xl font-bold">{{ p.title }}</h2>
            <span class="text-sm px-2 py-1 bg-gray-700 rounded">{{ p.difficulty }}</span>
          </div>
        </NuxtLink>
      </div>
  
      <!-- Empty State -->
      <div v-else class="text-gray-500">دیتابیس خالی است.</div>
    </div>
  </template>