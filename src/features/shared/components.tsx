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
import s from "./nidhi.module.css";

export const ownerLabel = (owner: DiagnosisResult["owner"]) =>
  ({
    MEMBER: "You",
    EMPLOYER: "Your previous employer",
    EPFO: "EPFO",
    BANK: "Your bank",
    NONE: "No one",
  })[owner];
const OwnerIcon = ({ owner }: { owner: DiagnosisResult["owner"] }) =>
  owner === "EMPLOYER" ? (
    <Building2 size={22} />
  ) : owner === "MEMBER" ? (
    <UserRound size={22} />
  ) : owner === "BANK" ? (
    <Wallet size={22} />
  ) : (
    <Landmark size={22} />
  );
export function Header({ onBack }: { onBack?: () => void }) {
  return (
    <header className={s.head}>
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
    </header>
  );
}
export function Context({
  label = "Rejected PF claim",
  value,
}: { label?: string; value: string }) {
  return (
    <div className={s.context}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
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
export function Card({
  title,
  children,
}: { title?: string; children: ReactNode }) {
  return (
    <section className={s.card}>
      {title && (
        <div className={s.cardTitle}>
          <FileText size={15} />
          {title}
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
}: {
  tone: "danger" | "warn" | "info" | "good";
  title: string;
  children: ReactNode;
}) {
  const Icon =
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
        <Icon size={19} />
        {title}
      </div>
      {children && <p>{children}</p>}
    </aside>
  );
}
export function Ownership({ diagnosis }: { diagnosis: DiagnosisResult }) {
  return (
    <Card>
      <div className={s.alertTitle}>
        <OwnerIcon owner={diagnosis.owner} /> Who acts next
      </div>
      <h2>
        {ownerLabel(diagnosis.owner)}
        {diagnosis.owner === "NONE" ? "" : " needs to act."}
      </h2>
      <p className={s.sub}>
        {diagnosis.blocker?.reason ?? diagnosis.recommendedAction}
      </p>
    </Card>
  );
}
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
          <div>
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
