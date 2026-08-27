import {
  boolean,
  date,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const journeyTypeEnum = pgEnum("journey_type", [
  "MISMATCH",
  "MISSING_DATA",
  "VALIDATION_FAILURE",
  "SERVICE_HISTORY",
  "ELIGIBILITY",
  "RECORD_CONSOLIDATION",
  "PENDING_PROCESS",
  "UNSUPPORTED",
]);
export const verdictEnum = pgEnum("verdict", [
  "FIX",
  "FIGHT",
  "FORWARD",
  "NONE",
]);
export const ownerTypeEnum = pgEnum("owner_type", [
  "MEMBER",
  "EMPLOYER",
  "EPFO",
  "BANK",
  "NONE",
]);
export const caseStatusEnum = pgEnum("case_status", [
  "OPEN",
  "DIAGNOSING",
  "DIAGNOSED",
  "IN_RESOLUTION",
  "WAITING",
  "RESOLVED",
  "REFUSED",
]);
export const supportStatusEnum = pgEnum("support_status", [
  "GOLDEN",
  "SUPPORTED",
  "DECLARED_UNSUPPORTED",
]);

export const claims = pgTable("claims", {
  id: uuid("id").defaultRandom().primaryKey(),
  memberRef: varchar("member_ref", { length: 80 }).notNull(),
  pfAccountRef: varchar("pf_account_ref", { length: 80 }).notNull(),
  externalRef: varchar("external_ref", { length: 80 }).notNull().unique(),
  claimType: varchar("claim_type", { length: 40 }).notNull(),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
export const claimRejections = pgTable("claim_rejections", {
  id: uuid("id").defaultRandom().primaryKey(),
  claimId: uuid("claim_id")
    .notNull()
    .references(() => claims.id, { onDelete: "cascade" }),
  rawText: text("raw_text").notNull(),
  code: varchar("code", { length: 80 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
export const rescueCases = pgTable(
  "rescue_cases",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    claimId: uuid("claim_id")
      .notNull()
      .references(() => claims.id, { onDelete: "restrict" }),
    rejectionId: uuid("rejection_id")
      .notNull()
      .references(() => claimRejections.id, { onDelete: "restrict" }),
    status: caseStatusEnum("status").default("OPEN").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("rescue_cases_claim_rejection_idx").on(
      table.claimId,
      table.rejectionId,
    ),
  ],
);
export const rejectionContracts = pgTable("rejection_contracts", {
  code: varchar("code", { length: 80 }).primaryKey(),
  category: varchar("category", { length: 40 }).notNull(),
  journeyType: journeyTypeEnum("journey_type").notNull(),
  memberFacingReason: text("member_facing_reason").notNull(),
  contractJson: jsonb("contract_json").notNull(),
  supportStatus: supportStatusEnum("support_status").notNull(),
  verificationStatus: varchar("verification_status", { length: 24 }).notNull(),
});
export const recordSnapshots = pgTable("record_snapshots", {
  id: uuid("id").defaultRandom().primaryKey(),
  caseId: uuid("case_id")
    .notNull()
    .references(() => rescueCases.id, { onDelete: "cascade" }),
  source: varchar("source", { length: 80 }).notNull(),
  capturedAt: timestamp("captured_at", { withTimezone: true }).notNull(),
  payload: jsonb("payload").notNull(),
});
export const evidenceItems = pgTable("evidence_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  caseId: uuid("case_id")
    .notNull()
    .references(() => rescueCases.id, { onDelete: "cascade" }),
  source: varchar("source", { length: 80 }).notNull(),
  label: text("label").notNull(),
  state: varchar("state", { length: 16 }).notNull(),
  provenance: jsonb("provenance").notNull(),
});
export const diagnosisRuns = pgTable(
  "diagnosis_runs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    caseId: uuid("case_id")
      .notNull()
      .references(() => rescueCases.id, { onDelete: "restrict" }),
    idempotencyKey: varchar("idempotency_key", { length: 200 }).notNull(),
    version: integer("version").notNull(),
    status: varchar("status", { length: 24 }).notNull(),
    result: jsonb("result").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("diagnosis_runs_case_version_idx").on(
      table.caseId,
      table.version,
    ),
    uniqueIndex("diagnosis_runs_case_idempotency_key_idx").on(
      table.caseId,
      table.idempotencyKey,
    ),
  ],
);
export const blockers = pgTable("blockers", {
  id: uuid("id").defaultRandom().primaryKey(),
  diagnosisId: uuid("diagnosis_id")
    .notNull()
    .references(() => diagnosisRuns.id, { onDelete: "restrict" }),
  type: varchar("type", { length: 40 }).notNull(),
  field: varchar("field", { length: 80 }),
  reason: text("reason").notNull(),
  owner: ownerTypeEnum("owner").notNull(),
});
export const timelineEvents = pgTable("timeline_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  caseId: uuid("case_id")
    .notNull()
    .references(() => rescueCases.id, { onDelete: "cascade" }),
  occurredOn: date("occurred_on").notNull(),
  label: text("label").notNull(),
  source: varchar("source", { length: 80 }).notNull(),
  payload: jsonb("payload").notNull(),
});

// Resolution-owned tables start after the shared diagnosis foundation.
export const proposedChanges = pgTable("proposed_changes", {
  id: uuid("id").defaultRandom().primaryKey(),
  caseId: uuid("case_id")
    .notNull()
    .references(() => rescueCases.id, { onDelete: "restrict" }),
  diagnosisId: uuid("diagnosis_id")
    .notNull()
    .references(() => diagnosisRuns.id, { onDelete: "restrict" }),
  beforeState: jsonb("before_state").notNull(),
  afterState: jsonb("after_state").notNull(),
  idempotencyKey: varchar("idempotency_key", { length: 120 }).unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
export const simulations = pgTable("simulations", {
  id: uuid("id").defaultRandom().primaryKey(),
  proposedChangeId: uuid("proposed_change_id")
    .notNull()
    .references(() => proposedChanges.id, { onDelete: "cascade" }),
  blockerDelta: jsonb("blocker_delta").notNull(),
  safe: boolean("safe").notNull(),
  disclaimer: text("disclaimer").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
export const resolutionActions = pgTable("resolution_actions", {
  id: uuid("id").defaultRandom().primaryKey(),
  caseId: uuid("case_id")
    .notNull()
    .references(() => rescueCases.id, { onDelete: "restrict" }),
  actionType: varchar("action_type", { length: 40 }).notNull(),
  status: varchar("status", { length: 24 }).notNull(),
  idempotencyKey: varchar("idempotency_key", { length: 120 })
    .notNull()
    .unique(),
  payload: jsonb("payload").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
export const handoffs = pgTable("handoffs", {
  id: uuid("id").defaultRandom().primaryKey(),
  caseId: uuid("case_id")
    .notNull()
    .references(() => rescueCases.id, { onDelete: "restrict" }),
  owner: ownerTypeEnum("owner").notNull(),
  payload: jsonb("payload").notNull(),
  consentedAt: timestamp("consented_at", { withTimezone: true }),
  idempotencyKey: varchar("idempotency_key", { length: 120 }).unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
export const caseArtifacts = pgTable("case_artifacts", {
  id: uuid("id").defaultRandom().primaryKey(),
  caseId: uuid("case_id")
    .notNull()
    .references(() => rescueCases.id, { onDelete: "restrict" }),
  kind: varchar("kind", { length: 24 }).notNull(),
  payload: jsonb("payload").notNull(),
  idempotencyKey: varchar("idempotency_key", { length: 120 }).unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
export const caseStatusEvents = pgTable("case_status_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  caseId: uuid("case_id")
    .notNull()
    .references(() => rescueCases.id, { onDelete: "cascade" }),
  fromStatus: caseStatusEnum("from_status"),
  toStatus: caseStatusEnum("to_status").notNull(),
  reason: text("reason").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
