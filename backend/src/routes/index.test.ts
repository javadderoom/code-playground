import { describe, it, expect } from 'vitest';
import { Hono } from 'hono';
import indexRoutes from './index';

const testApp = new Hono();
testApp.route('/', indexRoutes);

describe("Index Routes", () => {
    it("Get / should return 200", async () => {
        const res = await testApp.request("/");

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data).toHaveProperty('message', 'Code Playground API is running!');
    });
});
