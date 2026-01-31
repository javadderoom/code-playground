-- Add composite index for faster gamification lookups
CREATE INDEX idx_submissions_user_problem_status ON submissions(user_id, problem_id, status);

-- Add index for user leaderboard queries
CREATE INDEX idx_users_xp_desc ON users(xp DESC);

-- Add index for problem difficulty lookups
CREATE INDEX idx_problems_difficulty ON problems(difficulty);
