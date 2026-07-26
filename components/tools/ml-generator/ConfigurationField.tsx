"use client";

import React from "react";

export type GeneratorFieldOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type GeneratorField = {
  id: string;
  label: string;
  inputType: "select" | "number" | "text" | "toggle";
  helpText: string;
  modes: Array<"starter" | "production">;
  min?: number;
  max?: number;
  step?: number;
};

type ConfigurationFieldProps = {
  templateId: string;
  field: GeneratorField;
  value: unknown;
  rawNumericValue?: string;
  options?: GeneratorFieldOption[];
  error?: string;
  disabled?: boolean;
  onValueChange: (fieldId: string, value: string | boolean) => void;
  onRawNumericChange: (fieldId: string, value: string) => void;
  onNumericCommit: (fieldId: string) => void;
};

export function ConfigurationField({
  templateId,
  field,
  value,
  rawNumericValue,
  options = [],
  error,
  disabled = false,
  onValueChange,
  onRawNumericChange,
  onNumericCommit,
}: ConfigurationFieldProps) {
  const inputId = `ml-generator-${templateId}-${field.id}`;
  const helpId = `${inputId}-help`;
  const errorId = `${inputId}-error`;
  const describedBy = [helpId, error ? errorId : ""].filter(Boolean).join(" ");
  const invalid = error ? true : undefined;

  let control: React.ReactNode;

  if (field.inputType === "select") {
    control = (
      <select
        id={inputId}
        name={field.id}
        value={String(value ?? "")}
        disabled={disabled}
        aria-describedby={describedBy}
        aria-invalid={invalid}
        onChange={(event) => onValueChange(field.id, event.target.value)}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
    );
  } else if (field.inputType === "number") {
    control = (
      <input
        id={inputId}
        name={field.id}
        type="number"
        inputMode="decimal"
        value={rawNumericValue ?? String(value ?? "")}
        min={field.min}
        max={field.max}
        step={field.step ?? "any"}
        disabled={disabled}
        aria-describedby={describedBy}
        aria-invalid={invalid}
        onChange={(event) => onRawNumericChange(field.id, event.target.value)}
        onBlur={() => onNumericCommit(field.id)}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
        }}
      />
    );
  } else if (field.inputType === "toggle") {
    const checked = Boolean(value);
    control = (
      <label className="ml-generator-toggle" htmlFor={inputId}>
        <input
          id={inputId}
          name={field.id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          aria-describedby={describedBy}
          aria-invalid={invalid}
          onChange={(event) => onValueChange(field.id, event.target.checked)}
        />
        <span className="ml-generator-toggle-track" aria-hidden="true">
          <span />
        </span>
        <span className="ml-generator-toggle-state">
          {checked ? "Enabled" : "Disabled"}
        </span>
      </label>
    );
  } else {
    control = (
      <input
        id={inputId}
        name={field.id}
        type="text"
        value={String(value ?? "")}
        disabled={disabled}
        aria-describedby={describedBy}
        aria-invalid={invalid}
        onChange={(event) => onValueChange(field.id, event.target.value)}
      />
    );
  }

  return (
    <div
      className={`ml-generator-field tool-input${error ? " is-invalid" : ""}`}
      data-field-id={field.id}
    >
      {field.inputType !== "toggle" ? (
        <label htmlFor={inputId}>{field.label}</label>
      ) : (
        <span className="ml-generator-field-label">{field.label}</span>
      )}
      {control}
      <p id={helpId} className="ml-generator-field-help">
        {field.helpText}
      </p>
      {error ? (
        <p id={errorId} className="ml-generator-field-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
