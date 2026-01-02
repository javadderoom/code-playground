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
    <div class="p-8 bg-dark min-h-screen text-main" dir="rtl">
      <h1 class="text-3xl font-bold text-secondary mb-8">لیست مسائل</h1>

      <!-- Pending State -->
      <div v-if="pending" class="text-muted animate-pulse">در حال دریافت لیست...</div>

      <!-- Error State -->
      <div v-else-if="error" class="text-red-400 p-4 bg-card-bg/20 rounded border border-red-400/20">
         خطا در اتصال به بک‌انند: {{ error.message }}
      </div>

      <!-- Data State: Check for problems AND problems.length -->
      <div v-else-if="problems && Array.isArray(problems) && problems.length > 0" class="grid gap-4">
        <NuxtLink
          v-for="p in problems"
          :key="p.id"
          :to="p?.slug ? `/problem/${p.slug}` : '#'"
          class="p-6 bg-card-bg rounded-xl border border-border-gray hover:border-secondary transition-all"
        >
          <div v-if="p" class="flex justify-between items-center">
            <h2 class="text-xl font-bold text-main">{{ p.title }}</h2>
            <span class="text-sm px-2 py-1 bg-border-gray text-main rounded">{{ p.difficulty }}</span>
          </div>
        </NuxtLink>
      </div>

      <!-- Empty State -->
      <div v-else class="text-muted">
        دیتابیس خالی است.
        <UiButton variant="outline" class="mt-4">Reload</UiButton>
      </div>
    </div>
  </template>