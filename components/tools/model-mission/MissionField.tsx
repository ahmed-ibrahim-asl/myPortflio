import { MissionExplanation } from "./MissionExplanation";
import styles from "./ModelMission.module.css";

type Option = {
  value: string;
  label: string;
};

type MissionFieldProps = {
  id: string;
  label: string;
  help: string;
  value: string | number | boolean;
  type?: "text" | "number" | "select" | "toggle";
  options?: Option[];
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  disabledReason?: string;
  error?: string;
  recommended?: boolean;
  technicalTerm?: string;
  explanation?: {
    what: string;
    why: string;
    useWhen: string;
    avoidWhen?: string;
    tradeoff?: string;
    codeEffect: string;
  };
  onChange: (value: string | number | boolean) => void;
};

export function MissionField({
  id,
  label,
  help,
  value,
  type = "text",
  options = [],
  min,
  max,
  step,
  disabled = false,
  disabledReason,
  error,
  recommended = false,
  technicalTerm,
  explanation,
  onChange,
}: MissionFieldProps) {
  const helpId = `${id}-help`;
  const errorId = `${id}-error`;
  const describedBy = [helpId, disabledReason ? `${id}-disabled` : "", error ? errorId : ""]
    .filter(Boolean)
    .join(" ");
  // MissionExplanation supplies the "Learn this choice" control with aria-expanded.
  const controlProps = {
    id,
    name: id,
    disabled,
    "aria-describedby": describedBy,
    "aria-invalid": error ? true : undefined,
  };

  const control = type === "select" ? (
    <select
      {...controlProps}
      value={String(value)}
      onChange={(event) => onChange(event.target.value)}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ) : (
    <input
      {...controlProps}
      type={type === "toggle" ? "checkbox" : type}
      {...(type === "toggle"
        ? {
            checked: Boolean(value),
            onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
              onChange(event.target.checked),
          }
        : {
            value: String(value),
            min,
            max,
            step,
            onChange: (event: React.ChangeEvent<HTMLInputElement>) => onChange(
              type === "number" ? Number(event.target.value) : event.target.value,
            ),
          })}
    />
  );

  return (
    <div className={type === "toggle" ? styles.toggleField : styles.field}>
      <div className={styles.fieldHeading}>
        <label htmlFor={id}>{label}</label>
        {technicalTerm ? <span>{technicalTerm}</span> : null}
        {recommended ? <span className={styles.recommendedBadge}>Recommended</span> : null}
      </div>
      {control}
      <small id={helpId}>{help}</small>
      {disabledReason ? <small id={`${id}-disabled`}>{disabledReason}</small> : null}
      {error ? <p id={errorId} className={styles.fieldError} role="alert">{error}</p> : null}
      {explanation ? <MissionExplanation id={id} explanation={explanation} /> : null}
    </div>
  );
}