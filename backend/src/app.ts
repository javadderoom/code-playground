// backend/src/app.ts
import { Hono } from 'hono'
import indexRoutes from './routes/index'
import problemRoutes from './routes/problems'
import judgeRoutes from './routes/judge'
import authRoutes from './routes/auth'
import { corsMiddleWare } from './middleware/cors.js'
import { initializeRedis } from './lib/redis.js'
import dns from 'node:dns'

dns.setDefaultResultOrder('ipv4first');

// Initialize Redis with persistence
initializeRedis().catch(err => {
  console.warn('Redis initialization warning:', err.message);
  // App can continue without Redis for caching
});

const app = new Hono()

// Middleware
app.use('/api/*', corsMiddleWare)
app.use('/auth/*', corsMiddleWare)
// Routes
app.route('/', indexRoutes)
app.route('/auth', authRoutes)
app.route('/api/problems', problemRoutes)
app.route('/api/judge', judgeRoutes)


// 404 Handler
app.notFound((c) => {
    // Note: During tests, you can check process.env.NODE_ENV
    if (process.env.NODE_ENV !== 'test') {
        console.log(`404 Alert: Target URL was ${c.req.url}`);
    }
    return c.json({ error: 'Not Found', path: c.req.url }, 404);
});

export default app