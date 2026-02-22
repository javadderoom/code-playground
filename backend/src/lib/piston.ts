import { PistonExecuteOptions, PistonResult } from '../../types/types.js'

const PISTON_URL = process.env.PISTON_URL as string

function isPistonResult(data: unknown): data is PistonResult {
  if (!data || typeof data !== 'object') return false

  const maybeRun = (data as { run?: unknown }).run
  if (!maybeRun || typeof maybeRun !== 'object') return false

  const run = maybeRun as Record<string, unknown>
  return (
    typeof run.stdout === 'string' &&
    typeof run.stderr === 'string' &&
    typeof run.code === 'number'
  )
}

export async function executeCode(options: PistonExecuteOptions): Promise<PistonResult> {
  const response = await fetch(PISTON_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(options),
  })

  const data: unknown = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(`Piston HTTP ${response.status}: ${JSON.stringify(data)}`)
  }

  if (!isPistonResult(data)) {
    throw new Error(`Invalid Piston response: ${JSON.stringify(data)}`)
  }

  return data
}
