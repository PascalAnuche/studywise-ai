#!/usr/bin/env node
/**
 * Seeds a realistic term of study for one student.
 *
 * The point is not "some rows exist" but that every screen has something
 * coherent to show and the numbers agree with each other: the topics on the
 * plan are the topics quizzed, the weak areas are the ones actually missed, and
 * the recommendations name those same topics. A demo that contradicts itself is
 * worse than an empty one.
 *
 * Dates are relative to today, so the data never goes stale.
 * Re-runnable: it clears the seeded student first.
 */
import { connect, prepare } from './db-client.mjs';

const client = connect();
// A tiny prepared-statement shape over the async client, so the script below
// reads as it did under node:sqlite.
const db = { prepare: (sql) => prepare(client, sql) };

const now = new Date();
const iso = (daysAgo = 0) => new Date(now.getTime() - daysAgo * 864e5).toISOString();
const day = (daysAgo = 0) => iso(daysAgo).slice(0, 10);

const EMAIL = 'sarah.johnson@example.ac.uk';
await db.prepare('DELETE FROM students WHERE email = ?').run(EMAIL);

// Persona 1 from PRD section 4.
const student = await db.prepare(
    `INSERT INTO students (name, email, discipline, streak_count, last_active_on, created_at)
     VALUES (?, ?, ?, ?, ?, ?) RETURNING id`
  )
  .get('Sarah Johnson', EMAIL, 'Computer Science', 12, day(0), iso(96));

const studentId = student.id;

// ---------------------------------------------------------------------------
// Study plans
// ---------------------------------------------------------------------------

const insertPlan = db.prepare(
  `INSERT INTO study_plans
     (student_id, subject, goals, topics, frequency, start_date, end_date, status, understood, created_at, updated_at)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`
);

