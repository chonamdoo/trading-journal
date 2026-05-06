# Fix Loop - SPEC-002 Slice 2

Result:
- Full test run exposed obsolete mobile profile test.

Fix:
- Updated `tests/api/mobile-profile-route.behavior.test.ts` to assert 308 redirect.
- PR review noted that auto-following redirect clients would observe canonical wrapped responses instead of legacy mobile plain responses.
- Added a mobile compatibility marker to redirect targets and made canonical routes return legacy mobile response shape when that marker is present.
