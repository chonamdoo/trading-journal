# PRD - SPEC-005 Slice 4

## Problem
The AI report page currently loads only monthly reports. Weekly reports can be generated, but users cannot choose or inspect them from the report page.

## Goal
Expose Report Period selection on the AI report page while preserving the existing monthly-first experience.

## Acceptance Criteria
- Page loads monthly reports by default.
- Page can load weekly reports through `fetchReportsByType('weekly')`.
- Header and hero period labels reflect weekly or monthly selection.
- Empty state copy is period-specific.
- Existing UI/design system remains unchanged.
