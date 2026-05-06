# Domain Grill - SPEC-002 Slice 2

Task: SPEC-002 Slice 2: Mobile Route Redirect Compatibility.

Decisions:
- `/api/mobile/*` data routes are compatibility entry points only.
- Compatibility data routes should permanently redirect to matching `/api/*` routes with status 308.
- Mobile auth routes remain out of scope and do not redirect.
- Query strings must be preserved during redirect.

Open questions:
- None.

Terms:
- Mobile Compatibility Route: legacy `/api/mobile/*` data endpoint.
- Canonical Route Handler: replacement `/api/*` endpoint.
- 308 Redirect: permanent redirect that preserves the original HTTP method.

Sources checked:
- `specs/002-api-unification.md`
- `src/app/api/mobile/trades/route.ts`
- `src/app/api/mobile/deposits/route.ts`
- `src/app/api/mobile/profile/route.ts`
