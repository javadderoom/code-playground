import { PistonExecuteOptions, PistonResult } from '../../types/types.js'

const PISTON_URL = 'https://emkc.org/api/v2/piston/execute'

export async function executeCode(options: PistonExecuteOptions): Promise<PistonResult> {
  const response = await fetch(PISTON_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(options),
  })

  return response.json() as Promise<any>
}