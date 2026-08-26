CREATE TYPE "public"."case_status" AS ENUM('OPEN', 'DIAGNOSING', 'DIAGNOSED', 'IN_RESOLUTION', 'WAITING', 'RESOLVED', 'REFUSED');--> statement-breakpoint
CREATE TYPE "public"."journey_type" AS ENUM('MISMATCH', 'MISSING_DATA', 'VALIDATION_FAILURE', 'SERVICE_HISTORY', 'ELIGIBILITY', 'RECORD_CONSOLIDATION', 'PENDING_PROCESS', 'UNSUPPORTED');--> statement-breakpoint
CREATE TYPE "public"."owner_type" AS ENUM('MEMBER', 'EMPLOYER', 'EPFO', 'BANK', 'NONE');--> statement-breakpoint
CREATE TYPE "public"."support_status" AS ENUM('GOLDEN', 'SUPPORTED', 'DECLARED_UNSUPPORTED');--> statement-breakpoint
CREATE TYPE "public"."verdict" AS ENUM('FIX', 'FIGHT', 'FORWARD', 'NONE');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "blockers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"diagnosis_id" uuid NOT NULL,
	"type" varchar(40) NOT NULL,
	"field" varchar(80),
	"reason" text NOT NULL,
	"owner" "owner_type" NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "case_artifacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"case_id" uuid NOT NULL,
	"kind" varchar(24) NOT NULL,
	"payload" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "case_status_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"case_id" uuid NOT NULL,
	"from_status" "case_status",
	"to_status" "case_status" NOT NULL,
	"reason" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "claim_rejections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"claim_id" uuid NOT NULL,
	"raw_text" text NOT NULL,
	"code" varchar(80),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "claims" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"external_ref" varchar(80) NOT NULL,
	"claim_type" varchar(40) NOT NULL,
	"submitted_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "claims_external_ref_unique" UNIQUE("external_ref")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "diagnosis_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"case_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"status" varchar(24) NOT NULL,
	"result" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "evidence_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"case_id" uuid NOT NULL,
	"source" varchar(80) NOT NULL,
	"label" text NOT NULL,
	"state" varchar(16) NOT NULL,
	"provenance" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "handoffs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"case_id" uuid NOT NULL,
	"owner" "owner_type" NOT NULL,
	"payload" jsonb NOT NULL,
	"consented_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "proposed_changes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"case_id" uuid NOT NULL,
	"diagnosis_id" uuid NOT NULL,
	"before_state" jsonb NOT NULL,
	"after_state" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "record_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"case_id" uuid NOT NULL,
	"source" varchar(80) NOT NULL,
	"captured_at" timestamp with time zone NOT NULL,
	"payload" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rejection_contracts" (
	"code" varchar(80) PRIMARY KEY NOT NULL,
	"category" varchar(40) NOT NULL,
	"journey_type" "journey_type" NOT NULL,
	"member_facing_reason" text NOT NULL,
	"contract_json" jsonb NOT NULL,
	"support_status" "support_status" NOT NULL,
	"verification_status" varchar(24) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rescue_cases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"claim_id" uuid NOT NULL,
	"rejection_id" uuid NOT NULL,
	"status" "case_status" DEFAULT 'OPEN' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "resolution_actions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"case_id" uuid NOT NULL,
	"action_type" varchar(40) NOT NULL,
	"status" varchar(24) NOT NULL,
	"idempotency_key" varchar(120) NOT NULL,
	"payload" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "resolution_actions_idempotency_key_unique" UNIQUE("idempotency_key")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "simulations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"proposed_change_id" uuid NOT NULL,
	"blocker_delta" jsonb NOT NULL,
	"safe" boolean NOT NULL,
	"disclaimer" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "timeline_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"case_id" uuid NOT NULL,
	"occurred_on" date NOT NULL,
	"label" text NOT NULL,
	"source" varchar(80) NOT NULL,
	"payload" jsonb NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "blockers" ADD CONSTRAINT "blockers_diagnosis_id_diagnosis_runs_id_fk" FOREIGN KEY ("diagnosis_id") REFERENCES "public"."diagnosis_runs"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "case_artifacts" ADD CONSTRAINT "case_artifacts_case_id_rescue_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."rescue_cases"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "case_status_events" ADD CONSTRAINT "case_status_events_case_id_rescue_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."rescue_cases"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "claim_rejections" ADD CONSTRAINT "claim_rejections_claim_id_claims_id_fk" FOREIGN KEY ("claim_id") REFERENCES "public"."claims"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "diagnosis_runs" ADD CONSTRAINT "diagnosis_runs_case_id_rescue_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."rescue_cases"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "evidence_items" ADD CONSTRAINT "evidence_items_case_id_rescue_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."rescue_cases"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "handoffs" ADD CONSTRAINT "handoffs_case_id_rescue_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."rescue_cases"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "proposed_changes" ADD CONSTRAINT "proposed_changes_case_id_rescue_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."rescue_cases"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "proposed_changes" ADD CONSTRAINT "proposed_changes_diagnosis_id_diagnosis_runs_id_fk" FOREIGN KEY ("diagnosis_id") REFERENCES "public"."diagnosis_runs"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "record_snapshots" ADD CONSTRAINT "record_snapshots_case_id_rescue_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."rescue_cases"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rescue_cases" ADD CONSTRAINT "rescue_cases_claim_id_claims_id_fk" FOREIGN KEY ("claim_id") REFERENCES "public"."claims"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rescue_cases" ADD CONSTRAINT "rescue_cases_rejection_id_claim_rejections_id_fk" FOREIGN KEY ("rejection_id") REFERENCES "public"."claim_rejections"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "resolution_actions" ADD CONSTRAINT "resolution_actions_case_id_rescue_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."rescue_cases"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "simulations" ADD CONSTRAINT "simulations_proposed_change_id_proposed_changes_id_fk" FOREIGN KEY ("proposed_change_id") REFERENCES "public"."proposed_changes"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "timeline_events" ADD CONSTRAINT "timeline_events_case_id_rescue_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."rescue_cases"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "diagnosis_runs_case_version_idx" ON "diagnosis_runs" USING btree ("case_id","version");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "rescue_cases_claim_rejection_idx" ON "rescue_cases" USING btree ("claim_id","rejection_id");