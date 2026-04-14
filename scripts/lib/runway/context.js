import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * 가드레일 문서를 읽어 프롬프트에 주입할 컨텍스트를 구성한다.
 */

/**
 * 파일을 읽되, 없으면 null 반환
 */
async function safeRead(filePath) {
  try {
    return await readFile(filePath, 'utf-8');
  } catch {
    return null;
  }
}

/**
 * 가드레일 문서들을 읽어 하나의 컨텍스트 문자열로 조합.
 * CLAUDE.md + docs/ 하위 모든 .md 파일을 포함한다.
 */
export async function buildGuardrails(projectRoot) {
  const sections = [];

  // CLAUDE.md
  const claudeMd = await safeRead(join(projectRoot, 'CLAUDE.md'));
  if (claudeMd) {
    sections.push(`## 프로젝트 규칙 (CLAUDE.md)\n\n${claudeMd}`);
  }

  // docs/ 하위 .md 파일 (non-recursive)
  // docs/ui/, docs/phases/ 등은 제외 — 프론트엔드 step은 "읽어야 할 파일"에서 직접 참조
  const docsDir = join(projectRoot, 'docs');
  try {
    const entries = await readdir(docsDir);
    const mdFiles = entries.filter((f) => f.endsWith('.md')).sort();
    for (const file of mdFiles) {
      const content = await safeRead(join(docsDir, file));
      if (content) {
        sections.push(`## ${file.replace('.md', '')}\n\n${content}`);
      }
    }
  } catch {
    // docs/ 디렉토리 없으면 무시
  }

  // docs/specs/ 하위 .md 파일 — 스펙 문서는 프로젝트 전반 규칙이므로 guardrails에 포함
  const specsDir = join(projectRoot, 'docs', 'specs');
  try {
    const specEntries = await readdir(specsDir);
    const specFiles = specEntries.filter((f) => f.endsWith('.md')).sort();
    for (const file of specFiles) {
      const content = await safeRead(join(specsDir, file));
      if (content) {
        sections.push(`## specs/${file.replace('.md', '')}\n\n${content}`);
      }
    }
  } catch {
    // docs/specs/ 디렉토리 없으면 무시
  }

  return sections.join('\n\n---\n\n');
}

/**
 * 완료된 step들의 summary를 누적하여 컨텍스트 문자열 생성
 */
export function buildSummaryChain(steps) {
  const completed = steps.filter((s) => s.status === 'completed' && s.summary);
  if (completed.length === 0) return '';

  const lines = completed.map(
    (s) => `- Step ${s.step} (${s.name}): ${s.summary}`
  );

  return `## 이전 Step 산출물\n\n${lines.join('\n')}\n\n`;
}

/**
 * 작업 규칙 프리앰블 생성.
 * Python execute.py의 _build_preamble과 동일한 6가지 규칙을 포함한다.
 */
function buildPreamble({ taskName, prevError }) {
  const retrySection = prevError
    ? `\n## ⚠ 이전 시도 실패 — 아래 에러를 반드시 참고하여 수정하라\n\n${prevError}\n\n---\n\n`
    : '';

  return [
    `당신은 프로젝트의 개발자입니다. 아래 step을 수행하세요.`,
    '',
    retrySection,
    '## 작업 규칙',
    '',
    '1. 이전 step에서 작성된 코드를 확인하고 일관성을 유지하라.',
    '2. 이 step에 명시된 작업만 수행하라. 추가 기능이나 파일을 만들지 마라.',
    '3. 기존 테스트를 깨뜨리지 마라.',
    '4. AC(Acceptance Criteria) 검증을 직접 실행하라.',
    `5. docs/phases/${taskName}/index.json의 해당 step status를 업데이트하라:`,
    '   - AC 통과 → "completed" + "summary" 필드 기록',
    '   - 3회 수정 시도 후에도 실패 → "error" + "error_message" 기록',
    '   - 사용자 개입이 필요한 경우 (API 키, 인증, 수동 설정 등) → "blocked" + "blocked_reason" 기록 후 즉시 중단',
    `6. 커밋 메시지 형식: feat(${taskName}): step N — <step-name>`,
    '',
    '## summary 작성 규칙',
    '',
    'summary는 다음 step의 컨텍스트로 전달된다. 따라서:',
    '- 생성된 주요 파일 경로를 포함하라',
    '- 핵심 설계 결정을 한 줄로 기록하라',
    '- 다음 step이 알아야 할 정보를 우선하라',
    '- 예: "frontend/ scaffolded with Next.js 16 + Tailwind 4 + shadcn/ui. Path alias @/* configured."',
    '',
    '## 금지사항',
    '',
    '- console.log, 디버그 코드를 남기지 마라',
    '- 하드코딩된 시크릿(API 키, 비밀번호, 토큰)을 넣지 마라',
    '- step.md에 명시되지 않은 범위를 건드리지 마라',
    '',
    '---',
    '',
  ].join('\n');
}

/**
 * step.md 내용 + 가드레일 + summary chain + 작업 규칙을 조합하여 최종 프롬프트 구성
 */
export async function buildPrompt({
  projectRoot,
  stepContent,
  steps,
  taskName,
  prevError = null,
}) {
  const guardrails = await buildGuardrails(projectRoot);
  const summaryChain = buildSummaryChain(steps);
  const preamble = buildPreamble({ taskName, prevError });

  return [
    `# Runway Execution: ${taskName}`,
    '',
    preamble,
    guardrails,
    '',
    '---',
    '',
    summaryChain,
    stepContent,
  ].join('\n');
}
