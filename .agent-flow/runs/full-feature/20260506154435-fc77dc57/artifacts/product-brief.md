# Product Brief - SPEC-002 Slice 3

Demand:
- Future SPEC-002 slices need a stable browser fetch boundary before removing direct Supabase data calls from stores and API helpers.

Status quo:
- `src/lib/api/client.ts` exists, but behavior is not covered by tests and empty success responses are fragile because all responses are parsed as JSON.

Target user:
- A logged-in Trading Journal web user using existing screens.

Narrowest wedge:
- Lock the wrapper behavior with behavior tests and make the wrapper safe for successful empty responses.

Observed behavior:
- UI behavior must remain unchanged.
- API calls still flow through existing `/api/*` routes.

Cut list:
- No Zustand migration.
- No route handler creation.
- No design or UI change.
- No production Supabase automated test.

Decision:
- build.
