# Slice Plan - SPEC-002 Slice 1

Slice:
- Unified Auth Boundary.

Steps:
1. RED: add behavior tests for Bearer auth, cookie auth, and mobile-auth compatibility.
2. GREEN: add minimal `mobile-auth.ts` re-export.
3. REFACTOR: keep existing `auth.ts` unchanged unless tests require it.
4. Gates: run targeted test, full test, typecheck, lint, build, diff check.
5. Review and commit.

Validation:
- `npm test -- tests/api/auth-boundary.behavior.test.ts`
- `npm test`
- `npx tsc --noEmit`
- `npm run lint`
- `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_ANON_KEY=local-anon-key npx next build`
- `git diff --check`
