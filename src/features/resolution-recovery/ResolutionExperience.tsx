"use client";

import {
  ArrowRight,
  Check,
  Clock3,
  FileText,
  RefreshCw,
  Share2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { DiagnosisResult } from "../../domain/contracts";
import { selectCorrectionRoute } from "../claim-intelligence/correction-route";
import {
  Alert,
  Card,
  ConsentBox,
  Context,
  CorrectionRouteCard,
  Cta,
  Header,
  LinkButton,
  Ownership,
  SimCompare,
} from "../shared/components";
import s from "../shared/nidhi.module.css";

type View =
  | "simulation"
  | "route"
  | "forward"
  | "consent"
  | "result"
  | "tracking"
  | "refusal";
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
  currentBlocker?: string;
  lastAction?: string;
  nextStep: string;
  events: Array<{ toStatus: string; reason: string; createdAt: string }>;
  simulated: boolean;
}
interface SavedJourney {
  artifact?: Artifact;
  outcome?: string;
  tracking?: Tracking;
  view?: View;
}

const storageKey = (caseId: string) => `nidhi-rakshak:resolution:${caseId}`;
const loadDiagnosis = async (caseId: string) => {
  const response = await fetch(
    `/api/rescue-cases/${encodeURIComponent(caseId)}/resolution`,
  );
  if (!response.ok) throw new Error("We couldn’t load the claim details.");
  const body = (await response.json()) as {
    data?: { diagnosis?: DiagnosisResult };
  };
  return body.data?.diagnosis;
};

