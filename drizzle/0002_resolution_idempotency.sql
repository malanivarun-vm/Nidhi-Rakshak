ALTER TABLE "proposed_changes" ADD COLUMN "idempotency_key" varchar(120);
ALTER TABLE "handoffs" ADD COLUMN "idempotency_key" varchar(120);
ALTER TABLE "case_artifacts" ADD COLUMN "idempotency_key" varchar(120);
CREATE UNIQUE INDEX "proposed_changes_idempotency_key_idx" ON "proposed_changes" USING btree ("idempotency_key");
CREATE UNIQUE INDEX "handoffs_idempotency_key_idx" ON "handoffs" USING btree ("idempotency_key");
CREATE UNIQUE INDEX "case_artifacts_idempotency_key_idx" ON "case_artifacts" USING btree ("idempotency_key");
