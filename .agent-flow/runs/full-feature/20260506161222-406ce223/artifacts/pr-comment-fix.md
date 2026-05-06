# PR Comment Fix - SPEC-002 Slice 4

Comment:
- Codex P1: Do not serialize screenshot blobs as base64 JSON Data URLs because 5MB screenshots can exceed serverless response limits after base64 expansion.

Fix:
- Replaced JSON Data URL route with binary `/download` route.
- Added `apiFetchBlob` for authenticated blob downloads.
- Changed `ShareCardModal` to convert the returned blob to a Data URL in the browser with `FileReader`.
- Updated behavior tests to assert blob behavior instead of JSON Data URL behavior.

Verification:
- `npm test -- tests/api/screenshot-data-url.behavior.test.ts`: passed.
- `npm test`: passed, 22 files and 55 tests.
- `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_ANON_KEY=local-anon-key npx next build`: passed.
- `npx tsc --noEmit`: passed after Next type regeneration.
- `npm run lint`: passed with 0 errors and existing warnings.
- `git diff --check`: passed.

Thread resolution:
- No GitHub review thread exists for the top-level Codex comment.
