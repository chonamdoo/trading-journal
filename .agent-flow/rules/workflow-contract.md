# Workflow Contract

The workflow runner is the source of truth for phase order. Agents may read skills and prompts, but must use `npx github:chonamdoo/agent-flow run next` and `npx github:chonamdoo/agent-flow run advance` to move through the workflow.
