import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const exec = promisify(execFile);

/**
 * Git 작업을 수행하는 유틸리티.
 * - 브랜치 생성/checkout
 * - 2단계 커밋 (코드 + 메타데이터)
 * - push
 */

async function git(args, cwd) {
  try {
    const { stdout } = await exec('git', args, { cwd });
    return stdout.trim();
  } catch (err) {
    const detail = err.stderr?.trim() || err.stdout?.trim() || err.message;
    throw new Error(`git ${args[0]} failed: ${detail}`);
  }
}

/**
 * 현재 브랜치명 반환
 */
export async function currentBranch(cwd) {
  return git(['rev-parse', '--abbrev-ref', 'HEAD'], cwd);
}

/**
 * feat-{taskName} 브랜치 생성 및 checkout.
 * 이미 존재하면 checkout만 한다.
 */
export async function ensureBranch(taskName, cwd) {
  const branchName = `feat-${taskName}`;
  const current = await currentBranch(cwd);

  if (current === branchName) return branchName;

  try {
    await git(['checkout', branchName], cwd);
  } catch {
    await git(['checkout', '-b', branchName], cwd);
  }

  return branchName;
}

/**
 * 2단계 커밋:
 * 1) 코드 변경 (phases/ 제외)
 * 2) 메타데이터 (phases/ index.json)
 */
export async function twoPhaseCommit({ stepNum, stepName, taskName, cwd }) {
  // 스테이징된 변경 확인
  const status = await git(['status', '--porcelain'], cwd);
  if (!status) return; // 변경 없음

  const lines = status.split('\n').filter(Boolean);
  const codeFiles = [];
  const metaFiles = [];

  for (const line of lines) {
    let file = line.slice(3).trim();
    // porcelain v1: renamed/copied files show as "old -> new"
    if ((line[0] === 'R' || line[0] === 'C') && file.includes(' -> ')) {
      file = file.slice(file.indexOf(' -> ') + 4);
    }
    if (file.startsWith('docs/phases/')) {
      metaFiles.push(file);
    } else {
      codeFiles.push(file);
    }
  }

  // 1단계: 코드 커밋
  if (codeFiles.length > 0) {
    await git(['add', ...codeFiles], cwd);
    await git(
      ['commit', '-m', `feat(${taskName}): step ${stepNum} — ${stepName}`],
      cwd
    );
  }

  // 2단계: 메타데이터 커밋
  if (metaFiles.length > 0) {
    await git(['add', ...metaFiles], cwd);
    await git(
      ['commit', '-m', `chore(${taskName}): step ${stepNum} output`],
      cwd
    );
  }
}

/**
 * 원격에 push
 */
export async function push(cwd) {
  const branch = await currentBranch(cwd);
  await git(['push', '-u', 'origin', branch], cwd);
}
