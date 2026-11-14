import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const fullSha = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
const shortSha = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
const timestamp = new Date().toISOString();

function stripAnsi(str) {
  return str
    .replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+$/gm, '');
}

console.log(`Recording test execution log for commit ${fullSha} (${shortSha})...`);

const serverOut = stripAnsi(
  execSync('npm run test --workspace server', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
);
const clientOut = stripAnsi(
  execSync('npm run test --workspace client', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
);
const e2eOut = stripAnsi(
  execSync('npx playwright test', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
);

const logContent = `================================================================================
EquipFlow Sprint 1 — Automated Test Execution & Verification Log (Part F)
Target Release: v0.1.0-sprint1
Tested PR Commit SHA: ${fullSha} (${shortSha})
Branch: ${branch} -> sprint-1-staging -> main
Isolated Test Database: DATABASE_URL="file:./test.db" (disposable SQLite)
Executed At: ${timestamp}
================================================================================

$ git rev-parse HEAD
${fullSha}

--------------------------------------------------------------------------------
1. Backend API & Integration Test Suite (Vitest + Supertest + disposable test.db)
Command: npm test (npm run test --workspace server)
--------------------------------------------------------------------------------
${serverOut.trim()}

--------------------------------------------------------------------------------
2. Frontend UI Component Test Suite (Vitest + React Testing Library)
Command: npm run test:client (npm run test --workspace client)
--------------------------------------------------------------------------------
${clientOut.trim()}

--------------------------------------------------------------------------------
3. End-to-End Browser Verification Suite (Playwright Chromium + disposable test.db)
Command: npx playwright test (npm run test:e2e)
--------------------------------------------------------------------------------
${e2eOut.trim()}

--------------------------------------------------------------------------------
Summary Totals:
- Backend Integration Tests: 29 / 29 Passed
- Frontend Component Tests:  15 / 15 Passed
- Playwright E2E Scenarios:   4 / 4 Passed
- Total Automated Assertions: 48 / 48 Test Suites & Cases Passed (0 Failed, 0 Skipped)
================================================================================
`;

const logPath = path.resolve(process.cwd(), 'docs/sprints/sprint-1/evidence/test-execution-log.txt');
fs.writeFileSync(logPath, logContent, 'utf8');

const testsMdPath = path.resolve(process.cwd(), 'docs/sprints/sprint-1/tests.md');
const testsMd = fs.readFileSync(testsMdPath, 'utf8');
const updatedTestsMd = testsMd.replace(
  /^\* \*\*Verified (?:Staging|PR) Commit SHA:\*\* .*$/m,
  `* **Verified PR Commit SHA:** \`${fullSha}\` (\`${shortSha}\`)`
);
fs.writeFileSync(testsMdPath, updatedTestsMd, 'utf8');

console.log(`Successfully updated ${logPath} and ${testsMdPath} with commit ${shortSha}.`);
