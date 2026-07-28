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
  onChange,
}: MissionFieldProps) {
  if (type === "toggle") {
    return (
      <label className={styles.toggleField} htmlFor={id}>
        <span>
          <strong>{label}</strong>
          <small>{help}</small>
        </span>
        <input
          id={id}
          name={id}
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => onChange(event.target.checked)}
        />
      </label>
    );
  }

  return (
    <label className={styles.field} htmlFor={id}>
      <span>{label}</span>
      {type === "select" ? (
        <select
          id={id}
          name={id}
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
          id={id}
          name={id}
          type={type}
          value={String(value)}
          min={min}
          max={max}
          step={step}
          onChange={(event) => onChange(
            type === "number"
              ? Number(event.target.value)
              : event.target.value,
          )}
        />
      )}
      <small>{help}</small>
    </label>
  );
}
