import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

describe('SPEC-002 completion docs', () => {
  it('marks API unification as completed with implementation evidence', () => {
    const here = dirname(fileURLToPath(import.meta.url));
    const spec = readFileSync(resolve(here, '../../specs/002-api-unification.md'), 'utf8');
    const index = readFileSync(resolve(here, '../../specs/INDEX.md'), 'utf8');

    expect(index).toContain('| 002 | api-unification (Supabase 직접 호출 -> /api/* Route Handler 경유) | completed |');
    expect(spec).toContain('## 구현 완료 근거');

    for (const criterion of [
      '통합 인증 미들웨어(`src/lib/api/auth.ts`)가 Bearer token과 쿠키 방식을 자동 감지',
      '모든 데이터 CRUD가 `/api/*` Route Handler를 경유',
      '기존 `/api/mobile/*` 엔드포인트가 `/api/*`로 redirect (하위 호환)',
      '`useTrades.ts`(Zustand 스토어)에서 `createClient()` 직접 호출 제거',
      '`src/lib/api/*.ts`가 Supabase 클라이언트 파라미터 대신 fetch 기반',
      'Rate Limit이 통합 경로에서도 동일 적용',
      '빌드/타입체크/린트 통과',
    ]) {
      expect(spec).toContain(`- [x] ${criterion}`);
    }

    for (const evidence of [
      'PR #19',
      'PR #20',
      'PR #29',
      'PR #30',
      'PR #31',
      'PR #32',
      'tests/api/auth-boundary.behavior.test.ts',
      'tests/api/mobile-redirects.behavior.test.ts',
      'tests/api/utility-client-fetch.behavior.test.ts',
    ]) {
      expect(spec).toContain(evidence);
    }
  });
});
