# PRD - SPEC-002 Slice 1

Problem:
- SPEC-002 requires a stable auth boundary before route/client migration, but `mobile-auth.ts` compatibility is absent and auth selection behavior is not covered by tests.

Goal:
- Lock the unified auth boundary for Bearer and cookie requests.

Acceptance criteria:
- Bearer API request uses `createMobileClient(token)`.
- Cookie API request uses the server Supabase client.
- `src/lib/api/mobile-auth.ts` re-exports the unified auth API for compatibility.
- No production UI changes.

Out of scope:
- `/api/mobile/*` redirect migration.
- CRUD route migration.
- Zustand/client fetch migration.
