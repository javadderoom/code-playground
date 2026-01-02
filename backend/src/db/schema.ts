// backend/src/db/schema.ts
import { pgTable, serial, text, integer, timestamp, boolean, pgEnum, decimal } from 'drizzle-orm/pg-core';

// Difficulty enum for problem difficulty levels
export const difficultyEnum = pgEnum('difficulty', ['Easy', 'Medium', 'Hard']);

// Export difficulty values for TypeScript usage
export type Difficulty = 'Easy' | 'Medium' | 'Hard';


// Problems table
export const problems = pgTable('problems', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(), // e.g., "two-sum"
  description: text('description').notNull(), // Persian Markdown content
  functionName: text('function_name').default('solve').notNull(),
  starterCode: text('starter_code').notNull(),
  difficulty: difficultyEnum('difficulty').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Test Cases for each problem
export const testCases = pgTable('test_cases', {
  id: serial('id').primaryKey(),
  problemId: integer('problem_id').references(() => problems.id, { onDelete: 'cascade' }),
  input: text('input').notNull(),
  expectedOutput: text('expected_output').notNull(),
  isHidden: boolean('is_hidden').default(false),
});

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  name: text('name'),
  passwordHash: text('password_hash').notNull(),
  xp: integer('xp').default(0), // For Phase 2 Leaderboards
  createdAt: timestamp('created_at').defaultNow(),
});

// Update submissions to include userId
export const submissions = pgTable('submissions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id), // 👈 Link to User
  problemId: integer('problem_id').references(() => problems.id),
  code: text('code').notNull(),
  status: text('status').notNull(), // 'Accepted' | 'Wrong Answer'
  language: text('language').notNull(), 
  executionTime: decimal('execution_time'), // in milliseconds
  memoryUsed: decimal('memory_used'),       // in kilobytes
  createdAt: timestamp('created_at').defaultNow(),
});