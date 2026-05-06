# Product Brief - SPEC-002 Slice 4

Demand:
- SPEC-002 requires browser data access to move behind `/api/*`. Share-card screenshot rendering still uses Supabase Storage directly.

Narrowest wedge:
- Replace one direct browser Storage download with one authenticated API route and client wrapper.

Observed behavior:
- Share card preview, copy, share, and download behavior should remain unchanged.

Cut list:
- No visual redesign.
- No image-generation behavior change.
- No broader store migration.

Decision:
- build.
