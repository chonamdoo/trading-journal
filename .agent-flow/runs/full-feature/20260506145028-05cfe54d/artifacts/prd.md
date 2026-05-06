# PRD - SPEC-002 Slice 2

Problem:
- Legacy `/api/mobile/*` data routes still duplicate API behavior instead of forwarding to canonical `/api/*` endpoints.

Goal:
- Make mobile data routes compatibility redirects.

Acceptance criteria:
- `/api/mobile/trades` redirects to `/api/trades`.
- `/api/mobile/trades/[id]` redirects to `/api/trades/[id]`.
- `/api/mobile/trades/[id]/closes` redirects to `/api/trades/[id]/closes`.
- `/api/mobile/trades/[id]/scale-ins` redirects to `/api/trades/[id]/scale-ins`.
- `/api/mobile/deposits` redirects to `/api/deposits`.
- `/api/mobile/profile` redirects to `/api/profile`.
- Redirect status is 308.
- Query string is preserved.

Out of scope:
- `/api/mobile/auth/*`.
- Client-side caller migration.