export function ResolutionExperience({ caseId }: { caseId: string }) {
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult>();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>("simulation");
  const [simulation, setSimulation] = useState<Simulation>();
  const [artifact, setArtifact] = useState<Artifact>();
  const [tracking, setTracking] = useState<Tracking>();
  const [outcome, setOutcome] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    loadDiagnosis(caseId)
      .then((result) => {
        if (!result) throw new Error("No claim details found.");
        setDiagnosis(result);
        const first =
          result.status !== "DIAGNOSED" || !result.verdict
            ? "refusal"
            : result.verdict === "FORWARD"
              ? "forward"
              : result.verdict === "FIX" || result.verdict === "FIGHT"
                ? "simulation"
                : "consent";
        setView(first);
      })
      .catch((caught: unknown) =>
        setError(
          caught instanceof Error
            ? caught.message
            : "We couldn’t load the claim details.",
        ),
      )
      .finally(() => setLoading(false));
  }, [caseId]);

  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    if (!diagnosis || loading || error) return;
    const raw = window.localStorage.getItem(storageKey(caseId));
    if (!raw) return;
    try {
      const saved = JSON.parse(raw) as SavedJourney;
      if (saved.artifact) setArtifact(saved.artifact);
      if (saved.tracking) setTracking(saved.tracking);
      if (saved.outcome) setOutcome(saved.outcome);
      if (saved.view) setView(saved.view);
    } catch {
      window.localStorage.removeItem(storageKey(caseId));
    }
  }, [caseId, diagnosis, error, loading]);

  const persist = (next: SavedJourney) =>
    window.localStorage.setItem(storageKey(caseId), JSON.stringify(next));
  const goBack = () =>
    setView((current) =>
      current === "tracking" || current === "result"
        ? "result"
        : current === "route" || current === "consent" || current === "forward"
          ? "simulation"
          : "simulation",
    );

  const runSimulation = async () => {
    if (!diagnosis) return;
    if (diagnosis.verdict === "FIGHT") {
      setSimulation({
        safety: "UNSAFE",
        safetyResult: "This change creates more mismatches.",
        recommendation: "Keep your current details.",
        blockerDelta: { before: 1, after: 2, change: 1 },
        proposedChange: {
          field: "relation_name",
          before: "RAMESH BADIGER",
          after: "RAJESH BADIGER",
        },
        disclaimer: "Simulation only. No record will be changed.",
      });
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(
        `/api/rescue-cases/${encodeURIComponent(caseId)}/simulations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Idempotency-Key": crypto.randomUUID(),
          },
          body: JSON.stringify({
            proposedChange: {
              field: diagnosis.blocker?.field ?? "supported_detail",
              before: "Current value",
              after: "Corrected value",
            },
            before: { supportedBlockerCount: 1 },
            after: { supportedBlockerCount: 0 },
          }),
        },
      );
      const body = (await response.json()) as {
        data?: { simulation?: Simulation };
      };
      if (!response.ok || !body.data?.simulation)
        throw new Error("We couldn’t simulate this change safely. Try again.");
      setSimulation(body.data.simulation);
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "Try again.");
    } finally {
      setBusy(false);
    }
  };

  const submit = async () => {
    if (!diagnosis) return;
    setBusy(true);
    setMessage("");
    const key = crypto.randomUUID();
    try {
      const response = await fetch(
        `/api/rescue-cases/${encodeURIComponent(caseId)}/actions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Idempotency-Key": key,
          },
          body: JSON.stringify({
            actionType:
              diagnosis.verdict === "FIX"
                ? "MEMBER_CORRECTION"
                : diagnosis.verdict === "NONE"
                  ? "WAIT"
                  : "EPFO_REVIEW",
            consent: {
              approved: true,
              text: "I understand this is a simulated action and no external record will be changed.",
            },
            payload: {
              issue: diagnosis.problemSummary,
              nextAction: diagnosis.recommendedAction,
            },
          }),
        },
      );
      if (!response.ok)
        throw new Error("We couldn’t save this action. Try again.");
      let nextArtifact: Artifact | undefined;
      if (diagnosis.verdict === "FORWARD" || diagnosis.verdict === "FIGHT") {
        const handoff = await fetch(
          `/api/rescue-cases/${encodeURIComponent(caseId)}/handoffs`,
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
        const body = (await handoff.json()) as {
          data?: { artifact?: Artifact };
        };
        if (!handoff.ok || !body.data?.artifact)
          throw new Error("The package could not be prepared. Try again.");
        nextArtifact = body.data.artifact;
      } else if (diagnosis.verdict !== "NONE") {
        const receipt = await fetch(
          `/api/rescue-cases/${encodeURIComponent(caseId)}/receipts`,
          { method: "POST", headers: { "Idempotency-Key": key } },
        );
        const body = (await receipt.json()) as {
          data?: { receipt?: Artifact };
        };
        if (!receipt.ok || !body.data?.receipt)
          throw new Error("The case summary could not be prepared. Try again.");
        nextArtifact = body.data.receipt;
      }
      const nextTracking: Tracking = {
        status: "WAITING",
        owner: diagnosis.owner,
        currentBlocker: diagnosis.problemSummary,
        lastAction: diagnosis.recommendedAction,
        nextStep:
          diagnosis.verdict === "FORWARD"
            ? "Your previous employer reviews the simulated package."
            : "EPFO reviews the simulated package.",
        events: [],
        simulated: true,
      };
      setArtifact(nextArtifact);
      setTracking(nextTracking);
      setView("result");
      persist({
        artifact: nextArtifact,
        tracking: nextTracking,
        view: "result",
      });
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "Try again.");
    } finally {
      setBusy(false);
    }
  };

  const loadTracking = async () => {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(
        `/api/rescue-cases/${encodeURIComponent(caseId)}/tracking`,
      );
      const body = (await response.json()) as {
        data?: { tracking?: Tracking };
      };
      if (!response.ok || !body.data?.tracking)
        throw new Error("Tracking is unavailable. Try again.");
      const nextTracking =
        body.data.tracking.events.length > 0
          ? body.data.tracking
          : (tracking ?? body.data.tracking);
      setTracking(nextTracking);
      setView("tracking");
      persist({
        artifact,
        tracking: nextTracking,
        outcome,
        view: "tracking",
      });
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "Try again.");
    } finally {
      setBusy(false);
    }
  };

  const recheck = async () => {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(
        `/api/rescue-cases/${encodeURIComponent(caseId)}/recheck`,
        { method: "POST", headers: { "Idempotency-Key": crypto.randomUUID() } },
      );
      const body = (await response.json()) as {
        data?: { result?: { outcome: string } };
      };
      if (!response.ok || !body.data?.result)
        throw new Error("We couldn’t check this case. Try again.");
      setOutcome(body.data.result.outcome);
      persist({
        artifact,
        tracking,
        outcome: body.data.result.outcome,
        view: "result",
      });
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "Try again.");
    } finally {
      setBusy(false);
    }
  };

  if (loading)
    return (
      <Shell>
        <State
          title="Checking the details linked to this claim…"
          body="This usually takes a moment."
        />
      </Shell>
    );
  if (error || !diagnosis)
    return (
      <Shell>
        <State
          title={error || "No claim details found."}
          body="Your case has not changed."
          action={
            <Cta
              label="Try again"
              icon={<RefreshCw size={18} />}
              onClick={load}
            />
          }
        />
      </Shell>
    );

  return (
    <Shell>
      <Header onBack={() => history.back()} />
      <Context value={`Resolving: ${diagnosis.problemSummary}`} />
      {view === "simulation" && (
        <SimulationView
          diagnosis={diagnosis}
          simulation={simulation}
          busy={busy}
          message={message}
          onSimulate={() => void runSimulation()}
          onContinue={() =>
            setView(diagnosis.verdict === "FIX" ? "route" : "consent")
          }
          onBack={goBack}
        />
      )}
      {view === "route" && (
        <div className={s.body}>
          <p className={s.eyebrow}>Correction route</p>
          <h1 className={s.h1}>
            Here is the safest way to correct this detail.
          </h1>
          <CorrectionRouteCard
            route={selectCorrectionRoute({
              aadhaarValidated: true,
              uanIssuedBefore2017: false,
              fieldLevel: "UAN_PROFILE",
              priorEstablishmentStatus: undefined,
            })}
          />
          <Cta label="Continue to consent" onClick={() => setView("consent")} />
          <LinkButton label="Go back" onClick={goBack} />
        </div>
      )}
      {view === "forward" && (
        <div className={s.body}>
          <p className={s.eyebrow}>Who acts next</p>
          <h1 className={s.h1}>Your previous employer needs to update this.</h1>
          <Ownership diagnosis={diagnosis} />
          <Card title="Why this route">
            <p className={s.sub}>
              The missing service detail belongs to a previous establishment.
              You cannot add it from your current account.
            </p>
          </Card>
          <Cta
            label="Send this to my employer"
            onClick={() => setView("consent")}
          />
          <LinkButton label="Go back" onClick={goBack} />
        </div>
      )}
      {view === "consent" && (
        <ConsentView
          diagnosis={diagnosis}
          busy={busy}
          message={message}
          onApprove={() => void submit()}
          onBack={goBack}
        />
      )}
      {view === "result" && (
        <ResultView
          diagnosis={diagnosis}
          artifact={artifact}
          outcome={outcome}
          busy={busy}
          message={message}
          onTracking={() => void loadTracking()}
          onRecheck={() => void recheck()}
          onShare={() => void shareArtifact(artifact)}
        />
      )}
      {view === "tracking" && (
        <TrackingView
          tracking={tracking}
          message={message}
          onBack={() => setView("result")}
        />
      )}
      {view === "refusal" && (
        <div className={s.body}>
          <p className={s.eyebrow}>Safe fallback</p>
          <h1 className={s.h1}>
            We cannot safely diagnose this rejection yet.
          </h1>
          <p className={s.sub}>{diagnosis.problemSummary}</p>
          <Alert tone="info" title="We won’t guess.">
            The information available is not enough to tell you what should be
            changed.
          </Alert>
          <Cta
            label="Get help through EPFO"
            onClick={() =>
              setMessage(
                "This rejection is not supported yet. Get help through EPFO.",
              )
            }
          />
          {message && <p className={s.sub}>{message}</p>}
        </div>
      )}
    </Shell>
  );
}

