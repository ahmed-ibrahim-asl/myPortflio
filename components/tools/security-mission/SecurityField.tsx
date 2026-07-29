"use client";

import React from "react";
import { SecurityExplanation, ExplanationData } from "./SecurityExplanation";

export function SecurityField({
  id,
  label,
  technicalTerm,
  shortHelp,
  explanation,
  error,
  children,
}: {
  id: string;
  label: string;
  technicalTerm?: string;
  shortHelp?: string;
  explanation?: ExplanationData;
  error?: string;
  children: React.ReactNode;
}) {
  const helpId = `${id}-help`;
  const errorId = `${id}-error`;

  const ariaDescribedBy = [
    shortHelp ? helpId : null,
    error ? errorId : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="security-field mb-4 font-mono">
      <div className="flex items-baseline justify-between mb-1">
        <label htmlFor={id} className="text-xs font-bold text-zinc-100">
          {label}
        </label>
        {technicalTerm && (
          <span className="text-xs text-zinc-500">{technicalTerm}</span>
        )}
      </div>

      <div>
        {React.isValidElement(children)
          ? React.cloneElement(children as React.ReactElement<{ id?: string; "aria-describedby"?: string }>, {
              id,
              "aria-describedby": ariaDescribedBy || undefined,
            })
          : children}
      </div>

      {shortHelp && (
        <div id={helpId} className="text-xs text-zinc-400 mt-1">
          {shortHelp}
        </div>
      )}

      {error && (
        <div id={errorId} role="alert" className="text-xs text-red-400 font-bold mt-1">
          {error}
        </div>
      )}

      <SecurityExplanation explanation={explanation} />
    </div>
  );
}
