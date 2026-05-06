# PRD - SPEC-002 Slice 4

Problem:
- `ShareCardModal` imports the browser Supabase client and downloads Storage objects directly, which violates the SPEC-002 API boundary direction.

Goals:
- Add an authenticated API route that returns a screenshot Data URL.
- Add a client API wrapper for the route.
- Update `ShareCardModal` to use the wrapper instead of Supabase Storage.

Acceptance criteria:
- `ShareCardModal` no longer imports `createClient`.
- The screenshot data URL route returns `{ success: true, data: { dataUrl } }`.
- The route validates the screenshot belongs to the requested trade through DB lookup before downloading storage.
- Behavior tests cover successful Data URL response and client wrapper unwrapping.
- Existing UI remains unchanged.

Non-goals:
- No screenshot upload/delete behavior change.
- No design changes.
- No production Supabase automated test.
