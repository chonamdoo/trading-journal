# DDD Clean Architecture

Use during full-feature ddd-design and architecture-review phases.

Default architecture is data / domain / presentation with optional shared.

Layer rules:

- domain owns entities, value objects, aggregates, use cases, repository interfaces, domain services, events, errors, policies, and specifications.
- data owns repository implementations, API/DB clients, persistence models, mappers, and external integrations.
- presentation owns controllers, routes, components, presenters, view models, and external input handling.
- shared is optional and must contain only domain-free primitives such as Result, IDs, time, and common errors.

Dependency rules:

- domain must not import data or presentation.
- presentation calls domain use cases.
- data implements domain repository interfaces.
- presentation must not call data directly.
- repository pattern uses interfaces in domain and implementations in data.

Coding rule:

- Code comments are required when intent is not obvious, and every code comment must be written in Korean.

Design artifact must identify domain core modules and data / domain / presentation boundaries.
