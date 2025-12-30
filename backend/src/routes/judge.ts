
import { Hono } from 'hono'
import { executeCode } from '../lib/piston.js'
import { eq } from 'drizzle-orm';
import { testCases, submissions, problems } from '../db/schema';
import { db } from '../db/index.js';
import { PistonResult } from '../../types/types';
import { DriverFactory } from '../lib/drivers/factory';

const router = new Hono()

// --- Utility Endpoints ---

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

// --- Main Execution Endpoints ---

// 1. Dry Run / Debug (runs code against provided inputs or no inputs)
router.post('/execute', async (c) => {
  try {
    const body = await c.req.json()
    const { code, language = 'python', inputs, config } = body

    // Use Driver Factory
    const driver = DriverFactory.getDriver(language, code, config || {});
    
    if (inputs) {
      driver.setInputs(inputs);
    }

    const payload = driver.generatePayload();
    const pistonResult = await executeCode(payload);
    const result = driver.parseResult(pistonResult);

    return c.json({
      execution: result,
      raw: pistonResult // Optional debug info
    })

  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// 2. Submit Solution (runs code against DB test cases)
router.post('/submit', async (c) => {
  try {
    const { code, language = 'python', problemId } = await c.req.json();

    // Fetch problem to get functionName
    const [problem] = await db.select()
      .from(problems)
      .where(eq(problems.id, problemId));

    if (!problem) {
      return c.json({ error: 'Problem not found' }, 404);
    }

    // Fetch problem tests
    const problemTests = await db.select()
      .from(testCases)
      .where(eq(testCases.problemId, problemId));

    if (problemTests.length === 0) {
      return c.json({ error: 'No test cases found for this problem' }, 404);
    }

    // Prepare inputs for the driver
    // The driver expects inputs as an array of objects. 
    // We assume test.input is stored as a JSON string representing the arguments.
    // e.g. '{"args": [1, 2]}' or '[1, 2]'
    const inputs = problemTests.map(t => {
      try {
        const parsed = JSON.parse(t.input);
        return { 
            id: t.id, 
            // Normalize: if input is { args: [...] }, use it, else assume it's the args array itself
            args: parsed.args || (Array.isArray(parsed) ? parsed : [parsed])
        };
      } catch (e) {
        return { id: t.id, args: [] }; // Fallback
      }
    });

    // Initialize Driver with the correct function name
    const driver = DriverFactory.getDriver(language, code, { 
      mode: 'function',
      entryPoint: problem.functionName 
    });
    driver.setInputs(inputs);

    // Execute
    const payload = driver.generatePayload();
    const pistonResult = await executeCode(payload);
    const executionResult = driver.parseResult(pistonResult);

    // Validate Results against Expected Outputs
    let allPassed = true;
    const finalResults = [];

    if (executionResult.status !== 'success') {
        // Runtime error or compilation error
        allPassed = false;
        // Create error results for all test cases
        for (const test of problemTests) {
            finalResults.push({
                id: test.id,
                passed: false,
                input: test.isHidden ? '[Hidden]' : test.input,
                expected: test.isHidden ? '[Hidden]' : test.expectedOutput,
                actual: '[Error]',
                error: executionResult.error || 'Execution failed'
            });
        }
    } else {
        const userOutputs = executionResult.output || [];
        
        // Map user outputs back to test cases
        for (const test of problemTests) {
            const userRes = userOutputs.find((r: any) => r.id === test.id);
            const actualOutput = userRes ? String(userRes.result) : 'No Result';
            const expectedOutput = test.expectedOutput.trim();
            
            // Simple string comparison for now (enhance later for types)
            const isCorrect = actualOutput === expectedOutput;
            if (!isCorrect) allPassed = false;

            finalResults.push({
                id: test.id,
                passed: isCorrect,
                input: test.isHidden ? '[Hidden]' : test.input,
                expected: test.isHidden ? '[Hidden]' : expectedOutput,
                actual: test.isHidden ? '[Hidden]' : actualOutput,
                error: userRes?.error
            });
        }
    }

    // Save Submission
    const status = executionResult.status !== 'success' ? 'Runtime Error' : (allPassed ? 'Accepted' : 'Wrong Answer');
    
    await db.insert(submissions).values({
      problemId,
      code,
      languageId: 1, // TODO: Map language string to ID
      status,
    });

    return c.json({
        status,
        results: finalResults,
        error: executionResult.error,
        logs: executionResult.logs
    });

  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

export default router
