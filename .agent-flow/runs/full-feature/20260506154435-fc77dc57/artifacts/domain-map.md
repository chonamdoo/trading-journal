# Domain Map - SPEC-002 Slice 3

Referenced domain context:
- `specs/002-api-unification.md` defines the API unification goal: browser code should move toward `/api/*` Route Handlers instead of direct Supabase data access.
- Existing `CONTEXT.md` domain terms are unchanged.

Boundary map:
- Presentation/client callers depend on client API functions.
- Client API functions depend on `apiFetch`/`apiFetchFormData`.
- Client Fetch Wrapper depends on browser Supabase auth only for session token retrieval and refresh.
- Route Adapters remain the server boundary that owns request auth, parsing, use case calls, and response mapping.

Decisions carried forward:
- This slice creates no new Domain Layer objects.
- No Domain Layer module may import this client wrapper.
- The wrapper remains browser-only with `'use client'`.
