# Domain Map - SPEC-002 Slice 4

Boundary map:
- `ShareCardModal` remains presentation.
- `fetchScreenshotDataUrl` becomes the client API boundary for share-card screenshot download.
- `/api/trades/[id]/screenshots/[screenshotId]/data-url` becomes the Route Adapter.
- `src/lib/api/screenshots.ts` owns server-side screenshot Storage access.

Dependency rule:
- Presentation calls client API.
- Client API calls `/api/*`.
- Route Adapter calls API/data helper.
- Domain Layer remains untouched.
