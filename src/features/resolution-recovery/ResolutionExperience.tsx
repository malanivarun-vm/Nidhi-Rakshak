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

type View = "summary" | "consent" | "result";
interface ApiState {
  diagnosis?: DiagnosisResult;
  error?: string;
  loading: boolean;
}
interface Artifact {
  kind: string;
  payload: Record<string, unknown>;
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
  diagnosis.verdict === "FIGHT"
    ? "Resolve this with EPFO"
    : diagnosis.verdict === "FORWARD"
      ? "Send this to my employer"
      : diagnosis.verdict === "FIX"
        ? "See the safe correction"
        : "Get help through EPFO";

const loadDiagnosis = async (caseId: string) => {
  const response = await fetch(`/api/resolution/${caseId}`);
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
    try {
      const actionType =
        diagnosis.verdict === "FIX"
          ? "MEMBER_CORRECTION"
          : diagnosis.verdict === "NONE"
            ? "WAIT"
            : "EPFO_REVIEW";
      const response = await fetch(`/api/resolution/${caseId}/actions`, {
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
          `/api/resolution/${caseId}/handoffs`,
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
        setArtifact(handoffBody.data.artifact);
      }
      setView("result");
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
          onRecheck={async () => {
            setBusy(true);
            const response = await fetch(`/api/resolution/${caseId}/recheck`, {
              method: "POST",
              headers: { "Idempotency-Key": crypto.randomUUID() },
            });
            const body = (await response.json()) as {
              data?: { result?: { outcome: string } };
            };
            setMessage(
              body.data?.result?.outcome === "RESOLVED"
                ? "The issue we found has been resolved."
                : "This issue is still showing. Check the new details before changing anything.",
            );
            setBusy(false);
          }}
          busy={busy}
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
  onRecheck,
  busy,
}: {
  diagnosis: DiagnosisResult;
  artifact?: Artifact;
  onRecheck: () => void;
  busy: boolean;
}) => (
  <section>
    <div className={styles.answer}>
      <div className={styles.answerIcon}>
        <Check />
      </div>
      <p className={styles.eyebrow}>
        {diagnosis.verdict === "FORWARD" ? "Package ready" : "Case saved"}
      </p>
      <h1>
        {diagnosis.verdict === "FORWARD"
          ? "Your employer package is ready."
          : "Your case summary is ready."}
      </h1>
      <p>
        {diagnosis.verdict === "FORWARD"
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
              : "Employer handoff"}
          </strong>
          <span>Ready to share · simulated</span>
        </div>
      </div>
    )}
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
