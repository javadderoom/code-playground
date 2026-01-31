import { defineStore, acceptHMRUpdate } from 'pinia';
import { ref, computed } from 'vue';
import type { Problem, SubmissionResult } from '../../types/types';

// 1. Define the Empty State Constant
// This ensures your template never crashes when accessing {{ problem.title }}
const EMPTY_PROBLEM: Problem = {
  id: 0, // 0 indicates "empty"
  title: '',
  slug: '',
  description: '',
  functionName: '',
  starterCode: '',
  difficulty: 'Easy',
  createdAt: undefined // or new Date().toISOString() if it's a string
};

export const useProblemStore = defineStore('problem', () => {

  // 2. Initialize with the Empty Object (Type Safe)
  const problem = ref<Problem>({ ...EMPTY_PROBLEM });
  
  const isProblemLoading = ref(false);

  // 3. CRITICAL FIX: Use String for error message
  // Using ref(new Error('')) WILL break Nuxt SSR serialization.
  // We use an empty string '' to mean "no error".
  const problemError = ref<string>('');

  // 4. Helper Getter
  // Since 'problem' is never null, we need a way to know if data is loaded.
  const hasProblem = computed(() => problem.value.id !== 0);

  const fetchProblem = async (slug: string) => {
    isProblemLoading.value = true;
    problemError.value = ''; // Reset error string

    try {
      const data = await $fetch<Problem>(`/api/problems/${slug}`, {
        baseURL: useRuntimeConfig().public.apiBaseClient
      });
      problem.value = data;
    } catch (err: any) {
      // Store just the message string
      problemError.value = err.message || 'Failed to fetch problem';
      // Reset to empty state on error so we don't show mixed data
      problem.value = { ...EMPTY_PROBLEM };
      throw err;
    } finally {
      isProblemLoading.value = false;
    }
  };

  const runCode = async (code: string, language: string): Promise<SubmissionResult> => {
    // Guard using our ID check
    if (problem.value.id === 0) {
       return { status: 'Error', error: 'No problem loaded', results: [] };
    }

    try {
      const userStore = useUserStore()
      const token = userStore.token
      
      if (!token) {
        return { status: 'Error', error: 'Not authenticated', results: [] };
      }

      const data = await $fetch<SubmissionResult>(`/api/judge/execute`, {
        baseURL: useRuntimeConfig().public.apiBaseClient,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: {
          code,
          language,
          problemId: problem.value.id
        }
      });
      return data;
    } catch (err) {
      return {
        status: 'Error',
        error: 'Error connecting to the execution engine.',
        results: []
      };
    }
  };
  const submitCode = async (code: string, language: string): Promise<SubmissionResult> => {
    // Guard using our ID check
    if (problem.value.id === 0) {
       return { status: 'Error', error: 'No problem loaded', results: [] };
    }
  
    try {
      const userStore = useUserStore()
      const token = userStore.token
      
      if (!token) {
        return { status: 'Error', error: 'Not authenticated', results: [] };
      }

      const data = await $fetch<SubmissionResult>(`/api/judge/submit`, {
        baseURL: useRuntimeConfig().public.apiBaseClient,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: {
          code,
          language,
          problemId: problem.value.id
        }
      });
      return data;
    } catch (err) {
      return {
        status: 'Error',
        error: 'Error connecting to the execution engine.',
        results: []
      };
    }
  };
  return { 
      problem, 
      hasProblem, // Export the getter
      isProblemLoading, 
      problemError, 
      fetchProblem, 
      runCode,
      submitCode
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useProblemStore, import.meta.hot))
}