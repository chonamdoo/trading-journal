# PR Comment Fix - SPEC-002 Slice 3

Comment:
- Codex review requested BOM-tolerant JSON parsing after switching from `res.json()` to `text()` plus `JSON.parse`.

Fix:
- Added a regression test for UTF-8 BOM-prefixed JSON responses.
- Strip a leading BOM before `JSON.parse`.

Verification:
- `npm test -- tests/api/client-fetch.behavior.test.ts`: passed, 6 tests.
- `npm test`: passed, 21 files and 53 tests.
- `npx tsc --noEmit`: passed.
- `npm run lint`: passed with 0 errors and existing warnings.
- `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_ANON_KEY=local-anon-key npx next build`: passed.
- `git diff --check`: passed.

Thread resolution:
- No GitHub review thread exists for the top-level Codex comment.
