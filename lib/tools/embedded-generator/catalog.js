import {
  SENSOR_CONFIGURATIONS,
  SENSOR_PARAM_SCHEMAS,
  generateSensorCode
} from "../sensor-templates.js";
import { EXPANDED_EMBEDDED_CONFIGURATIONS } from "./templates.js";

export const EMBEDDED_FAMILIES = Object.freeze([
  Object.freeze({ id: "sensor", label: "Sensors", summary: "Read physical measurements from real devices." }),
  Object.freeze({ id: "communication", label: "Communication", summary: "Move data between boards, services, and apps." }),
  Object.freeze({ id: "interface", label: "Board interfaces", summary: "Bring up buses, cameras, USB, and peripheral links." })
]);

const targetRecords = [
  ["bme280", "sensor", "BME280", "Temperature, humidity, and pressure", ["i2c"]],
  ["mpu6050", "sensor", "MPU6050", "Acceleration and angular velocity", ["i2c"]],
  ["hcsr04", "sensor", "HC-SR04", "Ultrasonic distance", ["gpio"]],
  ["irsensor", "sensor", "IR obstacle sensor", "Digital obstacle presence", ["gpio"]],
  ["dht11", "sensor", "DHT11", "Basic temperature and humidity", ["gpio"]],
  ["dht22", "sensor", "DHT22", "Improved temperature and humidity", ["gpio"]],
  ["mq2", "sensor", "MQ-2", "Smoke and combustible gas response", ["adc"]],
  ["pir", "sensor", "HC-SR501 PIR", "Motion detection", ["gpio"]],
  ["bmp280", "sensor", "BMP280", "Temperature and barometric pressure", ["i2c"]],
  ["ds18b20", "sensor", "DS18B20", "Digital temperature on a OneWire bus", ["onewire"]],
  ["bh1750", "sensor", "BH1750", "Ambient light in lux", ["i2c"]],
  ["vl53l0x", "sensor", "VL53L0X", "Time-of-flight distance", ["i2c"]],
  ["ads1115", "sensor", "ADS1115", "16-bit external analog conversion", ["i2c"]],
  ["hx711", "sensor", "HX711 + load cell", "Weight and force measurement", ["gpio"]],
  ["soil-moisture", "sensor", "Capacitive soil moisture", "Calibrated analog moisture level", ["adc"]],
  ["espnow-sender", "communication", "ESP-NOW sender", "Low-latency ESP32 peer messages", ["wifi"]],
  ["espnow-receiver", "communication", "ESP-NOW receiver", "Receive ESP32 peer messages", ["wifi"]],
  ["uart-comm", "communication", "UART link", "Board-to-board serial communication", ["uart"]],
  ["http-client", "communication", "HTTP client", "Send or fetch web API data", ["http"]],
  ["http-server", "communication", "HTTP server", "Expose a local device endpoint", ["http"]],
  ["mqtt-publisher", "communication", "MQTT publisher", "Publish device telemetry", ["mqtt"]],
  ["mqtt-subscriber", "communication", "MQTT subscriber", "Receive device commands", ["mqtt"]],
  ["ble-server", "communication", "BLE GATT server", "Advertise readable or notifiable data", ["ble"]],
  ["ble-client", "communication", "BLE GATT client", "Scan and connect to peripherals", ["ble"]],
  ["esp32s3-usb-cdc", "interface", "ESP32-S3 USB CDC", "Native USB serial bring-up", ["usb"]],
  ["esp32s3-camera", "interface", "OV2640 camera", "ESP32-S3 camera capture", ["i2s"]],
  ["i2c-scanner", "interface", "I2C bus scanner", "Discover device addresses", ["i2c"]],
  ["spi-transfer", "interface", "SPI transfer", "Full-duplex peripheral exchange", ["spi"]]
];

export const EMBEDDED_TARGETS = Object.freeze(targetRecords.map(([id, family, label, summary, protocols]) =>
  Object.freeze({ id, family, label, summary, protocols: Object.freeze(protocols) })
));

