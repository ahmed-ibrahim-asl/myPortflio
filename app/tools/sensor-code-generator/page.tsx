"use client";

import React, { useMemo, useState } from "react";
import { EmbeddedExamplePicker } from "@/components/tools/EmbeddedExamplePicker";
import { TerminalCodeBlock } from "@/components/tools/TerminalCodeBlock";
import { ToolShell } from "@/components/tools/ToolShell";
import {
  EMBEDDED_CONFIGURATIONS,
  EMBEDDED_EXAMPLES,
  EMBEDDED_FAMILIES,
  EMBEDDED_PARAM_SCHEMAS,
  EMBEDDED_TARGETS,
  getEmbeddedFamilyStarter,
  generateEmbeddedCode
} from "@/lib/tools/embedded-generator/catalog";

interface ParamField {
  key: string;
  label: string;
  type: "select" | "number";
  default: string | number;
  options?: { value: string; label: string }[];
}

interface Selection {
  family: string;
  target: string;
  environment: string;
  protocol: string;
}

interface EmbeddedTarget {
  id: string;
  family: string;
  label: string;
  summary: string;
  protocols: readonly string[];
}

interface EmbeddedExample {
  id: string;
  family: string;
  target: string;
  title: string;
  summary: string;
  params: Readonly<Record<string, unknown>>;
}

interface EmbeddedFamilyStarter {
  example: EmbeddedExample;
  params: Record<string, unknown>;
  selection: Selection;
}

const configurations = EMBEDDED_CONFIGURATIONS as readonly any[];
const parameterSchemas = EMBEDDED_PARAM_SCHEMAS as Record<string, ParamField[]>;
const targets = EMBEDDED_TARGETS as unknown as readonly EmbeddedTarget[];
const examples = EMBEDDED_EXAMPLES as unknown as readonly EmbeddedExample[];

function firstConfiguration(target: string) {
  return configurations.find((config) => config.target === target);
}

