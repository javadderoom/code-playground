import { describe, it, expect, beforeEach } from 'vitest';
import { Hono } from 'hono';
import authRoutes from './auth';

const testApp = new Hono();
testApp.route('/api/auth', authRoutes);

describe("Auth Routes", () => {
    describe("POST /api/auth/register", () => {
        it("should return 400 for invalid input", async () => {
            const res = await testApp.request("/api/auth/register", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}),
            });

            expect(res.status).toBe(400);
            const data = await res.json();
            expect(data).toHaveProperty('error', 'Invalid input');
        });

        it("should return 400 for missing required fields", async () => {
            const res = await testApp.request("/api/auth/register", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: 'test' }),
            });

            expect(res.status).toBe(400);
            const data = await res.json();
            expect(data).toHaveProperty('error', 'Invalid input');
        });
    });

    describe("POST /api/auth/login", () => {
        it("should return 400 for invalid input", async () => {
            const res = await testApp.request("/api/auth/login", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}),
            });

            expect(res.status).toBe(400);
            const data = await res.json();
            expect(data).toHaveProperty('error', 'Invalid input');
        });
    });

    describe("GET /api/auth/me", () => {
        it("should return 501 (not implemented yet)", async () => {
            const res = await testApp.request("/api/auth/me");

            expect(res.status).toBe(501);
            const data = await res.json();
            expect(data).toHaveProperty('error', 'Authentication middleware not implemented yet');
        });
    });
});
