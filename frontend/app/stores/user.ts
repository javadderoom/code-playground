import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { toast } from 'vue-sonner'

interface User {
  id: string
  username: string
  email: string
  name?: string | null
  xp: number
  coins?: number | null
  streakDays?: number | null
  lastSolvedAt?: string | null
  createdAt?: string
}

interface AuthResponse {
  message: string
  user: User
  token: string
}

interface MeResponse {
  user: User
}

export const useUserStore = defineStore('user', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isUserLoading = ref(false)
  const userError = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value)

  async function fetchMe() {
    if (!token.value) {
      user.value = null
      return null
    }

    try {
      const config = useRuntimeConfig()
      const response = await fetch(`${config.public.apiBaseClient}/auth/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      })

      if (!response.ok) {
        if (response.status === 401 || response.status === 404) {
          logout()
          return null
        }
        throw new Error('Failed to fetch user profile')
      }

      const data: MeResponse = await response.json()
      user.value = data.user
      return data.user
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch user profile'
      userError.value = errorMessage
      return null
    }
  }

  // Actions
  async function register(userData: { username: string; email: string; password: string }) {
    isUserLoading.value = true
    userError.value = null

    try {
      const config = useRuntimeConfig()
      const response = await fetch(`${config.public.apiBaseClient}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      const data: AuthResponse = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed')
      }

      // Store user data and token
      user.value = data.user
      token.value = data.token

      // Store token in localStorage for persistence (client-side only)
      if (process.client) {
        localStorage.setItem('auth-token', data.token)
      }

      // Show success toast
      toast.success('Ø«Ø¨Øª Ù†Ø§Ù… Ø¨Ø§ Ù…ÙˆÙÙ‚ÛŒØª Ø§Ù†Ø¬Ø§Ù… Ø´Ø¯!')

      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed'
      userError.value = errorMessage
      toast.error(errorMessage)
      throw err
    } finally {
      isUserLoading.value = false
    }
  }

  async function login(credentials: { username: string; password: string }) {
    isUserLoading.value = true
    userError.value = null

    try {
      const config = useRuntimeConfig()
      const response = await fetch(`${config.public.apiBaseClient}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      const data: AuthResponse = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Login failed')
      }

      // Store user data and token
      user.value = data.user
      token.value = data.token

      // Store token in localStorage for persistence (client-side only)
      if (process.client) {
        localStorage.setItem('auth-token', data.token)
      }

      // Show success toast
      toast.success('ÙˆØ±ÙˆØ¯ Ø¨Ø§ Ù…ÙˆÙÙ‚ÛŒØª Ø§Ù†Ø¬Ø§Ù… Ø´Ø¯!')

      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed'
      userError.value = errorMessage
      toast.error(errorMessage)
      throw err
    } finally {
      isUserLoading.value = false
    }
  }

  function logout() {
    user.value = null
    token.value = null
    if (process.client) {
      localStorage.removeItem('auth-token')
    }
  }

  function initializeAuth() {
    // Check for stored token on app initialization (client-side only)
    if (import.meta.client) {
      const storedToken = localStorage.getItem('auth-token')
      if (!storedToken) return

      if (isTokenExpired(storedToken)) {
        localStorage.removeItem('auth-token')
        token.value = null
        user.value = null
        return
      }

      token.value = storedToken
      if (!user.value) {
        void fetchMe()
      }
    }
  }

  // Initialize auth state on store creation
  initializeAuth()

  function isTokenExpired(token: string): boolean {
    try {
      const parts = token.split('.')
      if (parts.length < 2 || !parts[1]) return true
      const payload = JSON.parse(atob(parts[1])) as { exp?: number }
      if (!payload.exp) return false // if missing exp, treat as non-expiring
      return payload.exp * 1000 <= Date.now()
    } catch {
      return true
    }
  }


  return {
    // State
    user,
    token,
    isUserLoading,
    userError,
    // Getters
    isAuthenticated,
    isTokenExpired,
    // Actions
    register,
    login,
    fetchMe,
    logout,
    initializeAuth,
  }
})
