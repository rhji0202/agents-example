#!/usr/bin/env node

/**
 * PostToolUse hook: Validates spec document integrity after writes/edits.
 *
 * Checks:
 * 1. If a spec file is written, verify companion state file exists
 * 2. If a state file is written, verify schema compliance
 * 3. If a task file is written, verify schema compliance
 * 4. Warn if spec is missing required sections
 */

const fs = require('fs');
const path = require('path');

const DOCS_DIR = path.resolve(process.cwd(), 'docs');
const SPECS_DIR = path.join(DOCS_DIR, 'specs');
const STATE_DIR = path.join(DOCS_DIR, 'state');
const TASKS_DIR = path.join(DOCS_DIR, 'tasks');

const REQUIRED_SECTIONS = [
  'Overview',
  'Problem Statement',
  'Requirements',
  'User Stories',
  'Dependencies',
  'Changelog',
];

const KOREAN_SECTIONS = [
  '개요',
  '문제 정의',
  '요구사항',
  '사용자 스토리',
  '의존성',
];

function parseInput() {
  let data = '';
  return new Promise((resolve) => {
    process.stdin.on('data', (chunk) => (data += chunk));
    process.stdin.on('end', () => {
      try {
        resolve(JSON.parse(data));
      } catch {
        resolve(null);
      }
    });
  });
}

function extractDomain(filePath) {
  const basename = path.basename(filePath);
  const match = basename.match(/^([a-z0-9-]+)\.v\d+\.md$/);
  return match ? match[1] : null;
}

function checkSpecFile(filePath) {
  const warnings = [];
  const domain = extractDomain(filePath);

  if (!domain) {
    return warnings;
  }

  // Check companion state file
  const stateFile = path.join(STATE_DIR, `${domain}.json`);
  if (!fs.existsSync(stateFile)) {
    warnings.push(
      `[spec-check] State file missing: docs/state/${domain}.json — run /spec-gen to generate`,
    );
  }

  // Check required sections
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const missingSections = REQUIRED_SECTIONS.filter((section) => {
      const englishPresent = content.includes(`## `) && content.toLowerCase().includes(section.toLowerCase());
      const koreanIdx = REQUIRED_SECTIONS.indexOf(section);
      const koreanSection = KOREAN_SECTIONS[koreanIdx];
      const koreanPresent = koreanSection && content.includes(koreanSection);
      return !englishPresent && !koreanPresent;
    });

    if (missingSections.length > 0) {
      warnings.push(
        `[spec-check] Missing sections in spec: ${missingSections.join(', ')}`,
      );
    }

    // Check for filler content
    if (content.includes('Lorem ipsum') || content.includes('placeholder')) {
      warnings.push('[spec-check] Spec contains placeholder/filler content');
    }
  }

  return warnings;
}

function checkStateFile(filePath) {
  const warnings = [];

  if (!fs.existsSync(filePath)) {
    return warnings;
  }

  try {
    const state = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const required = ['spec_id', 'current_version', 'target_version', 'status'];
    const missing = required.filter((field) => !(field in state));

    if (missing.length > 0) {
      warnings.push(
        `[spec-check] State file missing required fields: ${missing.join(', ')}`,
      );
    }

    const validStatuses = ['idle', 'syncing', 'in_progress', 'verifying', 'completed', 'stable'];
    if (state.status && !validStatuses.includes(state.status)) {
      warnings.push(
        `[spec-check] Invalid status "${state.status}" — valid: ${validStatuses.join(', ')}`,
      );
    }
  } catch {
    warnings.push('[spec-check] State file is not valid JSON');
  }

  return warnings;
}

function checkTaskFile(filePath) {
  const warnings = [];

  if (!fs.existsSync(filePath)) {
    return warnings;
  }

  try {
    const tasks = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const required = ['spec_id', 'spec_version', 'generated_from_diff', 'created', 'tasks'];
    const missing = required.filter((field) => !(field in tasks));

    if (missing.length > 0) {
      warnings.push(
        `[spec-check] Task file missing required fields: ${missing.join(', ')}`,
      );
    }

    if (Array.isArray(tasks.tasks)) {
      tasks.tasks.forEach((task, i) => {
        if (!task.id || !task.title || !task.status) {
          warnings.push(
            `[spec-check] Task ${i} missing required fields (id, title, or status)`,
          );
        }
      });
    }
  } catch {
    warnings.push('[spec-check] Task file is not valid JSON');
  }

  return warnings;
}

async function main() {
  const input = await parseInput();
  if (!input) {
    process.stdout.write(JSON.stringify(input));
    return;
  }

  const filePath = input.tool_input?.file_path || '';
  const warnings = [];

  // Only check files in docs/ directory
  if (!filePath.includes('/docs/')) {
    process.stdout.write(JSON.stringify(input));
    return;
  }

  const relative = path.relative(DOCS_DIR, filePath);

  if (relative.startsWith('specs/')) {
    warnings.push(...checkSpecFile(filePath));
  } else if (relative.startsWith('state/') && filePath.endsWith('.json') && !filePath.includes('_schema')) {
    warnings.push(...checkStateFile(filePath));
  } else if (relative.startsWith('tasks/') && filePath.endsWith('.json') && !filePath.includes('_schema')) {
    warnings.push(...checkTaskFile(filePath));
  }

  if (warnings.length > 0) {
    process.stderr.write(warnings.join('\n') + '\n');
  }

  // Always pass through (exit 0) — warnings only
  process.stdout.write(JSON.stringify(input));
}

main();
