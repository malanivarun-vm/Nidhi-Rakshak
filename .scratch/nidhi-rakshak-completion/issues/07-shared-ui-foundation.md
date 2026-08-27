# 07 — Unify the shared UI foundation

**What to build:** Diagnosis and resolution consume one shared token and component system with a centered responsive shell.

**Blocked by:** None.

**Status:** complete

- [x] Normalize shared component exports and call sites.
- [x] Constrain every screen body and header row to the same mobile-first column.
- [x] Migrate resolution off `ResolutionExperience.module.css` and remove the duplicate stylesheet.
- [x] Use the existing public brand asset consistently.
- [x] Preserve visible focus, 44px targets, dark mode, and reduced motion.

## Comments

- 2026-08-27: Current diagnosis and resolution components expose incompatible APIs despite both importing the shared module.
