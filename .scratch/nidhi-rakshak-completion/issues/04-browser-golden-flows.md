# 04 — Add browser golden-flow verification

**What to build:** Browser tests replay Fight, Forward, Fix, and Unsupported journeys at mobile and desktop viewports, including reload/resume and failure recovery.

**Blocked by:** 03 — Complete resolution reload and resume UI.

**Status:** complete

- [x] Playwright runs against a local Next server.
- [x] All four golden journeys are covered end-to-end.
- [x] Required refusal, wait, and reload states are covered.
- [x] 390px and 1280px layouts have no horizontal overflow.
- [x] Critical controls are reached by accessible role/name selectors.
