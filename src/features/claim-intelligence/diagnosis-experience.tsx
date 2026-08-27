"use client";

import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle2,
  CircleHelp,
  Clock3,
  FileText,
  Landmark,
  RefreshCw,
  ShieldAlert,
  UserRound,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  DiagnosisResult,
  type DiagnosisResult as DiagnosisResultType,
  ErrorEnvelope,
} from "../../domain/contracts";
import styles from "./diagnosis-experience.module.css";
import { toDiagnosisView } from "./diagnosis-view";

const defaultCaseId = "case-golden-fight-relation-name";
const savedCaseKey = "nidhi-rakshak:last-diagnosis-case";

type ScreenState = "ENTRY" | "LOADING" | "DATA" | "EMPTY" | "ERROR";

type DiagnosisResponse =
  | { kind: "DATA"; diagnosis: DiagnosisResultType }
  | { kind: "EMPTY" }
  | { kind: "ERROR"; message: string };

function ownerIcon(owner: DiagnosisResultType["owner"]) {
  if (owner === "EMPLOYER") return <Building2 aria-hidden="true" size={22} />;
  if (owner === "MEMBER") return <UserRound aria-hidden="true" size={22} />;
  if (owner === "BANK") return <Landmark aria-hidden="true" size={22} />;
  return <FileText aria-hidden="true" size={22} />;
}

function evidenceClass(
  state: DiagnosisResultType["evidence"][number]["state"],
) {
  if (state === "VERIFIED") return styles.verified;
  if (state === "INFERRED") return styles.different;
  return styles.unknown;
}

async function getDiagnosis(caseId: string): Promise<DiagnosisResponse> {
  try {
    const response = await fetch(
      `/api/rescue-cases/${encodeURIComponent(caseId)}/diagnosis`,
      { cache: "no-store" },
    );
    const body: unknown = await response.json();
    if (response.ok)
      return {
        kind: "DATA",
        diagnosis: DiagnosisResult.parse((body as { data: unknown }).data),
      };
    if (response.status === 404) return { kind: "EMPTY" };
    const error = ErrorEnvelope.safeParse(body);
    return {
      kind: "ERROR",
      message: error.success
        ? error.data.error.message
        : "We couldn’t load this claim right now.",
    };
  } catch {
    return { kind: "ERROR", message: "We couldn’t load this claim right now." };
  }
}

