import { describe, expect, it } from "vitest";
import {
  REJECTION_CONTRACTS,
  findRejectionContractByPattern,
  getRejectionContract,
} from "./rejection-registry";

describe("rejection contract registry", () => {
  it("contains the complete v2 taxonomy with the documented support boundary", () => {
    expect(REJECTION_CONTRACTS).toHaveLength(38);
    expect(
      REJECTION_CONTRACTS.filter(
        (contract) => contract.prototypeSupport === "GOLDEN",
      ),
    ).toHaveLength(6);
    expect(
      REJECTION_CONTRACTS.filter(
        (contract) => contract.prototypeSupport === "SUPPORTED",
      ),
    ).toHaveLength(23);
    expect(
      REJECTION_CONTRACTS.filter(
        (contract) => contract.prototypeSupport === "DECLARED_UNSUPPORTED",
      ),
    ).toHaveLength(9);
  });

  it("matches only declared code patterns", () => {
    expect(getRejectionContract("bank_details_invalid")?.code).toBe(
      "BANK_DETAILS_INVALID",
    );
    expect(
      findRejectionContractByPattern("Rejection: relation name mismatch"),
    ).toMatchObject({ code: "RELATION_NAME_MISMATCH" });
    expect(
      findRejectionContractByPattern("A free-form phrase with no code"),
    ).toBeNull();
  });
});
