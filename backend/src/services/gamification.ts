import { db } from '../db/index.js'
import { users, submissions } from '../db/schema.js'
import { and, eq, sql } from 'drizzle-orm'
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

const XP_TABLE = { Easy: 10, Medium: 30, Hard: 50 } as const
const COINS_TABLE = { Easy: 5, Medium: 15, Hard: 25 } as const

const utcDayKey = (date: Date) => {
  const y = date.getUTCFullYear()
  const m = `${date.getUTCMonth() + 1}`.padStart(2, '0')
  const d = `${date.getUTCDate()}`.padStart(2, '0')
  return `${y}-${m}-${d}`
}

const isSameUtcDay = (a: Date, b: Date) => utcDayKey(a) === utcDayKey(b)

const isYesterdayUtc = (last: Date, now: Date) => {
  const y = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  y.setUTCDate(y.getUTCDate() - 1)
  return isSameUtcDay(last, y)
}

export async function processXpAward(userId: string, problemId: number, difficulty: string) {
  const [user] = await db
    .select({
      id: users.id,
      username: users.username,
      xp: users.xp,
      coins: users.coins,
      streakDays: users.streakDays,
      lastSolvedAt: users.lastSolvedAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!user) {
    throw new Error(`User not found for reward processing: ${userId}`)
  }

  // /submit writes the accepted submission first; count===1 means first-ever accepted solve.
  const [acceptedCountRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(submissions)
    .where(
      and(
        eq(submissions.userId, userId),
        eq(submissions.problemId, problemId),
        eq(submissions.status, 'Accepted'),
      ),
    )

  const acceptedCount = Number(acceptedCountRow?.count ?? 0)
  const isFirstAccepted = acceptedCount === 1

  const xpEarned = isFirstAccepted ? (XP_TABLE[difficulty as keyof typeof XP_TABLE] ?? XP_TABLE.Easy) : 0
  const coinsEarned = isFirstAccepted ? (COINS_TABLE[difficulty as keyof typeof COINS_TABLE] ?? COINS_TABLE.Easy) : 0

  const now = new Date()
  const lastSolvedAt = user.lastSolvedAt ? new Date(user.lastSolvedAt) : null
  const currentStreak = user.streakDays ?? 0

  let streakDays = currentStreak
  let shouldUpdateLastSolvedAt = false

  // Streak can advance only once per day.
  if (!lastSolvedAt || !isSameUtcDay(lastSolvedAt, now)) {
    shouldUpdateLastSolvedAt = true
    streakDays = lastSolvedAt && isYesterdayUtc(lastSolvedAt, now) ? currentStreak + 1 : 1
  }

  const shouldWrite =
    xpEarned > 0 || coinsEarned > 0 || shouldUpdateLastSolvedAt

  if (!shouldWrite) {
    return {
      xpEarned: 0,
      totalXp: user.xp ?? 0,
      coinsEarned: 0,
      totalCoins: user.coins ?? 0,
      streakDays: currentStreak,
    }
  }

  const [updatedUser] = await db
    .update(users)
    .set({
      xp: sql`COALESCE(${users.xp}, 0) + ${xpEarned}`,
      coins: sql`COALESCE(${users.coins}, 0) + ${coinsEarned}`,
      streakDays,
      lastSolvedAt: shouldUpdateLastSolvedAt ? now : user.lastSolvedAt,
    })
    .where(eq(users.id, userId))
    .returning({
      username: users.username,
      xp: users.xp,
      coins: users.coins,
      streakDays: users.streakDays,
    })

  const totalXp = updatedUser?.xp ?? user.xp ?? 0
  const totalCoins = updatedUser?.coins ?? user.coins ?? 0
  const updatedStreak = updatedUser?.streakDays ?? streakDays

  try {
    await redis.zadd('leaderboard:global', totalXp, updatedUser?.username ?? user.username)
  } catch (redisError) {
    console.warn('Leaderboard update failed:', redisError)
  }

  return {
    xpEarned,
    totalXp,
    coinsEarned,
    totalCoins,
    streakDays: updatedStreak,
  }
}
