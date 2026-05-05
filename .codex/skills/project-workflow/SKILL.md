---
name: project-workflow
description: Trading Journal wrapper workflow for the installed Agent Flow full-feature CLI. Use when the user says workflow, 워크플로우, flow, 플로우, feature work, bugfix, refactor, PRD slice, push/PR work, or asks for any non-trivial code/documentation change in this repo.
---

# Project Workflow

Use this skill when the user says `workflow`, `워크플로우`, `flow`, `플로우`, or requests non-trivial Trading Journal work. Simple questions do not start the workflow.

## 0. Source Of Truth

The installed Agent Flow runner is the source of truth for phase order.

Drive workflow progress through:

```bash
npx github:chonamdoo/agent-flow run start --task "<task>"
npx github:chonamdoo/agent-flow run next
```

After a phase artifact exists and satisfies the CLI instruction, advance only with:

```bash
npx github:chonamdoo/agent-flow run advance
```

Do not manually skip phases. If existing docs satisfy a phase, write the required artifact and reference those docs instead of duplicating large content.

## 1. Canonical Phase Order

Follow `.agent-flow/workflows/full-feature.yaml`:

```txt
domain-grill
-> domain-map
-> product-brief
-> prd
-> slice-plan
-> plan-review
-> ddd-design
-> worktree
-> run-start
-> red
-> green
-> refactor
-> gates
-> multi-review
-> fix-loop
-> architecture-review
-> commit
-> push-pr
-> pr-watch
-> pr-comment-fix
-> pr-ci-fix
-> merge
-> handoff
```

Use `.agent-flow/skills/full-feature-workflow/SKILL.md`, `.agent-flow/prompts/`, and `.agent-flow/rules/workflow-contract.md` as the reusable workflow assets.

## 2. Required Repo Context

Before implementation phases, read only the relevant parts of:

- `CONTEXT.md` for domain language.
- `docs/adr/` for architecture decisions.
- `specs/INDEX.md` and linked PRD/slice specs.
- `AGENTS.md` for project QA and verification rules.

Use the glossary terms: **Feature Module**, **Domain Layer**, **Data Layer**, **Composition Root**, **Route Adapter**, **Behavior Test**, **Tracer Bullet**, and **Red-Green-Refactor Cycle**.

## 3. Trading Journal Rules

- Do not change UI, design components, or design system unless the task explicitly asks for it.
- Feature modules use `presentation/`, `domain/`, and `data/`.
- **Domain Layer** owns entities, repository interfaces, and use cases.
- **Data Layer** owns DTOs, data sources, and repository implementations.
- **Presentation Layer** must not import Data Layer directly.
- Domain must not import Next.js, React, Supabase, browser APIs, or Data Layer.
- Server-only modules use `.server.ts`; browser-only modules use `.client.ts`.
- Each feature may expose `di.server.ts` as its **Composition Root** with `import 'server-only'`.
- Next route handlers are **Route Adapters** only: auth, request parsing, use case call, response mapping.
- Code comments are only for non-obvious intent, and every code comment must be written in Korean.

## 4. Worktree And Deploy Safety

- Implementation and documentation changes must run on a `codex/` branch.
- Prefer a dedicated worktree before starting new work.
- If already inside a task-specific `codex/` branch/worktree, continue there.
- Do not work directly on `main`.
- Refactor branches should use `codex/refactor-*` so Vercel Preview can be skipped.
- Push, PR creation, and merge happen only in the corresponding Agent Flow phases and only when the user asks for those actions.

## 5. TDD And Gates

- Use behavior-first TDD.
- RED: write one **Behavior Test** through a public interface and record failing output in the phase artifact.
- GREEN: write the minimum code to pass and record passing output.
- REFACTOR: clean only after green.
- Do not test private helpers, folder structure, or internal collaborators.
- For bugfixes, reproduce the bug with a failing regression test before fixing.

Run applicable gates in the `gates` phase and before commit:

```bash
npx next build
npx tsc --noEmit
npm run lint
npm test
```

- If migrations change, run the Supabase consistency check required by `AGENTS.md`.
- Do not run automated tests against production Supabase.
- Production demo account is manual Smoke Test only.

## 6. Review, Fix, And Handoff

- `multi-review`, `fix-loop`, and `architecture-review` are separate Agent Flow phases.
- If a gate, review, PR comment, or PR check fails, complete the matching fix phase and push again before merge/handoff.
- Commit only after required gates and reviews pass.
- Handoff artifacts must record decisions, changed files, verification, risks, and remaining work.
