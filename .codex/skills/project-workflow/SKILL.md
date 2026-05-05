---
name: project-workflow
description: Trading Journal repository workflow for PRD-driven slices, branch/worktree isolation, agent-flow runs, TDD, gates, review-fix loops, commits, PR discipline, and handoff. Use when the user says workflow, 워크플로우, flow, 플로우, feature work, bugfix, refactor, PRD slice, or asks for any non-trivial code/documentation change in this repo.
---

# Project Workflow

Use this workflow when the user says `workflow`, `워크플로우`, `flow`, `플로우`, or requests non-trivial Trading Journal work. Simple questions do not start the workflow.

## 0. Required Context

Before work, read only the relevant parts of:

- `CONTEXT.md` for domain and architecture language.
- `docs/adr/` for decisions in the touched area.
- `specs/INDEX.md` and the linked PRD/slice spec.
- `AGENTS.md` for project QA and verification rules.

Use the glossary terms: **Feature Module**, **Domain Layer**, **Data Layer**, **Composition Root**, **Route Adapter**, **Behavior Test**, **Tracer Bullet**, and **Red-Green-Refactor Cycle**.

## 1. Standard Flow

Follow this order:

```txt
PRD
-> Slice Plan
-> separate branch/worktree
-> agent-flow run start
-> RED
-> GREEN
-> REFACTOR
-> gates
-> multi-review
-> fix loop
-> commit
-> push/PR
-> handoff
```

## 2. PRD And Slice Plan

- Large work starts from a PRD in `specs/`.
- One GitHub Issue equals one vertical slice equals one PR.
- Slice by externally observable behavior, not by technical layer.
- Respect dependency order. Do not start blocked slices.
- Keep completed or superseded specs for history.

## 3. Branch And Worktree Isolation

- Implementation and documentation changes must run on a `codex/` branch.
- Prefer a separate worktree before starting new work.
- If already inside a task-specific `codex/` branch/worktree, continue there.
- Do not work directly on `main`.
- Refactor branches should use `codex/refactor-*` so Vercel Preview can be skipped.

## 4. Agent-Flow Run

- Start or continue the lifecycle in `.agent-flow/` before implementation.
- Store handoff, run state, review decisions, and recovery notes under `.agent-flow/`.
- If agent-flow tooling is missing or incomplete, keep the same artifact structure manually and record the gap.

## 5. TDD Cycle

- Use behavior-first TDD.
- RED: write one **Behavior Test** through a public interface.
- GREEN: write the minimum code to pass.
- REFACTOR: clean only after green.
- Do not batch tests before implementation.
- Do not test private helpers, folder structure, or internal collaborators.
- For bugfixes, reproduce the bug with a failing regression test before fixing.

## 6. Architecture Rules

- Feature modules use `presentation/`, `domain/`, and `data/`.
- **Domain Layer** owns entities, repository interfaces, and use cases.
- **Data Layer** owns DTOs, data sources, and repository implementations.
- **Presentation Layer** must not import Data Layer directly.
- Domain must not import Next.js, React, Supabase, browser APIs, or Data Layer.
- Server-only modules use `.server.ts`; browser-only modules use `.client.ts`.
- Each feature may expose `di.server.ts` as its **Composition Root** with `import 'server-only'`.
- Next route handlers are **Route Adapters** only: auth, request parsing, use case call, response mapping.

## 7. Gates

Run applicable gates before review and before commit:

```bash
npx next build
npx tsc --noEmit
npm run lint
npm test
```

- If test tooling is not installed yet, add it as part of the slice that introduces TDD.
- If migrations change, run the Supabase consistency check required by `AGENTS.md`.
- Gate failure means fix and rerun. Report only if blocked.

## 8. Multi-Review And Fix Loop

- After gates pass, run the project verification loop from `AGENTS.md`.
- Use the code reviewer first. Run QA only after review approval.
- If review requests changes, fix, rerun relevant tests/gates, then review again.
- Maximum three review rounds. Escalate if still failing.
- Treat repeated review findings as blockers.

## 9. Commit, Push, PR

- Commit only after gates and review pass.
- Commit messages should state the slice, behavior, verification, and accepted/rejected review feedback.
- Push or open PR only when the user explicitly asks.
- Never merge directly to `main`.
- PRs should stay one vertical slice.

## 10. Handoff

At stop or completion, update `.agent-flow/handoffs/` with:

- PRD/spec and GitHub Issue URL.
- Current branch/worktree.
- Changed files.
- Gates run and results.
- Review decision.
- Remaining risks and next slice.