const Shell = ({ children }: { children: React.ReactNode }) => (
  <main className={s.screen}>
    {children}
    <footer className={s.footer}>
      No EPFO record will be changed in this prototype.
    </footer>
  </main>
);
const State = ({
  title,
  body,
  action,
}: { title: string; body: string; action?: React.ReactNode }) => (
  <div className={s.body}>
    <p className={s.eyebrow}>Nidhi Rakshak</p>
    <h1 className={s.h1}>{title}</h1>
    <p className={s.sub}>{body}</p>
    {action}
  </div>
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
  <div className={s.body}>
    <p className={s.eyebrow}>Try before you touch</p>
    <h1 className={s.h1}>
      {diagnosis.verdict === "FIGHT"
        ? "See what would happen if you changed it."
        : "See what this correction would change."}
    </h1>
    <p className={s.sub}>
      This is a simulation only. No record will be changed here.
    </p>
    {!simulation ? (
      <Card title="Preview a change">
        <p className={s.sub}>
          Right now you have <strong>1 blocker</strong>. Preview the proposed
          change before you decide.
        </p>
        <Cta
          label={
            diagnosis.verdict === "FIGHT"
              ? "Preview this change"
              : "Run safe simulation"
          }
          onClick={onSimulate}
          disabled={busy}
        />
      </Card>
    ) : (
      <>
        <SimCompare
          before={[
            simulation.blockerDelta.before,
            diagnosis.verdict === "FIGHT" ? "mismatch now" : "blocker now",
          ]}
          after={[
            simulation.blockerDelta.after,
            diagnosis.verdict === "FIGHT"
              ? "mismatches if you change it"
              : "blockers after correction",
          ]}
          tone={diagnosis.verdict === "FIGHT" ? "bad" : "good"}
          note="No record will be changed"
        />
        <Alert
          tone={diagnosis.verdict === "FIGHT" ? "danger" : "good"}
          title={
            diagnosis.verdict === "FIGHT"
              ? "This change creates more mismatches."
              : "This correction clears the blocker we found."
          }
        >
          {simulation.safetyResult} {simulation.recommendation}
        </Alert>
        <Cta
          label={
            diagnosis.verdict === "FIGHT"
              ? "Keep my current details"
              : "Continue to the correction route"
          }
          onClick={onContinue}
        />
      </>
    )}
    {message && (
      <Alert tone="warn" title="We couldn’t complete that check.">
        {message}
      </Alert>
    )}
    <LinkButton label="Go back" onClick={onBack} />
  </div>
);

