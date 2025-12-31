export interface PistonExecuteOptions {
    language: string
    version: string
    files: Array<{
      name: string
      content: string
    }>
}

export interface PistonResult {
    run: {
        stdout: string
        stderr: string
        code: number
        time: number
        signal?: string | null
        output?: string
    }
    language?: string
    version?: string
}
export interface TestResultWithTime {
    id: number;
    passed: boolean;
    input: string;
    expected: string;
    actual: string;
    time?: number ;  
    error?: string;         
  } 