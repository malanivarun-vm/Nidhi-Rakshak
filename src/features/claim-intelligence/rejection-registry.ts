import { z } from "zod";
import { JourneyType, OwnerType, SupportStatus } from "../../domain/contracts";

const ContractSupportStatus = SupportStatus;
const VerificationStatus = z.enum(["VERIFIED", "UNVERIFIED", "BLOCKING"]);

export const EvidenceRequirement = z.object({
  source: z.string().min(1),
  label: z.string().min(1),
});
export type EvidenceRequirement = z.infer<typeof EvidenceRequirement>;

export const RejectionContract = z.object({
  code: z.string().min(1),
  category: z.string().min(1),
  epfoTextPatterns: z.array(z.string().min(1)),
  memberFacingReason: z.string().min(1),
  recordsToCompare: z.array(z.string().min(1)),
  moolSignal: z.string().min(1),
  verdictCondition: z.string().min(1),
  defaultOwner: OwnerType,
  routeEligibility: z.array(z.string().min(1)),
  memberAction: z.string().min(1),
  counterpartyAction: z.string().min(1),
  evidenceRequired: z.array(EvidenceRequirement),
  falsifier: z.string().min(1),
  prototypeSupport: ContractSupportStatus,
  verificationStatus: VerificationStatus,
  journeyType: JourneyType,
  uiModules: z.array(z.string().min(1)).min(1),
});
export type RejectionContract = z.infer<typeof RejectionContract>;

type ContractDefinition = {
  code: string;
  category: string;
  journeyType: RejectionContract["journeyType"];
  prototypeSupport: RejectionContract["prototypeSupport"];
  defaultOwner: RejectionContract["defaultOwner"];
  memberFacingReason: string;
};

const evidenceByCode: Readonly<Record<string, EvidenceRequirement[]>> = {
  RELATION_NAME_MISMATCH: [
    {
      source: "current_identity_records",
      label: "Current identity records",
    },
    { source: "member_id_2019", label: "2019 member-ID record" },
  ],
  EXIT_DATE_MISSING: [{ source: "service_history", label: "Service history" }],
  BANK_DETAILS_INVALID: [
    { source: "claim_context", label: "Claim bank value" },
    { source: "member_confirmation", label: "Confirmed account value" },
  ],
};

