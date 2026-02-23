
import 'dotenv/config';
import { Hono } from 'hono';
import { sign, verify } from 'hono/jwt';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { v7 as uuidv7 } from 'uuid';
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
    console.log('/register => body:', body);
    
    // Validate input
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      console.error('/register => validation failed:', validationResult.error.issues);
      return c.json({ error: 'Invalid input', details: validationResult.error.issues }, 400);
    }

    const { username, email, password }: RegisterRequest = validationResult.data;
    console.log('/register => validation passed for:', username);

    // Check if user already exists
    console.log('/register => checking if username exists...');
    const existingUser = await db.select().from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (existingUser.length > 0) {
      console.log('/register => username already exists');
      return c.json({ error: 'Username already exists' }, 409);
    }

    // Check if email already exists
    console.log('/register => checking if email exists...');
    const existingEmail = await db.select().from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingEmail.length > 0) {
      console.log('/register => email already exists');
      return c.json({ error: 'Email already exists' }, 409);
    }

    // Hash password
    console.log('/register => user checks passed, hashing password');
    const hashedPassword = await hashPassword(password);
    const userId = uuidv7();
    console.log('/register => password hashed, inserting user');

    // Create user
    const [newUser] = await db.insert(users).values({
      id: userId,
      username,
      email,
      passwordHash: hashedPassword,
     
    }).returning({
      id: users.id,
      username: users.username,
      email: users.email,
      name: users.name,
      xp: users.xp,
      coins: users.coins,
      streakDays: users.streakDays,
      lastSolvedAt: users.lastSolvedAt,
      createdAt: users.createdAt,
    });

    console.log('/register => user inserted successfully:', newUser);

    // Generate JWT token
    const token = await sign(
      {
        id: newUser.id,
        username: newUser.username,
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24h
      },
      JWT_SECRET
    );

    console.log('/register => token generated, returning response');
    return c.json({
      message: 'User created successfully',
      user: newUser,
      token,
    }, 201);

  } catch (error) {
    console.error('Registration error:', error instanceof Error ? error.message : error);
    console.error('Registration error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return c.json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) }, 500);
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
        name: user.name,
        xp: user.xp,
        coins: user.coins,
        streakDays: user.streakDays,
        lastSolvedAt: user.lastSolvedAt,
        createdAt: user.createdAt,
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
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Missing or invalid authorization header' }, 401);
    }

    const token = authHeader.slice(7);
    const payload = await verify(token, JWT_SECRET);
    const userId = payload.id;

    if (typeof userId !== 'string' || userId.length === 0) {
      return c.json({ error: 'Invalid token payload' }, 401);
    }

    const userResult = await db.select().from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (userResult.length === 0) {
      return c.json({ error: 'User not found' }, 404);
    }

    const user = userResult[0];
    return c.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        xp: user.xp,
        coins: user.coins,
        streakDays: user.streakDays,
        lastSolvedAt: user.lastSolvedAt,
        createdAt: user.createdAt,
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    return c.json({ error: 'Invalid or expired token' }, 401);
  }
});

export default auth;
