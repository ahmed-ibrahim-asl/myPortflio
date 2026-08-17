import { test } from 'node:test';
import assert from 'node:assert';
import { generateSensorCode, SENSOR_CONFIGURATIONS } from '../../lib/tools/sensor-templates.js';

test('Sensor Generator - Every registry ID is unique', () => {
  const ids = SENSOR_CONFIGURATIONS.map(c => c.id);
  const uniqueIds = new Set(ids);
  assert.strictEqual(ids.length, uniqueIds.size);
});

test('Sensor Generator - Unsupported configurations return typed error', () => {
  const result = generateSensorCode({
    sensor: "hcsr04",
    environment: "esp-idf", // Does not exist
    protocol: "i2c"
  });
  
  assert.strictEqual(result.ok, false);
  assert.strictEqual(result.error, "UNSUPPORTED_CONFIGURATION");
  assert.strictEqual(result.code, "");
});

test('Sensor Generator - BME280 Arduino output includes Wire.begin and address 0x76', () => {
  const result = generateSensorCode({
    sensor: "bme280",
    environment: "arduino",
    protocol: "i2c"
  });
  
  assert.strictEqual(result.ok, true);
  assert.ok(result.code.includes("Wire.begin()"));
  assert.ok(result.code.includes("0x76"));
});

test('Sensor Generator - Generated code ends with newline and is not empty', () => {
  const result = generateSensorCode({
    sensor: "mpu6050",
    environment: "platformio",
    protocol: "i2c"
  });

  assert.strictEqual(result.ok, true);
  assert.ok(result.code.length > 0);
  assert.strictEqual(result.code.endsWith('\n'), true);
});

test('Sensor Generator - BME280 defaults to 0x76 and offers 0x77 as the fallback message', () => {
  const result = generateSensorCode({ sensor: "bme280", environment: "arduino", protocol: "i2c" }, {});
  assert.ok(result.code.includes("bme.begin(0x76)"));
  assert.ok(result.code.includes("try 0x77"));
});

test('Sensor Generator - BME280 honors a custom I2C address on both Arduino and PlatformIO variants', () => {
  const arduino = generateSensorCode(
    { sensor: "bme280", environment: "arduino", protocol: "i2c" },
    { i2cAddress: "0x77" }
  );
  const platformio = generateSensorCode(
    { sensor: "bme280", environment: "platformio", protocol: "i2c" },
    { i2cAddress: "0x77" }
  );
  assert.ok(arduino.code.includes("bme.begin(0x77)"));
  assert.ok(arduino.code.includes("try 0x76"));
  assert.ok(platformio.code.includes("bme.begin(0x77)"));
});

test('Sensor Generator - MPU6050 defaults to 0x68 and honors a custom address', () => {
  const defaultResult = generateSensorCode({ sensor: "mpu6050", environment: "arduino", protocol: "i2c" }, {});
  const customResult = generateSensorCode(
    { sensor: "mpu6050", environment: "arduino", protocol: "i2c" },
    { i2cAddress: "0x69" }
  );
  assert.ok(defaultResult.code.includes("mpu.begin(0x68)"));
  assert.ok(customResult.code.includes("mpu.begin(0x69)"));
});

test('Sensor Generator - HC-SR04 defaults match the original hardcoded pins on both environments', () => {
  const arduino = generateSensorCode({ sensor: "hcsr04", environment: "arduino", protocol: "gpio" }, {});
  const platformio = generateSensorCode({ sensor: "hcsr04", environment: "platformio", protocol: "gpio" }, {});
  assert.ok(arduino.code.includes("const int trigPin = 5;"));
  assert.ok(arduino.code.includes("const int echoPin = 18;"));
  assert.ok(platformio.code.includes("const int trigPin = 5;"));
  assert.ok(platformio.code.includes("const int echoPin = 18;"));
});

test('Sensor Generator - HC-SR04 honors custom trigger and echo pins', () => {
  const result = generateSensorCode(
    { sensor: "hcsr04", environment: "arduino", protocol: "gpio" },
    { trigPin: 25, echoPin: 26 }
  );
  assert.ok(result.code.includes("const int trigPin = 25;"));
  assert.ok(result.code.includes("const int echoPin = 26;"));
});

test('Sensor Generator - DHT11 defaults to a 1s poll interval and pin 4, honors a custom pin', () => {
  const defaultResult = generateSensorCode({ sensor: "dht11", environment: "arduino", protocol: "gpio" }, {});
  const customResult = generateSensorCode(
    { sensor: "dht11", environment: "arduino", protocol: "gpio" },
    { dataPin: 14 }
  );
  assert.ok(defaultResult.code.includes("#define DHTPIN 4"));
  assert.ok(defaultResult.code.includes("delay(1000);"));
  assert.ok(customResult.code.includes("#define DHTPIN 14"));
});

test('Sensor Generator - DHT22 keeps its 2s poll interval by default and honors a custom pin', () => {
  const defaultResult = generateSensorCode({ sensor: "dht22", environment: "arduino", protocol: "gpio" }, {});
  const customResult = generateSensorCode(
    { sensor: "dht22", environment: "platformio", protocol: "gpio" },
    { dataPin: 15 }
  );
  assert.ok(defaultResult.code.includes("#define DHTPIN 4"));
  assert.ok(defaultResult.code.includes("delay(2000);"));
  assert.ok(customResult.code.includes("#define DHTPIN 15"));
});

test('Sensor Generator - PIR defaults to pin 13 and honors a custom pin', () => {
  const defaultResult = generateSensorCode({ sensor: "pir", environment: "arduino", protocol: "gpio" }, {});
  const customResult = generateSensorCode(
    { sensor: "pir", environment: "arduino", protocol: "gpio" },
    { pirPin: 27 }
  );
  assert.ok(defaultResult.code.includes("const int pirPin = 13;"));
  assert.ok(customResult.code.includes("const int pirPin = 27;"));
});

test('Sensor Generator - non-numeric pin params fall back to the documented default instead of injecting garbage', () => {
  const result = generateSensorCode(
    { sensor: "hcsr04", environment: "arduino", protocol: "gpio" },
    { trigPin: "not-a-number", echoPin: null }
  );
  assert.ok(result.code.includes("const int trigPin = 5;"));
  assert.ok(result.code.includes("const int echoPin = 18;"));
});
