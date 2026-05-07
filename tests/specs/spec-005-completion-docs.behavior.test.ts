import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const spec = readFileSync('specs/005-weekly-auto-report.md', 'utf8');
const index = readFileSync('specs/INDEX.md', 'utf8');

describe('SPEC-005 completion docs', () => {
  it('marks all weekly auto report acceptance criteria complete', () => {
    expect(spec).not.toContain('- [ ]');
    expect(spec).toContain('- [x] 분석 페이지 접속 시 주간 리포트 자동 생성 조건 체크');
    expect(spec).toContain('- [x] AI 리포트 페이지에서 주간/월간 리포트 분리 표시');
  });

  it('marks SPEC-005 completed in the spec index', () => {
    expect(index).toContain('| 005 | weekly-auto-report (주간 자동 리포트 생성) | completed |');
  });
});
