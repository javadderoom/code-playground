export interface TestResult {
  id: number
  passed: boolean
  input: string
  expected: string
  actual: string
  error?: string
  time?: number
}

export interface SubmissionResult {
  status: 'Accepted' | 'Wrong Answer' | 'Runtime Error' | 'Error'
  results: TestResult[]
  error?: string
  logs?: string
  xpEarned?: number
  totalXp?: number
  coinsEarned?: number
  totalCoins?: number
  streakDays?: number
}

export interface Problem {
  id: number
  title: string
  slug: string
  description: string
  examples: Array<{
    input: string
    output: string
  }>
  functionName: string
  starterCode: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  createdAt?: string
}
