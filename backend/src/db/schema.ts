// backend/src/db/schema.ts
import { pgTable, serial, text, integer, timestamp, boolean } from 'drizzle-orm/pg-core';

// Problems table
export const problems = pgTable('problems', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(), // Markdown problem description
  difficulty: text('difficulty').$type<'Easy' | 'Medium' | 'Hard'>().notNull(),
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

// Submissions (History)
export const submissions = pgTable('submissions', {
  id: serial('id').primaryKey(),
  problemId: integer('problem_id').references(() => problems.id),
  code: text('code').notNull(),
  languageId: integer('language_id').notNull(), // Judge0 language ID
  status: text('status'), // e.g., "Accepted", "Wrong Answer"
  createdAt: timestamp('created_at').defaultNow(),
});