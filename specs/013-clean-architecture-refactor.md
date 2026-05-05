# 013 Clean Architecture Refactor PRD

## Problem Statement

Trading Journal already has working product behavior, but the current code structure mixes Next route handlers, Supabase access, domain rules, DTO conversion, and UI-facing API wrappers across broad shared folders. This makes large changes risky, makes TDD difficult, and makes a future FastAPI migration harder because business behavior is not isolated behind stable domain interfaces.

The user wants to refactor the project without changing features, UI, design components, or the design system. The refactor must happen on a separate working branch and must avoid automatic Vercel Preview deployments for refactor branches.

## Solution

Refactor Trading Journal into feature modules using the glossary and ADR-defined architecture language. Each feature module will separate the **Presentation Layer**, **Domain Layer**, and **Data Layer** while preserving current behavior and UI.

The refactor will proceed in small PR-sized slices. The first slice establishes the architecture, TDD setup, Vercel ignored build policy for refactor branches, local Supabase test environment, and the first **Trades** tracer bullet. Later slices migrate **Reports**, **User Profile**, **Assets**, **Favorite Assets**, and **Capital Targets** in order.

FastAPI is out of the immediate implementation path. The Next.js backend will be refactored first so that later FastAPI migration can reuse the same domain boundaries and API contracts.

## User Stories

1. As a trader, I want my existing Trading Journal screens to look unchanged, so that I can keep using the product during the refactor.
2. As a trader, I want my existing Trades to behave unchanged, so that open and closed position lifecycle records remain reliable.
3. As a trader, I want my Closes to continue supporting partial and full position exits, so that my realized Trading PnL stays correct.
4. As a trader, I want Scale-Ins to keep distinguishing Averaging Down and Pyramiding, so that my position history remains meaningful.
5. As a trader, I want Asset selection to keep supporting Supported Assets, Custom Assets, and Favorite Assets, so that trade entry stays fast.
6. As a trader, I want Capital Targets to remain separate from Target Prices, so that account-value goals are not confused with Trading Plan exit prices.
7. As a trader, I want Deposits to keep affecting Funded Capital, so that Equity calculations remain accurate.
8. As a trader, I want Reports and AI Reports to continue using Report Periods, so that weekly and monthly analysis remains consistent.
9. As a trader, I want Trading Plans to remain linkable to Trades, so that planned behavior and actual execution can be compared.
10. As a trader, I want Exchange Connections to keep syncing Imported Trades, so that exchange-based import workflows remain intact.
11. As a trader, I want Trade Source and Import Status to remain clear, so that manually entered and imported Trades are not mixed up.
12. As a trader, I want Trade Rationale, Trade Review, Trade Emotion, and Trade Tags to remain preserved, so that AI Reports can analyze behavior.
13. As a product owner, I want the refactor to preserve current UI and design components, so that implementation risk stays focused on architecture.
14. As a product owner, I want each refactor step to be small, so that regressions can be reviewed and reverted safely.
15. As a product owner, I want Vercel Preview deployments skipped for refactor branches, so that unfinished architecture work does not deploy automatically.
16. As a developer, I want feature modules organized around product capabilities, so that Trades, Reports, User Profile, Assets, and Capital Targets are easier to reason about.
17. As a developer, I want the Domain Layer to own entities, repository interfaces, and use cases, so that business behavior does not depend on Supabase or Next.js.
18. As a developer, I want the Data Layer to own DTOs, data sources, and repository implementations, so that external systems are isolated.
19. As a developer, I want repository interfaces in the Domain Layer and implementations in the Data Layer, so that dependency inversion is explicit.
20. As a developer, I want Route Adapters to stay thin, so that HTTP parsing and response mapping do not contain domain rules.
21. As a developer, I want a server-only Composition Root per feature, so that dependencies are wired in one predictable place.
22. As a developer, I want Runtime Boundary Suffixes, so that server-only and browser-only imports are visible in file names.
23. As a developer, I want a small Core Module, so that shared code does not become a dumping ground.
24. As a developer, I want Behavior Tests written in Trading Journal language, so that tests survive internal refactors.
25. As a developer, I want one Tracer Bullet before broad migration, so that the new architecture path is proven end to end.
26. As a developer, I want Red-Green-Refactor Cycles, so that TDD remains incremental instead of becoming a batch of implementation-coupled tests.
27. As a developer, I want local Supabase testing, so that automated verification does not mutate production data.
28. As a developer, I want production demo account use limited to manual read-oriented Smoke Tests, so that production data stays safe.
29. As a future backend developer, I want Next.js domain boundaries to map cleanly to FastAPI later, so that migration does not require rediscovering business rules.

## Implementation Decisions

- Refactor by feature module, not by horizontal layer-first folders.
- Use **Presentation Layer**, **Domain Layer**, and **Data Layer** as the canonical layer names.
- Do not introduce a separate Application Layer.
- Do not use Infrastructure Layer as the standard project term; use Data Layer.
- Keep use cases inside the Domain Layer.
- Keep repository interfaces in the Domain Layer.
- Keep repository implementations, DTOs, and data sources in the Data Layer.
- Use a server-only **Composition Root** per feature.
- Use Runtime Boundary Suffixes for server-only and browser-only modules.
- Keep the Core Module small and feature-independent.
- Keep existing UI and design components unchanged during backend/domain refactor slices.
- Convert Next route handlers into thin Route Adapters over time.
- Start migration order with Trades, then Reports, then User Profile, then Assets, Favorite Assets, and Capital Targets.
- First PR slice should establish architecture scaffolding, TDD tooling, local Supabase test environment, Vercel ignored build policy, and a small Trades tracer bullet.
- FastAPI is deferred until the Next.js architecture is clean enough to migrate safely.
- Production demo account is not an automated test dependency.

## Testing Decisions

- Good tests verify observable behavior through public interfaces, not implementation details.
- Tests must use Trading Journal domain language from the glossary.
- Tests must not assert folder structure, private collaborators, or internal implementation shape.
- TDD must proceed one Behavior Test at a time.
- The first implementation path should be a Tracer Bullet.
- Use Red-Green-Refactor Cycles and avoid horizontal batches of tests.
- Prioritize Trades behavior because it is the core position lifecycle domain.
- Cover behavior around Trade lifecycle, Close, Scale-In, Position Direction, Margin, Trading PnL, Funded Capital, and Equity before broader migration.
- Add Data Layer mapping tests only where DTO conversion is externally observable through a public interface or contract.
- Use local Supabase for automated tests that touch auth, RLS, persistence, or seeded data.
- Use production demo account only for manual, read-oriented Smoke Tests.
- Run project QA after implementation slices: build, typecheck, lint, and Supabase consistency checks when migrations change.

## Out of Scope

- UI redesign.
- Design system changes.
- Feature behavior changes.
- FastAPI implementation in the initial refactor.
- Production Supabase automated E2E writes.
- Replacing Supabase Auth.
- Moving all features in one PR.
- Refactoring unrelated files outside the active slice.

## Further Notes

- This PRD follows the terminology in the Trading Journal glossary.
- The architecture decision is recorded in ADR 0001.
- Refactor work should remain on `codex/refactor-clean-architecture` or another `codex/refactor-*` branch.
- Vercel Preview deployments should be skipped for refactor branches while GitHub Actions continue to run.