export function DiagnosisExperience() {
  const searchParams = useSearchParams();
  const caseId = searchParams.get("case")?.trim() || defaultCaseId;
  const [screen, setScreen] = useState<ScreenState>("ENTRY");
  const [diagnosis, setDiagnosis] = useState<DiagnosisResultType | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadDiagnosis = useCallback(async () => {
    setScreen("LOADING");
    setError(null);
    const response = await getDiagnosis(caseId);
    if (response.kind === "DATA") {
      setDiagnosis(response.diagnosis);
      window.localStorage.setItem(savedCaseKey, caseId);
      setScreen("DATA");
      return;
    }
    if (response.kind === "EMPTY") {
      setDiagnosis(null);
      setScreen("EMPTY");
      return;
    }
    setError(response.message);
    setScreen("ERROR");
  }, [caseId]);

  const begin = useCallback(() => {
    window.history.pushState({ diagnosisOpen: true }, "", window.location.href);
    void loadDiagnosis();
  }, [loadDiagnosis]);

  useEffect(() => {
    const onBack = () => {
      setScreen("ENTRY");
      setError(null);
    };
    window.addEventListener("popstate", onBack);
    return () => window.removeEventListener("popstate", onBack);
  }, []);

  useEffect(() => {
    if (window.localStorage.getItem(savedCaseKey) === caseId)
      void loadDiagnosis();
  }, [caseId, loadDiagnosis]);

  const view = diagnosis === null ? null : toDiagnosisView(diagnosis);

  return (
    <main className={styles.experience}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <div className={styles.brand}>
            <Landmark aria-hidden="true" size={20} /> Nidhi Rakshak
          </div>
          <p className={styles.prototype}>Simulated prototype, not EPFO</p>
        </header>
        <section aria-label="Claim context" className={styles.claimContext}>
          <p className={styles.eyebrow}>Rejected PF claim</p>
          <p className={styles.contextMeta}>
            Claim details were supplied by EPFO. You do not need to re-enter
            them.
          </p>
        </section>

        {screen === "ENTRY" && (
          <section className={styles.main} aria-labelledby="entry-title">
            <div className={styles.hero}>
              <p className={styles.eyebrow}>Claim rejected</p>
              <h1 id="entry-title">
                Understand this rejection before you change anything.
              </h1>
              <p className={styles.summary}>
                We’ll check the records already attached to this claim and show
                the safest next step.
              </p>
            </div>
            <button
              className={styles.primaryAction}
              onClick={begin}
              type="button"
            >
              Understand this rejection{" "}
              <ArrowRight aria-hidden="true" size={18} />
            </button>
            <aside className={`${styles.card} ${styles.info} ${styles.full}`}>
              <p className={styles.status}>
                <CircleHelp aria-hidden="true" size={18} /> We only ask for
                another document when it can change the answer.
              </p>
            </aside>
          </section>
        )}

        {screen === "LOADING" && (
          <section
            className={styles.main}
            aria-live="polite"
            aria-labelledby="loading-title"
          >
            <div className={styles.hero}>
              <p className={styles.eyebrow}>Checking your claim</p>
              <h1 id="loading-title">
                We’re reading the records that matter for this rejection.
              </h1>
              <p className={styles.status}>
                <span className={styles.loader} aria-hidden="true" /> This
                usually takes a moment.
              </p>
            </div>
          </section>
        )}

        {screen === "EMPTY" && (
          <section
            className={`${styles.main} ${styles.empty}`}
            aria-labelledby="empty-title"
          >
            <div className={styles.hero}>
              <p className={styles.eyebrow}>Claim context unavailable</p>
              <h1 id="empty-title">We can’t find a claim to review.</h1>
              <p className={styles.summary}>
                Return to the rejected claim in EPFO and open the help link
                again. We won’t ask you to type the details here.
              </p>
            </div>
            <button
              className={styles.secondaryAction}
              onClick={() => setScreen("ENTRY")}
              type="button"
            >
              Try again
            </button>
          </section>
        )}

        {screen === "ERROR" && (
          <section
            className={`${styles.main} ${styles.empty}`}
            aria-labelledby="error-title"
            role="alert"
          >
            <div className={styles.hero}>
              <p className={styles.eyebrow}>Couldn’t load the claim</p>
              <h1 id="error-title">Please try again.</h1>
              <p className={styles.summary}>{error}</p>
            </div>
            <button
              className={styles.primaryAction}
              onClick={() => void loadDiagnosis()}
              type="button"
            >
              <RefreshCw aria-hidden="true" size={18} /> Retry
            </button>
          </section>
        )}

        {screen === "DATA" && diagnosis !== null && view !== null && (
          <section className={styles.main} aria-labelledby="diagnosis-title">
            <div className={styles.hero}>
              <p className={styles.eyebrow}>
                {view.isRefusal ? "Need more support" : "What we found"}
              </p>
              <h1 id="diagnosis-title">{view.heading}</h1>
              <p className={styles.summary}>{diagnosis.problemSummary}</p>
            </div>

            {diagnosis.doNotTouch.applies && (
              <aside
                className={`${styles.card} ${styles.danger} ${styles.full}`}
                aria-label="Do not change your current details"
              >
                <p className={styles.sectionTitle}>
                  <ShieldAlert aria-hidden="true" size={20} /> Don’t change your
                  current details
                </p>
                <h2>
                  Your current details agree across the records we checked.
                </h2>
                <p>{diagnosis.doNotTouch.reason}</p>
              </aside>
            )}

            {view.needsEvidence && (
              <aside
                className={`${styles.card} ${styles.warning} ${styles.full}`}
              >
                <p className={styles.sectionTitle}>
                  <AlertTriangle aria-hidden="true" size={20} /> One record is
                  still missing
                </p>
                <h2>We can’t safely tell you what to change yet.</h2>
                <p>
                  Add only the record named below. It is the one item that could
                  change this diagnosis.
                </p>
              </aside>
            )}

            <a className={styles.primaryAction} href="#next-step">
              {view.actionLabel} <ArrowRight aria-hidden="true" size={18} />
            </a>

            {!view.isRefusal && (
              <section
                className={styles.card}
                aria-labelledby="owner-title"
                id="next-step"
              >
                <div className={styles.owner}>
                  {ownerIcon(diagnosis.owner)}
                  <div>
                    <p className={styles.sectionTitle}>Who acts next</p>
                    <h2 id="owner-title">{view.ownerHeading}</h2>
                    <p>{view.ownerReason}</p>
                  </div>
                </div>
                {view.correctionRoute !== undefined && (
                  <p className={styles.handoff}>{view.correctionRoute}</p>
                )}
              </section>
            )}

            {diagnosis.firstDivergence !== undefined && (
              <section
                className={`${styles.card} ${styles.full}`}
                aria-labelledby="mool-title"
              >
                <p className={styles.sectionTitle}>
                  <Clock3 aria-hidden="true" size={18} /> Record timeline
                </p>
                <h2 id="mool-title">We found where the mismatch starts.</h2>
                <ol className={styles.timeline}>
                  <li className={styles.timelineItem}>
                    <span className={styles.timelineStrong}>
                      {diagnosis.firstDivergence.label}
                    </span>
                    {diagnosis.firstDivergence.detail}
                  </li>
                  <li className={styles.timelineItem}>
                    We cannot see who entered this value from the records
                    available here.
                  </li>
                </ol>
              </section>
            )}

            {diagnosis.owner === "EMPLOYER" && (
              <section
                className={`${styles.card} ${styles.full}`}
                aria-labelledby="timeline-title"
              >
                <p className={styles.sectionTitle}>
                  <Clock3 aria-hidden="true" size={18} /> Service record
                </p>
                <h2 id="timeline-title">Your exit detail is still missing.</h2>
                <p>
                  The service record we checked does not have the last working
                  day EPFO needs. We do not have enough verified detail here to
                  show dates or make a claim about when it was entered.
                </p>
              </section>
            )}

            <details className={`${styles.details} ${styles.full}`}>
              <summary>See the records we used</summary>
              <div className={styles.detailsBody}>
                {diagnosis.evidence.length === 0 ? (
                  <p className={styles.falsifier}>
                    No supporting record is available for this rejection yet.
                  </p>
                ) : (
                  diagnosis.evidence.map((evidence) => (
                    <div className={styles.source} key={evidence.evidenceId}>
                      {evidence.state === "VERIFIED" ? (
                        <CheckCircle2
                          className={evidenceClass(evidence.state)}
                          aria-hidden="true"
                          size={18}
                        />
                      ) : (
                        <AlertTriangle
                          className={evidenceClass(evidence.state)}
                          aria-hidden="true"
                          size={18}
                        />
                      )}
                      <span>
                        <strong>{evidence.label}</strong>
                        <span className={styles.sourceMeta}>
                          {evidence.state === "VERIFIED"
                            ? "This appears directly in the source record."
                            : evidence.state === "INFERRED"
                              ? "This is suggested by the available record."
                              : "We could not verify this record."}
                        </span>
                      </span>
                    </div>
                  ))
                )}
              </div>
            </details>

            {diagnosis.falsifier !== undefined && (
              <section
                className={`${styles.card} ${styles.full}`}
                aria-labelledby="check-title"
              >
                <p className={styles.sectionTitle}>
                  <CircleHelp aria-hidden="true" size={18} /> Check this
                  yourself
                </p>
                <h2 id="check-title">Want to double-check this?</h2>
                <p className={styles.falsifier}>
                  <strong>This would change our answer:</strong>{" "}
                  {diagnosis.falsifier}
                </p>
              </section>
            )}

            {view.isRefusal && (
              <section
                className={`${styles.card} ${styles.info} ${styles.full}`}
                id="next-step"
                aria-labelledby="fallback-title"
              >
                <p className={styles.sectionTitle}>
                  <FileText aria-hidden="true" size={18} /> Safe next step
                </p>
                <h2 id="fallback-title">
                  Get help through the EPFO grievance route.
                </h2>
                <p>
                  We have not guessed what is wrong or asked you to make a
                  change. Keep this claim context with you when you ask for
                  help.
                </p>
              </section>
            )}

            <button
              className={styles.back}
              onClick={() => window.history.back()}
              type="button"
            >
              ← Back to claim summary
            </button>
          </section>
        )}
      </div>
    </main>
  );
}
