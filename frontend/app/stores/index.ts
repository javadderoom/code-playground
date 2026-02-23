import { defineStore } from 'pinia'
import { useUserStore } from './user'
import { useProblemStore } from './problem'

export const useRootStore = defineStore('root', () => {
    const problemStore = useProblemStore()
    const userStore = useUserStore()
    const { 
        problem, 
        isProblemLoading, 
        problemError ,
        hasProblem
    } = storeToRefs(problemStore)
    const {
        isUserLoading,
        user,
        token,
        userError
    } = storeToRefs(userStore)
    const state = {
        problem,
        isProblemLoading,
        problemError,
        hasProblem,
        isUserLoading,
        user,
        token,
        userError
    }
 
    
    const ensureAuth = () => {
        if (import.meta.client && !token.value) {
            userStore.initializeAuth()
        }
        if (import.meta.client && token.value && !user.value) {
            void userStore.fetchMe()
        }
        return token.value
    }

    const runCode = (code: string, language: string) => {
        return problemStore.runCode(code, language, ensureAuth())
    }

    const submitCode = (code: string, language: string) => {
        return problemStore.submitCode(code, language, ensureAuth())
    }

    return {
        state,
        fetchProblem: problemStore.fetchProblem,
        ensureAuth,
        runCode,
        submitCode,
        logout: userStore.logout,
        register: userStore.register,
        login: userStore.login
    }
})

// 1. Extract the Return Type of the function
// This gives you the full shape of the store automatically
export type RootStore = ReturnType<typeof useRootStore>

// 2. Extract just the Global State shape (Optional but useful)
// Useful if you need to type a variable that just holds data
export type GlobalState = RootStore['state']
