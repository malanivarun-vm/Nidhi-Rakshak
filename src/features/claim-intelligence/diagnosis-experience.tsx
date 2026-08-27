"use client";

import { ArrowRight, Camera, RefreshCw } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  DiagnosisResult,
  type DiagnosisResult as DiagnosisResultType,
  ErrorEnvelope,
} from "../../domain/contracts";
import { GOLDEN_FIXTURES } from "../../domain/golden-fixtures";
import {
  Alert,
  Card,
  Context,
  Cta,
  Header,
  Ownership,
  RecordDiff,
  Timeline,
} from "../shared/components";
import s from "../shared/nidhi.module.css";
import { selectCorrectionRoute } from "./correction-route";

type Screen = "LIST" | "ENTRY" | "LOADING" | "DATA" | "EVIDENCE" | "ERROR";
type FamilyKey =
  | "service"
  | "eligibility"
  | "consolidation"
  | "pending"
  | "preflight";
const familyCases: Record<FamilyKey, { title: string; reason: string }> = {
  service: {
    title: "Employment dates overlap",
    reason: "Two service records overlap by one month.",
  },
  eligibility: {
    title: "Claim amount is over the limit",
    reason:
      "Your details are okay, but this claim amount is above the rule limit.",
  },
  consolidation: {
    title: "Two PF records need linking",
    reason: "An older member ID is not connected to your current record.",
  },
  pending: {
    title: "Transfer is already in progress",
    reason: "EPFO is processing this transfer already.",
  },
  preflight: {
    title: "Check my claim before filing",
    reason: "Run supported checks before you submit.",
  },
};
const caseRows = Object.values(GOLDEN_FIXTURES).map((fixture) => ({
  id: fixture.caseId,
  title:
    fixture.journeyType === "MISMATCH"
      ? "Name differs across records"
      : fixture.journeyType === "MISSING_DATA"
        ? "Last working day is missing"
        : fixture.journeyType === "VALIDATION_FAILURE"
          ? "Bank detail needs correction"
          : "Rejection needs more evidence",
  reason: fixture.problemSummary,
}));

async function fetchDiagnosis(caseId: string) {
  const response = await fetch(
    `/api/rescue-cases/${encodeURIComponent(caseId)}/diagnosis`,
    { cache: "no-store" },
  );
  const body: unknown = await response.json();
  if (response.ok)
    return DiagnosisResult.parse((body as { data: unknown }).data);
  if (response.status === 404) return undefined;
  const error = ErrorEnvelope.safeParse(body);
  throw new Error(
    error.success
      ? error.data.error.message
      : "We couldn’t load the claim details.",
  );
}

function EvidenceRequest({
  onBack,
  onDone,
}: { onBack: () => void; onDone: () => void }) {
  return (
    <div className={s.screen}>
      <Header onBack={onBack} />
      <Context value="One more record needed" />
      <div className={s.body}>
        <p className={s.eyebrow}>Evidence request</p>
        <h1 className={s.h1}>We need one more record to be sure.</h1>
        <p className={s.sub}>
          Show the rejection message or document section that names the missing
          detail. We only use it to check this claim.
        </p>
        <Card title="What to capture">
          <ol className={s.steps}>
            <li>Keep the claim number visible.</li>
            <li>Make the rejection text sharp and fully in frame.</li>
            <li>Cover unrelated personal details.</li>
          </ol>
        </Card>
        <div className={s.capture} aria-label="Document capture frame" />
        <Cta
          label="Take a photo"
          icon={<Camera size={18} />}
          onClick={onDone}
        />
        <button className={s.secondary} onClick={onDone} type="button">
          Upload document instead
        </button>
      </div>
    </div>
  );
}

