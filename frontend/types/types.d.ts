export interface TestResult {
  id: number
  passed: boolean
  input: string
  expected: string
  actual: string
  error?: string
}

export interface SubmissionResult {
  status: 'Accepted' | 'Wrong Answer' | 'Runtime Error' | 'Error'
  results: TestResult[]
  error?: string
  logs?: string
}

export interface Problem {
  id: number
  title: string
  slug: string
  description: string
  functionName: string
  starterCode: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  createdAt?: string
}
