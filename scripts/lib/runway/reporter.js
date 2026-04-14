import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

/**
 * index.json 읽기/쓰기 + 상태 리포팅 유틸리티.
 * 타임스탬프 자동 기록을 담당한다.
 */

function now() {
  return new Date().toISOString();
}

/**
 * JSON 파일 읽기
 */
export async function readJson(filePath) {
  const raw = await readFile(filePath, 'utf-8');
  return JSON.parse(raw);
}

/**
 * JSON 파일 쓰기 (pretty print)
 */
export async function writeJson(filePath, data) {
  await writeFile(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

/**
 * Task index.json에 created_at 기록 (최초 실행 시 1회)
 */
export async function markTaskStarted(indexPath) {
  const data = await readJson(indexPath);
  if (!data.created_at) {
    data.created_at = now();
    await writeJson(indexPath, data);
  }
  return data;
}

/**
 * Step 시작 기록
 */
export async function markStepStarted(indexPath, stepNum) {
  const data = await readJson(indexPath);
  const step = data.steps.find((s) => s.step === stepNum);
  if (step) {
    step.started_at = now();
    await writeJson(indexPath, data);
  }
  return data;
}

/**
 * Step 완료 기록.
 * Claude가 이미 index.json에 status/summary를 기록했으므로
 * 그 데이터를 기반으로 completed_at 타임스탬프만 추가한다.
 */
export async function markStepCompleted(indexPath, stepNum) {
  const data = await readJson(indexPath);
  const step = data.steps.find((s) => s.step === stepNum);
  if (step) {
    step.completed_at = now();
  }
  await writeJson(indexPath, data);
  return data;
}

/**
 * Step 에러 기록.
 * Claude가 error_message를 남겼으면 그대로 유지하고 타임스탬프만 추가한다.
 */
export async function markStepError(indexPath, stepNum) {
  const data = await readJson(indexPath);
  const step = data.steps.find((s) => s.step === stepNum);
  if (step) {
    step.failed_at = now();
    step.status = 'error';
    await writeJson(indexPath, data);
  }
  return data;
}

/**
 * Step blocked 기록.
 * Claude가 blocked_reason을 남겼으면 그대로 유지하고 타임스탬프만 추가한다.
 */
export async function markStepBlocked(indexPath, stepNum) {
  const data = await readJson(indexPath);
  const step = data.steps.find((s) => s.step === stepNum);
  if (step) {
    step.status = 'blocked';
    step.blocked_at = now();
    await writeJson(indexPath, data);
  }
  return data;
}

/**
 * 실행 전 기존 error/blocked step이 있는지 확인.
 * 발견 시 안내 메시지와 함께 즉시 종료한다.
 */
export function checkBlockers(data) {
  for (const s of data.steps) {
    if (s.status === 'error') {
      console.error(`\n  ✗ Step ${s.step} (${s.name}) failed.`);
      console.error(`  Error: ${s.error_message ?? 'unknown'}`);
      console.error(`  Fix and reset status to 'pending' to retry.\n`);
      process.exit(1);
    }
    if (s.status === 'blocked') {
      console.error(`\n  ⏸ Step ${s.step} (${s.name}) blocked.`);
      console.error(`  Reason: ${s.blocked_reason ?? 'unknown'}`);
      console.error(`  Resolve and reset status to 'pending' to retry.\n`);
      process.exit(2);
    }
  }
}

/**
 * 전체 phase 상태 업데이트 (모든 step 완료 시 phase도 completed)
 */
export async function updatePhaseStatus(phasesIndexPath, taskName) {
  const phases = await readJson(phasesIndexPath);
  const phase = phases.phases.find((p) => p.dir === taskName);
  if (!phase) return;

  // task index.json 읽기
  const taskDir = join(dirname(phasesIndexPath), taskName, 'index.json');
  let taskData;
  try {
    taskData = await readJson(taskDir);
  } catch {
    return;
  }

  const allCompleted = taskData.steps.every((s) => s.status === 'completed');
  const hasError = taskData.steps.some((s) => s.status === 'error');
  const hasBlocked = taskData.steps.some((s) => s.status === 'blocked');

  if (allCompleted) {
    phase.status = 'completed';
    phase.completed_at = now();
  } else if (hasBlocked) {
    phase.status = 'blocked';
    phase.blocked_at = now();
  } else if (hasError) {
    phase.status = 'error';
    phase.failed_at = now();
  }

  await writeJson(phasesIndexPath, phases);
}

/**
 * 현황 출력 (터미널용)
 */
export function printStatus(data) {
  console.log(`\n  Project: ${data.project}`);
  console.log(`  Phase:   ${data.phase}\n`);

  for (const step of data.steps) {
    const icon =
      step.status === 'completed' ? '\x1b[32m✓\x1b[0m' :
      step.status === 'error'     ? '\x1b[31m✗\x1b[0m' :
      step.status === 'blocked'   ? '\x1b[33m⊘\x1b[0m' :
                                    '\x1b[90m○\x1b[0m';

    const summary = step.summary ? ` — ${step.summary}` : '';
    const error = step.error_message ? ` — ${step.error_message}` : '';
    const blocked = step.blocked_reason ? ` — ${step.blocked_reason}` : '';

    console.log(`  ${icon} step ${step.step}: ${step.name}${summary}${error}${blocked}`);
  }
  console.log('');
}
