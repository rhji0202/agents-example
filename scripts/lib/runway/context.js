import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * 가드레일 문서를 읽어 프롬프트에 주입할 컨텍스트를 구성한다.
 */

const GUARDRAIL_FILES = [
  'CLAUDE.md',
  'docs/ARCHITECTURE.md',
  'docs/PERMISSIONS.md',
  'docs/UI-GUIDE.md',
];

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
 * 가드레일 문서들을 읽어 하나의 컨텍스트 문자열로 조합
 */
export async function buildGuardrails(projectRoot) {
  const sections = [];

  for (const rel of GUARDRAIL_FILES) {
    const content = await safeRead(join(projectRoot, rel));
    if (content) {
      sections.push(`--- ${rel} ---\n${content}`);
    }
  }

  return sections.join('\n\n');
}

/**
 * 완료된 step들의 summary를 누적하여 컨텍스트 문자열 생성
 */
export function buildSummaryChain(steps) {
  const completed = steps.filter((s) => s.status === 'completed' && s.summary);
  if (completed.length === 0) return '';

  const lines = completed.map(
    (s) => `  - step ${s.step} (${s.name}): ${s.summary}`
  );

  return `\n## 이전 step 결과\n\n${lines.join('\n')}`;
}

/**
 * step.md 내용 + 가드레일 + summary chain을 조합하여 최종 프롬프트 구성
 */
export async function buildPrompt({
  projectRoot,
  stepContent,
  steps,
  taskName,
}) {
  const guardrails = await buildGuardrails(projectRoot);
  const summaryChain = buildSummaryChain(steps);

  return [
    `# Runway Execution: ${taskName}`,
    '',
    '아래 가드레일 문서를 숙지하고 step 지시를 수행하라.',
    '',
    guardrails,
    summaryChain,
    '',
    '---',
    '',
    stepContent,
  ].join('\n');
}
