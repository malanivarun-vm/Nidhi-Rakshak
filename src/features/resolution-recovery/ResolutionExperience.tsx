"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleAlert,
  Clock3,
  FileText,
  Landmark,
  RefreshCw,
  Send,
  ShieldCheck,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { DiagnosisResult } from "../../domain/contracts";
import styles from "./ResolutionExperience.module.css";

type View = "summary" | "simulation" | "consent" | "result" | "tracking";
interface ApiState {
  diagnosis?: DiagnosisResult;
  error?: string;
  loading: boolean;
}
interface Artifact {
  kind: string;
  payload: Record<string, unknown>;
}
interface Simulation {
  safety: "SAFE" | "UNSAFE" | "NOT_AVAILABLE";
  safetyResult: string;
  recommendation: string;
  blockerDelta: { before: number; after: number; change: number };
  proposedChange: { field: string; before: string; after: string };
  disclaimer: string;
}
interface Tracking {
  status: string;
  owner: string;
  nextStep: string;
  events: Array<{ toStatus: string; reason: string; createdAt: string }>;
  simulated: boolean;
  receipt?: Artifact;
  handoff?: Artifact;
  recheck?: { outcome: string };
}

const ownerLabel = (owner: DiagnosisResult["owner"]) =>
  ({
    MEMBER: "You",
    EMPLOYER: "Your previous employer",
    EPFO: "EPFO",
    BANK: "Your bank",
    NONE: "No one",
  })[owner];
const headline = (diagnosis: DiagnosisResult) =>
  diagnosis.status === "UNSUPPORTED"
    ? "We can’t safely diagnose this rejection yet."
    : diagnosis.verdict === "FIGHT"
      ? "Your current details are correct. Don’t change them."
      : diagnosis.verdict === "FORWARD"
        ? `${ownerLabel(diagnosis.owner)} needs to fix this.`
        : diagnosis.verdict === "FIX"
          ? "One detail needs to be corrected."
          : "You don’t need to do anything right now.";
const actionLabel = (diagnosis: DiagnosisResult) =>
  diagnosis.status === "UNSUPPORTED" || diagnosis.verdict === undefined
    ? "Get help through EPFO"
    : diagnosis.verdict === "FIGHT"
      ? "Resolve this with EPFO"
      : diagnosis.verdict === "FORWARD"
        ? "Send this to my employer"
        : diagnosis.verdict === "FIX"
          ? "See the safe correction"
          : "Check again later";

const journeyStorageKey = (caseId: string) =>
  `nidhi-rakshak:resolution:${caseId}`;

interface SavedJourney {
  artifact?: Artifact;
  outcome?: string;
  tracking?: Tracking;
}

const loadDiagnosis = async (caseId: string) => {
  const response = await fetch(`/api/rescue-cases/${caseId}/resolution`);
  if (!response.ok) throw new Error("We couldn’t load the claim details.");
  const body = (await response.json()) as {
    data?: { diagnosis?: DiagnosisResult };
  };
  return body.data?.diagnosis;
};

