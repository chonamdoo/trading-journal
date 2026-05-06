# Slice Plan - SPEC-002 Slice 4

Slice:
- Screenshot Data URL API Boundary.

Steps:
1. RED: add behavior tests for the server helper/route and client wrapper.
2. GREEN: add server helper, route adapter, client wrapper, and replace direct Supabase use in `ShareCardModal`.
3. REFACTOR: keep structure minimal.
4. Gates: tests, typecheck, lint, build, diff check.

Out of scope:
- UI redesign.
- Store migration.
- Auth pages.

Runner note:
- Reconfirmed at slice-plan phase.
