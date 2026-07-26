"use client";

import React, { useRef } from "react";

export type GeneratorInfoTab =
  | "dependencies"
  | "dataset"
  | "hardware"
  | "metrics"
  | "deployment"
  | "notes";

type Dependency = {
  package: string;
  version: string;
  purpose: string;
};

type DatasetMetadata = {
  title?: string;
  summary?: string;
  structure?: string;
  examplePaths?: string[];
  labelFormat?: string;
};

type HardwareMetadata = {
  minimum?: string;
  recommended?: string;
  edge?: string;
};

type GeneratorInfoTabsProps = {
  templateId: string;
  activeTab: GeneratorInfoTab;
  dependencies: Dependency[];
  dataset: DatasetMetadata;
  hardware: HardwareMetadata;
  metrics: string[];
  deployment: string[];
  notes: string[];
  warnings: string[];
  onTabChange: (tab: GeneratorInfoTab) => void;
};

const TABS: Array<{ id: GeneratorInfoTab; label: string }> = [
  { id: "dependencies", label: "Dependencies" },
  { id: "dataset", label: "Dataset" },
  { id: "hardware", label: "Hardware" },
  { id: "metrics", label: "Metrics" },
  { id: "deployment", label: "Deployment" },
  { id: "notes", label: "Notes" },
];

export function GeneratorInfoTabs({
  templateId,
  activeTab,
  dependencies,
  dataset,
  hardware,
  metrics,
  deployment,
  notes,
  warnings,
  onTabChange,
}: GeneratorInfoTabsProps) {
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const safeTemplateId = templateId.replace(/[^a-z0-9-]/giu, "-");
  const activeIndex = TABS.findIndex((tab) => tab.id === activeTab);

  const moveFocus = (nextIndex: number) => {
    const normalizedIndex = (nextIndex + TABS.length) % TABS.length;
    const nextTab = TABS[normalizedIndex];
    onTabChange(nextTab.id);
    tabRefs.current[normalizedIndex]?.focus();
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      moveFocus(index + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      moveFocus(index - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      moveFocus(0);
    } else if (event.key === "End") {
      event.preventDefault();
      moveFocus(TABS.length - 1);
    }
  };

  let panelContent: React.ReactNode;

  if (activeTab === "dependencies") {
    panelContent = (
      <ul className="ml-generator-info-list ml-generator-dependencies">
        {dependencies.map((dependency) => (
          <li key={dependency.package}>
            <code>{dependency.package} {dependency.version}</code>
            <span>{dependency.purpose}</span>
          </li>
        ))}
      </ul>
    );
  } else if (activeTab === "dataset") {
    panelContent = (
      <div className="ml-generator-dataset-info">
        <strong>{dataset.title}</strong>
        <p>{dataset.summary}</p>
        {dataset.structure ? <pre>{dataset.structure}</pre> : null}
        {dataset.labelFormat ? <p><b>Labels:</b> {dataset.labelFormat}</p> : null}
        {dataset.examplePaths?.length ? (
          <ul>
            {dataset.examplePaths.map((path) => <li key={path}><code>{path}</code></li>)}
          </ul>
        ) : null}
      </div>
    );
  } else if (activeTab === "hardware") {
    panelContent = (
      <dl className="ml-generator-hardware-info">
        <div><dt>Minimum</dt><dd>{hardware.minimum}</dd></div>
        <div><dt>Recommended</dt><dd>{hardware.recommended}</dd></div>
        {hardware.edge ? <div><dt>Edge target</dt><dd>{hardware.edge}</dd></div> : null}
      </dl>
    );
  } else {
    const entries = activeTab === "metrics"
      ? metrics
      : activeTab === "deployment"
        ? deployment
        : [...notes, ...warnings];
    panelContent = (
      <ul className="ml-generator-info-list">
        {entries.map((entry) => <li key={entry}>{entry}</li>)}
      </ul>
    );
  }

  const activeTabId = `ml-generator-${safeTemplateId}-tab-${activeTab}`;
  const activePanelId = `ml-generator-${safeTemplateId}-panel-${activeTab}`;

  return (
    <section className="ml-generator-info" aria-label="Generated script guidance">
      <div className="ml-generator-tablist" role="tablist" aria-label="Script information">
        {TABS.map((tab, index) => {
          const selected = tab.id === activeTab;
          const tabId = `ml-generator-${safeTemplateId}-tab-${tab.id}`;
          const panelId = `ml-generator-${safeTemplateId}-panel-${tab.id}`;
          return (
            <button
              key={tab.id}
              ref={(element) => { tabRefs.current[index] = element; }}
              id={tabId}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={panelId}
              tabIndex={selected ? 0 : -1}
              onClick={() => onTabChange(tab.id)}
              onKeyDown={(event) => handleKeyDown(event, index)}
            >
              {tab.label}
              {tab.id === "notes" && warnings.length > 0 ? (
                <span aria-label={`${warnings.length} warnings`}>{warnings.length}</span>
              ) : null}
            </button>
          );
        })}
      </div>
      <div
        id={activePanelId}
        className="ml-generator-tab-panel"
        role="tabpanel"
        aria-labelledby={activeTabId}
        tabIndex={0}
      >
        {panelContent}
      </div>
    </section>
  );
}
