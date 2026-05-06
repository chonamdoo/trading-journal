# Product Brief - SPEC-002 Slice 1

Demand:
- SPEC-002 needs one auth entry point before broader `/api/*` migration.

Status quo:
- `auth.ts` already contains unified Bearer/cookie detection.
- `mobile-auth.ts` is missing.
- No behavior test locks this auth selection contract.

Narrowest wedge:
- Add behavior tests for auth client selection.
- Add `mobile-auth.ts` as a compatibility re-export.

Cut list:
- No CRUD route migration.
- No client fetch wrapper changes.
- No UI changes.

Decision:
- build.
