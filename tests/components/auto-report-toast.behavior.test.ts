import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = readFileSync('src/components/ui/AutoReportToast.tsx', 'utf8');

describe('AutoReportToast generated type copy', () => {
  it('can display weekly and monthly report generation labels', () => {
    expect(source).toContain('generatedType');
    expect(source).toContain('주간 리포트');
    expect(source).toContain('월간 리포트');
  });
});
