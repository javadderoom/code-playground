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
        signal?: string | null
        output?: string
    }
    language?: string
    version?: string
}