const insertSession = db.prepare(
  `INSERT INTO plan_sessions
     (plan_id, order_index, topic, focus, duration_minutes, scheduled_for, start_time, created_at, updated_at)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
);

const dataStructures = await insertPlan.get(
  studentId,
  'Data Structures',
  JSON.stringify(['Pass the January exam', 'Actually understand recursion', 'Stop guessing at Big-O']),
  JSON.stringify(['Arrays', 'Linked Lists', 'Stacks', 'Queues', 'Hash Tables', 'Recursion', 'Big-O notation', 'Trees', 'Graph traversal', 'Dynamic programming']),
  '5x/week',
  day(21),
  day(-35),
  'active',
  1,
  iso(21),
  iso(1)
);

const operatingSystems = await insertPlan.get(
  studentId,
  'Operating Systems',
  JSON.stringify(['Keep up with the lectures']),
  JSON.stringify(['Processes', 'Scheduling', 'Memory management', 'File systems']),
  '2x/week',
  day(14),
  day(-28),
  'active',
  1,
  iso(14),
  iso(3)
);

// A draft whose checkpoint has not been answered: understood stays null.
await insertPlan.get(
  studentId,
  'Databases',
  JSON.stringify(['Normalisation confidence before the coursework']),
  JSON.stringify(['Normal forms', 'Indexing', 'Transactions']),
  '2x/week',
  day(-2),
  day(-30),
  'draft',
  null,
  iso(2),
  iso(2)
);

/**
 * Sessions across the last week and the week ahead.
 *
 * The Home goal ring is sessions already past over sessions scheduled this
 * week, so these are laid out to land near the design's 72% rather than
 * whatever an arbitrary spread happens to produce.
 */
const SESSIONS = [
  // Earlier this week, all in the past: these count as done.
  ['Arrays', 'Data Structures Lecture', 60, 6, '09:00'],
  ['Linked Lists', 'Algorithms Practice', 45, 6, '14:00'],
  ['Stacks', 'Data Structures Lecture', 45, 5, '10:00'],
  ['Queues', 'Practice Questions', 45, 5, '16:00'],
  ['Hash Tables', 'Weekly Review', 60, 4, '09:30'],
  ['Big-O notation', 'Algorithms Practice', 45, 4, '13:00'],
  ['Recursion', 'Data Structures Lecture', 120, 3, '10:00'],
  ['Trees', 'Practice Questions', 60, 3, '15:00'],
  ['Processes', 'Read Chapter 5', 60, 2, '11:00'],
  ['Scheduling', 'Algorithms Practice', 45, 2, '17:00'],
  ['Graph traversal', 'Weekly Review', 120, 1, '10:00'],
  ['Memory management', 'Read Chapter 6', 60, 1, '14:30'],
  ['Dynamic programming', 'Review AI Notes', 105, 1, '19:00'],

  // Today, matching the design's Today's Plan.
  ['Arrays, Linked Lists', 'Data Structures Lecture', 90, 0, '10:00'],
  ['Dynamic programming', 'Review AI Notes', 60, 0, '13:00'],
  ['Sorting Algorithms', 'Practice Questions', 90, 0, '15:30'],
  ['File systems', 'Read Chapter 7', 60, 0, '19:00'],

  // Ahead: scheduled but not yet due, so they do not count as done.
  ['Sorting Algorithms', 'Algorithms Practice', 60, -1, '10:00'],
];

// for..of rather than forEach: a callback cannot await, and these inserts now
// go one at a time over the client.
for (const [index, [topic, focus, minutes, daysAgo, startTime]] of SESSIONS.entries()) {
  const osTopics = ['Processes', 'Scheduling', 'Memory management', 'File systems'];
  const planId = osTopics.includes(topic) ? operatingSystems.id : dataStructures.id;
  await insertSession.run(planId, index + 1, topic, focus, minutes, day(daysAgo), startTime, iso(21), iso(daysAgo < 0 ? 0 : daysAgo));
}

// ---------------------------------------------------------------------------
// Explanations and follow-ups
// ---------------------------------------------------------------------------

const EXPLANATIONS = [
  ['Arrays', 'Explain the difference between Array and Linked List in Data Structures.',
   [
     "Sure! Here's a clear comparison between Arrays and Linked Lists.",
     '',
     '## Key Differences',
     '',
     '| Feature | Array | Linked List |',
     '| --- | --- | --- |',
     '| Memory Allocation | Contiguous | Non-contiguous |',
     '| Size | Fixed | Dynamic |',
     '| Access | Random Access (Direct indexing) | Sequential Access (Traversal required) |',
     '| Insertion/Deletion | Slow (Shifting required) | Fast (No shifting required) |',
     '| Memory Usage | Less overhead | Extra memory for pointers |',
   ].join('\n'),
   'Because the two differ in how memory is allocated, and every other difference (indexing cost, insertion cost, memory overhead) follows from that one choice.',
   'well-established', 1, 6],
  ['Recursion', 'Why does a recursive function need a base case?',
   'Without a base case the function calls itself forever, and each call keeps a frame on the stack until the stack runs out.',
   'Because recursion only terminates when a call returns without recursing, and the base case is the branch that does that.',
   'well-established', 1, 5],
  ['Big-O notation', 'Is O(n log n) always better than O(n^2)?',
   'For large enough inputs, yes. For small inputs an O(n^2) algorithm with low constants often wins, which is why real sort implementations switch to insertion sort under a threshold.',
   'Because Big-O describes growth as n grows, not the constant factors that dominate at small n.',
   'one interpretation', 1, 4],
  ['Hash Tables', 'What happens when two keys hash to the same bucket?',
   'That is a collision, and the table resolves it either by chaining (a list per bucket) or open addressing (probe for the next free slot).',
   'Because a hash maps a large key space onto a small bucket space, so collisions are guaranteed by the pigeonhole principle rather than being a bug.',
   'well-established', 1, 4],
  ['Dynamic programming', 'When do I use memoisation over tabulation?',
   'Memoisation when the recursion is natural and you only need some subproblems; tabulation when you need all of them and want to avoid deep call stacks.',
   'Because both cache the same subproblem results, and the choice is really about traversal order and stack depth rather than about complexity.',
   'worth verifying', 0, 2],
  ['Graph traversal', 'What is the difference between BFS and DFS?',
   'BFS explores level by level using a queue; DFS follows one path to its end using a stack or recursion.',
   'Because the only real difference is the data structure holding the frontier, and the traversal order falls out of that.',
   'well-established', null, 1],
  ['Trees', 'Why is a balanced tree better than an unbalanced one?',
   'A balanced tree keeps height at about log n, so search stays logarithmic. An unbalanced tree can degrade to a chain, at which point search is linear.',
   'Because search cost on a tree is proportional to its height, not its node count.',
   'well-established', 1, 3],
  ['Scheduling', 'What is the difference between preemptive and non-preemptive scheduling?',
   'Preemptive scheduling can interrupt a running process; non-preemptive waits for it to yield or finish.',
   'Because the distinction is only about who controls when a process stops running, the scheduler or the process.',
   'one interpretation', 1, 2],
];

const insertExplanation = db.prepare(
  `INSERT INTO explanations
     (student_id, subject, question, answer, reasoning, confidence, understood, created_at)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`
);

const explanationIds = {};
for (const [subject, question, answer, reasoning, confidence, understood, daysAgo] of EXPLANATIONS) {
  const row = await insertExplanation.get(studentId, subject, question, answer, reasoning, confidence, understood, iso(daysAgo));
  explanationIds[subject] = row.id;
}

const insertFollowUp = db.prepare(
  `INSERT INTO follow_up_questions
     (explanation_id, question, answer, reasoning, confidence, created_at)
   VALUES (?, ?, ?, ?, ?, ?)`
);

await insertFollowUp.run(
  explanationIds['Dynamic programming'],
  "I didn't follow that. Can you explain it a different way, with a worked example or smaller steps?",
  'Take Fibonacci with n = 5. Memoisation starts at fib(5) and caches on the way down. Tabulation starts at fib(0) and fills upward. Same values, opposite direction.',
  'Because a small case makes the shared subproblems visible, which is the part the general description hides.',
  'well-established',
  iso(2)
);

await insertFollowUp.run(
  explanationIds['Arrays'],
  'Can you give me an example of each?',
  'An array is a row of lockers numbered 0 upward. A linked list is a treasure hunt: each note tells you where the next one is.',
  'Because the analogy keeps the one property that matters, whether you can jump straight to position n or must walk to it.',
  'well-established',
  iso(6)
);

// ---------------------------------------------------------------------------
// Quizzes
// ---------------------------------------------------------------------------

const insertQuiz = db.prepare(
  `INSERT INTO quizzes (student_id, subject, topic, difficulty, score, completed_at, created_at)
   VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id`
);

const insertQuestion = db.prepare(
  `INSERT INTO quiz_questions
     (quiz_id, question_text, options, correct_answer, reasoning, student_answer, is_correct, explanation_id, created_at)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
);

