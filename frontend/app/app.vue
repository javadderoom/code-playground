// frontend/app.vue
<template>
  <div class="antialiased font-sans">
    <!-- NuxtPage is the window that renders our index and [slug] pages -->
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
</script>