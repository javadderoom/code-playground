# Database Schema Documentation

## Overview

The code playground application uses PostgreSQL with Drizzle ORM for data persistence. The schema consists of four main tables: `problems`, `test_cases`, `users`, and `submissions`.

## Enums

### Difficulty Enum

The application uses a Drizzle ORM enum for problem difficulty levels:

```typescript
// Defined in schema.ts
export const difficultyEnum = pgEnum('difficulty', ['Easy', 'Medium', 'Hard']);
export type Difficulty = 'Easy' | 'Medium' | 'Hard';
```

**Features:**
- **Database-level constraints**: Only valid difficulty values can be stored
- **Type Safety**: TypeScript union type prevents invalid values at compile time
- **Migration-friendly**: Drizzle handles enum creation and updates
- **Persian Display**: Helper functions for localized display names
- **Validation**: Runtime validation functions available

**Usage in Schema:**
```typescript
difficulty: difficultyEnum('difficulty').notNull(),
```

## Tables and Relationships

### Entity Relationship Diagram
```
┌─────────────┐     ┌─────────────┐
│   users     │     │  problems  │
│             │     │             │
│  id (PK)    │     │  id (PK)    │
│  username   │     │  title      │
│  email      │     │  slug       │
│  password   │     │  description│
│  xp         │     │  function   │
│  created_at │     │  starter    │
└─────┬───────┘     │  difficulty │
      │             │  created_at │
      │             └─────┬───────┘
      │                   │
      │                   │
      │                   │
┌─────▼───────┐     ┌─────▼───────┐
│submissions  │     │ test_cases │
│             │     │             │
│  id (PK)    │     │  id (PK)    │
│  user_id(FK)├─────┘  problem_id │
│  problem_id │     │  input      │
│  code       │     │  expected   │
│  status     │     │  is_hidden  │
│  created_at │     └─────────────┘
└─────────────┘
```

## Tables

### 1. `problems` Table

Stores coding problems/challenges that users can solve.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Auto-incrementing unique identifier |
| `title` | TEXT | NOT NULL | Problem title (e.g., "Two Sum", "Add Two Numbers") |
| `slug` | TEXT | NOT NULL, UNIQUE | URL-friendly identifier (e.g., "two-sum") |
| `description` | TEXT | NOT NULL | Problem description in Persian Markdown |
| `function_name` | TEXT | NOT NULL, DEFAULT 'solve' | Name of the function user must implement |
| `starter_code` | TEXT | NOT NULL | Initial code template provided to users |
| `difficulty` | TEXT | NOT NULL | Difficulty level: 'Easy', 'Medium', or 'Hard' (enum values) |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Record creation timestamp |

### 2. `test_cases` Table

Contains test cases for each problem, used for code validation.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Auto-incrementing unique identifier |
| `problem_id` | INTEGER | FOREIGN KEY → problems.id, CASCADE DELETE | Reference to the problem |
| `input` | TEXT | NOT NULL | Input data for the test case (JSON string) |
| `expected_output` | TEXT | NOT NULL | Expected output for the test case |
| `is_hidden` | BOOLEAN | DEFAULT false | Whether this test case is visible to users |

### 3. `users` Table

User accounts for the platform.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Auto-incrementing unique identifier |
| `username` | TEXT | NOT NULL, UNIQUE | User's display name |
| `email` | TEXT | NOT NULL, UNIQUE | User's email address |
| `password_hash` | TEXT | NOT NULL | Hashed password for authentication |
| `xp` | INTEGER | DEFAULT 0 | Experience points for leaderboards (Phase 2) |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Account creation timestamp |

### 4. `submissions` Table

Records of user code submissions and their results.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Auto-incrementing unique identifier |
| `user_id` | INTEGER | FOREIGN KEY → users.id | Reference to the submitting user |
| `problem_id` | INTEGER | FOREIGN KEY → problems.id | Reference to the solved problem |
| `code` | TEXT | NOT NULL | The submitted code |
| `status` | TEXT | NOT NULL | Submission result: 'Accepted', 'Wrong Answer', etc. |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Submission timestamp |

## Relationships

### Foreign Key Constraints

1. **`test_cases.problem_id`** → **`problems.id`**
   - **Type**: Many-to-One
   - **Behavior**: CASCADE DELETE (deleting a problem removes its test cases)

2. **`submissions.user_id`** → **`users.id`**
   - **Type**: Many-to-One
   - **Behavior**: No cascade (submissions remain if user is deleted)

3. **`submissions.problem_id`** → **`problems.id`**
   - **Type**: Many-to-One
   - **Behavior**: No cascade (submissions remain if problem is deleted)

### Relationship Summary

- **One problem** can have **many test cases**
- **One user** can have **many submissions**
- **One problem** can have **many submissions**
- **One submission** belongs to **one user** and **one problem**

## Data Flow

1. **Problem Creation**: Admin creates problem → Test cases are added
2. **User Registration**: User creates account
3. **Code Submission**: User submits code → System runs against test cases → Result stored
4. **Progress Tracking**: XP and submission history tracked per user

## Example Data

### Sample Problem
```typescript
// Using the Difficulty type in code:
import { type Difficulty } from './schema.js';

const problemData: {
  title: string;
  slug: string;
  description: string;
  functionName: string;
  starterCode: string;
  difficulty: Difficulty;  // Type-safe union type
} = {
  title: 'جمع دو عدد',
  slug: 'sum-of-two-numbers',
  description: 'تابعی بنویسید که دو عدد را با هم جمع کند',
  functionName: 'add',
  starterCode: 'def add(a: int, b: int) -> int:\n    # کد خود را اینجا بنویسید\n    pass',
  difficulty: 'Easy'  // Valid enum value
};
```

```sql
-- Database representation (stored as text):
INSERT INTO problems (title, slug, description, function_name, starter_code, difficulty)
VALUES (
  'جمع دو عدد',
  'sum-of-two-numbers',
  'تابعی بنویسید که دو عدد را با هم جمع کند',
  'add',
  'def add(a: int, b: int) -> int:\n    # کد خود را اینجا بنویسید\n    pass',
  'Easy'
);
```

### Sample Test Cases
```sql
INSERT INTO test_cases (problem_id, input, expected_output, is_hidden)
VALUES
  (1, '[1, 2]', '3', false),
  (1, '[5, 7]', '12', false),
  (1, '[-1, 1]', '0', true);  -- Hidden test case
```

### Sample User
```sql
INSERT INTO users (username, email, password_hash, xp)
VALUES ('john_doe', 'john@example.com', '$2b$10$...', 150);
```

### Sample Submission
```sql
INSERT INTO submissions (user_id, problem_id, code, status)
VALUES (
  1,
  1,
  'def add(a: int, b: int) -> int:\n    return a + b',
  'Accepted'
);
```

## Migration Notes

- Uses Drizzle ORM for schema definition and migrations
- Run `npm run db:generate` to create migration files
- Run `npm run seed` to populate initial data
- Database runs in Docker Compose by default
- Local development requires `DATABASE_URL` environment variable

## Future Enhancements

- **Leaderboards**: Using `users.xp` field
- **Problem Categories/Tags**: Additional table for categorization
- **Submission Details**: Store execution time, memory usage
- **User Progress**: Track solved problems, streaks, etc.
