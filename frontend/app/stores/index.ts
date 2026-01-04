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
 
    
    return {
        state,
        fetchProblem: problemStore.fetchProblem,
        runCode: problemStore.runCode,
        submitCode: problemStore.submitCode,
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