const ConsentView = ({
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
    <div className={s.body}>
      <p className={s.eyebrow}>Before you continue</p>
      <h1 className={s.h1}>Here is exactly what we will share.</h1>
      <p className={s.sub}>Review this simulated action before approving it.</p>
      <Card title="Case package">
        <div className={s.row}>
          <span className={s.key}>Will share</span>
          <span className={s.value}>{diagnosis.problemSummary}</span>
        </div>
        <div className={s.row}>
          <span className={s.key}>Won’t happen</span>
          <span className={s.value}>
            No EPFO, employer, or bank record will be changed.
          </span>
        </div>
      </Card>
      <ConsentBox
        checked={approved}
        onChange={setApproved}
        label="I understand this is a simulation and approve creating this case package."
      />
      {message && (
        <Alert tone="warn" title="Action not saved.">
          {message}
        </Alert>
      )}
      <Cta
        label={busy ? "Saving…" : "Approve simulated action"}
        onClick={onApprove}
        disabled={!approved || busy}
      />
      <LinkButton label="Go back" onClick={onBack} />
    </div>
  );
};

const ResultView = ({
  diagnosis,
  artifact,
  outcome,
  busy,
  message,
  onTracking,
  onRecheck,
  onShare,
}: {
  diagnosis: DiagnosisResult;
  artifact?: Artifact;
  outcome?: string;
  busy: boolean;
  message: string;
  onTracking: () => void;
  onRecheck: () => void;
  onShare: () => void;
}) => (
  <div className={s.body}>
    <p className={s.eyebrow}>
      {outcome === "RESOLVED"
        ? "Issue resolved"
        : diagnosis.verdict === "FORWARD"
          ? "Employer handoff"
          : "Case summary"}
    </p>
    <h1 className={s.h1}>
      {outcome === "RESOLVED"
        ? "The issue we found has been resolved."
        : artifact
          ? "Your case summary is ready."
          : "Your case is saved."}
    </h1>
    <p className={s.sub}>
      {outcome === "RESOLVED"
        ? "This check covered the supported issue only. It does not predict claim approval."
        : "Nothing was submitted. This simulated package is ready to review."}
    </p>
    {artifact && <Receipt artifact={artifact} onShare={onShare} />}
    {message && (
      <Alert tone="warn" title="We couldn’t complete that action.">
        {message}
      </Alert>
    )}
    <Cta
      label="View tracking"
      icon={<Clock3 size={18} />}
      onClick={onTracking}
    />
    <Cta
      label={busy ? "Checking…" : "Check again"}
      icon={<RefreshCw size={18} />}
      onClick={onRecheck}
      disabled={busy}
    />
  </div>
);
const Receipt = ({
  artifact,
  onShare,
}: { artifact: Artifact; onShare: () => void }) => (
  <section className={s.receipt}>
    <div className={s.receiptHead}>
      <strong>
        <img src="/assets/favicon-48.png" alt="" /> Nidhi Rakshak · Case summary
      </strong>
      <div>
        Case reference:{" "}
        {String(
          artifact.payload.caseReference ??
            artifact.payload.caseId ??
            "simulated",
        )}
      </div>
    </div>
    <div className={s.receiptBody}>
      {Object.entries(artifact.payload)
        .filter(([key]) => key !== "simulated")
        .slice(0, 9)
        .map(([key, value]) => (
          <div className={s.row} key={key}>
            <span className={s.key}>{key.replaceAll(/([A-Z])/g, " $1")}</span>
            <span className={s.value}>
              {Array.isArray(value) ? value.join(", ") : String(value)}
            </span>
          </div>
        ))}
    </div>
    <div className={s.footer}>
      <span>SIMULATED PROTOTYPE</span>
      <button className={s.secondary} onClick={onShare} type="button">
        <Share2 size={16} /> Share
      </button>
    </div>
  </section>
);
const TrackingView = ({
  tracking,
  message,
  onBack,
}: { tracking?: Tracking; message: string; onBack: () => void }) => {
  const statusLabel =
    tracking?.status === "WAITING" || tracking?.status === "IN_RESOLUTION"
      ? "Waiting for review"
      : tracking?.status === "RESOLVED"
        ? "Resolved"
        : (tracking?.status ?? "Not started");
  return (
    <div className={s.body}>
      <p className={s.eyebrow}>Tracking</p>
      <h1 className={s.h1}>We are tracking this for you.</h1>
      {tracking ? (
        <Card title="Current status">
          <div className={s.row}>
            <span className={s.key}>Status</span>
            <span className={s.statusPill}>{statusLabel}</span>
          </div>
          <div className={s.row}>
            <span className={s.key}>Owner</span>
            <span className={s.value}>{tracking.owner}</span>
          </div>
          <div className={s.row}>
            <span className={s.key}>Blocker</span>
            <span className={s.value}>
              {tracking.currentBlocker ?? "No blocker recorded."}
            </span>
          </div>
          <div className={s.row}>
            <span className={s.key}>Last action</span>
            <span className={s.value}>
              {tracking.lastAction ?? "No action recorded."}
            </span>
          </div>
          <div className={s.row}>
            <span className={s.key}>Next step</span>
            <span className={s.value}>{tracking.nextStep}</span>
          </div>
        </Card>
      ) : (
        <Alert tone="warn" title="Tracking is unavailable.">
          Your case has not changed. Try again later.
        </Alert>
      )}
      {message && <p className={s.sub}>{message}</p>}
      <LinkButton label="Back to case summary" onClick={onBack} />
    </div>
  );
};

const shareArtifact = async (artifact?: Artifact) => {
  if (!artifact) return;
  const text = Object.entries(artifact.payload)
    .map(
      ([key, value]) =>
        `${key}: ${Array.isArray(value) ? value.join(", ") : String(value)}`,
    )
    .join("\n");
  if (navigator.share) {
    await navigator.share({ title: "Nidhi Rakshak case summary", text });
    return;
  }
  await navigator.clipboard?.writeText(text);
};
