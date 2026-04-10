#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const MAX_STDIN = 1024 * 1024;

// Source code extensions to check
const SOURCE_EXTS = /\.(ts|tsx|js|jsx|py|go|rs|java|kt|swift|php|rb|cs|cpp|c|h)$/;

// Paths that are part of the spec system itself (skip checking)
const SPEC_SYSTEM_PATHS = /[/\\]docs[/\\](specs|tasks|state)[/\\]/;

/**
 * Check if an edited file is tracked by any active spec task.
 * Warns if the file is not in any active task's files_affected.
 *
 * @param {string} rawInput - Raw JSON string from stdin
 * @returns {string|{stdout:string, stderr:string, exitCode:number}}
 */
function run(rawInput) {
  try {
    const input = JSON.parse(rawInput);
    const filePath = input.tool_input?.file_path;

    if (!filePath) return rawInput;

    // Normalize path separators
    const normalizedPath = filePath.replace(/\\/g, '/');

    // Skip spec system files
    if (SPEC_SYSTEM_PATHS.test(normalizedPath)) return rawInput;

    // Only check source code files
    if (!SOURCE_EXTS.test(normalizedPath)) return rawInput;

    // Find project root (where docs/ lives)
    const projectRoot = findProjectRoot(filePath);
    if (!projectRoot) return rawInput;

    const stateDir = path.join(projectRoot, 'docs', 'state');
    if (!fs.existsSync(stateDir)) return rawInput;

    // Read all state files
    const stateFiles = fs.readdirSync(stateDir)
      .filter(f => f.endsWith('.json') && !f.startsWith('_'));

    if (stateFiles.length === 0) return rawInput;

    // Check if any active spec has this file in its tasks
    const activeSpecs = [];
    let fileTracked = false;

    for (const stateFile of stateFiles) {
      try {
        const state = JSON.parse(fs.readFileSync(path.join(stateDir, stateFile), 'utf8'));

        // Only check specs that are in_progress or syncing
        if (state.status !== 'in_progress' && state.status !== 'syncing') continue;

        activeSpecs.push(state.spec_id);

        // Find corresponding task file
        const taskFile = path.join(projectRoot, 'docs', 'tasks',
          `${state.spec_id}-v${state.target_version}.json`);

        if (!fs.existsSync(taskFile)) continue;

        const taskData = JSON.parse(fs.readFileSync(taskFile, 'utf8'));

        for (const task of taskData.tasks || []) {
          if (task.status === 'skipped') continue;
          const affected = (task.files_affected || []).map(f => f.replace(/\\/g, '/'));
          if (affected.some(f => normalizedPath.endsWith(f) || f.endsWith(normalizedPath.split('/').pop()))) {
            fileTracked = true;
            break;
          }
        }

        if (fileTracked) break;
      } catch {
        // Skip unparseable state files
      }
    }

    // Only warn if there ARE active specs but file is not tracked
    if (activeSpecs.length > 0 && !fileTracked) {
      const basename = path.basename(filePath);
      return {
        stdout: rawInput,
        stderr: `[Hook] File "${basename}" is not tracked by any active spec task (active specs: ${activeSpecs.join(', ')}). Consider updating the spec or task files_affected.`,
        exitCode: 0
      };
    }
  } catch {
    // Ignore parse errors — always pass through
  }
  return rawInput;
}

/**
 * Walk up directories to find the project root (contains docs/ directory).
 */
function findProjectRoot(filePath) {
  let dir = path.dirname(path.resolve(filePath));
  for (let i = 0; i < 10; i++) {
    if (fs.existsSync(path.join(dir, 'docs', 'specs'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

// Backwards-compatible stdin entry point
if (require.main === module) {
  let raw = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', chunk => {
    if (raw.length < MAX_STDIN) raw += chunk.substring(0, MAX_STDIN - raw.length);
  });
  process.stdin.on('end', () => {
    const result = run(raw);
    if (typeof result === 'string') {
      process.stdout.write(result);
    } else {
      if (result.stderr) process.stderr.write(result.stderr + '\n');
      process.stdout.write(result.stdout);
      process.exit(result.exitCode);
    }
  });
}

module.exports = { run };
