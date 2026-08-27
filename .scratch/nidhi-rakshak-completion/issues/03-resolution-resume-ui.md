# 03 — Complete resolution reload and resume UI

**What to build:** The resolution experience restores saved simulation, consent, artifacts, tracking, and re-check outcomes, with distinct resolved, repeated-blocker, new-blocker, wait, and refusal states.

**Blocked by:** 02 — Harden resolution persistence and idempotency.

**Status:** complete

- [x] Reload restores the saved journey and artifacts.
- [x] Each re-check outcome has distinct plain-language UI.
- [x] Every action has loading, error/retry, success, empty, and refusal/wait behavior.
- [x] Controls expose clear focus, labels, and safe feedback.