export const ResolutionExperience = ({ caseId }: { caseId: string }) => {
  const [state, setState] = useState<ApiState>({ loading: true });
  const [view, setView] = useState<View>("summary");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [artifact, setArtifact] = useState<Artifact>();
  const [simulation, setSimulation] = useState<Simulation>();
  const [recheckOutcome, setRecheckOutcome] = useState<string>();
  const [tracking, setTracking] = useState<Tracking>();

  const load = useCallback(() => {
    setState({ loading: true });
    loadDiagnosis(caseId)
      .then((diagnosis) => setState({ loading: false, diagnosis }))
      .catch((error: Error) =>
        setState({ loading: false, error: error.message }),
      );
  }, [caseId]);
  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    if (state.loading || state.error || !state.diagnosis) return;
    const saved = window.localStorage.getItem(journeyStorageKey(caseId));
    if (saved) {
      try {
        const journey = JSON.parse(saved) as SavedJourney;
        if (journey.artifact) setArtifact(journey.artifact);
        if (journey.outcome) setRecheckOutcome(journey.outcome);
        if (journey.tracking) setTracking(journey.tracking);
        if (journey.artifact || journey.outcome || journey.tracking)
          setView("result");
      } catch {
        window.localStorage.removeItem(journeyStorageKey(caseId));
      }
    }
    fetch(`/api/rescue-cases/${caseId}/tracking`)
      .then(async (response) => {
        if (!response.ok) return;
        const body = (await response.json()) as {
          data?: { tracking?: Tracking };
        };
        const current = body.data?.tracking;
        if (current?.events.length) {
          setTracking(current);
          if (current.receipt ?? current.handoff)
            setArtifact(current.receipt ?? current.handoff);
          if (current.recheck?.outcome)
            setRecheckOutcome(current.recheck.outcome);
          const saved = window.localStorage.getItem(journeyStorageKey(caseId));
          const savedJourney = saved ? (JSON.parse(saved) as SavedJourney) : {};
          window.localStorage.setItem(
            journeyStorageKey(caseId),
            JSON.stringify({
              ...savedJourney,
              ...((current.receipt ?? current.handoff)
                ? { artifact: current.receipt ?? current.handoff }
                : {}),
              ...(current.recheck?.outcome
                ? { outcome: current.recheck.outcome }
                : {}),
              tracking: current,
            } satisfies SavedJourney),
          );
          setView("result");
        }
      })
      .catch(() => undefined);
  }, [caseId, state.diagnosis, state.error, state.loading]);

  if (state.loading)
    return (
      <Shell>
        <div className={styles.loading}>
          <RefreshCw size={20} />
          <p>Checking the details linked to this claim…</p>
        </div>
      </Shell>
    );
  if (state.error)
    return (
      <Shell>
        <StateCard
          icon={<CircleAlert />}
          title={state.error}
          body="Your case has not changed."
          action={
            <button type="button" className={styles.primary} onClick={load}>
              Try again
            </button>
          }
        />
      </Shell>
    );
  if (!state.diagnosis)
    return (
      <Shell>
        <StateCard
          title="No claim details found"
          body="Open Nidhi Rakshak from a rejected claim to continue."
        />
      </Shell>
    );

  const diagnosis = state.diagnosis;
  const refused = diagnosis.status === "UNSUPPORTED" || !diagnosis.verdict;
  const submit = async () => {
    setBusy(true);
    setMessage("");
    const key = crypto.randomUUID();
    let nextArtifact: Artifact | undefined;
    try {
      const actionType =
        diagnosis.verdict === "FIX"
          ? "MEMBER_CORRECTION"
          : diagnosis.verdict === "NONE"
            ? "WAIT"
            : "EPFO_REVIEW";
      const response = await fetch(`/api/rescue-cases/${caseId}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": key },
        body: JSON.stringify({
          actionType,
          consent: {
            approved: true,
            text: "I understand this is a simulated action and no external record will be changed.",
          },
          payload: {
            issue: diagnosis.problemSummary,
            nextAction: diagnosis.recommendedAction,
          },
        }),
      });
      if (!response.ok)
        throw new Error("We couldn’t save this action. Try again.");
      if (diagnosis.verdict === "FORWARD" || diagnosis.verdict === "FIGHT") {
        const handoffResponse = await fetch(
          `/api/rescue-cases/${caseId}/handoffs`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Idempotency-Key": key,
            },
            body: JSON.stringify({
              consent: {
                approved: true,
                text: "I understand this is a simulated handoff and nothing was submitted.",
              },
              payload: {
                issue: diagnosis.problemSummary,
                nextAction: diagnosis.recommendedAction,
              },
            }),
          },
        );
        if (!handoffResponse.ok)
          throw new Error("The package could not be prepared. Try again.");
        const handoffBody = (await handoffResponse.json()) as {
          data: { artifact: Artifact };
        };
        nextArtifact = handoffBody.data.artifact;
        setArtifact(nextArtifact);
      }
      if (diagnosis.verdict !== "FORWARD") {
        const receiptResponse = await fetch(
          `/api/rescue-cases/${caseId}/receipts`,
          {
            method: "POST",
            headers: { "Idempotency-Key": key },
          },
        );
        if (!receiptResponse.ok)
          throw new Error("The case summary could not be prepared. Try again.");
        const receiptBody = (await receiptResponse.json()) as {
          data: { receipt: Artifact };
        };
        nextArtifact = receiptBody.data.receipt;
        setArtifact(nextArtifact);
      }
      window.localStorage.setItem(
        journeyStorageKey(caseId),
        JSON.stringify({ artifact: nextArtifact } satisfies SavedJourney),
      );
      setView("result");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Try again.");
    } finally {
      setBusy(false);
    }
  };

  const runSimulation = async () => {
    setBusy(true);
    setMessage("");
    try {
      const field = diagnosis.blocker?.field ?? "supported_detail";
      const response = await fetch(`/api/rescue-cases/${caseId}/simulations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": crypto.randomUUID(),
        },
        body: JSON.stringify({
          proposedChange: {
            field,
            before: "Current value",
            after: "Corrected value",
          },
          before: { supportedBlockerCount: 1 },
          after: { supportedBlockerCount: 0 },
        }),
      });
      const body = (await response.json()) as {
        data?: { simulation?: Simulation };
      };
      if (!response.ok || !body.data?.simulation)
        throw new Error("We couldn’t simulate this change safely. Try again.");
      setSimulation(body.data.simulation);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Try again.");
    } finally {
      setBusy(false);
    }
  };

  const loadTracking = async () => {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(`/api/rescue-cases/${caseId}/tracking`);
      const body = (await response.json()) as {
        data?: { tracking?: Tracking };
      };
      if (!response.ok || !body.data?.tracking)
        throw new Error("Tracking is unavailable. Try again.");
      setTracking(body.data.tracking);
      window.localStorage.setItem(
        journeyStorageKey(caseId),
        JSON.stringify({
          artifact,
          tracking: body.data.tracking,
          outcome: recheckOutcome,
        } satisfies SavedJourney),
      );
      setView("tracking");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Shell>
      <div className={styles.topline}>
        <button
          type="button"
          className={styles.back}
          onClick={() =>
            view === "summary" ? history.back() : setView("summary")
          }
        >
          <ArrowLeft size={17} /> Back
        </button>
        <span className={styles.simulated}>SIMULATED PROTOTYPE</span>
      </div>
      <div className={styles.context}>
        <span>Rejected claim</span>
        <span>Case {caseId.replace("case-golden-", "")}</span>
      </div>
      {view === "result" ? (
        <Result
          diagnosis={diagnosis}
          artifact={artifact}
          outcome={recheckOutcome}
          onTracking={loadTracking}
          onRecheck={async () => {
            setBusy(true);
            setMessage("");
            try {
              const response = await fetch(
                `/api/rescue-cases/${caseId}/recheck`,
                {
                  method: "POST",
                  headers: { "Idempotency-Key": crypto.randomUUID() },
                },
              );
              const body = (await response.json()) as {
                data?: { result?: { outcome: string } };
              };
              if (!response.ok || !body.data?.result)
                throw new Error("We couldn’t check this case. Try again.");
              setRecheckOutcome(body.data.result.outcome);
              const saved = window.localStorage.getItem(
                journeyStorageKey(caseId),
              );
              const journey = saved ? (JSON.parse(saved) as SavedJourney) : {};
              window.localStorage.setItem(
                journeyStorageKey(caseId),
                JSON.stringify({
                  ...journey,
                  outcome: body.data.result.outcome,
                } satisfies SavedJourney),
              );
            } catch (error) {
              setMessage(error instanceof Error ? error.message : "Try again.");
            } finally {
              setBusy(false);
            }
          }}
          busy={busy}
        />
      ) : view === "tracking" ? (
        <TrackingView
          tracking={tracking}
          message={message}
          onBack={() => setView("result")}
        />
      ) : view === "simulation" ? (
        <SimulationView
          diagnosis={diagnosis}
          simulation={simulation}
          busy={busy}
          message={message}
          onSimulate={runSimulation}
          onContinue={() => simulation?.safety === "SAFE" && setView("consent")}
          onBack={() => setView("summary")}
        />
      ) : view === "consent" ? (
        <Consent
          diagnosis={diagnosis}
          busy={busy}
          message={message}
          onApprove={submit}
          onBack={() => setView("summary")}
        />
      ) : (
        <Summary
          diagnosis={diagnosis}
          refused={refused}
          onPrimary={() =>
            refused
              ? setMessage(
                  "This rejection is not supported yet. Get help through EPFO.",
                )
              : diagnosis.verdict === "FIX"
                ? setView("simulation")
                : setView("consent")
          }
          message={message}
        />
      )}
    </Shell>
  );
};

