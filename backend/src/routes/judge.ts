import { Hono } from 'hono'
import { executeCode } from '../lib/piston.js'

const router = new Hono()

router.get('/test-judge', async (c) => {
  try {
    const result = await executeCode({
      language: 'python',
      version: '3.10.0',
      files: [{
        name: 'main.py',
        content: "print('Hello from the Piston Engine!')"
      }]
    })

    return c.json({
      status: 'Connected to Piston (Free Engine)!',
      stdout: result.run.stdout,
      stderr: result.run.stderr,
      code: result.run.code,
    })
  } catch (error: any) {
    return c.json({ status: 'Error', message: error.message }, 500)
  }
})

router.post('/execute', async (c) => {
  try {
    const body = await c.req.json()
    const { language = 'python', version = '3.10.0', files } = body

    if (!files || !Array.isArray(files) || files.length === 0) {
      return c.json({ error: 'Files array is required' }, 400)
    }

    const result = await executeCode({
      language,
      version,
      files
    })

    return c.json({
      stdout: result.run.stdout,
      stderr: result.run.stderr,
      code: result.run.code,
    })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

export default router