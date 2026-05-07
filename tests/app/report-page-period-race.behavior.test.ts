import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const pageSource = readFileSync('src/app/(main)/analysis/report/page.tsx', 'utf8');

describe('AI report page period switching', () => {
  it('ignores stale report fetch responses after the active period changes', () => {
    expect(pageSource).toContain('reportRequestIdRef');
    expect(pageSource).toContain('requestId !== reportRequestIdRef.current');
  });
});