export const EMBEDDED_EXAMPLES = Object.freeze([
  ["weather-station", "sensor", "bme280", "Weather station", "Read temperature, humidity, and pressure together", { i2cAddress: "0x76" }],
  ["tank-distance", "sensor", "vl53l0x", "Tank distance", "Measure short-range distance without an ultrasonic echo", {}],
  ["load-cell-scale", "sensor", "hx711", "Load-cell scale", "Start a calibrated weight measurement", { dataPin: 19, clockPin: 18, calibrationFactor: -7050 }],
  ["light-monitor", "sensor", "bh1750", "Light monitor", "Report ambient illuminance in lux", {}],
  ["plant-moisture", "sensor", "soil-moisture", "Plant moisture", "Calibrate dry and wet soil readings", { adcPin: 34, dryReading: 3000, wetReading: 1300 }],
  ["temperature-bus", "sensor", "ds18b20", "Temperature bus", "Read a waterproof OneWire temperature probe", { dataPin: 4 }],
  ["board-telemetry", "communication", "mqtt-publisher", "Publish telemetry", "Send periodic device state through MQTT", {}],
  ["remote-command", "communication", "mqtt-subscriber", "Receive commands", "Subscribe to a command topic", {}],
  ["local-api", "communication", "http-server", "Local device API", "Expose a JSON health endpoint", {}],
  ["peer-link", "communication", "espnow-sender", "ESP-NOW peer link", "Send a compact message between ESP32 boards", {}],
  ["bus-diagnostics", "interface", "i2c-scanner", "I2C diagnostics", "Find addresses during hardware bring-up", {}],
  ["spi-bring-up", "interface", "spi-transfer", "SPI bring-up", "Verify chip-select and transfer wiring", { csPin: 5 }]
].map(([id, family, target, title, summary, params]) => Object.freeze({ id, family, target, title, summary, params: Object.freeze(params) })));

export const EMBEDDED_PARAM_SCHEMAS = Object.freeze({
  ...SENSOR_PARAM_SCHEMAS,
  bmp280: SENSOR_PARAM_SCHEMAS.bme280,
  ds18b20: [{ key: "dataPin", label: "Data pin (GPIO)", type: "number", default: 4 }],
  hx711: [
    { key: "dataPin", label: "Data pin (GPIO)", type: "number", default: 19 },
    { key: "clockPin", label: "Clock pin (GPIO)", type: "number", default: 18 },
    { key: "calibrationFactor", label: "Calibration factor", type: "number", default: -7050 }
  ],
  "soil-moisture": [
    { key: "adcPin", label: "ADC pin", type: "number", default: 34 },
    { key: "dryReading", label: "Dry calibration reading", type: "number", default: 3000 },
    { key: "wetReading", label: "Wet calibration reading", type: "number", default: 1300 }
  ],
  "spi-transfer": [{ key: "csPin", label: "Chip-select pin", type: "number", default: 5 }]
});

const familyByTarget = new Map(EMBEDDED_TARGETS.map(({ id, family }) => [id, family]));
const wiringByProtocol = Object.freeze({
  i2c: ["Connect SDA and SCL to the board I2C pins.", "Connect a common ground and use the module's supported supply voltage."],
  gpio: ["Connect signal pins exactly as configured and share ground."],
  adc: ["Connect the analog output to an ADC-capable pin and share ground."],
  onewire: ["Connect DATA to the configured GPIO with the required pull-up resistor."],
  wifi: ["No signal wires are required; both devices need compatible 2.4 GHz radio settings."],
  http: ["No peripheral wiring is required beyond board power and network connectivity."],
  mqtt: ["No peripheral wiring is required beyond board power and network connectivity."],
  ble: ["No peripheral wiring is required beyond board power and BLE radio availability."],
  uart: ["Cross TX to RX, RX to TX, and connect grounds."],
  usb: ["Use the board's native USB connector and a data-capable cable."],
  i2s: ["Camera data and clock pins must match the board module pinout."],
  spi: ["Connect SCK, MOSI, MISO, CS, power, and a common ground." ]
});

const legacyConfigurations = SENSOR_CONFIGURATIONS.map((config) => Object.freeze({
  ...config,
  target: config.sensor,
  label: config.sensorLabel,
  family: familyByTarget.get(config.sensor)
}));

export const EMBEDDED_CONFIGURATIONS = Object.freeze([
  ...legacyConfigurations,
  ...EXPANDED_EMBEDDED_CONFIGURATIONS.map((config) => Object.freeze({
    ...config,
    family: familyByTarget.get(config.target)
  }))
]);

export function generateEmbeddedCode(selection, params = {}) {
  const target = selection.target ?? selection.sensor;
  const metadata = EMBEDDED_TARGETS.find(({ id }) => id === target);
  if (!metadata || (selection.family && selection.family !== metadata.family)) {
    return { ok: false, error: "UNSUPPORTED_CONFIGURATION", code: "", filename: null, dependencies: [], notes: [], wiring: [] };
  }

  const expanded = EXPANDED_EMBEDDED_CONFIGURATIONS.find((config) =>
    config.target === target
    && config.environment === selection.environment
    && config.protocol === selection.protocol
  );

  const result = expanded
    ? {
        ok: true,
        code: expanded.generate(params),
        filename: expanded.filename,
        language: expanded.language,
        dependencies: expanded.dependencies,
        notes: expanded.notes
      }
    : generateSensorCode({ sensor: target, environment: selection.environment, protocol: selection.protocol }, params);

  return {
    ...result,
    wiring: result.ok ? [...(wiringByProtocol[selection.protocol] ?? ["Check the selected board and module documentation before wiring."])] : []
  };
}
