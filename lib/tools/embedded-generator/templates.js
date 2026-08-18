const asPin = (value, fallback) => Number.isInteger(value) ? value : fallback;

function record({ target, label, protocol, filename, dependencies = [], notes, generate }) {
  return Object.freeze({
    id: `${target}-arduino-${protocol}`,
    target,
    label,
    environment: "arduino",
    environmentLabel: "Arduino IDE / ESP32",
    protocol,
    protocolLabel: protocol.toUpperCase(),
    language: "cpp",
    filename,
    dependencies: Object.freeze(dependencies),
    notes: Object.freeze(notes),
    generate
  });
}

export const EXPANDED_EMBEDDED_CONFIGURATIONS = Object.freeze([
  record({
    target: "bmp280", label: "BMP280 pressure sensor", protocol: "i2c", filename: "bmp280_example.ino",
    dependencies: [{ name: "Adafruit BMP280 Library", version: "^2.6.8" }],
    notes: ["The common I2C addresses are 0x76 and 0x77.", "Use 3.3V logic with ESP32 boards."],
    generate: (params = {}) => {
      const address = params.i2cAddress === "0x77" ? "0x77" : "0x76";
      return `#include <Wire.h>\n#include <Adafruit_BMP280.h>\n\nAdafruit_BMP280 bmp;\n\nvoid setup() {\n  Serial.begin(115200);\n  Wire.begin();\n  if (!bmp.begin(${address})) {\n    Serial.println("BMP280 not found; check wiring and address");\n    while (true) delay(10);\n  }\n}\n\nvoid loop() {\n  Serial.print("Temperature C: "); Serial.println(bmp.readTemperature());\n  Serial.print("Pressure hPa: "); Serial.println(bmp.readPressure() / 100.0F);\n  delay(1000);\n}\n`;
    }
  }),
  record({
    target: "ds18b20", label: "DS18B20 temperature sensor", protocol: "onewire", filename: "ds18b20_example.ino",
    dependencies: [{ name: "DallasTemperature", version: "^3.11.0" }, { name: "OneWire", version: "^2.3.8" }],
    notes: ["Add a 4.7kΩ pull-up from DATA to VCC.", "Several sensors can share one OneWire bus."],
    generate: (params = {}) => {
      const dataPin = asPin(params.dataPin, 4);
      return `#include <OneWire.h>\n#include <DallasTemperature.h>\n\nconstexpr int ONE_WIRE_PIN = ${dataPin};\nOneWire oneWire(ONE_WIRE_PIN);\nDallasTemperature sensors(&oneWire);\n\nvoid setup() {\n  Serial.begin(115200);\n  sensors.begin();\n}\n\nvoid loop() {\n  sensors.requestTemperatures();\n  Serial.print("Temperature C: ");\n  Serial.println(sensors.getTempCByIndex(0));\n  delay(1000);\n}\n`;
    }
  }),
  record({
    target: "bh1750", label: "BH1750 light sensor", protocol: "i2c", filename: "bh1750_example.ino",
    dependencies: [{ name: "BH1750", version: "^1.3.0" }],
    notes: ["Default address is normally 0x23.", "Keep the sensor window clear of shadows from the enclosure."],
    generate: () => `#include <Wire.h>\n#include <BH1750.h>\n\nBH1750 lightMeter;\n\nvoid setup() {\n  Serial.begin(115200);\n  Wire.begin();\n  if (!lightMeter.begin()) {\n    Serial.println("BH1750 not found");\n    while (true) delay(10);\n  }\n}\n\nvoid loop() {\n  Serial.print("Light lx: ");\n  Serial.println(lightMeter.readLightLevel());\n  delay(500);\n}\n`
  }),
  record({
    target: "vl53l0x", label: "VL53L0X time-of-flight sensor", protocol: "i2c", filename: "vl53l0x_example.ino",
    dependencies: [{ name: "Adafruit VL53L0X", version: "^1.2.4" }],
    notes: ["The default address is 0x29.", "Use the XSHUT pin when assigning unique addresses to multiple sensors."],
    generate: () => `#include <Wire.h>\n#include <Adafruit_VL53L0X.h>\n\nAdafruit_VL53L0X tof;\n\nvoid setup() {\n  Serial.begin(115200);\n  Wire.begin();\n  if (!tof.begin()) {\n    Serial.println("VL53L0X not found");\n    while (true) delay(10);\n  }\n}\n\nvoid loop() {\n  VL53L0X_RangingMeasurementData_t measure;\n  tof.rangingTest(&measure, false);\n  if (measure.RangeStatus != 4) Serial.println(measure.RangeMilliMeter);\n  else Serial.println("Out of range");\n  delay(200);\n}\n`
  }),
  record({
    target: "ads1115", label: "ADS1115 precision ADC", protocol: "i2c", filename: "ads1115_example.ino",
    dependencies: [{ name: "Adafruit ADS1X15", version: "^2.5.0" }],
    notes: ["The default address is 0x48.", "The input must remain inside the configured gain range."],
    generate: () => `#include <Wire.h>\n#include <Adafruit_ADS1X15.h>\n\nAdafruit_ADS1115 ads;\n\nvoid setup() {\n  Serial.begin(115200);\n  if (!ads.begin()) {\n    Serial.println("ADS1115 not found");\n    while (true) delay(10);\n  }\n  ads.setGain(GAIN_ONE);\n}\n\nvoid loop() {\n  int16_t raw = ads.readADC_SingleEnded(0);\n  Serial.print("A0 raw: "); Serial.println(raw);\n  delay(500);\n}\n`
  }),
  record({
    target: "hx711", label: "HX711 load-cell amplifier", protocol: "gpio", filename: "hx711_scale.ino",
    dependencies: [{ name: "HX711 Arduino Library", version: "^0.7.5" }],
    notes: ["Calibrate with a known mass before trusting measurements.", "Keep load-cell wiring away from motors and switching supplies."],
    generate: (params = {}) => {
      const dataPin = asPin(params.dataPin, 19);
      const clockPin = asPin(params.clockPin, 18);
      const calibration = Number.isFinite(params.calibrationFactor) ? params.calibrationFactor : -7050;
      return `#include <HX711.h>\n\nHX711 scale;\nconstexpr int DATA_PIN = ${dataPin};\nconstexpr int CLOCK_PIN = ${clockPin};\n\nvoid setup() {\n  Serial.begin(115200);\n  scale.begin(DATA_PIN, CLOCK_PIN);\n  scale.set_scale(${calibration});\n  scale.tare();\n}\n\nvoid loop() {\n  if (scale.is_ready()) Serial.println(scale.get_units(10));\n  else Serial.println("HX711 not ready");\n  delay(500);\n}\n`;
    }
  }),
  record({
    target: "soil-moisture", label: "Capacitive soil-moisture sensor", protocol: "adc", filename: "soil_moisture.ino",
    notes: ["Calibrate dry and wet readings for the exact sensor and soil.", "Do not feed a voltage above the board ADC limit."],
    generate: (params = {}) => {
      const adcPin = asPin(params.adcPin, 34);
      const dry = asPin(params.dryReading, 3000);
      const wet = asPin(params.wetReading, 1300);
      return `constexpr int SENSOR_PIN = ${adcPin};\nconstexpr int DRY_READING = ${dry};\nconstexpr int WET_READING = ${wet};\n\nvoid setup() {\n  Serial.begin(115200);\n}\n\nvoid loop() {\n  int raw = analogRead(SENSOR_PIN);\n  int percent = constrain(map(raw, DRY_READING, WET_READING, 0, 100), 0, 100);\n  Serial.printf("Moisture: %d%% (raw %d)\\n", percent, raw);\n  delay(1000);\n}\n`;
    }
  }),
  record({
    target: "http-client", label: "ESP32 HTTP client", protocol: "http", filename: "http_client.ino",
    notes: ["Replace the Wi-Fi and URL placeholders before uploading.", "Use TLS and certificate validation for production endpoints."],
    generate: () => `#include <WiFi.h>\n#include <HTTPClient.h>\n\nconst char* WIFI_SSID = "YOUR_WIFI_SSID";\nconst char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";\nconst char* API_URL = "https://example.com/api/telemetry";\n\nvoid setup() {\n  Serial.begin(115200);\n  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);\n  while (WiFi.status() != WL_CONNECTED) delay(250);\n}\n\nvoid loop() {\n  if (WiFi.status() == WL_CONNECTED) {\n    HTTPClient http;\n    http.begin(API_URL);\n    int status = http.GET();\n    Serial.printf("HTTP status: %d\\n", status);\n    if (status > 0) Serial.println(http.getString());\n    http.end();\n  }\n  delay(10000);\n}\n`
  }),
  record({
    target: "http-server", label: "ESP32 HTTP server", protocol: "http", filename: "http_server.ino",
    notes: ["Replace the Wi-Fi placeholders before uploading.", "This starter is a local-network example; add authentication before exposing controls."],
    generate: () => `#include <WiFi.h>\n#include <WebServer.h>\n\nconst char* WIFI_SSID = "YOUR_WIFI_SSID";\nconst char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";\nWebServer server(80);\n\nvoid setup() {\n  Serial.begin(115200);\n  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);\n  while (WiFi.status() != WL_CONNECTED) delay(250);\n  server.on("/", []() { server.send(200, "application/json", "{\\"status\\":\\"ok\\"}"); });\n  server.begin();\n}\n\nvoid loop() {\n  server.handleClient();\n}\n`
  }),
  record({
    target: "mqtt-publisher", label: "MQTT publisher", protocol: "mqtt", filename: "mqtt_publisher.ino",
    dependencies: [{ name: "PubSubClient", version: "^2.8" }],
    notes: ["Replace broker and Wi-Fi placeholders.", "Use a unique client ID and authenticated TLS broker in production."],
    generate: () => mqttCode("publish")
  }),
  record({
    target: "mqtt-subscriber", label: "MQTT subscriber", protocol: "mqtt", filename: "mqtt_subscriber.ino",
    dependencies: [{ name: "PubSubClient", version: "^2.8" }],
    notes: ["Replace broker and Wi-Fi placeholders.", "Treat incoming payloads as untrusted input before controlling hardware."],
    generate: () => mqttCode("subscribe")
  }),
  record({
    target: "ble-server", label: "BLE GATT server", protocol: "ble", filename: "ble_server.ino",
    dependencies: [{ name: "NimBLE-Arduino", version: "^2.3.7" }],
    notes: ["Use your own service and characteristic UUIDs for a product.", "Advertising consumes power; tune the interval for battery devices."],
    generate: () => `#include <NimBLEDevice.h>\n\n#define SERVICE_UUID "12345678-1234-1234-1234-1234567890ab"\n#define CHARACTERISTIC_UUID "12345678-1234-1234-1234-1234567890ac"\n\nvoid setup() {\n  NimBLEDevice::init("ESP32 Sensor");\n  NimBLEServer* server = NimBLEDevice::createServer();\n  NimBLEService* service = server->createService(SERVICE_UUID);\n  NimBLECharacteristic* value = service->createCharacteristic(CHARACTERISTIC_UUID, NIMBLE_PROPERTY::READ | NIMBLE_PROPERTY::NOTIFY);\n  value->setValue("ready");\n  service->start();\n  NimBLEDevice::getAdvertising()->addServiceUUID(SERVICE_UUID);\n  NimBLEDevice::startAdvertising();\n}\n\nvoid loop() { delay(1000); }\n`
  }),
  record({
    target: "ble-client", label: "BLE GATT client", protocol: "ble", filename: "ble_client.ino",
    dependencies: [{ name: "NimBLE-Arduino", version: "^2.3.7" }],
    notes: ["Replace the service UUID with the peripheral's UUID.", "Scanning continuously consumes significant power."],
    generate: () => `#include <NimBLEDevice.h>\n\n#define SERVICE_UUID "12345678-1234-1234-1234-1234567890ab"\n\nvoid setup() {\n  Serial.begin(115200);\n  NimBLEDevice::init("");\n  NimBLEScan* scan = NimBLEDevice::getScan();\n  scan->setActiveScan(true);\n  NimBLEScanResults results = scan->getResults(5 * 1000);\n  Serial.printf("Found %d BLE devices\\n", results.getCount());\n}\n\nvoid loop() { delay(5000); }\n`
  }),
  record({
    target: "i2c-scanner", label: "I2C bus scanner", protocol: "i2c", filename: "i2c_scanner.ino",
    notes: ["Default ESP32 pins are SDA 21 and SCL 22 on many boards.", "A discovered address identifies a device, not its exact model."],
    generate: () => `#include <Wire.h>\n\nvoid setup() {\n  Serial.begin(115200);\n  Wire.begin();\n}\n\nvoid loop() {\n  int found = 0;\n  for (uint8_t address = 1; address < 127; address++) {\n    Wire.beginTransmission(address);\n    if (Wire.endTransmission() == 0) {\n      Serial.printf("Found I2C device at 0x%02X\\n", address);\n      found++;\n    }\n  }\n  if (!found) Serial.println("No I2C devices found");\n  delay(5000);\n}\n`
  }),
  record({
    target: "spi-transfer", label: "SPI full-duplex transfer", protocol: "spi", filename: "spi_transfer.ino",
    notes: ["Confirm SCK, MOSI, MISO, and CS pins for your board.", "Match SPI mode and clock limit to the peripheral datasheet."],
    generate: (params = {}) => {
      const csPin = asPin(params.csPin, 5);
      return `#include <SPI.h>\n\nconstexpr int CS_PIN = ${csPin};\n\nvoid setup() {\n  Serial.begin(115200);\n  pinMode(CS_PIN, OUTPUT);\n  digitalWrite(CS_PIN, HIGH);\n  SPI.begin();\n}\n\nvoid loop() {\n  SPI.beginTransaction(SPISettings(1000000, MSBFIRST, SPI_MODE0));\n  digitalWrite(CS_PIN, LOW);\n  uint8_t response = SPI.transfer(0x00);\n  digitalWrite(CS_PIN, HIGH);\n  SPI.endTransaction();\n  Serial.printf("SPI response: 0x%02X\\n", response);\n  delay(1000);\n}\n`;
    }
  })
]);

function mqttCode(mode) {
  const action = mode === "publish"
    ? `client.publish("workbench/telemetry", "{\\"temperature\\":24.5}");`
    : `client.subscribe("workbench/commands");`;
  return `#include <WiFi.h>\n#include <PubSubClient.h>\n\nconst char* WIFI_SSID = "YOUR_WIFI_SSID";\nconst char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";\nconst char* MQTT_BROKER = "YOUR_MQTT_BROKER";\nWiFiClient network;\nPubSubClient client(network);\n\nvoid connectMqtt() {\n  while (!client.connected()) {\n    if (client.connect("esp32-workbench")) { ${action} }\n    else delay(1000);\n  }\n}\n\nvoid setup() {\n  Serial.begin(115200);\n  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);\n  while (WiFi.status() != WL_CONNECTED) delay(250);\n  client.setServer(MQTT_BROKER, 1883);\n}\n\nvoid loop() {\n  if (!client.connected()) connectMqtt();\n  client.loop();\n  ${mode === "publish" ? "static unsigned long last = 0; if (millis() - last > 5000) { client.publish(\"workbench/telemetry\", \"online\"); last = millis(); }" : "delay(10);"}\n}\n`;
}