const Shell = ({ children }: { children: React.ReactNode }) => (
  <main className={styles.page}>
    <div className={styles.shell}>
      <header>
        <img
          src="/assets/logo.png"
          alt="Nidhi Rakshak"
          className={styles.logo}
        />
      </header>
      {children}
      <footer className={styles.footer}>
        No EPFO record will be changed in this prototype.
      </footer>
    </div>
  </main>
);
const Summary = ({
  diagnosis,
  refused,
  onPrimary,
  message,
}: {
  diagnosis: DiagnosisResult;
  refused: boolean;
  onPrimary: () => void;
  message: string;
}) => (
  <>
    <section className={styles.answer}>
      <div className={styles.answerIcon}>
        {refused ? (
          <CircleAlert />
        ) : diagnosis.verdict === "FIGHT" ? (
          <ShieldCheck />
        ) : diagnosis.verdict === "FORWARD" ? (
          <Send />
        ) : (
          <Check />
        )}
      </div>
      <p className={styles.eyebrow}>
        {refused ? "Safe fallback" : "We found the problem"}
      </p>
      <h1>{headline(diagnosis)}</h1>
      <p>{diagnosis.problemSummary}</p>
    </section>
    {diagnosis.doNotTouch.applies && (
      <aside className={styles.warning}>
        <CircleAlert />
        <div>
          <strong>Do not change your current details.</strong>
          <p>{diagnosis.doNotTouch.reason}</p>
        </div>
      </aside>
    )}
    <button type="button" className={styles.primary} onClick={onPrimary}>
      {actionLabel(diagnosis)} <ArrowRight size={18} />
    </button>
    {message && <p className={styles.inlineError}>{message}</p>}
    {!refused && (
      <div className={styles.grid}>
        <InfoCard
          icon={<Landmark />}
          label="Who acts next"
          value={ownerLabel(diagnosis.owner)}
        />
        <InfoCard
          icon={<Clock3 />}
          label="What happens next"
          value={diagnosis.recommendedAction}
        />
      </div>
    )}
    <details className={styles.details}>
      <summary>See what we checked</summary>
      <div className={styles.evidence}>
        {diagnosis.evidence.length ? (
          diagnosis.evidence.map((item) => (
            <div key={item.evidenceId}>
              <strong>{item.label}</strong>
              <span>
                {item.state === "VERIFIED"
                  ? "Checked record"
                  : "Needs confirmation"}
              </span>
            </div>
          ))
        ) : (
          <p>No supporting record is available for this rejection.</p>
        )}
        {diagnosis.firstDivergence && (
          <p>
            <strong>Where the mismatch starts:</strong>{" "}
            {diagnosis.firstDivergence.detail}
          </p>
        )}
      </div>
    </details>
  </>
);
const Consent = ({
  diagnosis,
  busy,
  message,
  onApprove,
  onBack,
}: {
  diagnosis: DiagnosisResult;
  busy: boolean;
  message: string;
  onApprove: () => void;
  onBack: () => void;
}) => {
  const [approved, setApproved] = useState(false);
  return (
    <section>
      <div className={styles.sectionHeading}>
        <p className={styles.eyebrow}>Before you continue</p>
        <h1>Here is exactly what will happen.</h1>
        <p>Review this simulated action before approving it.</p>
      </div>
      <div className={styles.preview}>
        <span className={styles.previewLabel}>SIMULATED ACTION</span>
        <h2>{actionLabel(diagnosis)}</h2>
        <p>{diagnosis.recommendedAction}</p>
        <hr />
        <p>
          <strong>What will be shared:</strong> {diagnosis.problemSummary}
        </p>
        <p>
          <strong>What will not happen:</strong> No EPFO, employer, or bank
          record will be changed.
        </p>
      </div>
      <label className={styles.consent}>
        <input
          type="checkbox"
          checked={approved}
          onChange={(event) => setApproved(event.target.checked)}
        />{" "}
        I understand this is a simulation and approve creating this case
        package.
      </label>
      {message && <p className={styles.inlineError}>{message}</p>}
      <button
        type="button"
        className={styles.primary}
        disabled={busy || !approved}
        onClick={onApprove}
      >
        {busy ? "Saving…" : "Approve simulated action"} <ArrowRight size={18} />
      </button>
      <button type="button" className={styles.secondary} onClick={onBack}>
        Go back
      </button>
    </section>
  );
};
const Result = ({
  diagnosis,
  artifact,
  outcome,
  onTracking,
  onRecheck,
  busy,
}: {
  diagnosis: DiagnosisResult;
  artifact?: Artifact;
  outcome?: string;
  onTracking: () => void;
  onRecheck: () => void;
  busy: boolean;
}) => (
  <section>
    <div className={styles.answer}>
      <div className={styles.answerIcon}>
        {outcome === "RESOLVED" ? <Check /> : <ShieldCheck />}
      </div>
      <p className={styles.eyebrow}>
        {outcome === "RESOLVED"
          ? "Issue resolved"
          : outcome === "SAME_BLOCKER"
            ? "Same issue found"
            : outcome === "NEW_BLOCKER"
              ? "New issue found"
              : diagnosis.verdict === "FORWARD"
                ? "Package ready"
                : "Case saved"}
      </p>
      <h1>
        {outcome === "RESOLVED"
          ? "The issue we found has been resolved."
          : outcome === "SAME_BLOCKER"
            ? "This issue is still showing."
            : outcome === "NEW_BLOCKER"
              ? "A different issue needs attention."
              : diagnosis.verdict === "FORWARD"
                ? "Your employer package is ready."
                : "Your case summary is ready."}
      </h1>
      <p>
        {outcome === "RESOLVED"
          ? "This check only covered the supported issue. It does not predict claim approval."
          : outcome
            ? "Review the new details before changing anything. No external record was changed."
            : diagnosis.verdict === "FORWARD"
              ? "Share this with your previous employer. This prototype has not sent it."
              : "You can use this summary when you contact EPFO. Nothing was submitted."}
      </p>
    </div>
    {artifact && (
      <div className={styles.artifact}>
        <FileText />
        <div>
          <strong>
            {artifact.kind === "EPFO"
              ? "EPFO review package"
              : artifact.kind === "RECEIPT"
                ? "Case summary"
                : "Employer handoff"}
          </strong>
          <span>Ready to share · simulated</span>
        </div>
      </div>
    )}
    <button type="button" className={styles.secondary} onClick={onTracking}>
      View tracking <Clock3 size={18} />
    </button>
    <button
      type="button"
      className={styles.primary}
      onClick={onRecheck}
      disabled={busy}
    >
      {busy ? "Checking…" : "Check again"} <RefreshCw size={18} />
    </button>
    <p className={styles.trust}>
      The re-check only checks the supported issue. It does not predict claim
      approval.
    </p>
  </section>
);
const SimulationView = ({
  diagnosis,
  simulation,
  busy,
  message,
  onSimulate,
  onContinue,
  onBack,
}: {
  diagnosis: DiagnosisResult;
  simulation?: Simulation;
  busy: boolean;
  message: string;
  onSimulate: () => void;
  onContinue: () => void;
  onBack: () => void;
}) => (
  <section>
    <div className={styles.sectionHeading}>
      <p className={styles.eyebrow}>Try before you touch</p>
      <h1>See what this correction would change.</h1>
      <p>
        We check only the supported blocker. This is not a claim approval check.
      </p>
    </div>
    {simulation ? (
      <div className={styles.preview}>
        <span className={styles.previewLabel}>SIMULATED RESULT</span>
        <p>
          <strong>Before:</strong> {simulation.blockerDelta.before} supported
          blocker
        </p>
        <p>
          <strong>After:</strong> {simulation.blockerDelta.after} supported
          blocker
        </p>
        <p>
          <strong>Change:</strong> {simulation.blockerDelta.change}
        </p>
        <p>{simulation.safetyResult}</p>
        <p className={styles.trust}>{simulation.disclaimer}</p>
      </div>
    ) : (
      <div className={styles.preview}>
        <span className={styles.previewLabel}>PROPOSED CHANGE</span>
        <p>
          <strong>Field:</strong>{" "}
          {diagnosis.blocker?.field ?? "the failing detail"}
        </p>
        <p>We will test the corrected value without changing any record.</p>
      </div>
    )}
    {message && <p className={styles.inlineError}>{message}</p>}
    {!simulation && (
      <button
        type="button"
        className={styles.primary}
        onClick={onSimulate}
        disabled={busy}
      >
        {busy ? "Checking…" : "Run safe simulation"} <ArrowRight size={18} />
      </button>
    )}
    {simulation?.safety === "SAFE" && (
      <button type="button" className={styles.primary} onClick={onContinue}>
        Continue to consent <ArrowRight size={18} />
      </button>
    )}
    {simulation?.safety === "UNSAFE" && (
      <p className={styles.warning}>Do not make this change.</p>
    )}
    <button type="button" className={styles.secondary} onClick={onBack}>
      Go back
    </button>
  </section>
);
const TrackingView = ({
  tracking,
  message,
  onBack,
}: {
  tracking?: Tracking;
  message: string;
  onBack: () => void;
}) => (
  <section>
    <div className={styles.sectionHeading}>
      <p className={styles.eyebrow}>Case tracking</p>
      <h1>Here is what happens next.</h1>
      <p>This status is simulated. No external submission has occurred.</p>
    </div>
    {tracking ? (
      <div className={styles.preview}>
        <p>
          <strong>Owner:</strong> {tracking.owner}
        </p>
        <p>
          <strong>Status:</strong> {tracking.status}
        </p>
        <p>
          <strong>Next:</strong> {tracking.nextStep}
        </p>
        {tracking.events.map((event, index) => (
          <p key={`${event.toStatus}-${index}`}>
            <strong>{event.toStatus}:</strong> {event.reason}
          </p>
        ))}
      </div>
    ) : (
      <StateCard
        title="Tracking is unavailable"
        body="Your case has not changed."
      />
    )}
    {message && <p className={styles.inlineError}>{message}</p>}
    <button type="button" className={styles.secondary} onClick={onBack}>
      Go back
    </button>
  </section>
);
const InfoCard = ({
  icon,
  label,
  value,
}: { icon: ReactNode; label: string; value: string }) => (
  <div className={styles.infoCard}>
    {icon}
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  </div>
);
const StateCard = ({
  icon,
  title,
  body,
  action,
}: { icon?: ReactNode; title: string; body: string; action?: ReactNode }) => (
  <section className={styles.stateCard}>
    {icon}
    <h1>{title}</h1>
    <p>{body}</p>
    {action}
  </section>
);
