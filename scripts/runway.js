#!/usr/bin/env node

/**
 * Runway — Multi-step implementation executor
 *
 * Usage:
 *   node scripts/runway.js <task-name>              # 순차 실행
 *   node scripts/runway.js <task-name> --push        # 실행 후 push
 *   node scripts/runway.js <task-name> --step <N>    # 특정 step만 실행
 *   node scripts/runway.js --status                  # 전체 현황
 *   node scripts/runway.js --status <task-name>      # task 현황
 */

import { existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { runTask } from './lib/runway/runner.js';
import { ensureBranch, push } from './lib/runway/git.js';
import {
  readJson,
  printStatus,
  markTaskStarted,
  updatePhaseStatus,
  checkBlockers,
} from './lib/runway/reporter.js';

const PROJECT_ROOT = resolve(import.meta.dirname, '..');
const PHASES_DIR = join(PROJECT_ROOT, 'docs', 'phases');

function usage() {
  console.log(`
  Runway — Multi-step implementation executor

  Usage:
    node scripts/runway.js <task-name>              순차 실행
    node scripts/runway.js <task-name> --push       실행 후 push
    node scripts/runway.js <task-name> --step <N>   특정 step만 실행
    node scripts/runway.js --status                 전체 현황
    node scripts/runway.js --status <task-name>     task 현황
  `);
}

async function showGlobalStatus() {
  const indexPath = join(PHASES_DIR, 'index.json');
  if (!existsSync(indexPath)) {
    console.log('\n  docs/phases/index.json이 없습니다. /runway로 phase를 먼저 생성하세요.\n');
    return;
  }

  const phases = await readJson(indexPath);
  console.log('\n  === Runway Phase Status ===\n');

  for (const phase of phases.phases) {
    const icon =
      phase.status === 'completed' ? '\x1b[32m✓\x1b[0m' :
      phase.status === 'error'     ? '\x1b[31m✗\x1b[0m' :
      phase.status === 'blocked'   ? '\x1b[33m⊘\x1b[0m' :
                                     '\x1b[90m○\x1b[0m';
    console.log(`  ${icon} ${phase.dir} — ${phase.status}`);
  }
  console.log('');
}

async function showTaskStatus(taskName) {
  const indexPath = join(PHASES_DIR, taskName, 'index.json');
  if (!existsSync(indexPath)) {
    console.error(`\n  docs/phases/${taskName}/index.json이 없습니다.\n`);
    process.exit(1);
  }

  const data = await readJson(indexPath);
  printStatus(data);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    usage();
    process.exit(0);
  }

  // --status 처리
  if (args[0] === '--status') {
    if (args[1]) {
      await showTaskStatus(args[1]);
    } else {
      await showGlobalStatus();
    }
    return;
  }

  const taskName = args[0];
  const shouldPush = args.includes('--push');
  const stepIdx = args.indexOf('--step');
  const singleStep = stepIdx !== -1 ? parseInt(args[stepIdx + 1], 10) : undefined;

  if (singleStep !== undefined && Number.isNaN(singleStep)) {
    console.error(`\n  --step requires a numeric argument. Got: ${args[stepIdx + 1] ?? '(nothing)'}\n`);
    process.exit(1);
  }

  // task 디렉토리 확인
  const taskDir = join(PHASES_DIR, taskName);
  const indexPath = join(taskDir, 'index.json');

  if (!existsSync(indexPath)) {
    console.error(`\n  docs/phases/${taskName}/index.json이 없습니다.`);
    console.error(`  /runway ${taskName} 으로 phase를 먼저 생성하세요.\n`);
    process.exit(1);
  }

  // 브랜치 생성/전환
  console.log(`\n  === Runway: ${taskName} ===`);
  const branch = await ensureBranch(taskName, PROJECT_ROOT);
  console.log(`  Branch: ${branch}`);

  // 기존 error/blocked step 확인
  checkBlockers(await readJson(indexPath));

  // task 시작 기록
  await markTaskStarted(indexPath);

  // Step 실행
  await runTask({
    projectRoot: PROJECT_ROOT,
    taskName,
    singleStep,
  });

  // Phase 상태 업데이트
  const phasesIndexPath = join(PHASES_DIR, 'index.json');
  if (existsSync(phasesIndexPath)) {
    await updatePhaseStatus(phasesIndexPath, taskName);
  }

  // 최종 상태 출력
  const finalData = await readJson(indexPath);
  printStatus(finalData);

  // push
  if (shouldPush) {
    console.log('  Pushing to remote...');
    try {
      await push(PROJECT_ROOT);
      console.log('  \x1b[32m✓\x1b[0m Push 완료\n');
    } catch (err) {
      console.error(`  \x1b[31m✗\x1b[0m Push 실패: ${err.message}\n`);
    }
  }
}

main().catch((err) => {
  console.error(`\n  Fatal error: ${err.message}\n`);
  process.exit(1);
});
