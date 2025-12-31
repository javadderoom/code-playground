import { db } from './index.js';
import { problems, testCases, submissions, type Difficulty } from './schema.js';
import { eq } from 'drizzle-orm';

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // Clear submissions table
    console.log('🗑️  Clearing submissions table...');
    await db.delete(submissions);
    console.log('✅ Submissions table cleared');
    const slug = 'sum-of-two-numbers';
    
    const problemData = {
      title: 'Sum of Two Numbers',
      slug,
      description: `
# جمع دو عدد

یک تابع بنویسید که دو عدد صحیح \`a\` و \`b\` را دریافت کرده و مجموع آن‌ها را برگرداند.

## مثال
**ورودی:**
\`a = 1, b = 2\`

**خروجی:**
\`3\`
      `.trim(),
      difficulty: 'Easy' as Difficulty,
      functionName: 'add',
      starterCode: `
def add(a: int, b: int) -> int:
   
    return 0
`.trim(),
    };

    // Check if problem exists
    const existing = await db.select().from(problems).where(eq(problems.slug, slug));
    let problemId: number;

    if (existing.length > 0) {
      console.log(`🔄 Updating existing problem: ${slug}`);
      problemId = existing[0].id;
      await db.update(problems).set(problemData).where(eq(problems.id, problemId));
      
      // Remove existing test cases to replace them
      await db.delete(testCases).where(eq(testCases.problemId, problemId));
    } else {
      console.log(`✨ Creating new problem: ${slug}`);
      const [p] = await db.insert(problems).values(problemData).returning();
      problemId = p.id;
    }

    console.log(`✅ Problem synced: ${problemData.title} (ID: ${problemId})`);

    // 2. Create Test Cases
    await db.insert(testCases).values([
      {
        problemId: problemId,
        input: JSON.stringify( [1, 2] ),
        expectedOutput: '3',
        isHidden: false
      },
      {
        problemId: problemId,
        input: JSON.stringify([10, 20] ),
        expectedOutput: '30',
        isHidden: false
      },
      {
        problemId: problemId,
        input: JSON.stringify([-4, 5] ),
        expectedOutput: '1',
        isHidden: true // Hidden test case
      }
    ]);

    console.log('✅ Test cases added successfully');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    process.exit(0);
  }
}

seed();
