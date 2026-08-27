ALTER TABLE proposed_changes ADD COLUMN IF NOT EXISTS idempotency_key varchar(120);
ALTER TABLE handoffs ADD COLUMN IF NOT EXISTS idempotency_key varchar(120);
ALTER TABLE case_artifacts ADD COLUMN IF NOT EXISTS idempotency_key varchar(120);
CREATE UNIQUE INDEX IF NOT EXISTS proposed_changes_idempotency_key_idx ON proposed_changes (idempotency_key);
CREATE UNIQUE INDEX IF NOT EXISTS handoffs_idempotency_key_idx ON handoffs (idempotency_key);
CREATE UNIQUE INDEX IF NOT EXISTS case_artifacts_idempotency_key_idx ON case_artifacts (idempotency_key);