const definitions: readonly ContractDefinition[] = [
  {
    code: "KYC_NAME_MISMATCH",
    category: "IDENTITY_PROFILE",
    journeyType: "MISMATCH",
    prototypeSupport: "GOLDEN",
    defaultOwner: "NONE",
    memberFacingReason:
      "Your name differs across the records used for this claim.",
  },
  {
    code: "KYC_DOB_MISMATCH",
    category: "IDENTITY_PROFILE",
    journeyType: "MISMATCH",
    prototypeSupport: "SUPPORTED",
    defaultOwner: "MEMBER",
    memberFacingReason: "Your date of birth differs from your Aadhaar record.",
  },
  {
    code: "KYC_GENDER_MISMATCH",
    category: "IDENTITY_PROFILE",
    journeyType: "MISMATCH",
    prototypeSupport: "SUPPORTED",
    defaultOwner: "MEMBER",
    memberFacingReason: "Your gender details do not match the identity record.",
  },
  {
    code: "RELATION_NAME_MISMATCH",
    category: "IDENTITY_PROFILE",
    journeyType: "MISMATCH",
    prototypeSupport: "GOLDEN",
    defaultOwner: "NONE",
    memberFacingReason:
      "A family-name detail differs between an older PF record and identity records.",
  },
  {
    code: "AADHAAR_NOT_SEEDED",
    category: "IDENTITY_PROFILE",
    journeyType: "MISSING_DATA",
    prototypeSupport: "SUPPORTED",
    defaultOwner: "MEMBER",
    memberFacingReason: "Your UAN is not linked or validated against Aadhaar.",
  },
  {
    code: "KYC_PENDING_APPROVAL",
    category: "IDENTITY_PROFILE",
    journeyType: "PENDING_PROCESS",
    prototypeSupport: "SUPPORTED",
    defaultOwner: "EMPLOYER",
    memberFacingReason:
      "A profile change is still waiting for employer action.",
  },
  {
    code: "MULTIPLE_UANS",
    category: "IDENTITY_PROFILE",
    journeyType: "RECORD_CONSOLIDATION",
    prototypeSupport: "DECLARED_UNSUPPORTED",
    defaultOwner: "NONE",
    memberFacingReason: "More than one UAN appears to belong to you.",
  },
  {
    code: "UAN_NOT_ACTIVATED",
    category: "IDENTITY_PROFILE",
    journeyType: "MISSING_DATA",
    prototypeSupport: "SUPPORTED",
    defaultOwner: "MEMBER",
    memberFacingReason: "Your UAN has not been activated.",
  },
  {
    code: "MOBILE_NOT_LINKED_AADHAAR",
    category: "IDENTITY_PROFILE",
    journeyType: "MISSING_DATA",
    prototypeSupport: "SUPPORTED",
    defaultOwner: "MEMBER",
    memberFacingReason:
      "An Aadhaar-linked mobile number is needed for the required OTP.",
  },
  {
    code: "SIGNATURE_MISMATCH",
    category: "IDENTITY_PROFILE",
    journeyType: "VALIDATION_FAILURE",
    prototypeSupport: "DECLARED_UNSUPPORTED",
    defaultOwner: "MEMBER",
    memberFacingReason: "The signature on the claim does not match the record.",
  },
  {
    code: "BANK_DETAILS_INVALID",
    category: "BANKING",
    journeyType: "VALIDATION_FAILURE",
    prototypeSupport: "GOLDEN",
    defaultOwner: "MEMBER",
    memberFacingReason: "One bank detail does not match the account evidence.",
  },
  {
    code: "BANK_VALIDATION_FAILED",
    category: "BANKING",
    journeyType: "VALIDATION_FAILURE",
    prototypeSupport: "GOLDEN",
    defaultOwner: "NONE",
    memberFacingReason:
      "The bank or NPCI validation did not accept the account details.",
  },
  {
    code: "BANK_IFSC_OBSOLETE",
    category: "BANKING",
    journeyType: "VALIDATION_FAILURE",
    prototypeSupport: "SUPPORTED",
    defaultOwner: "MEMBER",
    memberFacingReason: "The IFSC may no longer be current for this account.",
  },
  {
    code: "BANK_ACCOUNT_NON_SPOUSE_JOINT",
    category: "BANKING",
    journeyType: "VALIDATION_FAILURE",
    prototypeSupport: "SUPPORTED",
    defaultOwner: "MEMBER",
    memberFacingReason:
      "The account is joint with someone other than a spouse, or belongs to a third party.",
  },
  {
    code: "BANK_DEPOSIT_CAP",
    category: "BANKING",
    journeyType: "VALIDATION_FAILURE",
    prototypeSupport: "SUPPORTED",
    defaultOwner: "MEMBER",
    memberFacingReason:
      "The account's deposit cap may be lower than the claim amount.",
  },
  {
    code: "BANK_ACCOUNT_DORMANT",
    category: "BANKING",
    journeyType: "VALIDATION_FAILURE",
    prototypeSupport: "SUPPORTED",
    defaultOwner: "NONE",
    memberFacingReason: "The bank account appears to be inoperative.",
  },
  {
    code: "DOC_IMAGE_UNREADABLE",
    category: "BANKING",
    journeyType: "VALIDATION_FAILURE",
    prototypeSupport: "DECLARED_UNSUPPORTED",
    defaultOwner: "MEMBER",
    memberFacingReason: "A submitted document image cannot be read.",
  },
  {
    code: "EXIT_DATE_MISSING",
    category: "SERVICE_RECORD",
    journeyType: "MISSING_DATA",
    prototypeSupport: "GOLDEN",
    defaultOwner: "NONE",
    memberFacingReason: "A previous employer record has no exit date.",
  },
  {
    code: "EXIT_DATE_WRONG",
    category: "SERVICE_RECORD",
    journeyType: "SERVICE_HISTORY",
    prototypeSupport: "SUPPORTED",
    defaultOwner: "EMPLOYER",
    memberFacingReason: "A recorded exit date appears incorrect.",
  },
  {
    code: "DOJ_MISSING_OR_WRONG",
    category: "SERVICE_RECORD",
    journeyType: "SERVICE_HISTORY",
    prototypeSupport: "SUPPORTED",
    defaultOwner: "EMPLOYER",
    memberFacingReason: "A joining date is missing or inconsistent.",
  },
  {
    code: "SERVICE_OVERLAP",
    category: "SERVICE_RECORD",
    journeyType: "SERVICE_HISTORY",
    prototypeSupport: "SUPPORTED",
    defaultOwner: "EMPLOYER",
    memberFacingReason: "The service records overlap between employers.",
  },
  {
    code: "NCP_DAYS_MISMATCH",
    category: "SERVICE_RECORD",
    journeyType: "SERVICE_HISTORY",
    prototypeSupport: "DECLARED_UNSUPPORTED",
    defaultOwner: "EMPLOYER",
    memberFacingReason:
      "Non-contributory days do not agree with the wage record.",
  },
  {
    code: "CONTRIBUTION_NOT_REMITTED",
    category: "SERVICE_RECORD",
    journeyType: "SERVICE_HISTORY",
    prototypeSupport: "SUPPORTED",
    defaultOwner: "EMPLOYER",
    memberFacingReason: "A contribution appears deducted but not deposited.",
  },
  {
    code: "ANNEXURE_K_MISSING",
    category: "SERVICE_RECORD",
    journeyType: "SERVICE_HISTORY",
    prototypeSupport: "SUPPORTED",
    defaultOwner: "EPFO",
    memberFacingReason:
      "Service history and funds did not transfer between field offices.",
  },
  {
    code: "MEMBER_IDS_UNMERGED",
    category: "SERVICE_RECORD",
    journeyType: "RECORD_CONSOLIDATION",
    prototypeSupport: "SUPPORTED",
    defaultOwner: "MEMBER",
    memberFacingReason: "Past member IDs are still open for this withdrawal.",
  },
  {
    code: "TRANSFER_IN_PENDING",
    category: "SERVICE_RECORD",
    journeyType: "PENDING_PROCESS",
    prototypeSupport: "SUPPORTED",
    defaultOwner: "EPFO",
    memberFacingReason: "A transfer request has not completed.",
  },
  {
    code: "EXEMPTED_TRUST",
    category: "SERVICE_RECORD",
    journeyType: "SERVICE_HISTORY",
    prototypeSupport: "DECLARED_UNSUPPORTED",
    defaultOwner: "EMPLOYER",
    memberFacingReason:
      "The establishment's exempted trust, not EPFO, is the payer.",
  },
  {
    code: "EMPLOYER_DSC_INVALID",
    category: "SERVICE_RECORD",
    journeyType: "PENDING_PROCESS",
    prototypeSupport: "DECLARED_UNSUPPORTED",
    defaultOwner: "EMPLOYER",
    memberFacingReason:
      "The employer's digital signature is unavailable or expired.",
  },
  {
    code: "FORM_10C_AFTER_10Y",
    category: "POLICY_ELIGIBILITY",
    journeyType: "ELIGIBILITY",
    prototypeSupport: "SUPPORTED",
    defaultOwner: "MEMBER",
    memberFacingReason: "This form does not fit the recorded eligible service.",
  },
  {
    code: "SERVICE_LENGTH_SHORTFALL",
    category: "POLICY_ELIGIBILITY",
    journeyType: "ELIGIBILITY",
    prototypeSupport: "SUPPORTED",
    defaultOwner: "MEMBER",
    memberFacingReason: "The selected advance requires more eligible service.",
  },
  {
    code: "CLAIM_EXCEEDS_CAP",
    category: "POLICY_ELIGIBILITY",
    journeyType: "ELIGIBILITY",
    prototypeSupport: "SUPPORTED",
    defaultOwner: "MEMBER",
    memberFacingReason: "The requested amount exceeds the applicable cap.",
  },
  {
    code: "EPS_WAGE_DISCREPANCY",
    category: "POLICY_ELIGIBILITY",
    journeyType: "SERVICE_HISTORY",
    prototypeSupport: "DECLARED_UNSUPPORTED",
    defaultOwner: "EMPLOYER",
    memberFacingReason:
      "Pension contributions use wages above the statutory limit.",
  },
  {
    code: "WAITING_PERIOD_NOT_MET",
    category: "POLICY_ELIGIBILITY",
    journeyType: "ELIGIBILITY",
    prototypeSupport: "SUPPORTED",
    defaultOwner: "MEMBER",
    memberFacingReason:
      "The claim was filed before the required waiting period.",
  },
  {
    code: "ADVANCE_LIMIT_EXHAUSTED",
    category: "POLICY_ELIGIBILITY",
    journeyType: "ELIGIBILITY",
    prototypeSupport: "DECLARED_UNSUPPORTED",
    defaultOwner: "MEMBER",
    memberFacingReason:
      "The permitted advances for this purpose appear exhausted.",
  },
  {
    code: "PURPOSE_DOCUMENT_MISSING",
    category: "POLICY_ELIGIBILITY",
    journeyType: "MISSING_DATA",
    prototypeSupport: "SUPPORTED",
    defaultOwner: "MEMBER",
    memberFacingReason: "A document for the selected claim purpose is missing.",
  },
  {
    code: "DUPLICATE_OR_SETTLED",
    category: "POLICY_ELIGIBILITY",
    journeyType: "PENDING_PROCESS",
    prototypeSupport: "SUPPORTED",
    defaultOwner: "EPFO",
    memberFacingReason:
      "A claim for this period is already settled or in process.",
  },
  {
    code: "NOMINATION_MISSING",
    category: "BENEFICIARY_SUCCESSION",
    journeyType: "UNSUPPORTED",
    prototypeSupport: "DECLARED_UNSUPPORTED",
    defaultOwner: "NONE",
    memberFacingReason: "There is no e-nomination for this legal-heir claim.",
  },
  {
    code: "UNMAPPED_REJECTION",
    category: "UNSUPPORTED",
    journeyType: "UNSUPPORTED",
    prototypeSupport: "GOLDEN",
    defaultOwner: "NONE",
    memberFacingReason: "We cannot safely diagnose this rejection yet.",
  },
];

