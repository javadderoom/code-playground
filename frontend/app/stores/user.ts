import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  // State
  const name = ref('Ali')
  const token = ref('null')

  // Actions
  function login() {
    console.log('Logging in...')
    token.value = '12345'
  }

  return { name, token, login }
})