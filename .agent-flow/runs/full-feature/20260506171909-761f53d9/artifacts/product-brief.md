# Product Brief: Weekly Report Period Schema

## Demand
Users need weekly automatic reports without losing the existing monthly report behavior.

## Status Quo
The code already references `period_type` and `week`, but the migration uniqueness strategy can allow duplicate monthly rows when `week` is `NULL`.

## Target User
Authenticated Trading Journal user viewing AI reports.

## Narrowest Wedge
Fix the report period schema contract so weekly/monthly report identity is safe before adding or relying on generation behavior.

## Build
- Migration SQL uniqueness fix.
- Type/test coverage for the period schema contract.

## Defer
- Weekly generation prompt.
- Auto generation UI.
- Report page grouping changes.

## Cut
- No design or component changes in this slice.