/** [subject, topic, difficulty, correct, wrong, daysAgo] */
const QUIZZES = [
  ['Data Structures', 'Arrays', 'medium', 6, 1, 6],
  ['Data Structures', 'Linked Lists', 'medium', 5, 1, 5],
  ['Data Structures', 'Stacks', 'easy', 5, 0, 5],
  ['Data Structures', 'Hash Tables', 'medium', 5, 2, 4],
  ['Data Structures', 'Big-O notation', 'hard', 4, 2, 4],
  ['Data Structures', 'Recursion', 'medium', 6, 2, 3],
  ['Data Structures', 'Trees', 'medium', 5, 1, 3],
  ['Operating Systems', 'Scheduling', 'easy', 5, 1, 2],
  ['Data Structures', 'Dynamic programming', 'hard', 2, 3, 1],
];

let questionsSolved = 0;

for (const [subject, topic, difficulty, correct, wrong, daysAgo] of QUIZZES) {
  const total = correct + wrong;
  const quiz = await insertQuiz.get(studentId, subject, topic, difficulty, correct / total, iso(daysAgo), iso(daysAgo));

  for (let i = 0; i < total; i++) {
    const isCorrect = i < correct;
    const answer = `The correct answer for ${topic} point ${i + 1}`;
    await insertQuestion.run(
      quiz.id,
      `[${difficulty}] Question ${i + 1} on ${topic}.`,
      JSON.stringify([answer, `A common mix-up on ${topic}`, `True of a related topic, but not ${topic}`, 'Correct wording, wrong conclusion']),
      answer,
      `Because ${topic} turns on the distinction the other options each miss in a different way.`,
      isCorrect ? answer : `A common mix-up on ${topic}`,
      isCorrect ? 1 : 0,
      isCorrect ? null : (explanationIds[topic] ?? null),
      iso(daysAgo)
    );
    questionsSolved++;
  }
}

