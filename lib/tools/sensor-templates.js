export const SENSOR_CONFIGURATIONS = [
  {
    id: "bme280-arduino-i2c",
    sensor: "bme280",
    sensorLabel: "BME280",
    environment: "arduino",
    environmentLabel: "Arduino IDE",
    protocol: "i2c",
    protocolLabel: "I²C",
    language: "cpp",
    filename: "bme280_example.ino",
    dependencies: [
      { name: "Adafruit BME280 Library", version: "tested-version" },
      { name: "Adafruit Unified Sensor", version: "tested-version" }
    ],
    notes: [
      "Default address is 0x76.",
      "Try 0x77 when the address pin is configured high."
    ],
    generate: (params = {}) => {
      const address = params.i2cAddress === "0x77" ? "0x77" : "0x76";
      const altAddress = address === "0x76" ? "0x77" : "0x76";
      return `#include <Wire.h>\n#include <Adafruit_Sensor.h>\n#include <Adafruit_BME280.h>\n\nAdafruit_BME280 bme;\n\nvoid setup() {\n  Serial.begin(115200);\n  Wire.begin();\n  if (!bme.begin(${address})) {\n    Serial.println(F("Sensor not found, check wiring or try ${altAddress}"));\n    while (1);\n  }\n}\n\nvoid loop() {\n  float t = bme.readTemperature();\n  float h = bme.readHumidity();\n  float p = bme.readPressure() / 100.0F;\n\n  Serial.print(F("Temp: ")); Serial.print(t); Serial.println(F(" *C"));\n  Serial.print(F("Hum: ")); Serial.print(h); Serial.println(F(" %"));\n  Serial.print(F("Pres: ")); Serial.print(p); Serial.println(F(" hPa"));\n\n  delay(2000);\n}\n`;
    }
  },
  {
    id: "bme280-platformio-i2c",
    sensor: "bme280",
    sensorLabel: "BME280",
    environment: "platformio",
    environmentLabel: "PlatformIO / Arduino",
    protocol: "i2c",
    protocolLabel: "I²C",
    language: "cpp",
    filename: "main.cpp",
    dependencies: [
      { name: "adafruit/Adafruit BME280 Library", version: "^2.2.2" },
      { name: "adafruit/Adafruit Unified Sensor", version: "^1.1.9" }
    ],
    notes: [
      "Ensure platformio.ini contains lib_deps = adafruit/Adafruit BME280 Library"
    ],
    generate: (params = {}) => {
      const address = params.i2cAddress === "0x77" ? "0x77" : "0x76";
      const altAddress = address === "0x76" ? "0x77" : "0x76";
      return `#include <Arduino.h>\n#include <Wire.h>\n#include <Adafruit_Sensor.h>\n#include <Adafruit_BME280.h>\n\nAdafruit_BME280 bme;\n\nvoid setup() {\n  Serial.begin(115200);\n  Wire.begin();\n  if (!bme.begin(${address})) {\n    Serial.println(F("Sensor not found, check wiring or try ${altAddress}"));\n    while (1);\n  }\n}\n\nvoid loop() {\n  float t = bme.readTemperature();\n  float h = bme.readHumidity();\n  float p = bme.readPressure() / 100.0F;\n\n  Serial.print(F("Temp: ")); Serial.print(t); Serial.println(F(" *C"));\n  Serial.print(F("Hum: ")); Serial.print(h); Serial.println(F(" %"));\n  Serial.print(F("Pres: ")); Serial.print(p); Serial.println(F(" hPa"));\n\n  delay(2000);\n}\n`;
    }
  },
  {
    id: "bme280-espidf-i2c",
    sensor: "bme280",
    sensorLabel: "BME280",
    environment: "esp-idf",
    environmentLabel: "ESP-IDF",
    protocol: "i2c",
    protocolLabel: "I²C",
    language: "c",
    filename: "main.c",
    dependencies: [
      { name: "esp-idf", version: "v5.0+" },
      { name: "bme280", version: "idf-component" }
    ],
    notes: [
      "Assumes usage of standard ESP-IDF i2c master driver."
    ],
    generate: () => `#include <stdio.h>\n#include "freertos/FreeRTOS.h"\n#include "freertos/task.h"\n#include "driver/i2c.h"\n\n#define I2C_MASTER_SCL_IO           22\n#define I2C_MASTER_SDA_IO           21\n#define I2C_MASTER_NUM              0\n#define I2C_MASTER_FREQ_HZ          100000\n\nstatic esp_err_t i2c_master_init(void)\n{\n    int i2c_master_port = I2C_MASTER_NUM;\n    i2c_config_t conf = {\n        .mode = I2C_MODE_MASTER,\n        .sda_io_num = I2C_MASTER_SDA_IO,\n        .scl_io_num = I2C_MASTER_SCL_IO,\n        .sda_pullup_en = GPIO_PULLUP_ENABLE,\n        .scl_pullup_en = GPIO_PULLUP_ENABLE,\n        .master.clk_speed = I2C_MASTER_FREQ_HZ,\n    };\n    i2c_param_config(i2c_master_port, &conf);\n    return i2c_driver_install(i2c_master_port, conf.mode, 0, 0, 0);\n}\n\nvoid app_main(void)\n{\n    ESP_ERROR_CHECK(i2c_master_init());\n    printf("I2C initialized successfully\\n");\n\n    while (1) {\n        // BME280 read logic\n        vTaskDelay(2000 / portTICK_PERIOD_MS);\n    }\n}\n`
  },
  {
    id: "mpu6050-arduino-i2c",
    sensor: "mpu6050",
    sensorLabel: "MPU6050",
    environment: "arduino",
    environmentLabel: "Arduino IDE",
    protocol: "i2c",
    protocolLabel: "I²C",
    language: "cpp",
    filename: "mpu6050_example.ino",
    dependencies: [
      { name: "Adafruit MPU6050", version: "tested-version" },
      { name: "Adafruit Unified Sensor", version: "tested-version" }
    ],
    notes: [
      "Uses the Adafruit_MPU6050 library. I2C address is usually 0x68 (AD0 low); tie AD0 high for 0x69 to run two on one bus."
    ],
    generate: (params = {}) => {
      const address = params.i2cAddress === "0x69" ? "0x69" : "0x68";
      return `#include <Wire.h>\n#include <Adafruit_MPU6050.h>\n#include <Adafruit_Sensor.h>\n\nAdafruit_MPU6050 mpu;\n\nvoid setup() {\n  Serial.begin(115200);\n  Wire.begin();\n  if (!mpu.begin(${address})) {\n    Serial.println("Failed to find MPU6050 chip");\n    while (1) { delay(10); }\n  }\n  mpu.setAccelerometerRange(MPU6050_RANGE_8_G);\n  mpu.setGyroRange(MPU6050_RANGE_500_DEG);\n}\n\nvoid loop() {\n  sensors_event_t a, g, temp;\n  mpu.getEvent(&a, &g, &temp);\n\n  Serial.print("Accel X: "); Serial.print(a.acceleration.x);\n  Serial.print(", Y: "); Serial.print(a.acceleration.y);\n  Serial.print(", Z: "); Serial.println(a.acceleration.z);\n\n  delay(500);\n}\n`;
    }
  },
  {
    id: "mpu6050-platformio-i2c",
    sensor: "mpu6050",
    sensorLabel: "MPU6050",
    environment: "platformio",
    environmentLabel: "PlatformIO / Arduino",
    protocol: "i2c",
    protocolLabel: "I²C",
    language: "cpp",
    filename: "main.cpp",
    dependencies: [
      { name: "adafruit/Adafruit MPU6050", version: "^2.2.4" }
    ],
    notes: [
      "Uses the Adafruit_MPU6050 library. I2C address is usually 0x68 (AD0 low); tie AD0 high for 0x69 to run two on one bus."
    ],
    generate: (params = {}) => {
      const address = params.i2cAddress === "0x69" ? "0x69" : "0x68";
      return `#include <Arduino.h>\n#include <Wire.h>\n#include <Adafruit_MPU6050.h>\n#include <Adafruit_Sensor.h>\n\nAdafruit_MPU6050 mpu;\n\nvoid setup() {\n  Serial.begin(115200);\n  Wire.begin();\n  if (!mpu.begin(${address})) {\n    Serial.println("Failed to find MPU6050 chip");\n    while (1) { delay(10); }\n  }\n  mpu.setAccelerometerRange(MPU6050_RANGE_8_G);\n  mpu.setGyroRange(MPU6050_RANGE_500_DEG);\n}\n\nvoid loop() {\n  sensors_event_t a, g, temp;\n  mpu.getEvent(&a, &g, &temp);\n\n  Serial.print("Accel X: "); Serial.print(a.acceleration.x);\n  Serial.print(", Y: "); Serial.print(a.acceleration.y);\n  Serial.print(", Z: "); Serial.println(a.acceleration.z);\n\n  delay(500);\n}\n`;
    }
  },
  {
    id: "hcsr04-arduino-gpio",
    sensor: "hcsr04",
    sensorLabel: "HC-SR04",
    environment: "arduino",
    environmentLabel: "Arduino IDE",
    protocol: "gpio",
    protocolLabel: "GPIO timing",
    language: "cpp",
    filename: "hcsr04_example.ino",
    dependencies: [],
    notes: [
      "Uses standard GPIO.",
      "5V logic on echo pin requires a voltage divider if connected to 3.3V ESP32!"
    ],
    generate: (params = {}) => {
      const trigPin = Number.isInteger(params.trigPin) ? params.trigPin : 5;
      const echoPin = Number.isInteger(params.echoPin) ? params.echoPin : 18;
      return `const int trigPin = ${trigPin};\nconst int echoPin = ${echoPin};\n\nlong duration;\nint distance;\n\nvoid setup() {\n  Serial.begin(115200);\n  pinMode(trigPin, OUTPUT);\n  pinMode(echoPin, INPUT);\n}\n\nvoid loop() {\n  digitalWrite(trigPin, LOW);\n  delayMicroseconds(2);\n  digitalWrite(trigPin, HIGH);\n  delayMicroseconds(10);\n  digitalWrite(trigPin, LOW);\n\n  duration = pulseIn(echoPin, HIGH);\n  distance = duration * 0.034 / 2;\n\n  Serial.print("Distance: ");\n  Serial.print(distance);\n  Serial.println(" cm");\n\n  delay(100);\n}\n`;
    }
  },
  {
    id: "hcsr04-platformio-gpio",
    sensor: "hcsr04",
    sensorLabel: "HC-SR04",
    environment: "platformio",
    environmentLabel: "PlatformIO / Arduino",
    protocol: "gpio",
    protocolLabel: "GPIO timing",
    language: "cpp",
    filename: "main.cpp",
    dependencies: [],
    notes: [
      "Uses standard GPIO with PlatformIO Arduino framework.",
      "5V logic on echo pin requires a voltage divider if connected to 3.3V ESP32!"
    ],
    generate: (params = {}) => {
      const trigPin = Number.isInteger(params.trigPin) ? params.trigPin : 5;
      const echoPin = Number.isInteger(params.echoPin) ? params.echoPin : 18;
      return `#include <Arduino.h>\n\nconst int trigPin = ${trigPin};\nconst int echoPin = ${echoPin};\n\nlong duration;\nint distance;\n\nvoid setup() {\n  Serial.begin(115200);\n  pinMode(trigPin, OUTPUT);\n  pinMode(echoPin, INPUT);\n}\n\nvoid loop() {\n  digitalWrite(trigPin, LOW);\n  delayMicroseconds(2);\n  digitalWrite(trigPin, HIGH);\n  delayMicroseconds(10);\n  digitalWrite(trigPin, LOW);\n\n  duration = pulseIn(echoPin, HIGH);\n  distance = duration * 0.034 / 2;\n\n  Serial.print("Distance: ");\n  Serial.print(distance);\n  Serial.println(" cm");\n\n  delay(100);\n}\n`;
    }
  },
  {
    id: "irsensor-arduino-gpio",
    sensor: "irsensor",
    sensorLabel: "IR Obstacle",
    environment: "arduino",
    environmentLabel: "Arduino IDE",
    protocol: "gpio",
    protocolLabel: "GPIO Digital",
    language: "cpp",
    filename: "ir_sensor_example.ino",
    dependencies: [],
    notes: [
      "Generic digital IR obstacle avoidance sensor.",
      "Returns LOW when obstacle is detected (active low)."
    ],
    generate: () => `const int irPin = 4;\n\nvoid setup() {\n  Serial.begin(115200);\n  pinMode(irPin, INPUT);\n}\n\nvoid loop() {\n  int state = digitalRead(irPin);\n  if (state == LOW) {\n    Serial.println("Obstacle Detected!");\n  } else {\n    Serial.println("Path Clear");\n  }\n  delay(200);\n}\n`
  },
  {
    id: "irsensor-platformio-gpio",
    sensor: "irsensor",
    sensorLabel: "IR Obstacle",
    environment: "platformio",
    environmentLabel: "PlatformIO / Arduino",
    protocol: "gpio",
    protocolLabel: "GPIO Digital",
    language: "cpp",
    filename: "main.cpp",
    dependencies: [],
    notes: [
      "Generic digital IR obstacle avoidance sensor.",
      "Returns LOW when obstacle is detected (active low)."
    ],
    generate: () => `#include <Arduino.h>\n\nconst int irPin = 4;\n\nvoid setup() {\n  Serial.begin(115200);\n  pinMode(irPin, INPUT);\n}\n\nvoid loop() {\n  int state = digitalRead(irPin);\n  if (state == LOW) {\n    Serial.println("Obstacle Detected!");\n  } else {\n    Serial.println("Path Clear");\n  }\n  delay(200);\n}\n`
  },
  {
    id: "irsensor-platformio-espidf-gpio",
    sensor: "irsensor",
    sensorLabel: "IR Obstacle",
    environment: "platformio-espidf",
    environmentLabel: "PlatformIO / ESP-IDF",
    protocol: "gpio",
    protocolLabel: "GPIO Digital",
    language: "c",
    filename: "main.c",
    dependencies: [],
    notes: [
      "Uses ESP-IDF framework via PlatformIO (framework = espidf).",
      "Generic digital IR obstacle avoidance sensor."
    ],
    generate: () => `#include <stdio.h>\n#include "freertos/FreeRTOS.h"\n#include "freertos/task.h"\n#include "driver/gpio.h"\n\n#define IR_PIN 4\n\nvoid app_main(void)\n{\n    gpio_reset_pin(IR_PIN);\n    gpio_set_direction(IR_PIN, GPIO_MODE_INPUT);\n    gpio_set_pull_mode(IR_PIN, GPIO_PULLUP_ENABLE);\n\n    while (1) {\n        int state = gpio_get_level(IR_PIN);\n        if (state == 0) {\n            printf("Obstacle Detected!\\n");\n        } else {\n            printf("Path Clear\\n");\n        }\n        vTaskDelay(200 / portTICK_PERIOD_MS);\n    }\n}\n`
  },
  {
    id: "bme280-platformio-espidf-i2c",
    sensor: "bme280",
    sensorLabel: "BME280",
    environment: "platformio-espidf",
    environmentLabel: "PlatformIO / ESP-IDF",
    protocol: "i2c",
    protocolLabel: "I²C",
    language: "c",
    filename: "main.c",
    dependencies: [
      { name: "idf-component", version: "bme280" }
    ],
    notes: [
      "Uses ESP-IDF framework via PlatformIO (framework = espidf).",
      "Assumes usage of standard ESP-IDF i2c master driver."
    ],
    generate: () => `#include <stdio.h>\n#include "freertos/FreeRTOS.h"\n#include "freertos/task.h"\n#include "driver/i2c.h"\n\n#define I2C_MASTER_SCL_IO           22\n#define I2C_MASTER_SDA_IO           21\n#define I2C_MASTER_NUM              0\n#define I2C_MASTER_FREQ_HZ          100000\n\nstatic esp_err_t i2c_master_init(void)\n{\n    int i2c_master_port = I2C_MASTER_NUM;\n    i2c_config_t conf = {\n        .mode = I2C_MODE_MASTER,\n        .sda_io_num = I2C_MASTER_SDA_IO,\n        .scl_io_num = I2C_MASTER_SCL_IO,\n        .sda_pullup_en = GPIO_PULLUP_ENABLE,\n        .scl_pullup_en = GPIO_PULLUP_ENABLE,\n        .master.clk_speed = I2C_MASTER_FREQ_HZ,\n    };\n    i2c_param_config(i2c_master_port, &conf);\n    return i2c_driver_install(i2c_master_port, conf.mode, 0, 0, 0);\n}\n\nvoid app_main(void)\n{\n    ESP_ERROR_CHECK(i2c_master_init());\n    printf("I2C initialized successfully\\n");\n\n    while (1) {\n        // BME280 read logic\n        vTaskDelay(2000 / portTICK_PERIOD_MS);\n    }\n}\n`
  },
  {
    id: "dht11-arduino-gpio",
    sensor: "dht11",
    sensorLabel: "DHT11",
    environment: "arduino",
    environmentLabel: "Arduino IDE",
    protocol: "gpio",
    protocolLabel: "One-Wire",
    language: "cpp",
    filename: "dht11_example.ino",
    dependencies: [
      { name: "DHT sensor library by Adafruit", version: "tested-version" },
      { name: "Adafruit Unified Sensor", version: "tested-version" }
    ],
    notes: [
      "Requires a 10K pull-up resistor between VCC and Data pin.",
      "DHT11's minimum sampling interval is ~1s (vs DHT22's ~2s) — it's the less accurate sensor (±2°C) but tolerates faster polling."
    ],
    generate: (params = {}) => {
      const dataPin = Number.isInteger(params.dataPin) ? params.dataPin : 4;
      return `#include "DHT.h"\n\n#define DHTPIN ${dataPin}\n#define DHTTYPE DHT11\n\nDHT dht(DHTPIN, DHTTYPE);\n\nvoid setup() {\n  Serial.begin(115200);\n  dht.begin();\n}\n\nvoid loop() {\n  delay(1000);\n\n  float h = dht.readHumidity();\n  float t = dht.readTemperature();\n\n  if (isnan(h) || isnan(t)) {\n    Serial.println(F("Failed to read from DHT sensor!"));\n    return;\n  }\n\n  Serial.print(F("Humidity: "));\n  Serial.print(h);\n  Serial.print(F("%  Temperature: "));\n  Serial.print(t);\n  Serial.println(F(" *C"));\n}\n`;
    }
  },
  {
    id: "dht22-arduino-gpio",
    sensor: "dht22",
    sensorLabel: "DHT22",
    environment: "arduino",
    environmentLabel: "Arduino IDE",
    protocol: "gpio",
    protocolLabel: "One-Wire",
    language: "cpp",
    filename: "dht22_example.ino",
    dependencies: [
      { name: "DHT sensor library by Adafruit", version: "tested-version" },
      { name: "Adafruit Unified Sensor", version: "tested-version" }
    ],
    notes: [
      "Requires a 10K pull-up resistor between VCC and Data pin.",
      "DHT22 needs ~2s between reads (vs DHT11's ~1s) — the trade for its better accuracy (±0.5°C)."
    ],
    generate: (params = {}) => {
      const dataPin = Number.isInteger(params.dataPin) ? params.dataPin : 4;
      return `#include "DHT.h"\n\n#define DHTPIN ${dataPin}\n#define DHTTYPE DHT22\n\nDHT dht(DHTPIN, DHTTYPE);\n\nvoid setup() {\n  Serial.begin(115200);\n  dht.begin();\n}\n\nvoid loop() {\n  delay(2000);\n\n  float h = dht.readHumidity();\n  float t = dht.readTemperature();\n\n  if (isnan(h) || isnan(t)) {\n    Serial.println(F("Failed to read from DHT sensor!"));\n    return;\n  }\n\n  Serial.print(F("Humidity: "));\n  Serial.print(h);\n  Serial.print(F("%  Temperature: "));\n  Serial.print(t);\n  Serial.println(F(" *C"));\n}\n`;
    }
  },
  {
    id: "mq2-arduino-adc",
    sensor: "mq2",
    sensorLabel: "MQ-2 Smoke/Gas",
    environment: "arduino",
    environmentLabel: "Arduino IDE",
    protocol: "adc",
    protocolLabel: "Analog (ADC)",
    language: "cpp",
    filename: "mq2_example.ino",
    dependencies: [],
    notes: [
      "MQ sensors require a preheat time (burn-in) of up to 24-48 hours for accurate calibration.",
      "The sensor heater draws significant current. Do not power directly from ESP32/Arduino GPIO pins."
    ],
    generate: () => `const int mq2Pin = 34; // Use appropriate ADC pin\n\nvoid setup() {\n  Serial.begin(115200);\n  // Optional: Allow pre-heating\n  Serial.println("Warming up MQ-2 sensor...");\n  delay(5000);\n}\n\nvoid loop() {\n  int sensorValue = analogRead(mq2Pin);\n  Serial.print("MQ-2 Raw ADC Value: ");\n  Serial.println(sensorValue);\n\n  if (sensorValue > 2000) { // Threshold depends on environment and MCU ADC resolution\n    Serial.println("WARNING: High Gas/Smoke detected!");\n  }\n\n  delay(1000);\n}\n`
  },
  {
    id: "pir-arduino-gpio",
    sensor: "pir",
    sensorLabel: "HC-SR501 (PIR)",
    environment: "arduino",
    environmentLabel: "Arduino IDE",
    protocol: "gpio",
    protocolLabel: "GPIO Digital",
    language: "cpp",
    filename: "pir_example.ino",
    dependencies: [],
    notes: [
      "Sensor requires ~60 seconds after power-on to stabilize.",
      "Adjust the sensitivity and time delay using the onboard potentiometers."
    ],
    generate: (params = {}) => {
      const pirPin = Number.isInteger(params.pirPin) ? params.pirPin : 13;
      return `const int pirPin = ${pirPin};\nint motionState = LOW;\n\nvoid setup() {\n  Serial.begin(115200);\n  pinMode(pirPin, INPUT);\n  Serial.println("PIR Sensor Initializing (wait 60s)...");\n}\n\nvoid loop() {\n  int val = digitalRead(pirPin);\n\n  if (val == HIGH) {\n    if (motionState == LOW) {\n      Serial.println("Motion detected!");\n      motionState = HIGH;\n    }\n  } else {\n    if (motionState == HIGH) {\n      Serial.println("Motion ended.");\n      motionState = LOW;\n    }\n  }\n  delay(100);\n}\n`;
    }
  },
  {
    id: "dht11-platformio-gpio",
    sensor: "dht11",
    sensorLabel: "DHT11",
    environment: "platformio",
    environmentLabel: "PlatformIO / Arduino",
    protocol: "gpio",
    protocolLabel: "One-Wire",
    language: "cpp",
    filename: "main.cpp",
    dependencies: [
      { name: "adafruit/DHT sensor library", version: "^1.4.6" },
      { name: "adafruit/Adafruit Unified Sensor", version: "^1.1.14" }
    ],
    notes: [
      "Requires a 10K pull-up resistor between VCC and Data pin.",
      "DHT11's minimum sampling interval is ~1s (vs DHT22's ~2s) — it's the less accurate sensor (±2°C) but tolerates faster polling."
    ],
    generate: (params = {}) => {
      const dataPin = Number.isInteger(params.dataPin) ? params.dataPin : 4;
      return `#include <Arduino.h>\n#include "DHT.h"\n\n#define DHTPIN ${dataPin}\n#define DHTTYPE DHT11\n\nDHT dht(DHTPIN, DHTTYPE);\n\nvoid setup() {\n  Serial.begin(115200);\n  dht.begin();\n}\n\nvoid loop() {\n  delay(1000);\n\n  float h = dht.readHumidity();\n  float t = dht.readTemperature();\n\n  if (isnan(h) || isnan(t)) {\n    Serial.println(F("Failed to read from DHT sensor!"));\n    return;\n  }\n\n  Serial.print(F("Humidity: "));\n  Serial.print(h);\n  Serial.print(F("%  Temperature: "));\n  Serial.print(t);\n  Serial.println(F(" *C"));\n}\n`;
    }
  },
  {
    id: "dht22-platformio-gpio",
    sensor: "dht22",
    sensorLabel: "DHT22",
    environment: "platformio",
    environmentLabel: "PlatformIO / Arduino",
    protocol: "gpio",
    protocolLabel: "One-Wire",
    language: "cpp",
    filename: "main.cpp",
    dependencies: [
      { name: "adafruit/DHT sensor library", version: "^1.4.6" },
      { name: "adafruit/Adafruit Unified Sensor", version: "^1.1.14" }
    ],
    notes: [
      "Requires a 10K pull-up resistor between VCC and Data pin.",
      "DHT22 needs ~2s between reads (vs DHT11's ~1s) — the trade for its better accuracy (±0.5°C)."
    ],
    generate: (params = {}) => {
      const dataPin = Number.isInteger(params.dataPin) ? params.dataPin : 4;
      return `#include <Arduino.h>\n#include "DHT.h"\n\n#define DHTPIN ${dataPin}\n#define DHTTYPE DHT22\n\nDHT dht(DHTPIN, DHTTYPE);\n\nvoid setup() {\n  Serial.begin(115200);\n  dht.begin();\n}\n\nvoid loop() {\n  delay(2000);\n\n  float h = dht.readHumidity();\n  float t = dht.readTemperature();\n\n  if (isnan(h) || isnan(t)) {\n    Serial.println(F("Failed to read from DHT sensor!"));\n    return;\n  }\n\n  Serial.print(F("Humidity: "));\n  Serial.print(h);\n  Serial.print(F("%  Temperature: "));\n  Serial.print(t);\n  Serial.println(F(" *C"));\n}\n`;
    }
  },
  {
    id: "espnow-sender-arduino-wifi",
    sensor: "espnow-sender",
    sensorLabel: "ESP-NOW Sender",
    environment: "arduino",
    environmentLabel: "Arduino IDE",
    protocol: "wifi",
    protocolLabel: "ESP-NOW",
    language: "cpp",
    filename: "espnow_sender.ino",
    dependencies: [],
    notes: [
      "Ensure you replace the broadcastAddress with the MAC address of your receiver.",
      "Requires #include <esp_now.h> and #include <WiFi.h> on ESP32."
    ],
    generate: () => `#include <esp_now.h>\n#include <WiFi.h>\n\n// REPLACE WITH YOUR RECEIVER MAC Address\nuint8_t broadcastAddress[] = {0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF};\n\ntypedef struct struct_message {\n  char a[32];\n  int b;\n  float c;\n  bool d;\n} struct_message;\n\nstruct_message myData;\nesp_now_peer_info_t peerInfo;\n\nvoid OnDataSent(const uint8_t *mac_addr, esp_now_send_status_t status) {\n  Serial.print("\\r\\nLast Packet Send Status:\\t");\n  Serial.println(status == ESP_NOW_SEND_SUCCESS ? "Delivery Success" : "Delivery Fail");\n}\n\nvoid setup() {\n  Serial.begin(115200);\n  WiFi.mode(WIFI_STA);\n\n  if (esp_now_init() != ESP_OK) {\n    Serial.println("Error initializing ESP-NOW");\n    return;\n  }\n\n  esp_now_register_send_cb(OnDataSent);\n\n  memcpy(peerInfo.peer_addr, broadcastAddress, 6);\n  peerInfo.channel = 0;  \n  peerInfo.encrypt = false;\n  \n  if (esp_now_add_peer(&peerInfo) != ESP_OK){\n    Serial.println("Failed to add peer");\n    return;\n  }\n}\n\nvoid loop() {\n  strcpy(myData.a, "Hello ESP32");\n  myData.b = random(1,20);\n  myData.c = 1.2;\n  myData.d = false;\n\n  esp_err_t result = esp_now_send(broadcastAddress, (uint8_t *) &myData, sizeof(myData));\n  delay(2000);\n}\n`
  },
  {
    id: "espnow-receiver-arduino-wifi",
    sensor: "espnow-receiver",
    sensorLabel: "ESP-NOW Receiver",
    environment: "arduino",
    environmentLabel: "Arduino IDE",
    protocol: "wifi",
    protocolLabel: "ESP-NOW",
    language: "cpp",
    filename: "espnow_receiver.ino",
    dependencies: [],
    notes: [
      "Run this on your receiving ESP32.",
      "You can find this board's MAC address by running WiFi.macAddress()."
    ],
    generate: () => `#include <esp_now.h>\n#include <WiFi.h>\n\ntypedef struct struct_message {\n  char a[32];\n  int b;\n  float c;\n  bool d;\n} struct_message;\n\nstruct_message myData;\n\nvoid OnDataRecv(const uint8_t * mac, const uint8_t *incomingData, int len) {\n  memcpy(&myData, incomingData, sizeof(myData));\n  Serial.print("Bytes received: ");\n  Serial.println(len);\n  Serial.print("Char: ");\n  Serial.println(myData.a);\n  Serial.print("Int: ");\n  Serial.println(myData.b);\n  Serial.print("Float: ");\n  Serial.println(myData.c);\n  Serial.print("Bool: ");\n  Serial.println(myData.d);\n  Serial.println();\n}\n\nvoid setup() {\n  Serial.begin(115200);\n  WiFi.mode(WIFI_STA);\n\n  if (esp_now_init() != ESP_OK) {\n    Serial.println("Error initializing ESP-NOW");\n    return;\n  }\n  \n  esp_now_register_recv_cb(OnDataRecv);\n}\n\nvoid loop() {\n  // Event-driven. Data is handled in OnDataRecv callback.\n  delay(10000);\n}\n`
  },
  {
    id: "uart-comm-arduino-serial",
    sensor: "uart-comm",
    sensorLabel: "UART Communication",
    environment: "arduino",
    environmentLabel: "Arduino IDE",
    protocol: "uart",
    protocolLabel: "Serial2",
    language: "cpp",
    filename: "uart_communication.ino",
    dependencies: [],
    notes: [
      "Hardware Serial2 on ESP32 defaults to RX=16, TX=17.",
      "Cross-connect TX of Board A to RX of Board B, and vice versa. DON'T forget common GND!"
    ],
    generate: () => `#include <Arduino.h>\n\n#define RX_PIN 16\n#define TX_PIN 17\n\nvoid setup() {\n  Serial.begin(115200); // Debug port\n  Serial2.begin(115200, SERIAL_8N1, RX_PIN, TX_PIN); // Communication port\n  Serial.println("ESP32 UART Communication Started.");\n}\n\nvoid loop() {\n  // Read from Serial2 and print to Serial\n  if (Serial2.available()) {\n    String incoming = Serial2.readStringUntil('\\n');\n    Serial.print("Received: ");\n    Serial.println(incoming);\n  }\n\n  // Send a message every 3 seconds\n  static unsigned long lastSend = 0;\n  if (millis() - lastSend > 3000) {\n    Serial2.println("Hello from ESP32 UART!");\n    lastSend = millis();\n  }\n}\n`
  },
  {
    id: "esp32s3-usb-cdc-arduino-serial",
    sensor: "esp32s3-usb-cdc",
    sensorLabel: "Native USB CDC",
    environment: "arduino",
    environmentLabel: "Arduino IDE",
    protocol: "usb",
    protocolLabel: "Native USB",
    language: "cpp",
    filename: "esp32s3_native_usb.ino",
    dependencies: [],
    notes: [
      "Ensure 'USB CDC On Boot' is enabled in Arduino IDE Tools menu.",
      "Hardware Serial (Serial0) will map to the native USB port instead of UART."
    ],
    generate: () => `void setup() {\n  // For ESP32-S3 with Native USB CDC enabled, this connects to the USB port\n  Serial.begin(115200);\n  \n  // Wait for USB Serial to connect (optional, but helpful for missing early logs)\n  while(!Serial) {\n    delay(10);\n  }\n  Serial.println("ESP32-S3 Native USB Initialized!");\n}\n\nvoid loop() {\n  Serial.println("Hello over Native USB!");\n  delay(1000);\n}\n`
  },
  {
    id: "esp32s3-camera-arduino-i2s",
    sensor: "esp32s3-camera",
    sensorLabel: "OV2640 Camera",
    environment: "arduino",
    environmentLabel: "Arduino IDE",
    protocol: "i2s",
    protocolLabel: "Parallel Camera",
    language: "cpp",
    filename: "esp32s3_camera.ino",
    dependencies: [
      { name: "esp32-camera", version: "built-in" }
    ],
    notes: [
      "Assumes typical ESP32-S3 WROOM Camera Pinout.",
      "Requires PSRAM enabled in Arduino IDE Tools menu!"
    ],
    generate: () => `#include "esp_camera.h"\n\n// Typical ESP32-S3 WROOM Camera Pinout\n#define PWDN_GPIO_NUM  -1\n#define RESET_GPIO_NUM -1\n#define XCLK_GPIO_NUM  15\n#define SIOD_GPIO_NUM  4\n#define SIOC_GPIO_NUM  5\n#define Y2_GPIO_NUM    11\n#define Y3_GPIO_NUM    9\n#define Y4_GPIO_NUM    8\n#define Y5_GPIO_NUM    10\n#define Y6_GPIO_NUM    12\n#define Y7_GPIO_NUM    18\n#define Y8_GPIO_NUM    17\n#define Y9_GPIO_NUM    16\n#define VSYNC_GPIO_NUM 6\n#define HREF_GPIO_NUM  7\n#define PCLK_GPIO_NUM  13\n\nvoid setup() {\n  Serial.begin(115200);\n  \n  camera_config_t config;\n  config.ledc_channel = LEDC_CHANNEL_0;\n  config.ledc_timer = LEDC_TIMER_0;\n  config.pin_d0 = Y2_GPIO_NUM;\n  config.pin_d1 = Y3_GPIO_NUM;\n  config.pin_d2 = Y4_GPIO_NUM;\n  config.pin_d3 = Y5_GPIO_NUM;\n  config.pin_d4 = Y6_GPIO_NUM;\n  config.pin_d5 = Y7_GPIO_NUM;\n  config.pin_d6 = Y8_GPIO_NUM;\n  config.pin_d7 = Y9_GPIO_NUM;\n  config.pin_xclk = XCLK_GPIO_NUM;\n  config.pin_pclk = PCLK_GPIO_NUM;\n  config.pin_vsync = VSYNC_GPIO_NUM;\n  config.pin_href = HREF_GPIO_NUM;\n  config.pin_sscb_sda = SIOD_GPIO_NUM;\n  config.pin_sscb_scl = SIOC_GPIO_NUM;\n  config.pin_pwdn = PWDN_GPIO_NUM;\n  config.pin_reset = RESET_GPIO_NUM;\n  config.xclk_freq_hz = 20000000;\n  config.frame_size = FRAMESIZE_UXGA;\n  config.pixel_format = PIXFORMAT_JPEG;\n  config.grab_mode = CAMERA_GRAB_WHEN_EMPTY;\n  config.fb_location = CAMERA_FB_IN_PSRAM;\n  config.jpeg_quality = 12;\n  config.fb_count = 1;\n\n  // Init Camera\n  esp_err_t err = esp_camera_init(&config);\n  if (err != ESP_OK) {\n    Serial.printf("Camera init failed with error 0x%x", err);\n    return;\n  }\n  Serial.println("Camera initialized!");\n}\n\nvoid loop() {\n  camera_fb_t * fb = esp_camera_fb_get();\n  if (!fb) {\n    Serial.println("Camera capture failed");\n    return;\n  }\n  \n  Serial.printf("Captured %d bytes\\n", fb->len);\n  esp_camera_fb_return(fb);\n  delay(2000);\n}\n`
  }
];

