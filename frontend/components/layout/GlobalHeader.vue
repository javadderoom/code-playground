<template>
  <header dir="rtl"
    class="h-16 border-b border-border bg-[color:var(--bg-secondary)]/90 backdrop-blur-md sticky top-0 z-50 px-4 md:px-6 flex items-center justify-between"
  >
    <div class="flex items-center gap-4">
      <NuxtLink to="/" class="flex items-center gap-2">
        <span class="material-icons text-[color:var(--accent-cyan)] text-2xl">terminal</span>
        <span class="font-bold text-lg hidden sm:inline tracking-tight text-[color:var(--text-primary)]">CodeQuest</span>
      </NuxtLink>

      <div class="h-6 w-px bg-border mx-1 hidden sm:block"></div>

      <div class="flex items-center gap-4 text-xs md:text-sm font-medium">
        <div class="flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
          <span class="bg-primary/15 text-primary px-2 py-0.5 rounded text-[10px] w-fit border border-primary/30">
            سطح 12
          </span>
          <div class="w-20 md:w-32 h-1.5 bg-muted rounded-full overflow-hidden">
            <div class="bg-primary h-full w-[65%]"></div>
          </div>
        </div>
        <div class="flex items-center gap-1 text-[color:var(--coins)]">
          <span class="material-icons text-lg">paid</span>
          <span class="font-bold">1,500</span>
        </div>
      </div>
    </div>

    <div class="flex items-center gap-3">
      <button
        type="button"
        class="flex items-center justify-center p-2 rounded-full border border-border hover:bg-muted transition-all text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]"
        @click="toggleTheme"
      >
        <span class="material-icons text-xl">{{ isLight ? 'dark_mode' : 'light_mode' }}</span>
      </button>

      <div class="w-9 h-9 rounded-full bg-muted overflow-hidden border-2 border-primary">
        <div class="w-full h-full flex items-center justify-center text-xs font-bold text-[color:var(--text-primary)]">
          U
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const colorMode = useState<'dark' | 'light'>('color-mode', () => 'dark')
const isLight = computed(() => colorMode.value === 'light')

onMounted(() => {
  const root = document.documentElement
  root.classList.toggle('light', colorMode.value === 'light')
  root.classList.toggle('dark', colorMode.value !== 'light')
})

const toggleTheme = () => {
  colorMode.value = colorMode.value === 'light' ? 'dark' : 'light'
  const root = document.documentElement
  root.classList.toggle('light', colorMode.value === 'light')
  root.classList.toggle('dark', colorMode.value !== 'light')
}
</script>
