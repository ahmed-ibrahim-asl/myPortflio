"use client";

import React from "react";

import {
  SecurityExplanation,
  type ExplanationData,
} from "./SecurityExplanation";
import styles from "./SecurityMission.module.css";

export function SecurityField({
  id,
  label,
  technicalTerm,
  shortHelp,
  explanation,
  error,
  required,
  valuePath,
  onFocus,
  children,
}: {
  id: string;
  label: string;
  technicalTerm?: string;
  shortHelp?: string;
  explanation?: ExplanationData;
  error?: string;
  required?: boolean;
  valuePath: string;
  onFocus?: (valuePath: string | null) => void;
  children: React.ReactNode;
}) {
  const helpId = `${id}-help`;
  const errorId = `${id}-error`;
  const describedBy = [
    shortHelp ? helpId : null,
    error ? errorId : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={styles.field}
      data-control-path={valuePath}
      onFocusCapture={() => onFocus?.(valuePath)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
          onFocus?.(null);
        }
      }}
    >
      <div className={styles.fieldHeader}>
        <label htmlFor={id}>
          {label}
          {required && <span aria-hidden="true"> *</span>}
        </label>
        {technicalTerm && <span>{technicalTerm}</span>}
      </div>
      {React.isValidElement(children)
        ? React.cloneElement(
            children as React.ReactElement<{
              id?: string;
              "aria-describedby"?: string;
              "aria-invalid"?: boolean;
              required?: boolean;
            }>,
            {
              id,
              "aria-describedby": describedBy || undefined,
              "aria-invalid": Boolean(error),
              required,
            },
          )
        : children}
      {shortHelp && (
        <p id={helpId} className={styles.fieldHelp}>
          {shortHelp}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className={styles.fieldError}>
          {error}
        </p>
      )}
      <SecurityExplanation explanation={explanation} />
    </div>
  );
}
