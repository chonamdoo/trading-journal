# Product Brief

## Demand
Users should not see failed weekly report generation when the same ISO week crosses month boundaries or when prior data has a different stored month.

## Narrowest Wedge
Fix weekly generation lookup to match the database uniqueness contract.

## Build
- Behavior test for weekly lookup key.
- Minimal API route fix.

## Defer
- UI grouping.
- Auto generation scheduling changes.
- Prompt changes.

## Cut
- No design change.
