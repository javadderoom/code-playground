
import { db } from '../db';
import { users, submissions } from '../db/schema';
import { eq, and, sql } from 'drizzle-orm';
import Redis from 'ioredis';
import { Pool } from 'pg';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export async function processXpAward(userId: number, problemId: number, difficulty: string) {
  const connection = (db as any)._.client; // Access underlying PG connection
  
  try {
    // Use transaction to prevent race conditions
    await connection.query('BEGIN');
    
    try {
      // 1. Check if already solved correctly (with lock to prevent duplicates)
      const previousSuccess = await db.select()
        .from(submissions)
        .where(and(
          eq(submissions.userId, userId),
          eq(submissions.problemId, problemId),
          eq(submissions.status, 'Accepted')
        ))
        .limit(1);

      // 2. If it's a first-time win
      if (previousSuccess.length === 0) {
        const xpTable = { 'Easy': 10, 'Medium': 30, 'Hard': 50 };
        const points = xpTable[difficulty as keyof typeof xpTable] || 10;

        // 3. Update SQL (Source of Truth)
        const [updatedUser] = await db.update(users)
          .set({ xp: sql`${users.xp} + ${points}` })
          .where(eq(users.id, userId))
          .returning();

        // 4. Update Redis (Performance Layer)
        const xpValue = updatedUser.xp ?? 0;
        await redis.zadd('leaderboard:global', xpValue, updatedUser.username);
        
        // Commit transaction
        await connection.query('COMMIT');
        
        console.log(`XP Award: User ${userId} earned ${points} XP (total: ${xpValue})`);
        return { earned: points, total: updatedUser.xp };
      }
      
      // Commit if no XP awarded
      await connection.query('COMMIT');
      return { earned: 0 };
      
    } catch (transactionError) {
      // Rollback on any error
      await connection.query('ROLLBACK');
      throw transactionError;
    }
  } catch (error) {
    console.error('Transaction error in processXpAward:', error);
    throw error;
  }
}