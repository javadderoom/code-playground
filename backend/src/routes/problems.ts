import { Hono } from 'hono'
import { db } from '../db/index.js'
import { problems } from '../db/schema.js'
import { eq } from 'drizzle-orm'
const router = new Hono()

router.get('/', async (c) => {
  const data = await db.select().from(problems)
  return c.json({ problems: data })
})
router.get('/:slug', async (c) => {
    const slug = c.req.param('slug');
    try {
      const [problem] = await db.select().from(problems).where(eq(problems.slug, slug));
      if (!problem) return c.json({ error: 'Problem not found' }, 404);
      return c.json(problem);
    } catch (e) {
      return c.json({ error: 'Database error' }, 500);
    }
  });

export default router