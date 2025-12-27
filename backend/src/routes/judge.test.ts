import { describe, it, expect, vi } from 'vitest';
import { Hono } from 'hono';
import judgeRoutes from './judge';

// Mock the executeCode function to avoid external API calls in tests
vi.mock('../lib/piston.js', () => ({
  executeCode: vi.fn().mockResolvedValue({
    run: {
      stdout: 'Hello from the Piston Engine!\n',
      stderr: '',
      code: 0
    }
  })
}));

const testApp = new Hono();
testApp.route('/api/judge', judgeRoutes);

describe("Judge Routes", () => {
    it("Get /api/judge/test-judge should return 200", async () => {
        const res = await testApp.request("/api/judge/test-judge");

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data).toHaveProperty('status', 'Connected to Piston (Free Engine)!');
        expect(data).toHaveProperty('stdout');
        expect(data).toHaveProperty('stderr');
        expect(data).toHaveProperty('code', 0);
    });
});
