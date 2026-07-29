"use client";

import React from "react";
import { SecurityField } from "./SecurityField";

export type SecurityControlDef = {
  id: string;
  configKey: string;
  label: string;
  technicalTerm?: string;
  controlType: string;
  defaultValue?: unknown;
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
  values = {},
  errors = {},
  onChange,
}: {
  controls: SecurityControlDef[];
  values?: Record<string, unknown>;
  errors?: Record<string, string>;
  onChange: (key: string, value: unknown) => void;
}) {
  if (!controls || controls.length === 0) return null;

  return (
    <div className="security-control-renderer space-y-4">
      {controls.map((ctrl) => {
        const value = values[ctrl.configKey] ?? ctrl.defaultValue ?? "";
        const error = errors[ctrl.configKey];

        let inputElement: React.ReactNode = null;

        switch (ctrl.controlType) {
          case "toggle":
            inputElement = (
              <label className="inline-flex items-center cursor-pointer text-xs font-mono text-zinc-200">
                <input
                  type="checkbox"
                  checked={Boolean(value)}
                  onChange={(e) => onChange(ctrl.configKey, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none border border-zinc-600 peer-checked:bg-cyan-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-200 after:border-zinc-300 after:border after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full relative"></div>
                <span className="ml-2 font-mono">{ctrl.label}</span>
              </label>
            );
            break;

          case "select":
            inputElement = (
              <select
                value={String(value)}
                onChange={(e) => onChange(ctrl.configKey, e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 text-xs p-2 font-mono focus:border-cyan-500 focus:outline-none rounded-none"
              >
                {(ctrl.options ?? []).map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            );
            break;

          case "multi-select": {
            const selectedList = Array.isArray(value) ? value : [];
            inputElement = (
              <div className="space-y-1 bg-zinc-900 p-2 border border-zinc-700 max-h-36 overflow-y-auto">
                {(ctrl.options ?? []).map((opt) => {
                  const isChecked = selectedList.includes(opt.value);
                  return (
                    <label key={opt.value} className="flex items-center text-xs font-mono text-zinc-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          const next = e.target.checked
                            ? [...selectedList, opt.value]
                            : selectedList.filter((v: string) => v !== opt.value);
                          onChange(ctrl.configKey, next);
                        }}
                        className="mr-2 text-cyan-500 bg-zinc-950 border-zinc-700 rounded-none focus:ring-0"
                      />
                      {opt.label}
                    </label>
                  );
                })}
              </div>
            );
            break;
          }

          case "placeholder-secret":
            inputElement = (
              <input
                type="password"
                value={String(value)}
                onChange={(e) => onChange(ctrl.configKey, e.target.value)}
                placeholder="<PLACEHOLDER_SECRET>"
                className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 text-xs p-2 font-mono focus:border-cyan-500 focus:outline-none rounded-none"
              />
            );
            break;

          default:
            // text, host, number, port, cidr, url, domain, username, path, output-path, etc.
            inputElement = (
              <input
                type="text"
                value={String(value ?? "")}
                onChange={(e) => onChange(ctrl.configKey, e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 text-xs p-2 font-mono focus:border-cyan-500 focus:outline-none rounded-none"
              />
            );
            break;
        }

        return (
          <SecurityField
            key={ctrl.id}
            id={`field-${ctrl.id}`}
            label={ctrl.label}
            technicalTerm={ctrl.technicalTerm}
            shortHelp={ctrl.shortHelp}
            explanation={ctrl.explanation}
            error={error}
          >
            {inputElement}
          </SecurityField>
        );
      })}
    </div>
  );
}
