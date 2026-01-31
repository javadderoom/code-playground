import { Hono } from 'hono'
import { verify } from 'hono/jwt'

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key'

export interface AuthContext {
  userId: number
  username: string
}

export async function authMiddleware(c: any, next: any) {
  try {
    const authHeader = c.req.header('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Missing or invalid authorization header' }, 401)
    }

    const token = authHeader.slice(7) 
    
    try {
      const payload = await verify(token, JWT_SECRET)
      
      // Attach user info to context
      c.set('userId', payload.id)
      c.set('username', payload.username)
      
      await next()
    } catch (verifyError) {
      return c.json({ error: 'Invalid or expired token' }, 401)
    }
  } catch (error) {
    return c.json({ error: 'Authentication error' }, 500)
  }
}

export function getAuthContext(c: any): AuthContext {
  return {
    userId: c.get('userId'),
    username: c.get('username')
  }
}
