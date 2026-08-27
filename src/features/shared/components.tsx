import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  FileText,
  Landmark,
  ShieldAlert,
  UserRound,
  Wallet,
} from "lucide-react";
import type { ReactNode } from "react";
import type { DiagnosisResult } from "../../domain/contracts";
import type { CorrectionRouteResult } from "../claim-intelligence/correction-route";
import s from "./nidhi.module.css";

type Tone = "danger" | "warn" | "info" | "good";

const ownerLabel = (owner: DiagnosisResult["owner"]) =>
  ({
    MEMBER: "You",
    EMPLOYER: "Your previous employer",
    EPFO: "EPFO",
    BANK: "Your bank",
    NONE: "No one",
  })[owner];
const ownerIcon = (owner: DiagnosisResult["owner"]) =>
  owner === "EMPLOYER"
    ? Building2
    : owner === "MEMBER"
      ? UserRound
      : owner === "BANK"
        ? Wallet
        : Landmark;

export function Header({ onBack }: { onBack?: () => void }) {
  return (
    <header className={s.head}>
      <div className={s.headInner}>
        {onBack ? (
          <button className={s.back} onClick={onBack} type="button">
            <ArrowLeft size={17} /> Back
          </button>
        ) : (
          <div className={s.brand}>
            <img src="/assets/favicon-48.png" alt="" /> Nidhi Rakshak
          </div>
        )}
        <span className={s.proto}>Simulated prototype, not EPFO</span>
      </div>
    </header>
  );
}

export function Context({
  label = "Rejected PF claim",
  value,
}: { label?: string; value: string }) {
  return (
    <div className={s.context}>
      <div className={s.column}>
        <span>{label}</span>
        <span>{value}</span>
      </div>
    </div>
  );
}
export const ClaimContext = ({ right }: { right: string }) => (
  <Context value={right} />
);

export function Cta({
  label,
  onClick,
  disabled = false,
  icon = <ArrowRight size={18} />,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  icon?: ReactNode;
}) {
  return (
    <button
      className={s.cta}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {label} {icon}
    </button>
  );
}
export const LinkButton = ({
  label,
  onClick,
}: { label: string; onClick: () => void }) => (
  <button className={s.secondary} onClick={onClick} type="button">
    {label}
  </button>
);

export function Card({
  title,
  children,
}: { title?: string; children: ReactNode }) {
  return (
    <section className={s.card}>
      {title && (
        <div className={s.cardTitle}>
          <FileText size={15} /> {title}
        </div>
      )}
      {children}
    </section>
  );
}

export function Alert({
  tone,
  title,
  children,
}: { tone: Tone; title: string; children?: ReactNode }) {
  const AlertIcon =
    tone === "danger"
      ? ShieldAlert
      : tone === "good"
        ? CheckCircle2
        : AlertTriangle;
  return (
    <aside
      className={`${s.alert} ${s[tone]}`}
      role={tone === "danger" ? "alert" : undefined}
    >
      <div className={s.alertTitle}>
        <AlertIcon size={19} /> {title}
      </div>
      {children && <p>{children}</p>}
    </aside>
  );
}

export function Ownership({ diagnosis }: { diagnosis: DiagnosisResult }) {
  const OwnerIcon = ownerIcon(diagnosis.owner);
  return (
    <Card>
      <div className={s.owner}>
        <div className={s.ownerIcon}>
          <OwnerIcon size={22} />
        </div>
        <div>
          <div className={s.ownerLabel}>Who acts next</div>
          <h2>
            {ownerLabel(diagnosis.owner)}
            {diagnosis.owner === "NONE"
              ? ""
              : diagnosis.owner === "MEMBER"
                ? " need to act."
                : " needs to act."}
          </h2>
          <p>{diagnosis.blocker?.reason ?? diagnosis.recommendedAction}</p>
        </div>
      </div>
    </Card>
  );
}
export const OwnershipCard = ({
  owner,
  headline,
  why,
}: { owner: DiagnosisResult["owner"]; headline: string; why: string }) => {
  const OwnerIcon = ownerIcon(owner);
  return (
    <Card>
      <div className={s.owner}>
        <div className={s.ownerIcon}>
          <OwnerIcon size={22} />
        </div>
        <div>
          <div className={s.ownerLabel}>Who acts next</div>
          <h2>{headline}</h2>
          <p>{why}</p>
        </div>
      </div>
    </Card>
  );
};

export function RecordDiff({ diagnosis }: { diagnosis: DiagnosisResult }) {
  const rows = diagnosis.caseId.includes("fight")
    ? ([
        ["Aadhaar", "RAMESH BADIGER", false],
        ["PAN", "RAMESH BADIGER", false],
        ["Current PF", "RAMESH BADIGER", false],
        ["2019 PF record", "RAJESH BADIGER", true],
      ] as const)
    : ([
        ["Entered value", "Account ending 4421", true],
        ["Verified value", "Account ending 7742", false],
      ] as const);
  return (
    <div>
      {rows.map(([name, value, different]) => (
        <div
          className={`${s.source} ${different ? s.sourceDiff : ""}`}
          key={name}
        >
          <div className={s.sourceMain}>
            <div className={s.sourceName}>{name}</div>
            <div className={s.sourceValue}>
              {different ? (
                <>
                  {value.slice(0, 2)}
                  <span className={s.hot}>{value.slice(2, 3)}</span>
                  {value.slice(3)}
                </>
              ) : (
                value
              )}
            </div>
          </div>
          <div className={`${s.state} ${different ? s.stateDiff : ""}`}>
            {different ? (
              <>
                <AlertTriangle size={14} /> Different
              </>
            ) : (
              <>
                <Check size={14} /> Matches
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export function Timeline({ items }: { items: string[] }) {
  return (
    <ol className={s.timeline}>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ol>
  );
}

export function SimCompare({
  before,
  after,
  tone,
  note,
}: {
  before: [number, string];
  after: [number, string];
  tone: "bad" | "good";
  note: string;
}) {
  return (
    <Card title="Before → after">
      <div className={s.simRow}>
        <div className={s.simBox}>
          <strong>{before[0]}</strong>
          <span>{before[1]}</span>
        </div>
        <ArrowRight className={s.simArrow} size={22} />
        <div className={`${s.simBox} ${tone === "bad" ? s.simBad : s.simGood}`}>
          <strong>{after[0]}</strong>
          <span>{after[1]}</span>
        </div>
      </div>
      <div className={s.simLabel}>Simulation only · {note}</div>
    </Card>
  );
}

export function ConsentBox({
  checked,
  onChange,
  label,
}: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return (
    <label className={s.consent}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className={s.checkbox}>
        <Check size={14} />
      </span>
      <span>{label}</span>
    </label>
  );
}

export function CorrectionRouteCard({
  route,
}: { route: CorrectionRouteResult }) {
  return (
    <>
      <Card>
        <div className={s.owner}>
          <div className={s.ownerIcon}>
            <UserRound size={22} />
          </div>
          <div>
            <div className={s.ownerLabel}>Selected route · {route.time}</div>
            <h2>{route.headline}</h2>
            <p>{route.reason}</p>
          </div>
        </div>
      </Card>
      <Card title="Your route">
        <ol className={s.steps}>
          {route.steps.map((step, index) => (
            <li key={step}>
              {index + 1}. {step}
            </li>
          ))}
        </ol>
      </Card>
      <details className={s.disclosure}>
        <summary>Why this route?</summary>
        {route.notApplicable.map((item) => (
          <p className={s.sub} key={item.label}>
            <strong>{item.label}:</strong> {item.why}
          </p>
        ))}
      </details>
    </>
  );
}
