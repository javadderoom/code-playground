
import 'dotenv/config';
import { Hono } from 'hono';
import { sign, verify } from 'hono/jwt';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';

const auth = new Hono();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

// Password utilities
const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

// Validation schemas
const registerSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

// Types
type RegisterRequest = z.infer<typeof registerSchema>;
type LoginRequest = z.infer<typeof loginSchema>;

auth.post('/register', async (c) => {
  try {
    const body = await c.req.json();

    // Validate input
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return c.json({ error: 'Invalid input', details: validationResult.error.issues }, 400);
    }

    const { username, email, password }: RegisterRequest = validationResult.data;

    // Check if user already exists
    const existingUser = await db.select().from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (existingUser.length > 0) {
      return c.json({ error: 'Username already exists' }, 409);
    }

    // Check if email already exists
    const existingEmail = await db.select().from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingEmail.length > 0) {
      return c.json({ error: 'Email already exists' }, 409);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const [newUser] = await db.insert(users).values({
      username,
      email,
      passwordHash: hashedPassword,
      xp: 0,
    }).returning({
      id: users.id,
      username: users.username,
      email: users.email,
      xp: users.xp,
      createdAt: users.createdAt,
    });

    // Generate JWT token
    const token = await sign(
      {
        id: newUser.id,
        username: newUser.username,
        
      },
      JWT_SECRET
    );

    return c.json({
      message: 'User created successfully',
      user: newUser,
      token,
    }, 201);

  } catch (error) {
    console.error('Registration error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

auth.post('/login', async (c) => {
  try {
    const body = await c.req.json();

    // Validate input
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      return c.json({ error: 'Invalid input', details: validationResult.error.issues }, 400);
    }

    const { username, password }: LoginRequest = validationResult.data;

    // Find user by username
    const userResult = await db.select().from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (userResult.length === 0) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    const user = userResult[0];

    // Verify password
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // Generate JWT token
    const token = await sign(
      {
        id: user.id,
        username: user.username,
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
      },
      JWT_SECRET
    );

    return c.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        xp: user.xp,
      },
      token,
    });

  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Optional: Get current user info (requires authentication middleware)
auth.get('/me', async (c) => {
  try {
    // This would typically use auth middleware to get user from token
    // For now, return a placeholder
    return c.json({ error: 'Authentication middleware not implemented yet' }, 501);
  } catch (error) {
    console.error('Get user error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default auth;