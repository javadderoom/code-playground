
import 'dotenv/config' 
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import indexRoutes from './routes/index'
import problemRoutes from './routes/problems'
import judgeRoutes from './routes/judge' 
import dns from 'node:dns';
import { corsMiddleWare } from './middleware/cors.js';
dns.setDefaultResultOrder('ipv4first'); 

const app = new Hono()

// Security: Only allow your Nuxt frontend to talk to this API
app.use('/api/*', corsMiddleWare)

app.route('/', indexRoutes)

app.route('/api/problems', problemRoutes)

app.route('/api/judge', judgeRoutes)


console.log('🚀 Server is running on http://localhost:4000')
serve({ fetch: app.fetch, port: 4000 })