import { defineStore, storeToRefs } from 'pinia'
import { useUserStore } from './user'

export const useRootStore = defineStore('root', () => {
    const userStore = useUserStore()

    const state = {
        user: storeToRefs(userStore),
    }

    return {
        state,
        login: userStore.login,
    }
})

// 1. Extract the Return Type of the function
// This gives you the full shape of the store automatically
export type RootStore = ReturnType<typeof useRootStore>

// 2. Extract just the Global State shape (Optional but useful)
// Useful if you need to type a variable that just holds data
export type GlobalState = RootStore['state']