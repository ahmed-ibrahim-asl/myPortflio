"use client";

import {
  getSecurityProjectValue,
} from "@/lib/tools/security-mission/project-paths.js";

import { SecurityField } from "./SecurityField";
import styles from "./SecurityMission.module.css";

export type SecurityControlDef = {
  id: string;
  configKey: string;
  valuePath: string;
  label: string;
  technicalTerm?: string;
  controlType: string;
  defaultValue?: unknown;
  required?: boolean;
  options?: Array<{ label: string; value: string }>;
  shortHelp?: string;
  explanation?: {
    what?: string;
    why?: string;
    useWhen?: string;
    avoidWhen?: string;
    tradeoff?: string;
    codeEffect?: string;
  };
};

export function SecurityControlRenderer({
  controls,
  project,
  errors = {},
  onChange,
  onFocus,
}: {
  controls: SecurityControlDef[];
  project: Record<string, any>;
  errors?: Record<string, string>;
  onChange: (valuePath: string, value: unknown) => void;
  onFocus?: (valuePath: string | null) => void;
}) {
  if (!controls || controls.length === 0) {
    return (
      <div className={styles.emptyState}>
        <strong>No values needed for this step.</strong>
        <span>Continue to review the generated command.</span>
      </div>
    );
  }

  return (
    <div className={styles.controlList}>
      {controls.map((control) => {
        const value =
          getSecurityProjectValue(project, control.valuePath)
          ?? control.defaultValue
          ?? "";
        const error = errors[control.valuePath];
        const inputClass = error ? styles.inputError : styles.input;
        let input: React.ReactNode;

        if (control.controlType === "toggle") {
          input = (
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={Boolean(value)}
                onChange={(event) =>
                  onChange(control.valuePath, event.target.checked)}
              />
              <span aria-hidden="true" />
              <strong>{Boolean(value) ? "Enabled" : "Disabled"}</strong>
            </label>
          );
        } else if (control.controlType === "select") {
          input = (
            <select
              className={inputClass}
              value={String(value)}
              onChange={(event) =>
                onChange(control.valuePath, event.target.value)}
            >
              {(control.options ?? []).map((option) => (
                <option value={option.value} key={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          );
        } else {
          const inputType = control.controlType === "placeholder-secret"
            ? "password"
            : ["number", "port"].includes(control.controlType)
              ? "number"
              : control.controlType === "url"
                ? "url"
                : "text";
          input = (
            <input
              className={inputClass}
              type={inputType}
              value={String(value)}
              min={control.controlType === "port" ? 1 : undefined}
              max={control.controlType === "port" ? 65535 : undefined}
              autoComplete={
                control.controlType === "placeholder-secret"
                  ? "off"
                  : undefined
              }
              onChange={(event) =>
                onChange(
                  control.valuePath,
                  inputType === "number" && event.target.value !== ""
                    ? Number(event.target.value)
                    : event.target.value,
                )}
            />
          );
        }

        return (
          <SecurityField
            key={control.id}
            id={`security-field-${control.id}`}
            valuePath={control.valuePath}
            label={control.label}
            technicalTerm={control.technicalTerm}
            shortHelp={control.shortHelp}
            explanation={control.explanation}
            error={error}
            required={control.required}
            onFocus={onFocus}
          >
            {input}
          </SecurityField>
        );
      })}
    </div>
  );
}
