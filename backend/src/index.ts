// backend/src/index.ts
import 'dotenv/config' 
import { serve } from '@hono/node-server'
import app from './app'

const port = Number(process.env.PORT) || 4000

console.log(`🚀 Server is running on http://localhost:${port}`)

serve({ 
    fetch: app.fetch, 
    port: port 
})