// Only the sensors with real, board-dependent values worth exposing as inputs get a schema —
// the rest (IR obstacle, MQ-2, ESP-NOW, UART, native USB, camera) stay single-option templates
// on purpose rather than fake-parameterized fields with nothing real behind them.
export const SENSOR_PARAM_SCHEMAS = Object.freeze({
  bme280: [
    {
      key: "i2cAddress",
      label: "I2C address",
      type: "select",
      options: [
        { value: "0x76", label: "0x76 (SDO tied to GND — most breakout boards ship this way)" },
        { value: "0x77", label: "0x77 (SDO tied to VDDIO)" }
      ],
      default: "0x76"
    }
  ],
  mpu6050: [
    {
      key: "i2cAddress",
      label: "I2C address",
      type: "select",
      options: [
        { value: "0x68", label: "0x68 (AD0 low — default)" },
        { value: "0x69", label: "0x69 (AD0 tied high — for running two on one bus)" }
      ],
      default: "0x68"
    }
  ],
  hcsr04: [
    { key: "trigPin", label: "Trigger pin (GPIO)", type: "number", default: 5 },
    { key: "echoPin", label: "Echo pin (GPIO)", type: "number", default: 18 }
  ],
  dht11: [{ key: "dataPin", label: "Data pin (GPIO)", type: "number", default: 4 }],
  dht22: [{ key: "dataPin", label: "Data pin (GPIO)", type: "number", default: 4 }],
  pir: [{ key: "pirPin", label: "Output pin (GPIO)", type: "number", default: 13 }]
});

export function generateSensorCode(selection, params = {}) {
  const config = SENSOR_CONFIGURATIONS.find(
    c => c.sensor === selection.sensor && c.environment === selection.environment && c.protocol === selection.protocol
  );

  if (!config) {
    return {
      ok: false,
      error: "UNSUPPORTED_CONFIGURATION",
      code: "",
      filename: null,
      dependencies: [],
      notes: []
    };
  }

  const code = config.generate(params);

  return {
    ok: true,
    code,
    filename: config.filename,
    language: config.language,
    dependencies: config.dependencies,
    notes: config.notes
  };
}
