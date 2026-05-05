import { spawnSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

const command = ['scripts/vercel-ignore-build.sh'];

function runIgnoreBuild(branch: string) {
  return spawnSync(command[0], {
    env: {
      ...process.env,
      VERCEL_GIT_COMMIT_REF: branch,
    },
    encoding: 'utf8',
  });
}

describe('Vercel refactor branch deploy policy', () => {
  it('skips Vercel builds for codex refactor branches', () => {
    const result = runIgnoreBuild('codex/refactor-clean-architecture');

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Skipping Vercel build');
  });

  it('allows Vercel builds for main', () => {
    const result = runIgnoreBuild('main');

    expect(result.status).toBe(1);
    expect(result.stdout).toContain('Continuing Vercel build');
  });
});
