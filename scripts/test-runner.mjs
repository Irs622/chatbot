#!/usr/bin/env node
import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

const c = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  bgBlue: '\x1b[44m',
  bgGreen: '\x1b[42m',
  white: '\x1b[37m'
};

const suites = [
  { name: 'Configuration & Knowledge Base', file: 'tests/config-knowledge.test.ts', category: 'Integrity' },
  { name: 'Intent Recognition & NLP (ID/EN/KO)', file: 'tests/intent.test.ts', category: 'AI Engine' },
  { name: 'RAG Knowledge Retrieval & Search', file: 'tests/rag.test.ts', category: 'RAG System' },
  { name: 'Validation, Phone (+62) & Security', file: 'tests/validation-auth.test.ts', category: 'Security' },
  { name: 'Database, CRM & Analytics Pipeline', file: 'tests/db.test.ts', category: 'Data & CRM' },
  { name: 'Lead Scoring & Prioritization Matrix', file: 'tests/lead-scoring.test.ts', category: 'BD Matrix' },
  { name: 'Dynamic Analytics & Conversion Funnel', file: 'tests/analytics.test.ts', category: 'Analytics' },
  { name: 'Client Confirmation & WhatsApp Handoff', file: 'tests/client-confirmation.test.ts', category: 'Automation' },
  { name: 'Enterprise Qualification & Schema UX', file: 'tests/enterprise-qualification.test.ts', category: 'Qualification' },
  { name: 'Consultative Diagnostic & Discovery Flow', file: 'tests/consultative-diagnostic.test.ts', category: 'Consultative' },
  { name: 'CRM Kanban Pipeline & Data Export', file: 'tests/crm-kanban-export.test.ts', category: 'CRM Kanban' },
  { name: 'End-to-End Client Journey Simulation', file: 'tests/e2e-simulation.test.ts', category: 'E2E Flow' }
];

console.log('\n' + c.blue + '━'.repeat(72) + c.reset);
console.log(`${c.bright}${c.blue}  🏢 INPARTNER AI — AUTOMATED QUALITY ASSURANCE SUITE${c.reset}`);
console.log(`${c.dim}  PT Inpartner Optima Integra • Multi-Layer Verification System${c.reset}`);
console.log(c.blue + '━'.repeat(72) + c.reset + '\n');

const startTime = Date.now();

function runSuite(suite) {
  return new Promise((resolve) => {
    const start = Date.now();
    const proc = spawn('node', ['--experimental-strip-types', '--test', suite.file], {
      cwd: process.cwd(),
      env: { ...process.env, NODE_NO_WARNINGS: '1' }
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (d) => { stdout += d.toString(); });
    proc.stderr.on('data', (d) => { stderr += d.toString(); });

    proc.on('close', (code) => {
      const duration = Date.now() - start;
      const passMatch = stdout.match(/pass\s+(\d+)/);
      const failMatch = stdout.match(/fail\s+(\d+)/);
      const totalMatch = stdout.match(/tests\s+(\d+)/);

      const pass = passMatch ? parseInt(passMatch[1], 10) : 0;
      const fail = failMatch ? parseInt(failMatch[1], 10) : 0;
      const total = totalMatch ? parseInt(totalMatch[1], 10) : pass + fail;

      resolve({
        ...suite,
        code,
        duration,
        pass,
        fail,
        total,
        output: stdout,
        error: stderr
      });
    });
  });
}

async function main() {
  const results = [];
  for (const suite of suites) {
    process.stdout.write(`  ${c.dim}Running${c.reset} [${c.cyan}${suite.category}${c.reset}] ${suite.name}... `);
    const res = await runSuite(suite);
    results.push(res);

    if (res.code === 0 && res.fail === 0) {
      console.log(`${c.green}✔ PASSED${c.reset} ${c.dim}(${res.pass} tests, ${res.duration}ms)${c.reset}`);
    } else {
      console.log(`${c.red}✖ FAILED${c.reset} ${c.dim}(${res.fail} failed)${c.reset}`);
    }
  }

  const totalDuration = Date.now() - startTime;
  const totalPass = results.reduce((a, b) => a + b.pass, 0);
  const totalFail = results.reduce((a, b) => a + b.fail, 0);
  const grandTotal = results.reduce((a, b) => a + b.total, 0);

  console.log('\n' + c.blue + '━'.repeat(72) + c.reset);
  console.log(`${c.bright}  SUMMARY TEST EXECUTION DASHBOARD${c.reset}`);
  console.log(c.blue + '━'.repeat(72) + c.reset);

  console.log(`  ${c.dim}Total Suites Run :${c.reset} ${suites.length}`);
  console.log(`  ${c.dim}Total Assertions :${c.reset} ${c.bright}${grandTotal}${c.reset}`);
  console.log(`  ${c.dim}Passed Tests     :${c.reset} ${c.green}${c.bright}${totalPass}${c.reset}`);
  console.log(`  ${c.dim}Failed Tests     :${c.reset} ${totalFail > 0 ? c.red : c.dim}${totalFail}${c.reset}`);
  console.log(`  ${c.dim}Execution Time   :${c.reset} ${totalDuration}ms`);
  console.log(`  ${c.dim}Success Rate     :${c.reset} ${totalFail === 0 ? c.green + '100% (READY FOR PRODUCTION)' : c.red + ((totalPass/grandTotal)*100).toFixed(1) + '%'}${c.reset}`);
  console.log(c.blue + '━'.repeat(72) + c.reset + '\n');

  // Reset database state after testing
  const dbPath = path.join(process.cwd(), 'data', 'db.json');
  if (fs.existsSync(dbPath)) {
    try {
      fs.writeFileSync(
        dbPath,
        JSON.stringify({ conversations: [], messages: [], leads: [], analytics_events: [] }, null, 2)
      );
    } catch {
      // ignore
    }
  }

  if (totalFail > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal testing error:', err);
  process.exit(1);
});
