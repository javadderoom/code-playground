
export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server) return

  const rootStore = useRootStore()
  const token = rootStore.ensureAuth() || localStorage.getItem('auth-token')
  if (!token) return navigateTo('/login')
})
