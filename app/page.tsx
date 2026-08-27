import { Suspense } from "react";
import { DiagnosisExperience } from "../src/features/claim-intelligence/diagnosis-experience";

export default function ClaimIntelligencePage() {
  return (
    <Suspense fallback={null}>
      <DiagnosisExperience />
    </Suspense>
  );
}
