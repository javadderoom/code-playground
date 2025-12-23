// packages/backend/src/index.ts
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { cors } from 'hono/cors'
import { db } from './db/index.js';
import { problems } from './db/schema.js';

const app = new Hono()

// Security: Only allow your Nuxt frontend to talk to this API
app.use('/api/*', cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}))

app.get('/', (c) => {
  return c.json({ message: 'Code Playground API is running!' })
})

app.get('/api/problems', async (c) => {
  // const data = await db.select().from(problems);
  return c.json({ problems: [] })
})
app.get('/api/test-db', async (c) => {
  try {
    // Attempt to fetch all problems (will be an empty array for now)
    const result = await db.select().from(problems);
    return c.json({ status: 'Connected to DB!', data: result });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    return c.json({ status: 'Error', message: errorMessage }, 500);
  }
});

console.log('🚀 Server is running on http://localhost:4000')
serve({ fetch: app.fetch, port: 4000 })