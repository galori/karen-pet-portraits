import { execFileSync } from 'node:child_process';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');

try {
  execFileSync('git', ['rev-parse', '--git-dir'], {
    cwd: root,
    stdio: 'ignore'
  });
} catch {
  console.log('Skipping git hook setup because this is not a git checkout.');
  process.exit(0);
}

execFileSync('git', ['config', 'core.hooksPath', '.githooks'], {
  cwd: root,
  stdio: 'inherit'
});

console.log('Configured git to use hooks from .githooks/.');
