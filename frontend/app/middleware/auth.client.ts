export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server) return
  const rootStore = useRootStore()
  const token = rootStore.ensureAuth()
  if (!token) return navigateTo('/login')
})
