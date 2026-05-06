# Domain Grill - SPEC-002 Slice 4

Task: Screenshot Data URL API Boundary.

Resolved decisions:
- The share card still needs a screenshot Data URL so `html-to-image` can render without CORS issues.
- Browser UI must not download Supabase Storage objects directly.
- The server Route Adapter will download the screenshot through authenticated `/api/*` and return a Data URL.
- UI and design output remain unchanged.
- This slice does not migrate auth pages or settings logout Supabase auth calls.

Terms:
- Screenshot Data URL: `data:<mime>;base64,<payload>` used by share-card rendering.
- Route Adapter: Next `/api/*` handler that owns auth and server-side Storage access.
- Client API wrapper: browser function in `src/lib/api/client-api.ts` that calls the route adapter.

Open questions:
- None.

Sources checked:
- `specs/002-api-unification.md`
- `src/components/trades/ShareCardModal.tsx`
- `src/lib/api/screenshots.ts`
- `src/lib/api/client-api.ts`
