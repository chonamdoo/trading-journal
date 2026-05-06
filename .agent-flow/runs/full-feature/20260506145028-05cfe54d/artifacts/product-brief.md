# Product Brief - SPEC-002 Slice 2

Demand:
- SPEC-002 requires old `/api/mobile/*` data endpoints to move to canonical `/api/*` paths without breaking clients immediately.

Status quo:
- Mobile data routes duplicate implementation logic.

Narrowest wedge:
- Convert specified mobile data routes to permanent redirects.

Cut list:
- Mobile auth routes.
- Client fetch migration.
- New resource route creation.
- UI changes.

Decision:
- build.
