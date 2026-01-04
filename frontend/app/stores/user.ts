import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { toast } from 'vue-sonner'

interface User {
  id: number
  username: string
  email: string
  xp: number
  createdAt?: string
}

interface AuthResponse {
  message: string
  user: User
  token: string
}

export const useUserStore = defineStore('user', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isUserLoading = ref(false)
  const userError = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value)

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
      toast.success('ثبت نام با موفقیت انجام شد!')

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
      toast.success('ورود با موفقیت انجام شد!')

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
    if (process.client) {
      const storedToken = localStorage.getItem('auth-token')
      if (storedToken) {
        token.value = storedToken
        // TODO: Validate token and fetch user data from /me endpoint
      }
    }
  }

  // Initialize auth state on store creation
  initializeAuth()

  return {
    // State
    user,
    token,
    isUserLoading,
    userError,
    // Getters
    isAuthenticated,
    // Actions
    register,
    login,
    logout,
    initializeAuth,
  }
})