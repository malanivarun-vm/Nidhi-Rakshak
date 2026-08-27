import { ResolutionExperience } from "../../../src/features/resolution-recovery/ResolutionExperience";

export default async function ResolutionPage({
  params,
}: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;
  return <ResolutionExperience caseId={caseId} />;
}
