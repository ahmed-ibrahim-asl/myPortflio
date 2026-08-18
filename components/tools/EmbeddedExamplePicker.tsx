import React from "react";

interface EmbeddedExample {
  id: string;
  family: string;
  target: string;
  title: string;
  summary: string;
  params: Readonly<Record<string, unknown>>;
}

interface EmbeddedExamplePickerProps {
  examples: readonly EmbeddedExample[];
  activeExampleId: string;
  onSelect: (example: EmbeddedExample) => void;
}

export function EmbeddedExamplePicker({ examples, activeExampleId, onSelect }: EmbeddedExamplePickerProps) {
  return (
    <section className="embedded-examples" aria-labelledby="embedded-examples-title">
      <div className="embedded-section-heading">
        <span className="mono">EXAMPLES</span>
        <h2 id="embedded-examples-title">Start from a familiar build</h2>
      </div>
      <div className="embedded-example-grid">
        {examples.map((example) => (
          <button
            className={`embedded-example-card${activeExampleId === example.id ? " is-active" : ""}`}
            type="button"
            aria-pressed={activeExampleId === example.id}
            onClick={() => onSelect(example)}
            key={example.id}
          >
            <strong>{example.title}</strong>
            <span>{example.summary}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
