# Domain Grill

Task: SPEC-003 Slice 2: Pre-trade Checklist UI

Decisions:
- Pre-trade Checklist is a user-facing self-check before creating a new Trade.
- Checklist answers are not persisted.
- Incomplete checklist does not block saving; it only emits a warning toast.
- The checklist is only shown on new trade entry, not edit mode.
- Save success and manual reset clear checklist state.

Terms:
- Pre-trade Checklist: three transient checks before trade creation.
- Warning toast: non-blocking feedback when one or more checks are incomplete.

Sources checked:
- `specs/003-checklist-market-insight.md`
- `src/components/trades/TradeForm.tsx`

Open questions:
- None.
