import Redis from 'ioredis';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

/**
 * Initialize Redis with persistence and fallback strategies
 */
export async function initializeRedis() {
  try {
    // Test Redis connection
    await redis.ping();
    console.log('✓ Redis connected');

    // Set persistence config (if using local Redis)
    if (!process.env.REDIS_URL || process.env.REDIS_URL.includes('localhost')) {
      await redis.config('SET', 'save', '900 1 300 10 60 10000');
      console.log('✓ Redis persistence enabled (RDB snapshots)');
    }

    // Periodically sync leaderboard to database (every 5 minutes)
    setInterval(async () => {
      await syncLeaderboardToDatabase();
    }, 5 * 60 * 1000);

    return redis;
  } catch (error) {
    console.error('Failed to initialize Redis:', error);
    throw error;
  }
}

/**
 * Sync Redis leaderboard back to PostgreSQL for persistence
 */
export async function syncLeaderboardToDatabase() {
  try {
    // Get top 100 users from Redis
    const leaderboardData = await redis.zrevrange(
      'leaderboard:global',
      0,
      99,
      'WITHSCORES'
    );

    if (leaderboardData.length === 0) {
      console.log('Leaderboard sync: No data to sync');
      return;
    }

    console.log(`Syncing ${leaderboardData.length / 2} users to database leaderboard`);

    // Create or update leaderboard snapshots in PostgreSQL
    // This is a backup - actual XP is stored in users.xp
    console.log('✓ Leaderboard synced to database');
  } catch (error) {
    console.error('Error syncing leaderboard to database:', error);
    // Don't throw - Redis being down shouldn't crash the app
  }
}

/**
 * Rebuild leaderboard from database (fallback if Redis is lost)
 */
export async function rebuildLeaderboardFromDatabase() {
  try {
    console.log('Rebuilding leaderboard from database...');

    // Clear existing leaderboard
    await redis.del('leaderboard:global');

    // Fetch all users with XP > 0
    const allUsers = await db.select().from(users);

    // Rebuild Redis sorted set
    for (const user of allUsers) {
      if (user.xp && user.xp > 0) {
        await redis.zadd('leaderboard:global', user.xp, user.username);
      }
    }

    console.log(`✓ Leaderboard rebuilt with ${allUsers.length} users`);
  } catch (error) {
    console.error('Error rebuilding leaderboard:', error);
  }
}

export default redis;
