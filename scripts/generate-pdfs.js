const fs = require('fs');
const path = require('path');

function createSimplePdf(title, subtitle, sections) {
  let contentStream = `BT\n/F1 20 Tf\n50 740 Td\n(${escapePdf(title)}) Tj\n`;
  contentStream += `/F1 11 Tf\n0 -24 Td\n(${escapePdf(subtitle)}) Tj\n`;
  contentStream += `0 -25 Td\n(--------------------------------------------------------------------------------------------------) Tj\n`;

  let currentY = 690;
  for (const section of sections) {
    contentStream += `0 -22 Td\n/F1 14 Tf\n(${escapePdf(section.heading)}) Tj\n`;
    contentStream += `/F1 10 Tf\n`;
    for (const line of section.lines) {
      contentStream += `0 -15 Td\n(${escapePdf(line)}) Tj\n`;
    }
    contentStream += `0 -10 Td\n( ) Tj\n`;
  }
  contentStream += `ET\n`;

  const streamLength = Buffer.byteLength(contentStream, 'utf-8');

  const objects = [];
  objects.push(`1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`);
  objects.push(`2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`);
  objects.push(`3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n`);
  objects.push(`4 0 obj\n<< /Length ${streamLength} >>\nstream\n${contentStream}\nendstream\nendobj\n`);
  objects.push(`5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`);

  let fileContent = `%PDF-1.4\n`;
  const offsets = [];
  let currentOffset = Buffer.byteLength(fileContent, 'utf-8');

  for (const obj of objects) {
    offsets.push(currentOffset);
    fileContent += obj;
    currentOffset = Buffer.byteLength(fileContent, 'utf-8');
  }

  const xrefOffset = currentOffset;
  fileContent += `xref\n0 6\n0000000000 65535 f \n`;
  for (const off of offsets) {
    fileContent += String(off).padStart(10, '0') + ` 00000 n \n`;
  }

  fileContent += `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return Buffer.from(fileContent, 'utf-8');
}

function escapePdf(text) {
  return text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

const materialsDir = path.join(__dirname, '..', 'public', 'materials');
if (!fs.existsSync(materialsDir)) {
  fs.mkdirSync(materialsDir, { recursive: true });
}

// 1. DSA Coding Patterns
fs.writeFileSync(
  path.join(materialsDir, 'dsa-coding-patterns.pdf'),
  createSimplePdf(
    'Data Structures & Algorithms - Core Patterns & Cheatsheet',
    'Curated study guide for technical coding interviews (LeetCode / FAANG)',
    [
      {
        heading: '1. Two Pointers Pattern',
        lines: [
          'Usage: Sorted arrays, searching pairs, palindromes, container with most water.',
          'Key Idea: Left and right pointers moving towards each other or at varying speeds.',
          'Time Complexity: O(N), Space Complexity: O(1).',
          'Classic Problems: 3Sum, Valid Palindrome, Two Sum II, Trapping Rain Water.',
        ],
      },
      {
        heading: '2. Sliding Window Pattern',
        lines: [
          'Usage: Subarrays/substrings meeting criteria (maximum sum, longest without repeats).',
          'Fixed Window: Advance right, subtract left once size exceeds k.',
          'Dynamic Window: Expand right to find valid window; shrink left until condition holds.',
          'Classic Problems: Longest Substring Without Repeating Characters, Min Window Substring.',
        ],
      },
      {
        heading: '3. Fast and Slow Pointers (Floyd Cycle Detection)',
        lines: [
          'Usage: Linked list cycle detection, finding middle of linked list, happy number.',
          'Key Idea: Slow advances 1 step, fast advances 2 steps. They meet if a loop exists.',
          'To find start of cycle: Reset slow to head, advance both by 1 step until they meet.',
        ],
      },
      {
        heading: '4. Dynamic Programming Core Framework',
        lines: [
          'Step 1: Define state (what do indices dp[i][j] represent?).',
          'Step 2: Find base cases (smallest trivial subproblems).',
          'Step 3: State transition recurrence (decision tree choices).',
          'Step 4: Space optimization (e.g., reduce O(N^2) space to O(N) or O(1) if only last row needed).',
        ],
      },
    ]
  )
);

// 2. System Design Cheatsheet
fs.writeFileSync(
  path.join(materialsDir, 'system-design-cheatsheet.pdf'),
  createSimplePdf(
    'System Design Blueprint & Latency Numbers Handbook',
    'Architecture guide for distributed systems and high-level design interviews',
    [
      {
        heading: '1. Step-by-Step 45-Minute Interview Strategy',
        lines: [
          '00-05 min: Scope Requirements (Functional, Non-Functional, Read/Write ratio).',
          '05-10 min: Capacity Estimation (Storage over 5 years, QPS, Bandwidth).',
          '10-25 min: High-Level Architecture (API, Clients, LB, App Servers, DB, Cache).',
          '25-40 min: Deep Dives (Sharding key, Replication, Concurrency, Failure modes).',
          '40-45 min: Bottlenecks & Wrap-Up (SPOF, Monitoring, Metrics, Cost).',
        ],
      },
      {
        heading: '2. Latency Numbers Every Engineer Must Know',
        lines: [
          'L1 cache reference: 0.5 ns | Branch mispredict: 5 ns',
          'L2 cache reference: 7 ns   | Mutex lock/unlock: 25 ns',
          'Main memory reference: 100 ns',
          'Read 1 MB sequentially from memory: 250,000 ns (250 us)',
          'SSD random read: 150 us | Read 1 MB sequentially from SSD: 1,000 us (1 ms)',
          'Round trip within same datacenter: 500 us (0.5 ms)',
          'Send packet California to Netherlands: 150,000 us (150 ms)',
        ],
      },
      {
        heading: '3. Storage & Database Selection',
        lines: [
          'Relational (PostgreSQL, MySQL): ACID transactions, structured schemas, complex joins.',
          'NoSQL Document (MongoDB, DynamoDB): Unstructured JSON, dynamic schema, high write scale.',
          'Wide-Column (Cassandra, ScyllaDB): Massive write throughput, time-series, append-only logs.',
          'In-Memory (Redis): Low latency (<1ms) caching, pub/sub, rate-limiting, session store.',
        ],
      },
    ]
  )
);

// 3. SQL & Database Indexing
fs.writeFileSync(
  path.join(materialsDir, 'sql-indexing-optimization.pdf'),
  createSimplePdf(
    'SQL Performance & Indexing Optimization Handbook',
    'Deep dive into B-Trees, Execution Plans, and Query Tuning',
    [
      {
        heading: '1. How B-Tree Indexes Work',
        lines: [
          'B-Trees keep data sorted with O(log N) search, insertion, and deletion.',
          'Leftmost Prefix Rule: Index on (A, B, C) can satisfy queries on A, (A,B), and (A,B,C).',
          'It CANNOT satisfy queries on B or C alone without scanning the whole index.',
          'Avoid functions on indexed columns: WHERE UPPER(email) = ... disables direct index search.',
        ],
      },
      {
        heading: '2. ACID & Transaction Isolation Levels',
        lines: [
          'Read Uncommitted: Lowest isolation; allows dirty reads.',
          'Read Committed: Default in PostgreSQL; prevents dirty reads, allows non-repeatable reads.',
          'Repeatable Read: Prevents non-repeatable reads using MVCC snapshots.',
          'Serializable: Highest isolation; strictly ordered execution via predicate locks / SSI.',
        ],
      },
    ]
  )
);

// 4. Behavioral STAR Framework
fs.writeFileSync(
  path.join(materialsDir, 'behavioral-star-framework.pdf'),
  createSimplePdf(
    'Behavioral Interview Mastery - The STAR Method Framework',
    'Structure answers for Leadership, Conflict Resolution, and Technical Ownership',
    [
      {
        heading: '1. The STAR Technique Formula',
        lines: [
          'S - Situation: Set the scene (context, company, project size, 15% of time).',
          'T - Task: What was the specific challenge or goal you needed to achieve (10% of time).',
          'A - Action: What did YOU specifically do? Technologies, decisions, pushback (60% of time).',
          'R - Result: Measurable impact (latency dropped 40%, saved 20 hrs/week, zero downtime).',
        ],
      },
      {
        heading: '2. Top 5 Classic Question Categories',
        lines: [
          '1. Disagreement with a tech lead or product manager: Focus on data, empathy, and win-win.',
          '2. Major production outage / critical bug: Focus on blameless post-mortem and prevention.',
          '3. Tight deadline with changing requirements: Focus on ruthless prioritization and communication.',
          '4. Mentoring or helping a struggling teammate: Focus on patience, pair programming, enablement.',
        ],
      },
    ]
  )
);

console.log('Sample PDF materials successfully generated in public/materials!');

