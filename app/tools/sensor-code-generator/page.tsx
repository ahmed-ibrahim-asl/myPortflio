"use client";

import React, { useState, useMemo } from "react";
import { ToolShell } from "@/components/tools/ToolShell";
import { TerminalCodeBlock } from "@/components/tools/TerminalCodeBlock";
import { generateSensorCode, SENSOR_CONFIGURATIONS, SENSOR_PARAM_SCHEMAS } from "@/lib/tools/sensor-templates";

interface SensorParamField {
  key: string;
  label: string;
  type: "select" | "number";
  default: string | number;
  options?: { value: string; label: string }[];
}

const PARAM_SCHEMAS = SENSOR_PARAM_SCHEMAS as unknown as Record<string, SensorParamField[]>;

export default function SensorCodeGeneratorPage() {
  const [selection, setSelection] = useState({
    sensor: "bme280",
    environment: "arduino",
    protocol: "i2c"
  });
  const [paramsBySensor, setParamsBySensor] = useState<Record<string, Record<string, unknown>>>({});

  const getAvailableEnvironments = (sensorId: string) => {
    const envs = new Set();
    SENSOR_CONFIGURATIONS.filter(c => c.sensor === sensorId).forEach(c => envs.add(c.environment));
    return Array.from(envs);
  };

  const getAvailableProtocols = (sensorId: string, envId: string) => {
    const protocols = new Set();
    SENSOR_CONFIGURATIONS.filter(c => c.sensor === sensorId && c.environment === envId).forEach(c => protocols.add(c.protocol));
    return Array.from(protocols);
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setSelection(prev => {
      const next = { ...prev, [name]: value };
      
      // Dependent select logic
      if (name === "sensor") {
        const envs = getAvailableEnvironments(value);
        if (!envs.includes(next.environment)) {
          next.environment = envs[0] as string;
        }
        const protocols = getAvailableProtocols(value, next.environment);
        if (!protocols.includes(next.protocol)) {
          next.protocol = protocols[0] as string;
        }
      } else if (name === "environment") {
        const protocols = getAvailableProtocols(next.sensor, value);
        if (!protocols.includes(next.protocol)) {
          next.protocol = protocols[0] as string;
        }
      }
      
      return next;
    });
  };

  const activeSchema = PARAM_SCHEMAS[selection.sensor];
  const activeParams = paramsBySensor[selection.sensor] || {};

  const handleParamChange = (key: string, rawValue: string, type: string) => {
    setParamsBySensor((prev) => ({
      ...prev,
      [selection.sensor]: {
        ...prev[selection.sensor],
        [key]: type === "number" ? Number(rawValue) : rawValue
      }
    }));
  };

  const result = useMemo(
    () => generateSensorCode(selection, activeParams),
    [selection, activeParams]
  );

  return (
    <ToolShell
      title="Sensor Code Generator"
      description="Generate validated starter code for selected embedded sensors and development environments."
    >
      <div className="tool-controls">
        <h3 className="mono" style={{ fontSize: "0.8rem", color: "var(--pixel-gold)" }}>CONFIGURATION</h3>

        <div className="tool-input">
          <label htmlFor="sensor">Sensor</label>
          <select id="sensor" name="sensor" value={selection.sensor} onChange={handleChange}>
            <optgroup label="Sensors">
              <option value="bme280">BME280 (Temp/Hum/Pres)</option>
              <option value="mpu6050">MPU6050 (Accel/Gyro)</option>
              <option value="hcsr04">HC-SR04 (Ultrasonic)</option>
              <option value="irsensor">IR Obstacle (Digital)</option>
              <option value="dht11">DHT11 (Temp/Hum)</option>
              <option value="dht22">DHT22 (Temp/Hum)</option>
              <option value="mq2">MQ-2 (Smoke/Gas)</option>
              <option value="pir">HC-SR501 (PIR Motion)</option>
            </optgroup>
            <optgroup label="ESP32 Communication">
              <option value="espnow-sender">ESP-NOW (Sender)</option>
              <option value="espnow-receiver">ESP-NOW (Receiver)</option>
              <option value="uart-comm">UART / Serial2</option>
            </optgroup>
            <optgroup label="ESP32-S3 Specifics">
              <option value="esp32s3-usb-cdc">Native USB CDC</option>
              <option value="esp32s3-camera">OV2640 Camera</option>
            </optgroup>
          </select>
        </div>
        
        <div className="tool-input">
          <label htmlFor="environment">Target Environment</label>
          <select id="environment" name="environment" value={selection.environment} onChange={handleChange}>
            {getAvailableEnvironments(selection.sensor).map((env: any) => (
              <option key={env} value={env}>
                {SENSOR_CONFIGURATIONS.find(c => c.environment === env)?.environmentLabel || env}
              </option>
            ))}
          </select>
        </div>

        <div className="tool-input">
          <label htmlFor="protocol">Protocol</label>
          <select id="protocol" name="protocol" value={selection.protocol} onChange={handleChange}>
            {getAvailableProtocols(selection.sensor, selection.environment).map((proto: any) => (
              <option key={proto} value={proto}>
                {SENSOR_CONFIGURATIONS.find(c => c.protocol === proto)?.protocolLabel || proto}
              </option>
            ))}
          </select>
        </div>

        {activeSchema && activeSchema.length > 0 ? (
          <>
            <h3 className="mono" style={{ fontSize: "0.8rem", color: "var(--pixel-gold)", margin: "16px 0 4px" }}>
              WIRING
            </h3>
            {activeSchema.map((field) => (
              <div className="tool-input" key={field.key}>
                <label htmlFor={field.key}>
                  {field.label}
                  {field.type === "select" ? (
                    <select
                      id={field.key}
                      value={String(activeParams[field.key] ?? field.default)}
                      onChange={(e) => handleParamChange(field.key, e.target.value, field.type)}
                    >
                      {field.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={field.key}
                      type="number"
                      value={String(activeParams[field.key] ?? field.default)}
                      onChange={(e) => handleParamChange(field.key, e.target.value, field.type)}
                    />
                  )}
                </label>
              </div>
            ))}
          </>
        ) : null}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }} aria-live="polite">
        {!result.ok ? (
          <div className="tool-result-card">
             <span className="hud-card-label mono" style={{ color: "var(--tool-error)" }}>ERROR</span>
             <div className="metric-value mono" style={{ fontSize: "1.5rem" }}>{result.error}</div>
             <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>This sensor configuration is not currently supported.</p>
          </div>
        ) : (
          <>
            <TerminalCodeBlock code={result.code} label={result.filename || "main.cpp"} />
            
            <div className="tool-result-card" style={{ padding: "16px", background: "rgba(85, 213, 216, 0.05)", borderColor: "#202844" }}>
              <span className="mono" style={{ color: "var(--pixel-cyan)", fontSize: "0.75rem" }}>NOTES</span>
              <ul style={{ margin: "8px 0 0", paddingLeft: "20px", fontSize: "0.85rem", color: "var(--muted)" }}>
                {result.notes.map((note: string, i: number) => (
                  <li key={i}>{note}</li>
                ))}
              </ul>
              {result.dependencies.length > 0 && (
                <>
                  <span className="mono" style={{ display: "block", color: "var(--pixel-gold)", fontSize: "0.75rem", marginTop: "16px" }}>DEPENDENCIES</span>
                  <ul style={{ margin: "8px 0 0", paddingLeft: "20px", fontSize: "0.85rem", color: "var(--muted)" }}>
                    {result.dependencies.map((dep: any, i: number) => (
                      <li key={i}>{dep.name} <code style={{ fontSize: "0.8em" }}>{dep.version}</code></li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </ToolShell>
  );
}