// ---------------------------------------------------------------------------
// Progress
// ---------------------------------------------------------------------------

/** [topic, status, weak, daysAgo|null] */
const PROGRESS = [
  ['Arrays', 'completed', 0, 6],
  ['Linked Lists', 'completed', 0, 5],
  ['Stacks', 'completed', 0, 5],
  ['Queues', 'completed', 0, 5],
  ['Hash Tables', 'completed', 1, 4],
  ['Big-O notation', 'completed', 1, 4],
  ['Recursion', 'completed', 0, 3],
  ['Trees', 'completed', 0, 3],
  ['Processes', 'in_progress', 0, 2],
  ['Scheduling', 'in_progress', 0, 2],
  ['Graph traversal', 'in_progress', 0, 1],
  ['Memory management', 'in_progress', 0, 1],
  ['Dynamic programming', 'in_progress', 1, 1],
  ['Sorting Algorithms', 'not_started', 0, null],
  ['File systems', 'not_started', 0, null],
];

const insertProgress = db.prepare(
  `INSERT INTO progress (student_id, topic, status, last_studied_at, is_weak_area, created_at, updated_at)
   VALUES (?, ?, ?, ?, ?, ?, ?)`
);

for (const [topic, status, weak, daysAgo] of PROGRESS) {
  await insertProgress.run(studentId, topic, status, daysAgo === null ? null : iso(daysAgo), weak, iso(21), iso(daysAgo ?? 21));
}

// ---------------------------------------------------------------------------
// Recommendations, each naming a topic that was actually missed
// ---------------------------------------------------------------------------

const insertRecommendation = db.prepare(
  `INSERT INTO recommendations (student_id, based_on_quiz_id, topic, reason, created_at)
   VALUES (?, ?, ?, ?, ?)`
);

const lastQuiz = await db.prepare('SELECT id FROM quizzes WHERE student_id = ? ORDER BY created_at DESC LIMIT 1')
  .get(studentId);

await insertRecommendation.run(studentId, lastQuiz.id, 'Dynamic programming', '3 of 5 questions on Dynamic programming were incorrect.', iso(1));
await insertRecommendation.run(studentId, null, 'Hash Tables', '2 of 6 questions were incorrect, and it is on your active Data Structures plan.', iso(4));
await insertRecommendation.run(studentId, null, 'Sorting Algorithms', 'Not started, and it is scheduled on your plan for tomorrow.', iso(0));

// ---------------------------------------------------------------------------

const count = async (table) =>
  (await db.prepare(`SELECT COUNT(*) AS n FROM ${table} WHERE student_id = ?`).get(studentId)).n;

const sessions = (
  await db
    .prepare(
      'SELECT COUNT(*) AS n FROM plan_sessions WHERE plan_id IN (SELECT id FROM study_plans WHERE student_id = ?)'
    )
    .get(studentId)
).n;

console.log(`Seeded student ${studentId} (${EMAIL})`);
console.log(`  study_plans:     ${await count('study_plans')} (${sessions} sessions)`);
console.log(`  explanations:    ${await count('explanations')}`);
console.log(`  quizzes:         ${await count('quizzes')} (${questionsSolved} questions answered)`);
console.log(`  progress:        ${await count('progress')}`);
console.log(`  recommendations: ${await count('recommendations')}`);
client.close();
