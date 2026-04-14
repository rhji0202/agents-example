import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { buildPrompt } from './context.js';
import {
  markStepStarted,
  markStepCompleted,
  markStepError,
  markStepBlocked,
  readJson,
} from './reporter.js';
import { twoPhaseCommit } from './git.js';

const exec = promisify(execFile);

const MAX_RETRIES = 3;

/**
 * claude -p 를 실행하여 step을 수행한다.
 * @returns {{ exitCode: number, stdout: string, stderr: string }}
 */
async function runClaude(prompt, cwd) {
  try {
    const { stdout, stderr } = await exec(
      'claude',
      ['-p', prompt, '--output-format', 'text'],
      {
        cwd,
        maxBuffer: 10 * 1024 * 1024, // 10MB
        timeout: 600_000, // 10분
        env: { ...process.env },
      }
    );
    return { exitCode: 0, stdout, stderr };
  } catch (err) {
    return {
      exitCode: err.code ?? 1,
      stdout: err.stdout ?? '',
      stderr: err.stderr ?? err.message,
    };
  }
}

/**
 * 단일 step 실행
 */
async function executeStep({ projectRoot, taskName, step, steps, indexPath }) {
  const stepFile = join(
    projectRoot,
    'docs',
    'phases',
    taskName,
    `step${step.step}.md`
  );

  let stepContent;
  try {
    stepContent = await readFile(stepFile, 'utf-8');
  } catch (err) {
    console.error(`  ✗ step${step.step}.md 파일을 읽을 수 없음: ${err.message}`);
    return 'error';
  }

  // 프롬프트 구성
  const prompt = await buildPrompt({
    projectRoot,
    stepContent,
    steps,
    taskName,
  });

  console.log(`  ▶ step ${step.step}: ${step.name}`);

  let lastError = '';

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 1) {
      console.log(`    재시도 ${attempt}/${MAX_RETRIES}...`);
    }

    // 재시도 시 이전 에러를 프롬프트에 추가
    const retryPrompt =
      attempt > 1
        ? `${prompt}\n\n## 이전 시도 에러\n\n이전 시도에서 아래 에러가 발생했다. 이 에러를 해결하라:\n\n${lastError}`
        : prompt;

    await markStepStarted(indexPath, step.step);

    const result = await runClaude(retryPrompt, projectRoot);

    // Claude가 index.json을 업데이트했는지 확인
    const updatedData = await readJson(indexPath);
    const updatedStep = updatedData.steps.find((s) => s.step === step.step);

    if (updatedStep?.status === 'completed') {
      await markStepCompleted(indexPath, step.step);
      console.log(`  \x1b[32m✓\x1b[0m step ${step.step}: ${step.name} — completed`);
      return 'completed';
    }

    if (updatedStep?.status === 'blocked') {
      await markStepBlocked(indexPath, step.step);
      console.log(
        `  \x1b[33m⊘\x1b[0m step ${step.step}: ${step.name} — blocked: ${updatedStep.blocked_reason ?? 'unknown'}`
      );
      return 'blocked';
    }

    // 실패 또는 에러
    lastError =
      updatedStep?.error_message ||
      result.stderr ||
      result.stdout.slice(-500) ||
      'Unknown error';

    if (attempt === MAX_RETRIES) {
      await markStepError(indexPath, step.step);
      console.log(
        `  \x1b[31m✗\x1b[0m step ${step.step}: ${step.name} — error after ${MAX_RETRIES} attempts`
      );
      return 'error';
    }
  }

  return 'error';
}

/**
 * task의 모든 pending step을 순차 실행
 */
export async function runTask({ projectRoot, taskName, singleStep }) {
  const indexPath = join(
    projectRoot,
    'docs',
    'phases',
    taskName,
    'index.json'
  );

  let data = await readJson(indexPath);

  const pendingSteps =
    singleStep !== undefined
      ? data.steps.filter((s) => s.step === singleStep && s.status === 'pending')
      : data.steps.filter((s) => s.status === 'pending');

  if (pendingSteps.length === 0) {
    console.log('  실행할 pending step이 없습니다.');
    return;
  }

  console.log(
    `\n  ${taskName}: ${pendingSteps.length}개 step 실행 예정\n`
  );

  for (const step of pendingSteps) {
    // 최신 steps 데이터 다시 읽기 (이전 step의 summary 반영)
    data = await readJson(indexPath);

    const result = await executeStep({
      projectRoot,
      taskName,
      step,
      steps: data.steps,
      indexPath,
    });

    // 2단계 커밋
    try {
      await twoPhaseCommit({
        stepNum: step.step,
        stepName: step.name,
        taskName,
        cwd: projectRoot,
      });
    } catch (err) {
      console.warn(`  ⚠ 커밋 실패: ${err.message}`);
    }

    // blocked 또는 error 시 중단
    if (result === 'blocked' || result === 'error') {
      console.log(`\n  실행 중단: step ${step.step} ${result}`);
      break;
    }
  }
}
