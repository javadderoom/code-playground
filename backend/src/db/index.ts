import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as pkg from 'pg';
const { Pool } = pkg;
import * as schema from './schema.js';

// IMPORTANT ARCHITECT NOTE:
// Inside Docker, the host is 'db'. On your Windows machine, the host is 'localhost'.
const connectionString = process.env.DATABASE_URL || 'postgres://user:password@db:5432/code_db';

const pool = new Pool({
  connectionString,
});

export const db = drizzle(pool, { schema });