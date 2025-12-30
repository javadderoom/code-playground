import { defineStore } from 'pinia'
import type { Problem, SubmissionResult } from '~/types/types'

export const useProblemStore = defineStore('problem', {
  state: () => ({
    currentProblem: null as Problem | null,
    currentSubmission: null as SubmissionResult | null,
    isSubmitting: false,
    recentProblems: [] as Problem[]
  }),

  getters: {
    hasCurrentProblem: (state) => !!state.currentProblem,
    submissionStatus: (state) => state.currentSubmission?.status || null,
    isAccepted: (state) => state.currentSubmission?.status === 'Accepted'
  },

  actions: {
    setCurrentProblem(problem: Problem) {
      this.currentProblem = problem
      // Add to recent problems if not already there
      const existingIndex = this.recentProblems.findIndex(p => p.id === problem.id)
      if (existingIndex === -1) {
        this.recentProblems.unshift(problem)
        // Keep only last 10 recent problems
        if (this.recentProblems.length > 10) {
          this.recentProblems = this.recentProblems.slice(0, 10)
        }
      }
    },

    setSubmission(submission: SubmissionResult) {
      this.currentSubmission = submission
    },

    setSubmitting(status: boolean) {
      this.isSubmitting = status
    },

    clearCurrentProblem() {
      this.currentProblem = null
      this.currentSubmission = null
    }
  }
})
