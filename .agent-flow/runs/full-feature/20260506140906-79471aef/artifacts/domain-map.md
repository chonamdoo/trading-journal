# Domain Map - SPEC-002 Slice 1

Referenced context:
- Existing `CONTEXT.md` domain language remains unchanged.

Boundary map:
- Route Adapter -> Unified Auth Boundary -> Supabase client -> handler.
- Bearer API requests use the mobile Supabase client factory.
- Cookie web requests use the server Supabase client factory.
- Existing mobile routes can import `mobile-auth.ts`, which re-exports the unified boundary.

Dependency decision:
- Route handlers may import `@/lib/api/auth`.
- Compatibility routes may import `@/lib/api/mobile-auth`.
- Domain Layer remains untouched.
