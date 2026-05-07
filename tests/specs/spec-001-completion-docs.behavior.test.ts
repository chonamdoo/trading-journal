import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const spec = readFileSync('specs/001-ux-redesign-v2.md', 'utf8');
const index = readFileSync('specs/INDEX.md', 'utf8');

describe('SPEC-001 completion docs', () => {
  it('marks all UX redesign acceptance criteria complete', () => {
    expect(spec).not.toContain('- [ ]');
    expect(spec).toContain('- [x] 기능 1: lg: 이상에서 좌측 사이드바');
    expect(spec).toContain('- [x] 기능 2: Trade Emotion 저장 계약 유지');
    expect(spec).toContain('- [x] 기능 5: TradeForm 하단 트레이딩 명언 랜덤 배너');
    expect(spec).toContain('5개 emotion chip UI는 현재 복기 태그 시스템으로 대체');
  });

  it('marks SPEC-001 completed in the spec index', () => {
    expect(index).toContain('| 001 | ux-redesign-v2 (사이드바+감정태그+요약바+인라인상세+명언) | completed |');
  });
});
