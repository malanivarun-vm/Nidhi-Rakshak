export type CorrectionRouteKey =
  | "SELF"
  | "EMPLOYER_CERT"
  | "PREV_EMPLOYER"
  | "OFFLINE";

export interface CorrectionRouteFacts {
  aadhaarValidated: boolean | undefined;
  uanIssuedBefore2017: boolean | undefined;
  fieldLevel: "UAN_PROFILE" | "MEMBER_ID_RECORD" | undefined;
  priorEstablishmentStatus: "ACTIVE" | "CLOSED" | "UNRESPONSIVE" | undefined;
}

export interface CorrectionRouteResult {
  key: CorrectionRouteKey;
  headline: string;
  reason: string;
  steps: string[];
  time: string;
  notApplicable: Array<{ label: string; why: string }>;
}

export const selectCorrectionRoute = (
  facts: CorrectionRouteFacts,
): CorrectionRouteResult => {
  const notApplicable = (selected: CorrectionRouteKey) =>
    (Object.keys(routeCopy) as CorrectionRouteKey[])
      .filter((key) => key !== selected)
      .map((key) => ({
        label: routeCopy[key].label,
        why: routeCopy[key].notApplicable,
      }));

  let key: CorrectionRouteKey;
  if (
    facts.aadhaarValidated === true &&
    facts.uanIssuedBefore2017 === false &&
    facts.fieldLevel === "UAN_PROFILE"
  )
    key = "SELF";
  else if (facts.uanIssuedBefore2017 === true) key = "EMPLOYER_CERT";
  else if (
    facts.fieldLevel === "MEMBER_ID_RECORD" &&
    facts.priorEstablishmentStatus === "ACTIVE"
  )
    key = "PREV_EMPLOYER";
  else key = "OFFLINE";
  const copy = routeCopy[key];
  return {
    key,
    headline: copy.headline,
    reason: copy.reason,
    steps: copy.steps,
    time: copy.time,
    notApplicable: notApplicable(key),
  };
};

const routeCopy: Record<
  CorrectionRouteKey,
  {
    label: string;
    headline: string;
    reason: string;
    steps: string[];
    time: string;
    notApplicable: string;
  }
> = {
  SELF: {
    label: "Self-service",
    headline: "You can fix this yourself right now.",
    reason:
      "Your Aadhaar-validated UAN and profile-level value fit the self-service route.",
    steps: [
      "Open Manage → Modify Basic Details.",
      "Update the one field and self-approve it.",
      "Wait for the profile check to run again.",
    ],
    time: "a few minutes",
    notApplicable: "The account facts support self-service.",
  },
  EMPLOYER_CERT: {
    label: "Employer certification",
    headline: "An employer needs to certify this change.",
    reason:
      "This UAN was issued before 1 October 2017, so the older certification route applies.",
    steps: [
      "Ask an authorised employer representative to certify the correction.",
      "Keep the supporting identity record ready.",
      "Check the claim again after the update.",
    ],
    time: "a few days",
    notApplicable: "The older UAN rule requires certification.",
  },
  PREV_EMPLOYER: {
    label: "Previous employer",
    headline: "Your previous employer needs to file this correction.",
    reason:
      "The differing value sits in an active previous establishment’s member record.",
    steps: [
      "Share the correction request with that previous employer.",
      "Ask them to file the Joint Declaration.",
      "Check the record after they confirm it.",
    ],
    time: "weeks, if they answer",
    notApplicable: "The record owner is the previous establishment.",
  },
  OFFLINE: {
    label: "Offline attested route",
    headline: "Use the offline attested route.",
    reason:
      "We cannot safely confirm a self-service or employer route from the account facts available.",
    steps: [
      "Prepare the physical Joint Declaration on Annexure-II.",
      "Get it attested by a bank manager, gazetted officer, or magistrate.",
      "Submit it with the closure letter to the EPFO office.",
    ],
    time: "no fixed timeline",
    notApplicable: "Unknown facts default to the safe route.",
  },
};
