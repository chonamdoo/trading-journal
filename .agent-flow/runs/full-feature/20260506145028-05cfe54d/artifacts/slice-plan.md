# Slice Plan - SPEC-002 Slice 2

Slice:
- Mobile Route Redirect Compatibility.

Steps:
1. RED: add behavior test for mobile data redirects.
2. GREEN: add redirect helper and convert six mobile data routes.
3. REFACTOR: update obsolete mobile profile test to redirect contract.
4. Gates: run tests, typecheck, lint, build, diff check.
5. Commit, push, PR.

Validation:
- `npm test -- tests/api/mobile-redirects.behavior.test.ts`
- `npm test`
- `npx tsc --noEmit`
- `npm run lint`
- `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_ANON_KEY=local-anon-key npx next build`
- `git diff --check`