function FamilyScreen({
  kind,
  onBack,
}: { kind: FamilyKey; onBack: () => void }) {
  const data = familyCases[kind];
  const [message, setMessage] = useState("");
  if (kind === "preflight")
    return (
      <div className={s.screen}>
        <Header onBack={onBack} />
        <Context label="Before filing" value="Claim compiler" />
        <div className={s.body}>
          <p className={s.eyebrow}>Pre-flight check</p>
          <h1 className={s.h1}>{data.title}.</h1>
          <p className={s.sub}>
            We’ll check the supported blockers we can see. A clear result never
            promises approval.
          </p>
          <Cta
            label="Run claim check"
            onClick={() =>
              setMessage(
                "This pre-flight result is simulated for the prototype.",
              )
            }
          />
          {message && (
            <Alert tone="info" title="Check complete.">
              {message}
            </Alert>
          )}
          <Card title="What this checks">
            <p className={s.sub}>
              Identity records, bank details, service history and known
              eligibility rules.
            </p>
          </Card>
        </div>
      </div>
    );
  return (
    <div className={s.screen}>
      <Header onBack={onBack} />
      <Context value="Representative journey" />
      <div className={s.body}>
        <p className={s.eyebrow}>
          {kind === "eligibility"
            ? "Rule explanation"
            : kind === "pending"
              ? "Current process"
              : kind === "consolidation"
                ? "Record map"
                : "Service history"}
        </p>
        <h1 className={s.h1}>
          {kind === "eligibility" ? "Your details are okay." : data.title}
        </h1>
        <p className={s.sub}>{data.reason}</p>
        {kind === "service" && (
          <Card title="Service timeline">
            <Timeline
              items={[
                "ABC Industries · Jan 2018 → Jun 2020",
                "XYZ Ltd · May 2020 → Present",
                "These dates overlap by one month.",
              ]}
            />
          </Card>
        )}
        {kind === "eligibility" && (
          <Alert
            tone="info"
            title="This is a rule limit, not a record problem."
          >
            Try a lower claim amount that fits this purpose.
          </Alert>
        )}
        {kind === "consolidation" && (
          <Card title="Records linked to you">
            <Timeline
              items={[
                "Current PF record · active",
                "Older member ID · needs linking",
              ]}
            />
          </Card>
        )}
        {kind === "pending" && (
          <Alert tone="good" title="Doing nothing is the right move.">
            EPFO is already processing this transfer. Do not submit another
            request.
          </Alert>
        )}
        <Card title="Who acts next">
          <p className={s.sub}>
            {kind === "pending"
              ? "EPFO"
              : kind === "eligibility"
                ? "You can change the claim amount."
                : "Your previous employer needs to review this."}
          </p>
        </Card>
        {message && (
          <Alert tone="info" title="Action recorded.">
            {message}
          </Alert>
        )}
        <Cta
          label={
            kind === "eligibility"
              ? "Change claim amount"
              : kind === "pending"
                ? "Check transfer status"
                : kind === "consolidation"
                  ? "Bring my old PF record in"
                  : "Request a correction"
          }
          onClick={() =>
            setMessage(
              "This representative action is simulated. Keep the case summary with you.",
            )
          }
        />
      </div>
    </div>
  );
}

