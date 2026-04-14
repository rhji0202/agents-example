import { spawn } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { buildPrompt } from './context.js';
import {
  markStepStarted,
  markStepCompleted,
  markStepError,
  markStepBlocked,
  readJson,
} from './reporter.js';
import { twoPhaseCommit } from './git.js';
import { withSpinner } from './spinner.js';

const MAX_RETRIES = 3;

/**
 * claude -p 를 stdin으로 프롬프트를 전달하여 step을 수행한다.
 * CLI arg 대신 stdin 사용으로 ARG_MAX(1MB) 제한을 회피한다.
 * @returns {Promise<{ exitCode: number, stdout: string, stderr: string }>}
 */
function runClaude(prompt, cwd) {
  return new Promise((resolve) => {
    const child = spawn(
      'claude',
      ['-p', '--dangerously-skip-permissions', '--output-format', 'json'],
      {
        cwd,
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env },
      }
    );

    const chunks = [];
    const errChunks = [];
    child.stdout.on('data', (c) => chunks.push(c));
    child.stderr.on('data', (c) => errChunks.push(c));

    const timer = setTimeout(() => child.kill('SIGTERM'), 1_800_000); // 30분

    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({
        exitCode: code ?? 1,
        stdout: Buffer.concat(chunks).toString('utf-8'),
        stderr: Buffer.concat(errChunks).toString('utf-8'),
      });
    });

    child.on('error', (err) => {
      clearTimeout(timer);
      resolve({ exitCode: 1, stdout: '', stderr: err.message });
    });

    child.stdin.write(prompt);
    child.stdin.end();
  });
}

/**
 * Claude JSON 출력에서 사람이 읽을 수 있는 에러 메시지를 추출한다.
 */
function extractClaudeError(stdout, stderr) {
  try {
    const parsed = JSON.parse(stdout);
    return parsed?.result?.slice?.(-500) || stderr || 'Unknown error';
  } catch {
    return stderr || stdout.slice(-500) || 'Unknown error';
  }
}

/**
 * step 실행 결과를 step{N}-output.json에 저장
 */
async function saveOutput({ taskDir, stepNum, stepName, result }) {
  const output = {
    step: stepNum,
    name: stepName,
    exitCode: result.exitCode,
    stdout: result.stdout,
    stderr: result.stderr,
  };
  const outPath = join(taskDir, `step${stepNum}-output.json`);
  await writeFile(outPath, JSON.stringify(output, null, 2) + '\n', 'utf-8');
}

/**
 * 단일 step 실행 (재시도 포함)
 */
async function executeStep({ projectRoot, taskName, step, steps, indexPath, maxStep, doneCount }) {
  const taskDir = join(projectRoot, 'docs', 'phases', taskName);
  const stepFile = join(taskDir, `step${step.step}.md`);

  let stepContent;
  try {
    stepContent = await readFile(stepFile, 'utf-8');
  } catch (err) {
    console.error(`  ✗ step${step.step}.md 파일을 읽을 수 없음: ${err.message}`);
    return 'error';
  }

  let lastError = '';

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    // 매 시도마다 최신 steps로 프롬프트 재구성 (이전 step summary 반영)
    const freshData = await readJson(indexPath);

    const prompt = await buildPrompt({
      projectRoot,
      stepContent,
      steps: freshData.steps,
      taskName,
      prevError: attempt > 1 ? lastError : null,
    });

    const tag = `Step ${step.step}/${maxStep} (${doneCount} done): ${step.name}`;
    const retryTag = attempt > 1 ? ` [retry ${attempt}/${MAX_RETRIES}]` : '';

    await markStepStarted(indexPath, step.step);

    const result = await withSpinner(`${tag}${retryTag}`, async () => {
      return runClaude(prompt, projectRoot);
    });

    // 실행 결과 저장
    await saveOutput({ taskDir, stepNum: step.step, stepName: step.name, result });

    // Claude가 index.json을 업데이트했는지 확인
    let updatedData;
    try {
      updatedData = await readJson(indexPath);
    } catch (parseErr) {
      lastError = `index.json parse error after Claude: ${parseErr.message}`;
      if (attempt >= MAX_RETRIES) {
        await markStepError(indexPath, step.step);
        console.log(`  \x1b[31m✗\x1b[0m step ${step.step}: ${step.name} — index.json corrupted`);
        return 'error';
      }
      console.log(`  ↻ step ${step.step}: retry ${attempt}/${MAX_RETRIES} — ${lastError.slice(0, 120)}`);
      continue;
    }

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
      extractClaudeError(result.stdout, result.stderr);

    if (attempt < MAX_RETRIES) {
      console.log(`  ↻ step ${step.step}: retry ${attempt}/${MAX_RETRIES} — ${lastError.slice(0, 120)}`);
    } else {
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

  const data = await readJson(indexPath);
  const maxStep = Math.max(...data.steps.map((s) => s.step));

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
    const freshData = await readJson(indexPath);
    const doneCount = freshData.steps.filter((s) => s.status === 'completed').length;

    const result = await executeStep({
      projectRoot,
      taskName,
      step,
      steps: freshData.steps,
      indexPath,
      maxStep,
      doneCount,
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
