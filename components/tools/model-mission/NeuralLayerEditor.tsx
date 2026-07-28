"use client";

import { useMemo, useState } from "react";

import {
  NEURAL_LAYER_TYPES,
  inferLayerShapes,
  normalizeNeuralConfig,
} from "@/lib/tools/ml-generator/workbench/neural-generator";

import styles from "./ModelMission.module.css";

type NeuralLayer = {
  id: string;
  type: string;
  units: number;
  filters: number;
  kernelSize: number;
  poolSize: number;
  rate: number;
  activation: string;
  returnSequences: boolean;
};

type NeuralLayerEditorProps = {
  model: Record<string, unknown>;
  training: Record<string, unknown>;
  onChange: (layers: NeuralLayer[]) => void;
};

function layerDefaults(type: string, index: number): NeuralLayer {
  return {
    id: `${type}-${Date.now()}-${index}`,
    type,
    units: 64,
    filters: 32,
    kernelSize: 3,
    poolSize: 2,
    rate: 0.2,
    activation: "relu",
    returnSequences: false,
  };
}

function shapeLabel(shape: number[]) {
  return `[${shape.join(", ")}]`;
}

export function NeuralLayerEditor({
  model,
  training,
  onChange,
}: NeuralLayerEditorProps) {
  const [newLayerType, setNewLayerType] = useState("dense");
  const config = normalizeNeuralConfig({
    ...model,
    ...training,
  }) as {
    inputShape: number[];
    layers: NeuralLayer[];
  };
  const inference = useMemo(
    () => inferLayerShapes(config.inputShape, config.layers) as {
      steps: Array<{
        layer: NeuralLayer;
        inputShape: number[];
        outputShape: number[];
        error: string;
      }>;
      errors: string[];
    },
    [config.inputShape, config.layers],
  );

  const patchLayer = (
    index: number,
    patch: Partial<NeuralLayer>,
  ) => {
    onChange(
      config.layers.map((layer, layerIndex) =>
        layerIndex === index
          ? { ...layer, ...patch }
          : layer
      ),
    );
  };

  const moveLayer = (index: number, direction: -1 | 1) => {
    const destination = index + direction;
    if (
      destination < 0
      || destination >= config.layers.length
    ) {
      return;
    }
    const layers = [...config.layers];
    [layers[index], layers[destination]] = [
      layers[destination],
      layers[index],
    ];
    onChange(layers);
  };

  return (
    <div className={styles.layerEditor}>
      <div className={styles.layerList}>
        {inference.steps.map((step, index) => {
          const layer = step.layer;
          const hasUnits = [
            "dense",
            "lstm",
            "gru",
          ].includes(layer.type);
          const hasFilters = [
            "conv1d",
            "conv2d",
          ].includes(layer.type);
          const hasPool = [
            "maxpool1d",
            "maxpool2d",
          ].includes(layer.type);
          const hasActivation = hasUnits || hasFilters;
          return (
            <article
              className={styles.layerCard}
              data-error={step.error ? "true" : "false"}
              key={layer.id}
            >
              <div className={styles.layerHeading}>
                <span>Layer {index + 1}</span>
                <span>
                  {shapeLabel(step.inputShape)}
                  {" → "}
                  {shapeLabel(step.outputShape)}
                </span>
              </div>
              <div className={styles.layerControls}>
                <label>
                  <span>Layer type</span>
                  <select
                    value={layer.type}
                    onChange={(event) => patchLayer(
                      index,
                      {
                        ...layerDefaults(
                          event.target.value,
                          index,
                        ),
                        id: layer.id,
                      },
                    )}
                  >
                    {NEURAL_LAYER_TYPES.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </label>
                {hasUnits ? (
                  <label>
                    <span>Units</span>
                    <input
                      type="number"
                      min={1}
                      max={8192}
                      value={layer.units}
                      onChange={(event) => patchLayer(
                        index,
                        { units: Number(event.target.value) },
                      )}
                    />
                  </label>
                ) : null}
                {hasFilters ? (
                  <>
                    <label>
                      <span>Filters</span>
                      <input
                        type="number"
                        min={1}
                        max={2048}
                        value={layer.filters}
                        onChange={(event) => patchLayer(
                          index,
                          { filters: Number(event.target.value) },
                        )}
                      />
                    </label>
                    <label>
                      <span>Kernel</span>
                      <input
                        type="number"
                        min={1}
                        max={31}
                        value={layer.kernelSize}
                        onChange={(event) => patchLayer(
                          index,
                          {
                            kernelSize: Number(
                              event.target.value,
                            ),
                          },
                        )}
                      />
                    </label>
                  </>
                ) : null}
                {hasPool ? (
                  <label>
                    <span>Pool size</span>
                    <input
                      type="number"
                      min={1}
                      max={16}
                      value={layer.poolSize}
                      onChange={(event) => patchLayer(
                        index,
                        { poolSize: Number(event.target.value) },
                      )}
                    />
                  </label>
                ) : null}
                {layer.type === "dropout" ? (
                  <label>
                    <span>Dropout rate</span>
                    <input
                      type="number"
                      min={0}
                      max={0.9}
                      step={0.05}
                      value={layer.rate}
                      onChange={(event) => patchLayer(
                        index,
                        { rate: Number(event.target.value) },
                      )}
                    />
                  </label>
                ) : null}
                {hasActivation ? (
                  <label>
                    <span>Activation</span>
                    <select
                      value={layer.activation}
                      onChange={(event) => patchLayer(
                        index,
                        { activation: event.target.value },
                      )}
                    >
                      {["relu", "gelu", "tanh", "sigmoid"]
                        .map((activation) => (
                          <option
                            key={activation}
                            value={activation}
                          >
                            {activation}
                          </option>
                        ))}
                    </select>
                  </label>
                ) : null}
              </div>
              {step.error ? (
                <p className={styles.layerError}>{step.error}</p>
              ) : null}
              <div className={styles.layerActions}>
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => moveLayer(index, -1)}
                >
                  Move up
                </button>
                <button
                  type="button"
                  disabled={index === config.layers.length - 1}
                  onClick={() => moveLayer(index, 1)}
                >
                  Move down
                </button>
                <button
                  type="button"
                  disabled={config.layers.length === 1}
                  onClick={() => onChange(
                    config.layers.filter(
                      (_, layerIndex) => layerIndex !== index,
                    ),
                  )}
                >
                  Remove
                </button>
              </div>
            </article>
          );
        })}
      </div>
      <div className={styles.addLayer}>
        <select
          aria-label="New layer type"
          value={newLayerType}
          onChange={(event) => setNewLayerType(event.target.value)}
        >
          {NEURAL_LAYER_TYPES.map((type) => (
            <option key={type.id} value={type.id}>
              {type.label} — {type.purpose}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => onChange([
            ...config.layers,
            layerDefaults(newLayerType, config.layers.length),
          ])}
        >
          Add layer
        </button>
      </div>
      {inference.errors.length > 0 ? (
        <div className={styles.errorBox}>
          <strong>Architecture needs attention</strong>
          {inference.errors.map((error) => (
            <p key={error}>{error}</p>
          ))}
        </div>
      ) : null}
    </div>
  );
}
