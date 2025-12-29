import { Hono } from 'hono'
import { executeCode } from '../lib/piston.js'
import { eq } from 'drizzle-orm';
import { testCases, submissions } from '../db/schema';
import { db } from '../db/index.js';
import { PistonResult } from '../../types/types.js';
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
router.post('/api/submit', async (c) => {
  const { code, language, problemId } = await c.req.json();

  // 1. Fetch all test cases for this problem
  const problemTests = await db.select()
    .from(testCases)
    .where(eq(testCases.problemId, problemId));

  const results = [];
  let allPassed = true;

  // 2. The Judging Loop
  for (const test of problemTests) {
    const response = await fetch('https://emkc.org/api/v2/piston/execute', {
      method: 'POST',
      body: JSON.stringify({
        language: language,
        version: "*",
        files: [{ content: code }],
        stdin: test.input // Pass the test case input here
      })
    });

    const execution = await response.json() as PistonResult;
    const actualOutput = execution.run.stdout.trim();
    const isCorrect = actualOutput === test.expectedOutput.trim();

    if (!isCorrect) allPassed = false;

    results.push({
      id: test.id,
      passed: isCorrect,
      // Only show input/output if it's not a hidden test case
      input: test.isHidden ? '[Hidden]' : test.input,
      expected: test.isHidden ? '[Hidden]' : test.expectedOutput,
      actual: test.isHidden ? '[Hidden]' : actualOutput,
      error: execution.run.stderr
    });
  }

  // 3. Save submission history
  const status = allPassed ? 'Accepted' : 'Wrong Answer';
  await db.insert(submissions).values({
    problemId,
    code,
    languageId: 1, // You can map language strings to IDs later
    status: status
  });

  return c.json({
    status: status,
    tests: results
  });
});

export default router