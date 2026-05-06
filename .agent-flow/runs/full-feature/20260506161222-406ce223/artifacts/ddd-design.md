# DDD Design - SPEC-002 Slice 4

Layer boundaries:
- Presentation: `ShareCardModal`.
- Client API: `fetchScreenshotDataUrl`.
- Route Adapter: screenshot data-url route.
- Data/API helper: `getScreenshotDataUrl`.

Dependency rules:
- Presentation must not import Supabase client for screenshot download.
- Route Adapter may use `withAuth` and server API helper.
- Domain Layer remains untouched.

Security rule:
- The helper must query `trade_screenshots` by `id` and `trade_id` before downloading the Storage object.

Runner note:
- Reconfirmed at ddd-design phase.