export function DiagnosisExperience() {
  const router = useRouter();
  const params = useSearchParams();
  const queryCase = params.get("case");
  const [screen, setScreen] = useState<Screen>(queryCase ? "ENTRY" : "LIST");
  const [caseId, setCaseId] = useState(queryCase ?? "");
  const [diagnosis, setDiagnosis] = useState<DiagnosisResultType>();
  const [error, setError] = useState("");
  const [family, setFamily] = useState<FamilyKey>();
  const load = useCallback(async () => {
    setScreen("LOADING");
    setError("");
    try {
      const result = await fetchDiagnosis(caseId);
      if (!result) throw new Error("We couldn’t find this claim.");
      setDiagnosis(result);
      localStorage.setItem("nidhi-rakshak:last-diagnosis-case", caseId);
      setScreen(result.status === "UNSUPPORTED" ? "EVIDENCE" : "DATA");
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "We couldn’t load the claim details.",
      );
      setScreen("ERROR");
    }
  }, [caseId]);
  useEffect(() => {
    if (queryCase) void load();
  }, [queryCase, load]);
  if (family)
    return <FamilyScreen kind={family} onBack={() => setFamily(undefined)} />;
  if (screen === "LIST")
    return (
      <div className={s.screen}>
        <Header />
        <div className={s.shell}>
          <div className={s.body}>
            <p className={s.eyebrow}>Your rejected claims</p>
            <h1 className={s.h1}>Let’s understand what happened.</h1>
            <p className={s.sub}>
              Pick a claim. We’ll use the details already attached to it.
            </p>
            {caseRows.map((row) => (
              <button
                className={s.case}
                key={row.id}
                onClick={() => {
                  setCaseId(row.id);
                  setScreen("ENTRY");
                }}
                type="button"
              >
                <span className={s.caseText}>
                  <span className={s.caseTitle}>{row.title}</span>
                  <span className={s.caseMeta}>{row.reason}</span>
                </span>
                <span className={s.chip}>Rejected</span>
                <ArrowRight size={18} />
              </button>
            ))}
            <Card title="More checks">
              <button
                className={s.secondary}
                onClick={() => setFamily("service")}
                type="button"
              >
                Service history
              </button>
              <button
                className={s.secondary}
                onClick={() => setFamily("eligibility")}
                type="button"
              >
                Eligibility rules
              </button>
              <button
                className={s.secondary}
                onClick={() => setFamily("consolidation")}
                type="button"
              >
                Link old PF record
              </button>
              <button
                className={s.secondary}
                onClick={() => setFamily("pending")}
                type="button"
              >
                Check an existing process
              </button>
              <button
                className={s.secondary}
                onClick={() => setFamily("preflight")}
                type="button"
              >
                Check my claim before filing
              </button>
            </Card>
          </div>
        </div>
      </div>
    );
  if (screen === "ENTRY")
    return (
      <div className={s.screen}>
        <Header onBack={() => setScreen("LIST")} />
        <Context value="Claim details supplied by EPFO" />
        <div className={s.body}>
          <p className={s.eyebrow}>Claim rejected</p>
          <h1 className={s.h1}>
            Understand this rejection before you change anything.
          </h1>
          <p className={s.sub}>
            We’ll check the records already attached to this claim and show the
            safest next step.
          </p>
          <Cta label="Understand this rejection" onClick={() => void load()} />
          <Alert tone="info" title="You do not need to re-enter claim details.">
            We only ask for another document when it can change the answer.
          </Alert>
        </div>
      </div>
    );
  if (screen === "LOADING")
    return (
      <div className={s.screen}>
        <Header />
        <div className={s.body}>
          <p className={s.eyebrow}>Checking your claim</p>
          <h1 className={s.h1}>
            Comparing the records relevant to this rejection…
          </h1>
          <p className={s.sub}>This usually takes a moment.</p>
        </div>
      </div>
    );
  if (screen === "ERROR")
    return (
      <div className={s.screen}>
        <Header onBack={() => setScreen("LIST")} />
        <div className={s.body}>
          <p className={s.eyebrow}>We couldn’t load the claim</p>
          <h1 className={s.h1}>Your case has not changed.</h1>
          <p className={s.sub}>{error}</p>
          <Cta
            label="Try again"
            icon={<RefreshCw size={18} />}
            onClick={() => void load()}
          />
        </div>
      </div>
    );
  if (screen === "EVIDENCE" || !diagnosis)
    return (
      <EvidenceRequest
        onBack={() => setScreen("LIST")}
        onDone={() => setScreen("LIST")}
      />
    );
  const refusal = diagnosis.status === "UNSUPPORTED";
  const correctionRoute = selectCorrectionRoute({
    aadhaarValidated: diagnosis.verdict === "FIX" ? true : undefined,
    uanIssuedBefore2017: diagnosis.verdict === "FIX" ? false : undefined,
    fieldLevel: diagnosis.verdict === "FIX" ? "UAN_PROFILE" : undefined,
    priorEstablishmentStatus: undefined,
  });
  return (
    <div className={s.screen}>
      <Header onBack={() => setScreen("LIST")} />
      <Context value={`Case ${diagnosis.caseId.replace("case-golden-", "")}`} />
      <div className={s.body}>
        <p className={s.eyebrow}>What we found</p>
        <h1 className={s.h1}>
          {diagnosis.doNotTouch.applies
            ? "Your current name is correct. Don’t change it."
            : diagnosis.owner === "EMPLOYER"
              ? "Your previous employer needs to fix this."
              : "One bank detail needs to be corrected."}
        </h1>
        <p className={s.sub}>{diagnosis.problemSummary}</p>
        {diagnosis.caseId.includes("fight") && (
          <Card title="The records do not all agree">
            <RecordDiff diagnosis={diagnosis} />
          </Card>
        )}
        {diagnosis.doNotTouch.applies && (
          <Alert tone="danger" title="Don’t change your current details.">
            {diagnosis.doNotTouch.reason}
          </Alert>
        )}
        {diagnosis.firstDivergence && (
          <Card title="Where the mismatch starts">
            <p className={s.sub}>
              The first different value appears in{" "}
              {diagnosis.firstDivergence.label}. We cannot see who entered it
              from these records.
            </p>
            <Timeline
              items={[
                "Current identity records · RAMESH BADIGER",
                "2019 PF record · RAJESH BADIGER",
              ]}
            />
          </Card>
        )}
        {diagnosis.owner === "EMPLOYER" && (
          <Card title="Service timeline">
            <Timeline
              items={[
                "Previous employer · last contribution recorded",
                "Last working day · missing",
              ]}
            />
          </Card>
        )}
        {refusal ? (
          <>
            <Alert tone="info" title="We won’t guess.">
              The information available is not enough to tell you what should be
              changed.
            </Alert>
            <Cta
              label="Get help through EPFO"
              onClick={() => setScreen("LIST")}
            />
          </>
        ) : (
          <>
            <Cta
              label={
                diagnosis.verdict === "FIGHT"
                  ? "Resolve this with EPFO"
                  : diagnosis.verdict === "FORWARD"
                    ? "Send this to my employer"
                    : "Review the safe correction"
              }
              onClick={() => router.push(`/resolution/${diagnosis.caseId}`)}
            />
            <Ownership diagnosis={diagnosis} />
            {diagnosis.verdict === "FIX" && (
              <Card title="Your correction route">
                <h2>{correctionRoute.headline}</h2>
                <p className={s.sub}>
                  {correctionRoute.reason} Update this bank detail under Manage
                  → KYC, then let the bank and NPCI validate it. No employer
                  approval or passbook upload is needed.
                </p>
                <details className={s.disclosure}>
                  <summary>Why this route?</summary>
                  {correctionRoute.notApplicable.map((item) => (
                    <p className={s.sub} key={item.label}>
                      {item.label}: {item.why}
                    </p>
                  ))}
                </details>
              </Card>
            )}
            {diagnosis.verdict === "FORWARD" && (
              <Card title="Why your employer acts next">
                <p className={s.sub}>
                  Your previous employer owns the missing service detail. The
                  current employer cannot edit another establishment’s record.
                </p>
              </Card>
            )}
          </>
        )}
        <details className={s.disclosure}>
          <summary>EPFO’s message</summary>
          <p className={s.sub}>
            {diagnosis.rejectionCode.replaceAll("_", " ")}
          </p>
        </details>
        <details className={s.disclosure}>
          <summary>See the records we used</summary>
          {diagnosis.evidence.map((item) => (
            <p className={s.sub} key={item.evidenceId}>
              {item.label} ·{" "}
              {item.state === "VERIFIED"
                ? "Verified in the source record."
                : "Needs confirmation."}
            </p>
          ))}
        </details>
      </div>
    </div>
  );
}
