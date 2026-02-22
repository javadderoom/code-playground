// frontend/app.vue
<template>
  <div class="antialiased font-sans min-h-screen bg-background text-foreground">
    <ClientOnly>
      <GlobalHeader v-if="!hideHeader" />
      <template #fallback>
        <div v-if="!hideHeader" class="h-16 border-b border-border bg-[color:var(--bg-secondary)]/90"></div>
      </template>
    </ClientOnly>
    <NuxtPage />

    <!-- Toast notifications -->
    <VueSonner
      position="top-center"
      dir="rtl"
      :duration="4000"
      :close-button="true"
    />
  </div>
</template>

<script setup lang="ts">
import { Toaster as VueSonner } from 'vue-sonner'
import GlobalHeader from '../components/layout/GlobalHeader.vue'

const route = useRoute()
const hideHeader = computed(() => route.path === '/login' || route.path === '/register')
</script>