export default function SensorCodeGeneratorPage() {
  const [selection, setSelection] = useState<Selection>({
    family: "sensor",
    target: "bme280",
    environment: "arduino",
    protocol: "i2c"
  });
  const [paramsByTarget, setParamsByTarget] = useState<Record<string, Record<string, unknown>>>({});
  const [activeExampleId, setActiveExampleId] = useState("weather-station");

  const familyTargets = useMemo(
    () => targets.filter((target) => target.family === selection.family),
    [selection.family]
  );
  const targetConfigurations = useMemo(
    () => configurations.filter((config) => config.target === selection.target),
    [selection.target]
  );
  const environments = useMemo(
    () => [...new Map(targetConfigurations.map((config) => [config.environment, config.environmentLabel])).entries()],
    [targetConfigurations]
  );
  const protocols = useMemo(
    () => [...new Map(
      targetConfigurations
        .filter((config) => config.environment === selection.environment)
        .map((config) => [config.protocol, config.protocolLabel])
    ).entries()],
    [selection.environment, targetConfigurations]
  );
  const familyExamples = useMemo(
    () => examples.filter((example) => example.family === selection.family),
    [selection.family]
  );

  const activeSchema = parameterSchemas[selection.target] ?? [];
  const activeParams = paramsByTarget[selection.target] ?? {};
  const result = useMemo(
    () => generateEmbeddedCode(selection, activeParams),
    [selection, activeParams]
  );

  const chooseTarget = (target: string, family = selection.family) => {
    const config = firstConfiguration(target);
    if (!config) return;
    setSelection({ family, target, environment: config.environment, protocol: config.protocol });
  };

  const chooseFamily = (family: string) => {
    const starter = getEmbeddedFamilyStarter(family) as EmbeddedFamilyStarter | null;
    if (!starter) return;

    setActiveExampleId(starter.example.id);
    setParamsByTarget((current) => ({
      ...current,
      [starter.selection.target]: starter.params
    }));
    setSelection(starter.selection);
  };

  const chooseEnvironment = (environment: string) => {
    const config = targetConfigurations.find((item) => item.environment === environment);
    if (!config) return;
    setSelection((current) => ({ ...current, environment, protocol: config.protocol }));
  };

  const chooseExample = (example: EmbeddedExample) => {
    const config = firstConfiguration(example.target);
    if (!config) return;
    setActiveExampleId(example.id);
    setParamsByTarget((current) => ({ ...current, [example.target]: { ...example.params } }));
    setSelection({
      family: example.family,
      target: example.target,
      environment: config.environment,
      protocol: config.protocol
    });
  };

  const changeParam = (field: ParamField, rawValue: string) => {
    setParamsByTarget((current) => ({
      ...current,
      [selection.target]: {
        ...current[selection.target],
        [field.key]: field.type === "number" ? Number(rawValue) : rawValue
      }
    }));
  };

  return (
    <ToolShell
      title="Embedded Code Workbench"
      description="Choose a sensor, communication workflow, or board interface. Start from a working example, adjust real wiring values, and copy a documented starter project."
    >
      <div className="embedded-workbench">
        <div className="embedded-family-tabs" role="tablist" aria-label="Embedded code family">
          {EMBEDDED_FAMILIES.map((family) => (
            <button
              className={`embedded-family-tab${selection.family === family.id ? " is-active" : ""}`}
              type="button"
              role="tab"
              aria-selected={selection.family === family.id}
              aria-pressed={selection.family === family.id}
              onClick={() => chooseFamily(family.id)}
              key={family.id}
            >
              <strong>{family.label}</strong>
              <span>{family.summary}</span>
            </button>
          ))}
        </div>

        <EmbeddedExamplePicker
          examples={familyExamples}
          activeExampleId={activeExampleId}
          onSelect={chooseExample}
        />

        <div className="embedded-workbench-grid">
          <section className="embedded-controls" aria-labelledby="embedded-configuration-title">
            <div className="embedded-section-heading">
              <span className="mono">CONFIGURATION</span>
              <h2 id="embedded-configuration-title">Choose the hardware path</h2>
            </div>

            <label className="tool-input">
              <span>{selection.family === "sensor" ? "Sensor" : selection.family === "communication" ? "Communication workflow" : "Board interface"}</span>
              <select value={selection.target} onChange={(event) => chooseTarget(event.target.value)}>
                {familyTargets.map((target) => (
                  <option value={target.id} key={target.id}>{target.label} — {target.summary}</option>
                ))}
              </select>
            </label>

            <label className="tool-input">
              <span>Target environment</span>
              <select value={selection.environment} onChange={(event) => chooseEnvironment(event.target.value)}>
                {environments.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
              </select>
            </label>

            <label className="tool-input">
              <span>Protocol or bus</span>
              <select
                value={selection.protocol}
                onChange={(event) => setSelection((current) => ({ ...current, protocol: event.target.value }))}
              >
                {protocols.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
              </select>
            </label>

            {activeSchema.length ? (
              <div className="embedded-parameter-group">
                <h3>Wiring and calibration</h3>
                {activeSchema.map((field) => (
                  <label className="tool-input" key={field.key}>
                    <span>{field.label}</span>
                    {field.type === "select" ? (
                      <select
                        value={String(activeParams[field.key] ?? field.default)}
                        onChange={(event) => changeParam(field, event.target.value)}
                      >
                        {field.options?.map((option) => (
                          <option value={option.value} key={option.value}>{option.label}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="number"
                        value={String(activeParams[field.key] ?? field.default)}
                        onChange={(event) => changeParam(field, event.target.value)}
                      />
                    )}
                  </label>
                ))}
              </div>
            ) : null}
          </section>

          <section className="embedded-output" aria-live="polite" aria-labelledby="embedded-output-title">
            <div className="embedded-section-heading">
              <span className="mono">GENERATED STARTER</span>
              <h2 id="embedded-output-title">Code, wiring, and dependencies</h2>
            </div>
            {!result.ok ? (
              <div className="embedded-error">
                <strong>That combination is not available.</strong>
                <p>Choose one of the environment and protocol pairs shown in the controls.</p>
              </div>
            ) : (
              <>
                <TerminalCodeBlock code={result.code} label={result.filename || "main.cpp"} />
                <div className="embedded-notes-grid">
                  <div>
                    <h3>Wiring</h3>
                    <ul>{result.wiring.map((note: string) => <li key={note}>{note}</li>)}</ul>
                  </div>
                  <div>
                    <h3>Notes</h3>
                    <ul>{result.notes.map((note: string) => <li key={note}>{note}</li>)}</ul>
                  </div>
                  <div>
                    <h3>Dependencies</h3>
                    {result.dependencies.length ? (
                      <ul>{result.dependencies.map((dependency: any) => <li key={dependency.name}>{dependency.name} <code>{dependency.version}</code></li>)}</ul>
                    ) : <p>Uses board-core libraries only.</p>}
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </ToolShell>
  );
}
