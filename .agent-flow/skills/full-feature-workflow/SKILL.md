# Full Feature Workflow

Use this skill for feature work in this project.

Always drive progress through:

```bash
npx github:chonamdoo/agent-flow run next
```

Canonical order:

1. domain-grill
2. domain-map
3. product-brief
4. prd
5. slice-plan
6. plan-review
7. ddd-design
8. worktree
9. run-start
10. red
11. green
12. refactor
13. gates
14. multi-review
15. fix-loop
16. architecture-review
17. commit
18. push-pr
19. pr-watch
20. pr-comment-fix
21. pr-ci-fix
22. merge-approval
23. merge
24. handoff

Do not skip phases. If existing docs satisfy a phase, write the required artifact and reference those docs. If a gate, review, PR comment, or PR check fails, complete the matching fix phase and push again before merge/handoff.

Coding rule:

- Code comments are required when intent is not obvious, and every code comment must be written in Korean.
