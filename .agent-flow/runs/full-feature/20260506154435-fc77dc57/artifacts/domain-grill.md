# Domain Grill - SPEC-002 Slice 3

Task: Client Fetch Wrapper Foundation.

Resolved decisions:
- This slice owns the browser-side API boundary only: `apiFetch`, `apiFetchFormData`, and narrow behavior tests.
- The wrapper must attach the Supabase access token as `Authorization: Bearer <token>` when a session exists.
- A 401 response must trigger exactly one `refreshSession()` retry, then redirect to `/login` only when refresh cannot provide a new token.
- The wrapper must normalize HTTP failures into `ApiResult<T>` failure values instead of throwing.
- Empty success responses such as 204 are valid for future delete-style client wrappers and must not be treated as network errors.
- No UI, design component, design-system, Supabase route handler, or Zustand migration is included in this slice.

Terms:
- Client Fetch Wrapper: browser-side fetch boundary used by client API functions.
- ApiResult: success/failure result envelope used by Trading Journal API helpers.
- Route Adapter: `/api/*` Next route handler. This slice calls adapters but does not change them.

Open questions:
- None for this slice.

Sources checked:
- `specs/002-api-unification.md`
- `src/lib/api/client.ts`
- `src/lib/api/client-api.ts`
- `src/lib/supabase/client.ts`
