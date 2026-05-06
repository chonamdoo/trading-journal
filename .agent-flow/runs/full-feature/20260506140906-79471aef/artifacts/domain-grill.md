# Domain Grill - SPEC-002 Slice 1

Task: SPEC-002 Slice 1: Unified Auth Boundary.

Decisions:
- Unified Auth Boundary is the server-side authentication entry point for both web cookie requests and Bearer-token API requests.
- `withAuth` already detects `Authorization: Bearer ...` and otherwise falls back to cookie-based server auth.
- `mobile-auth.ts` must remain as a compatibility module for existing mobile route imports.
- This slice does not migrate CRUD routes or client fetch callers.

Open questions:
- None for this slice.

Terms:
- Unified Auth Boundary: `src/lib/api/auth.ts`.
- Mobile compatibility boundary: `src/lib/api/mobile-auth.ts`.
- Bearer request: API request carrying `Authorization: Bearer <token>`.
- Cookie request: web request authenticated through Supabase server cookies.

Sources checked:
- `specs/002-api-unification.md`
- `src/lib/api/auth.ts`
- `src/lib/supabase/middleware.ts`
- `src/lib/supabase/mobile-server.ts`
- `src/lib/supabase/server.ts`