function createContract(definition: ContractDefinition): RejectionContract {
  const evidenceRequired = evidenceByCode[definition.code] ?? [];

  return RejectionContract.parse({
    ...definition,
    epfoTextPatterns: [definition.code, definition.code.replaceAll("_", " ")],
    recordsToCompare: evidenceRequired.map((requirement) => requirement.source),
    moolSignal: "Evaluate provenance only after the evidence gate passes.",
    verdictCondition: "Evaluate deterministically after record comparison.",
    routeEligibility: [],
    memberAction:
      "Do not enter this information again; continue with the existing claim context.",
    counterpartyAction: "Not evaluated during context loading.",
    evidenceRequired,
    falsifier: "New verified evidence may change this assessment.",
    verificationStatus: "UNVERIFIED",
    uiModules: [
      "DECODE",
      ...(evidenceRequired.length > 0 ? ["EVIDENCE_REQUEST"] : []),
    ],
  });
}

export const REJECTION_CONTRACTS = definitions.map(createContract);

const contractsByCode = new Map(
  REJECTION_CONTRACTS.map((contract) => [contract.code, contract] as const),
);

function normalize(value: string): string {
  return value.trim().toUpperCase().replaceAll(/\s+/g, " ");
}

function normalizePattern(value: string): string {
  return value
    .trim()
    .toUpperCase()
    .replaceAll(/[^A-Z0-9]+/g, " ")
    .replaceAll(/\s+/g, " ");
}

export function getRejectionContract(code: string): RejectionContract | null {
  return contractsByCode.get(normalize(code)) ?? null;
}

export function findRejectionContractByPattern(
  rawText: string,
): RejectionContract | null {
  const normalizedText = ` ${normalizePattern(rawText)} `;

  return (
    REJECTION_CONTRACTS.find((contract) =>
      contract.epfoTextPatterns.some((pattern) =>
        normalizedText.includes(` ${normalizePattern(pattern)} `),
      ),
    ) ?? null
  );
}
