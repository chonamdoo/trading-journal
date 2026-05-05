# 013 Clean Architecture Refactor Slice Plan

Status: completed
Parent PRD: `specs/013-clean-architecture-refactor.md`
GitHub Issue: https://github.com/chonamdoo/trading-journal/issues/12

## Context Capsule

Refactor Trading Journal in small vertical slices without changing features, UI, design components, or the design system. Use **Feature Module** structure with **Presentation Layer**, **Domain Layer**, **Data Layer**, server-only **Composition Root**, thin **Route Adapters**, and behavior-first TDD.

## Slice Order

### Slice 1: Refactor Safety Foundation

Goal: make future slices safe before moving runtime behavior.

Acceptance criteria:

- Vercel Preview deploys are skipped for `codex/refactor-*` branches.
- Vitest or equivalent test runner is available through `npm test`.
- A first **Behavior Test** can run locally.
- Local Supabase test setup path is documented or scripted without using production data.
- Existing UI and runtime behavior are unchanged.
- Project gates are documented for this repo.

Verification:

- `npm test`
- `npx tsc --noEmit`
- `npm run lint`
- `npx next build --no-lint`

### Slice 2: Trades Domain Tracer Bullet

Goal: prove the **Trades** feature module path with one public behavior.

Acceptance criteria:

- `Trades` has a feature module scaffold.
- **Domain Layer** owns Trade entity/value behavior and repository interface.
- **Data Layer** owns DTO mapping for the selected behavior.
- One **Tracer Bullet** covers observable Trade behavior.
- No UI change.
- Existing route behavior remains compatible.

Verification:

- Behavior test for the selected Trade behavior.
- Typecheck, lint, build.

### Slice 3: Trades Route Adapter Migration

Goal: migrate a small Trades HTTP path to the new module without changing behavior.

Acceptance criteria:

- One existing Trades route becomes a thin **Route Adapter**.
- Route calls the Trades **Composition Root**.
- Supabase access stays in the **Data Layer**.
- Existing response shape remains compatible.
- Regression behavior is locked by test.

Verification:

- Behavior or route-level test for migrated path.
- Typecheck, lint, build.

### Slice 4: Trades Lifecycle Expansion

Goal: extend the Trades module to **Close** and **Scale-In** behavior.

Acceptance criteria:

- Close behavior preserves partial and final close semantics.
- Scale-In behavior preserves **Averaging Down** and **Pyramiding** distinction.
- Trading PnL calculation remains compatible.
- Existing UI remains unchanged.

Verification:

- Behavior tests for Close and Scale-In.
- Typecheck, lint, build.

### Slice 5: Reports Feature Module

Goal: move **Report**, **AI Report**, and **Report Period** behavior behind feature boundaries.

Acceptance criteria:

- Reports have Domain/Data boundaries.
- AI generation integration remains in server-only Data Layer.
- Report Period handling remains compatible.
- Existing report UI remains unchanged.

Verification:

- Behavior tests for Report Period selection and AI Report data preparation.
- Typecheck, lint, build.

### Slice 6: User Profile And Auth Boundary

Goal: separate **Auth User** and **User Profile** behavior.

Acceptance criteria:

- Auth/session access is server-only.
- User Profile use cases do not depend on Next route handlers.
- Production demo account is not used by automated tests.
- Local Supabase path supports auth-related testing.

Verification:

- Behavior tests with mocked or local auth boundary.
- Typecheck, lint, build.

### Slice 7: Assets And Capital Targets

Goal: migrate **Asset**, **Supported Asset**, **Custom Asset**, **Favorite Asset**, and **Capital Target** behavior.

Acceptance criteria:

- Asset variants remain semantically distinct.
- Capital Target stays separate from Target Price.
- Existing UI behavior remains unchanged.
- Route Adapters stay thin.

Verification:

- Behavior tests for asset and capital target behavior.
- Typecheck, lint, build.

### Slice 8: Exchange Import Boundary

Goal: isolate **Exchange Connection**, **Exchange Sync**, **Imported Trade**, **Trade Source**, and **Import Status**.

Acceptance criteria:

- Exchange clients stay in server-only Data Layer.
- Imported Trade behavior uses domain language, not `api` as a domain source.
- Existing exchange sync flows remain compatible.

Verification:

- Behavior tests around import status/source mapping.
- Typecheck, lint, build.

## Cross-Slice Rules

- One slice equals one PR.
- Do not split by technical layer alone.
- Do not change UI or design system.
- Do not automate writes against production Supabase.
- Use local Supabase for automated persistence/auth tests.
- Run review-fix loop before commit.
- Record handoff in `.agent-flow/handoffs/`.
