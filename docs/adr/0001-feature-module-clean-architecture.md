# Use feature modules with domain and data layers

We will refactor Trading Journal into feature modules that keep UI, domain rules, and external data access separated without changing the existing product behavior or design. Each feature module will use `presentation`, `domain`, and `data` layers: the **Domain Layer** owns entities, repository interfaces, and use cases; the **Data Layer** owns DTOs, data sources, and repository implementations; the **Presentation Layer** owns UI and browser-facing state.

We chose this over a layer-first project structure because the product is organized around capabilities such as Trades, Reports, User Profile, Assets, and Capital Targets. We chose `data` instead of `infrastructure`, and domain-owned use cases instead of a separate `application` layer, to match the project's preferred Android-style Clean Architecture language while preserving dependency inversion.

Feature modules will expose server-only composition through `di.server.ts`, the feature **Composition Root**. Next route handlers will become thin **Route Adapters** that parse HTTP, call domain use cases through the composition root, and map responses. Runtime-specific modules will use **Runtime Boundary Suffixes** such as `.server.ts` and `.client.ts`.

Testing will follow behavior-first TDD: one **Behavior Test** at a time, one **Tracer Bullet** to prove a path, then repeated **Red-Green-Refactor Cycles**. Tests must verify public behavior using Trading Journal domain language, not internal folder structure or private collaborators.
