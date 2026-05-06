# DDD Design - SPEC-002 Slice 3

Layer boundaries:
- Presentation/client code may call client API helpers.
- Client API helpers may call `apiFetch` and `apiFetchFormData`.
- `apiFetch` is an infrastructure/client boundary for HTTP transport and browser auth token forwarding.
- Domain Layer is not touched and must not import this wrapper.

Dependency rules:
- `src/lib/api/client.ts` may import the browser Supabase client for session token and refresh handling.
- `src/lib/api/client.ts` must not import Next route handlers, server-only modules, or feature domain modules.
- Route Adapters remain responsible for server-side authentication, authorization, and response mapping.

Response contract:
- Return `ApiResult<T>`.
- HTTP errors become `{ success: false, error }`.
- Empty successful responses become `{ success: true, data: undefined as T }`.

Runner note:
- Reconfirmed at ddd-design phase.
