# PRD - SPEC-002 Slice 3

Problem:
- Client API migration needs a tested fetch foundation. Without behavior tests, later store migrations can silently break auth headers, refresh retry, failure normalization, or delete-style empty responses.

Goals:
- Add behavior tests for client fetch auth and response contracts.
- Preserve existing wrapped-response callers in `src/lib/api/client-api.ts`.
- Support empty success responses without returning a false network failure.

Acceptance criteria:
- `apiFetch` sends `Authorization: Bearer <access_token>` when a Supabase session exists.
- `apiFetch` retries once with a refreshed token after an initial 401.
- `apiFetch` returns a failure result and redirects to `/login` when refresh cannot recover authentication.
- `apiFetch` returns success for HTTP 204/no-content.
- `apiFetchFormData` sends FormData without setting `Content-Type` and follows the same 401 refresh behavior.
- Existing tests continue to pass.

Non-goals:
- No store migration.
- No route adapter changes.
- No UI changes.
