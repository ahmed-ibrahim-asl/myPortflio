(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,15004,e=>{"use strict";var i=e.i(43476),n=e.i(71645);function r({examples:e,activeExampleId:n,onSelect:t}){return(0,i.jsxs)("section",{className:"embedded-examples","aria-labelledby":"embedded-examples-title",children:[(0,i.jsxs)("div",{className:"embedded-section-heading",children:[(0,i.jsx)("span",{className:"mono",children:"EXAMPLES"}),(0,i.jsx)("h2",{id:"embedded-examples-title",children:"Start from a familiar build"})]}),(0,i.jsx)("div",{className:"embedded-example-grid",children:e.map(e=>(0,i.jsxs)("button",{className:`embedded-example-card${n===e.id?" is-active":""}`,type:"button","aria-pressed":n===e.id,onClick:()=>t(e),children:[(0,i.jsx)("strong",{children:e.title}),(0,i.jsx)("span",{children:e.summary})]},e.id))})]})}function t({code:e,label:r="TERMINAL_OUTPUT"}){let[a,o]=(0,n.useState)(!1);return(0,i.jsxs)("div",{className:"terminal-code-block",children:[(0,i.jsxs)("div",{className:"terminal-code-header",children:[(0,i.jsxs)("div",{className:"terminal-code-label",children:[(0,i.jsx)("span",{children:">"}),(0,i.jsx)("span",{children:r})]}),(0,i.jsx)("button",{onClick:()=>{navigator.clipboard.writeText(e),o(!0),setTimeout(()=>o(!1),2e3)},className:"terminal-code-copy",children:a?"COPIED":"COPY"})]}),(0,i.jsx)("pre",{className:"terminal-code-pre",children:(0,i.jsx)("code",{children:e})})]})}var a=e.i(8380);let o=[{id:"bme280-arduino-i2c",sensor:"bme280",sensorLabel:"BME280",environment:"arduino",environmentLabel:"Arduino IDE",protocol:"i2c",protocolLabel:"I²C",language:"cpp",filename:"bme280_example.ino",dependencies:[{name:"Adafruit BME280 Library",version:"tested-version"},{name:"Adafruit Unified Sensor",version:"tested-version"}],notes:["Default address is 0x76.","Try 0x77 when the address pin is configured high."],generate:(e={})=>{let i="0x77"===e.i2cAddress?"0x77":"0x76";return`#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BME280.h>

Adafruit_BME280 bme;

void setup() {
  Serial.begin(115200);
  Wire.begin();
  if (!bme.begin(${i})) {
    Serial.println(F("Sensor not found, check wiring or try ${"0x76"===i?"0x77":"0x76"}"));
    while (1);
  }
}

void loop() {
  float t = bme.readTemperature();
  float h = bme.readHumidity();
  float p = bme.readPressure() / 100.0F;

  Serial.print(F("Temp: ")); Serial.print(t); Serial.println(F(" *C"));
  Serial.print(F("Hum: ")); Serial.print(h); Serial.println(F(" %"));
  Serial.print(F("Pres: ")); Serial.print(p); Serial.println(F(" hPa"));

  delay(2000);
}
`}},{id:"bme280-platformio-i2c",sensor:"bme280",sensorLabel:"BME280",environment:"platformio",environmentLabel:"PlatformIO / Arduino",protocol:"i2c",protocolLabel:"I²C",language:"cpp",filename:"main.cpp",dependencies:[{name:"adafruit/Adafruit BME280 Library",version:"^2.2.2"},{name:"adafruit/Adafruit Unified Sensor",version:"^1.1.9"}],notes:["Ensure platformio.ini contains lib_deps = adafruit/Adafruit BME280 Library"],generate:(e={})=>{let i="0x77"===e.i2cAddress?"0x77":"0x76";return`#include <Arduino.h>
#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BME280.h>

Adafruit_BME280 bme;

void setup() {
  Serial.begin(115200);
  Wire.begin();
  if (!bme.begin(${i})) {
    Serial.println(F("Sensor not found, check wiring or try ${"0x76"===i?"0x77":"0x76"}"));
    while (1);
  }
}

void loop() {
  float t = bme.readTemperature();
  float h = bme.readHumidity();
  float p = bme.readPressure() / 100.0F;

  Serial.print(F("Temp: ")); Serial.print(t); Serial.println(F(" *C"));
  Serial.print(F("Hum: ")); Serial.print(h); Serial.println(F(" %"));
  Serial.print(F("Pres: ")); Serial.print(p); Serial.println(F(" hPa"));

  delay(2000);
}
`}},{id:"bme280-espidf-i2c",sensor:"bme280",sensorLabel:"BME280",environment:"esp-idf",environmentLabel:"ESP-IDF",protocol:"i2c",protocolLabel:"I²C",language:"c",filename:"main.c",dependencies:[{name:"esp-idf",version:"v5.0+"},{name:"bme280",version:"idf-component"}],notes:["Assumes usage of standard ESP-IDF i2c master driver."],generate:()=>`#include <stdio.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "driver/i2c.h"

#define I2C_MASTER_SCL_IO           22
#define I2C_MASTER_SDA_IO           21
#define I2C_MASTER_NUM              0
#define I2C_MASTER_FREQ_HZ          100000

static esp_err_t i2c_master_init(void)
{
    int i2c_master_port = I2C_MASTER_NUM;
    i2c_config_t conf = {
        .mode = I2C_MODE_MASTER,
        .sda_io_num = I2C_MASTER_SDA_IO,
        .scl_io_num = I2C_MASTER_SCL_IO,
        .sda_pullup_en = GPIO_PULLUP_ENABLE,
        .scl_pullup_en = GPIO_PULLUP_ENABLE,
        .master.clk_speed = I2C_MASTER_FREQ_HZ,
    };
    i2c_param_config(i2c_master_port, &conf);
    return i2c_driver_install(i2c_master_port, conf.mode, 0, 0, 0);
}

void app_main(void)
{
    ESP_ERROR_CHECK(i2c_master_init());
    printf("I2C initialized successfully\\n");

    while (1) {
        // BME280 read logic
        vTaskDelay(2000 / portTICK_PERIOD_MS);
    }
}
`},{id:"mpu6050-arduino-i2c",sensor:"mpu6050",sensorLabel:"MPU6050",environment:"arduino",environmentLabel:"Arduino IDE",protocol:"i2c",protocolLabel:"I²C",language:"cpp",filename:"mpu6050_example.ino",dependencies:[{name:"Adafruit MPU6050",version:"tested-version"},{name:"Adafruit Unified Sensor",version:"tested-version"}],notes:["Uses the Adafruit_MPU6050 library. I2C address is usually 0x68 (AD0 low); tie AD0 high for 0x69 to run two on one bus."],generate:(e={})=>{let i="0x69"===e.i2cAddress?"0x69":"0x68";return`#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>

Adafruit_MPU6050 mpu;

void setup() {
  Serial.begin(115200);
  Wire.begin();
  if (!mpu.begin(${i})) {
    Serial.println("Failed to find MPU6050 chip");
    while (1) { delay(10); }
  }
  mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
  mpu.setGyroRange(MPU6050_RANGE_500_DEG);
}

void loop() {
  sensors_event_t a, g, temp;
  mpu.getEvent(&a, &g, &temp);

  Serial.print("Accel X: "); Serial.print(a.acceleration.x);
  Serial.print(", Y: "); Serial.print(a.acceleration.y);
  Serial.print(", Z: "); Serial.println(a.acceleration.z);

  delay(500);
}
`}},{id:"mpu6050-platformio-i2c",sensor:"mpu6050",sensorLabel:"MPU6050",environment:"platformio",environmentLabel:"PlatformIO / Arduino",protocol:"i2c",protocolLabel:"I²C",language:"cpp",filename:"main.cpp",dependencies:[{name:"adafruit/Adafruit MPU6050",version:"^2.2.4"}],notes:["Uses the Adafruit_MPU6050 library. I2C address is usually 0x68 (AD0 low); tie AD0 high for 0x69 to run two on one bus."],generate:(e={})=>{let i="0x69"===e.i2cAddress?"0x69":"0x68";return`#include <Arduino.h>
#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>

Adafruit_MPU6050 mpu;

void setup() {
  Serial.begin(115200);
  Wire.begin();
  if (!mpu.begin(${i})) {
    Serial.println("Failed to find MPU6050 chip");
    while (1) { delay(10); }
  }
  mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
  mpu.setGyroRange(MPU6050_RANGE_500_DEG);
}

void loop() {
  sensors_event_t a, g, temp;
  mpu.getEvent(&a, &g, &temp);

  Serial.print("Accel X: "); Serial.print(a.acceleration.x);
  Serial.print(", Y: "); Serial.print(a.acceleration.y);
  Serial.print(", Z: "); Serial.println(a.acceleration.z);

  delay(500);
}
`}},{id:"hcsr04-arduino-gpio",sensor:"hcsr04",sensorLabel:"HC-SR04",environment:"arduino",environmentLabel:"Arduino IDE",protocol:"gpio",protocolLabel:"GPIO timing",language:"cpp",filename:"hcsr04_example.ino",dependencies:[],notes:["Uses standard GPIO.","5V logic on echo pin requires a voltage divider if connected to 3.3V ESP32!"],generate:(e={})=>{let i=Number.isInteger(e.trigPin)?e.trigPin:5,n=Number.isInteger(e.echoPin)?e.echoPin:18;return`const int trigPin = ${i};
const int echoPin = ${n};

long duration;
int distance;

void setup() {
  Serial.begin(115200);
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
}

void loop() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  duration = pulseIn(echoPin, HIGH);
  distance = duration * 0.034 / 2;

  Serial.print("Distance: ");
  Serial.print(distance);
  Serial.println(" cm");

  delay(100);
}
`}},{id:"hcsr04-platformio-gpio",sensor:"hcsr04",sensorLabel:"HC-SR04",environment:"platformio",environmentLabel:"PlatformIO / Arduino",protocol:"gpio",protocolLabel:"GPIO timing",language:"cpp",filename:"main.cpp",dependencies:[],notes:["Uses standard GPIO with PlatformIO Arduino framework.","5V logic on echo pin requires a voltage divider if connected to 3.3V ESP32!"],generate:(e={})=>{let i=Number.isInteger(e.trigPin)?e.trigPin:5,n=Number.isInteger(e.echoPin)?e.echoPin:18;return`#include <Arduino.h>

const int trigPin = ${i};
const int echoPin = ${n};

long duration;
int distance;

void setup() {
  Serial.begin(115200);
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
}

void loop() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  duration = pulseIn(echoPin, HIGH);
  distance = duration * 0.034 / 2;

  Serial.print("Distance: ");
  Serial.print(distance);
  Serial.println(" cm");

  delay(100);
}
`}},{id:"irsensor-arduino-gpio",sensor:"irsensor",sensorLabel:"IR Obstacle",environment:"arduino",environmentLabel:"Arduino IDE",protocol:"gpio",protocolLabel:"GPIO Digital",language:"cpp",filename:"ir_sensor_example.ino",dependencies:[],notes:["Generic digital IR obstacle avoidance sensor.","Returns LOW when obstacle is detected (active low)."],generate:()=>`const int irPin = 4;

void setup() {
  Serial.begin(115200);
  pinMode(irPin, INPUT);
}

void loop() {
  int state = digitalRead(irPin);
  if (state == LOW) {
    Serial.println("Obstacle Detected!");
  } else {
    Serial.println("Path Clear");
  }
  delay(200);
}
`},{id:"irsensor-platformio-gpio",sensor:"irsensor",sensorLabel:"IR Obstacle",environment:"platformio",environmentLabel:"PlatformIO / Arduino",protocol:"gpio",protocolLabel:"GPIO Digital",language:"cpp",filename:"main.cpp",dependencies:[],notes:["Generic digital IR obstacle avoidance sensor.","Returns LOW when obstacle is detected (active low)."],generate:()=>`#include <Arduino.h>

const int irPin = 4;

void setup() {
  Serial.begin(115200);
  pinMode(irPin, INPUT);
}

void loop() {
  int state = digitalRead(irPin);
  if (state == LOW) {
    Serial.println("Obstacle Detected!");
  } else {
    Serial.println("Path Clear");
  }
  delay(200);
}
`},{id:"irsensor-platformio-espidf-gpio",sensor:"irsensor",sensorLabel:"IR Obstacle",environment:"platformio-espidf",environmentLabel:"PlatformIO / ESP-IDF",protocol:"gpio",protocolLabel:"GPIO Digital",language:"c",filename:"main.c",dependencies:[],notes:["Uses ESP-IDF framework via PlatformIO (framework = espidf).","Generic digital IR obstacle avoidance sensor."],generate:()=>`#include <stdio.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "driver/gpio.h"

#define IR_PIN 4

void app_main(void)
{
    gpio_reset_pin(IR_PIN);
    gpio_set_direction(IR_PIN, GPIO_MODE_INPUT);
    gpio_set_pull_mode(IR_PIN, GPIO_PULLUP_ENABLE);

    while (1) {
        int state = gpio_get_level(IR_PIN);
        if (state == 0) {
            printf("Obstacle Detected!\\n");
        } else {
            printf("Path Clear\\n");
        }
        vTaskDelay(200 / portTICK_PERIOD_MS);
    }
}
`},{id:"bme280-platformio-espidf-i2c",sensor:"bme280",sensorLabel:"BME280",environment:"platformio-espidf",environmentLabel:"PlatformIO / ESP-IDF",protocol:"i2c",protocolLabel:"I²C",language:"c",filename:"main.c",dependencies:[{name:"idf-component",version:"bme280"}],notes:["Uses ESP-IDF framework via PlatformIO (framework = espidf).","Assumes usage of standard ESP-IDF i2c master driver."],generate:()=>`#include <stdio.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "driver/i2c.h"

#define I2C_MASTER_SCL_IO           22
#define I2C_MASTER_SDA_IO           21
#define I2C_MASTER_NUM              0
#define I2C_MASTER_FREQ_HZ          100000

static esp_err_t i2c_master_init(void)
{
    int i2c_master_port = I2C_MASTER_NUM;
    i2c_config_t conf = {
        .mode = I2C_MODE_MASTER,
        .sda_io_num = I2C_MASTER_SDA_IO,
        .scl_io_num = I2C_MASTER_SCL_IO,
        .sda_pullup_en = GPIO_PULLUP_ENABLE,
        .scl_pullup_en = GPIO_PULLUP_ENABLE,
        .master.clk_speed = I2C_MASTER_FREQ_HZ,
    };
    i2c_param_config(i2c_master_port, &conf);
    return i2c_driver_install(i2c_master_port, conf.mode, 0, 0, 0);
}

void app_main(void)
{
    ESP_ERROR_CHECK(i2c_master_init());
    printf("I2C initialized successfully\\n");

    while (1) {
        // BME280 read logic
        vTaskDelay(2000 / portTICK_PERIOD_MS);
    }
}
`},{id:"dht11-arduino-gpio",sensor:"dht11",sensorLabel:"DHT11",environment:"arduino",environmentLabel:"Arduino IDE",protocol:"gpio",protocolLabel:"One-Wire",language:"cpp",filename:"dht11_example.ino",dependencies:[{name:"DHT sensor library by Adafruit",version:"tested-version"},{name:"Adafruit Unified Sensor",version:"tested-version"}],notes:["Requires a 10K pull-up resistor between VCC and Data pin.","DHT11's minimum sampling interval is ~1s (vs DHT22's ~2s) — it's the less accurate sensor (±2°C) but tolerates faster polling."],generate:(e={})=>{let i=Number.isInteger(e.dataPin)?e.dataPin:4;return`#include "DHT.h"

#define DHTPIN ${i}
#define DHTTYPE DHT11

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();
}

void loop() {
  delay(1000);

  float h = dht.readHumidity();
  float t = dht.readTemperature();

  if (isnan(h) || isnan(t)) {
    Serial.println(F("Failed to read from DHT sensor!"));
    return;
  }

  Serial.print(F("Humidity: "));
  Serial.print(h);
  Serial.print(F("%  Temperature: "));
  Serial.print(t);
  Serial.println(F(" *C"));
}
`}},{id:"dht22-arduino-gpio",sensor:"dht22",sensorLabel:"DHT22",environment:"arduino",environmentLabel:"Arduino IDE",protocol:"gpio",protocolLabel:"One-Wire",language:"cpp",filename:"dht22_example.ino",dependencies:[{name:"DHT sensor library by Adafruit",version:"tested-version"},{name:"Adafruit Unified Sensor",version:"tested-version"}],notes:["Requires a 10K pull-up resistor between VCC and Data pin.","DHT22 needs ~2s between reads (vs DHT11's ~1s) — the trade for its better accuracy (±0.5°C)."],generate:(e={})=>{let i=Number.isInteger(e.dataPin)?e.dataPin:4;return`#include "DHT.h"

#define DHTPIN ${i}
#define DHTTYPE DHT22

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();
}

void loop() {
  delay(2000);

  float h = dht.readHumidity();
  float t = dht.readTemperature();

  if (isnan(h) || isnan(t)) {
    Serial.println(F("Failed to read from DHT sensor!"));
    return;
  }

  Serial.print(F("Humidity: "));
  Serial.print(h);
  Serial.print(F("%  Temperature: "));
  Serial.print(t);
  Serial.println(F(" *C"));
}
`}},{id:"mq2-arduino-adc",sensor:"mq2",sensorLabel:"MQ-2 Smoke/Gas",environment:"arduino",environmentLabel:"Arduino IDE",protocol:"adc",protocolLabel:"Analog (ADC)",language:"cpp",filename:"mq2_example.ino",dependencies:[],notes:["MQ sensors require a preheat time (burn-in) of up to 24-48 hours for accurate calibration.","The sensor heater draws significant current. Do not power directly from ESP32/Arduino GPIO pins."],generate:()=>`const int mq2Pin = 34; // Use appropriate ADC pin

void setup() {
  Serial.begin(115200);
  // Optional: Allow pre-heating
  Serial.println("Warming up MQ-2 sensor...");
  delay(5000);
}

void loop() {
  int sensorValue = analogRead(mq2Pin);
  Serial.print("MQ-2 Raw ADC Value: ");
  Serial.println(sensorValue);

  if (sensorValue > 2000) { // Threshold depends on environment and MCU ADC resolution
    Serial.println("WARNING: High Gas/Smoke detected!");
  }

  delay(1000);
}
`},{id:"pir-arduino-gpio",sensor:"pir",sensorLabel:"HC-SR501 (PIR)",environment:"arduino",environmentLabel:"Arduino IDE",protocol:"gpio",protocolLabel:"GPIO Digital",language:"cpp",filename:"pir_example.ino",dependencies:[],notes:["Sensor requires ~60 seconds after power-on to stabilize.","Adjust the sensitivity and time delay using the onboard potentiometers."],generate:(e={})=>{let i=Number.isInteger(e.pirPin)?e.pirPin:13;return`const int pirPin = ${i};
int motionState = LOW;

void setup() {
  Serial.begin(115200);
  pinMode(pirPin, INPUT);
  Serial.println("PIR Sensor Initializing (wait 60s)...");
}

void loop() {
  int val = digitalRead(pirPin);

  if (val == HIGH) {
    if (motionState == LOW) {
      Serial.println("Motion detected!");
      motionState = HIGH;
    }
  } else {
    if (motionState == HIGH) {
      Serial.println("Motion ended.");
      motionState = LOW;
    }
  }
  delay(100);
}
`}},{id:"dht11-platformio-gpio",sensor:"dht11",sensorLabel:"DHT11",environment:"platformio",environmentLabel:"PlatformIO / Arduino",protocol:"gpio",protocolLabel:"One-Wire",language:"cpp",filename:"main.cpp",dependencies:[{name:"adafruit/DHT sensor library",version:"^1.4.6"},{name:"adafruit/Adafruit Unified Sensor",version:"^1.1.14"}],notes:["Requires a 10K pull-up resistor between VCC and Data pin.","DHT11's minimum sampling interval is ~1s (vs DHT22's ~2s) — it's the less accurate sensor (±2°C) but tolerates faster polling."],generate:(e={})=>{let i=Number.isInteger(e.dataPin)?e.dataPin:4;return`#include <Arduino.h>
#include "DHT.h"

#define DHTPIN ${i}
#define DHTTYPE DHT11

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();
}

void loop() {
  delay(1000);

  float h = dht.readHumidity();
  float t = dht.readTemperature();

  if (isnan(h) || isnan(t)) {
    Serial.println(F("Failed to read from DHT sensor!"));
    return;
  }

  Serial.print(F("Humidity: "));
  Serial.print(h);
  Serial.print(F("%  Temperature: "));
  Serial.print(t);
  Serial.println(F(" *C"));
}
`}},{id:"dht22-platformio-gpio",sensor:"dht22",sensorLabel:"DHT22",environment:"platformio",environmentLabel:"PlatformIO / Arduino",protocol:"gpio",protocolLabel:"One-Wire",language:"cpp",filename:"main.cpp",dependencies:[{name:"adafruit/DHT sensor library",version:"^1.4.6"},{name:"adafruit/Adafruit Unified Sensor",version:"^1.1.14"}],notes:["Requires a 10K pull-up resistor between VCC and Data pin.","DHT22 needs ~2s between reads (vs DHT11's ~1s) — the trade for its better accuracy (±0.5°C)."],generate:(e={})=>{let i=Number.isInteger(e.dataPin)?e.dataPin:4;return`#include <Arduino.h>
#include "DHT.h"

#define DHTPIN ${i}
#define DHTTYPE DHT22

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();
}

void loop() {
  delay(2000);

  float h = dht.readHumidity();
  float t = dht.readTemperature();

  if (isnan(h) || isnan(t)) {
    Serial.println(F("Failed to read from DHT sensor!"));
    return;
  }

  Serial.print(F("Humidity: "));
  Serial.print(h);
  Serial.print(F("%  Temperature: "));
  Serial.print(t);
  Serial.println(F(" *C"));
}
`}},{id:"espnow-sender-arduino-wifi",sensor:"espnow-sender",sensorLabel:"ESP-NOW Sender",environment:"arduino",environmentLabel:"Arduino IDE",protocol:"wifi",protocolLabel:"ESP-NOW",language:"cpp",filename:"espnow_sender.ino",dependencies:[],notes:["Ensure you replace the broadcastAddress with the MAC address of your receiver.","Requires #include <esp_now.h> and #include <WiFi.h> on ESP32."],generate:()=>`#include <esp_now.h>
#include <WiFi.h>

// REPLACE WITH YOUR RECEIVER MAC Address
uint8_t broadcastAddress[] = {0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF};

typedef struct struct_message {
  char a[32];
  int b;
  float c;
  bool d;
} struct_message;

struct_message myData;
esp_now_peer_info_t peerInfo;

void OnDataSent(const uint8_t *mac_addr, esp_now_send_status_t status) {
  Serial.print("\\r\\nLast Packet Send Status:\\t");
  Serial.println(status == ESP_NOW_SEND_SUCCESS ? "Delivery Success" : "Delivery Fail");
}

void setup() {
  Serial.begin(115200);
  WiFi.mode(WIFI_STA);

  if (esp_now_init() != ESP_OK) {
    Serial.println("Error initializing ESP-NOW");
    return;
  }

  esp_now_register_send_cb(OnDataSent);

  memcpy(peerInfo.peer_addr, broadcastAddress, 6);
  peerInfo.channel = 0;  
  peerInfo.encrypt = false;
  
  if (esp_now_add_peer(&peerInfo) != ESP_OK){
    Serial.println("Failed to add peer");
    return;
  }
}

void loop() {
  strcpy(myData.a, "Hello ESP32");
  myData.b = random(1,20);
  myData.c = 1.2;
  myData.d = false;

  esp_err_t result = esp_now_send(broadcastAddress, (uint8_t *) &myData, sizeof(myData));
  delay(2000);
}
`},{id:"espnow-receiver-arduino-wifi",sensor:"espnow-receiver",sensorLabel:"ESP-NOW Receiver",environment:"arduino",environmentLabel:"Arduino IDE",protocol:"wifi",protocolLabel:"ESP-NOW",language:"cpp",filename:"espnow_receiver.ino",dependencies:[],notes:["Run this on your receiving ESP32.","You can find this board's MAC address by running WiFi.macAddress()."],generate:()=>`#include <esp_now.h>
#include <WiFi.h>

typedef struct struct_message {
  char a[32];
  int b;
  float c;
  bool d;
} struct_message;

struct_message myData;

void OnDataRecv(const uint8_t * mac, const uint8_t *incomingData, int len) {
  memcpy(&myData, incomingData, sizeof(myData));
  Serial.print("Bytes received: ");
  Serial.println(len);
  Serial.print("Char: ");
  Serial.println(myData.a);
  Serial.print("Int: ");
  Serial.println(myData.b);
  Serial.print("Float: ");
  Serial.println(myData.c);
  Serial.print("Bool: ");
  Serial.println(myData.d);
  Serial.println();
}

void setup() {
  Serial.begin(115200);
  WiFi.mode(WIFI_STA);

  if (esp_now_init() != ESP_OK) {
    Serial.println("Error initializing ESP-NOW");
    return;
  }
  
  esp_now_register_recv_cb(OnDataRecv);
}

void loop() {
  // Event-driven. Data is handled in OnDataRecv callback.
  delay(10000);
}
`},{id:"uart-comm-arduino-serial",sensor:"uart-comm",sensorLabel:"UART Communication",environment:"arduino",environmentLabel:"Arduino IDE",protocol:"uart",protocolLabel:"Serial2",language:"cpp",filename:"uart_communication.ino",dependencies:[],notes:["Hardware Serial2 on ESP32 defaults to RX=16, TX=17.","Cross-connect TX of Board A to RX of Board B, and vice versa. DON'T forget common GND!"],generate:()=>`#include <Arduino.h>

#define RX_PIN 16
#define TX_PIN 17

void setup() {
  Serial.begin(115200); // Debug port
  Serial2.begin(115200, SERIAL_8N1, RX_PIN, TX_PIN); // Communication port
  Serial.println("ESP32 UART Communication Started.");
}

void loop() {
  // Read from Serial2 and print to Serial
  if (Serial2.available()) {
    String incoming = Serial2.readStringUntil('\\n');
    Serial.print("Received: ");
    Serial.println(incoming);
  }

  // Send a message every 3 seconds
  static unsigned long lastSend = 0;
  if (millis() - lastSend > 3000) {
    Serial2.println("Hello from ESP32 UART!");
    lastSend = millis();
  }
}
`},{id:"esp32s3-usb-cdc-arduino-serial",sensor:"esp32s3-usb-cdc",sensorLabel:"Native USB CDC",environment:"arduino",environmentLabel:"Arduino IDE",protocol:"usb",protocolLabel:"Native USB",language:"cpp",filename:"esp32s3_native_usb.ino",dependencies:[],notes:["Ensure 'USB CDC On Boot' is enabled in Arduino IDE Tools menu.","Hardware Serial (Serial0) will map to the native USB port instead of UART."],generate:()=>`void setup() {
  // For ESP32-S3 with Native USB CDC enabled, this connects to the USB port
  Serial.begin(115200);
  
  // Wait for USB Serial to connect (optional, but helpful for missing early logs)
  while(!Serial) {
    delay(10);
  }
  Serial.println("ESP32-S3 Native USB Initialized!");
}

void loop() {
  Serial.println("Hello over Native USB!");
  delay(1000);
}
`},{id:"esp32s3-camera-arduino-i2s",sensor:"esp32s3-camera",sensorLabel:"OV2640 Camera",environment:"arduino",environmentLabel:"Arduino IDE",protocol:"i2s",protocolLabel:"Parallel Camera",language:"cpp",filename:"esp32s3_camera.ino",dependencies:[{name:"esp32-camera",version:"built-in"}],notes:["Assumes typical ESP32-S3 WROOM Camera Pinout.","Requires PSRAM enabled in Arduino IDE Tools menu!"],generate:()=>`#include "esp_camera.h"

// Typical ESP32-S3 WROOM Camera Pinout
#define PWDN_GPIO_NUM  -1
#define RESET_GPIO_NUM -1
#define XCLK_GPIO_NUM  15
#define SIOD_GPIO_NUM  4
#define SIOC_GPIO_NUM  5
#define Y2_GPIO_NUM    11
#define Y3_GPIO_NUM    9
#define Y4_GPIO_NUM    8
#define Y5_GPIO_NUM    10
#define Y6_GPIO_NUM    12
#define Y7_GPIO_NUM    18
#define Y8_GPIO_NUM    17
#define Y9_GPIO_NUM    16
#define VSYNC_GPIO_NUM 6
#define HREF_GPIO_NUM  7
#define PCLK_GPIO_NUM  13

void setup() {
  Serial.begin(115200);
  
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sscb_sda = SIOD_GPIO_NUM;
  config.pin_sscb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.frame_size = FRAMESIZE_UXGA;
  config.pixel_format = PIXFORMAT_JPEG;
  config.grab_mode = CAMERA_GRAB_WHEN_EMPTY;
  config.fb_location = CAMERA_FB_IN_PSRAM;
  config.jpeg_quality = 12;
  config.fb_count = 1;

  // Init Camera
  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed with error 0x%x", err);
    return;
  }
  Serial.println("Camera initialized!");
}

void loop() {
  camera_fb_t * fb = esp_camera_fb_get();
  if (!fb) {
    Serial.println("Camera capture failed");
    return;
  }
  
  Serial.printf("Captured %d bytes\\n", fb->len);
  esp_camera_fb_return(fb);
  delay(2000);
}
`}],s=Object.freeze({bme280:[{key:"i2cAddress",label:"I2C address",type:"select",options:[{value:"0x76",label:"0x76 (SDO tied to GND — most breakout boards ship this way)"},{value:"0x77",label:"0x77 (SDO tied to VDDIO)"}],default:"0x76"}],mpu6050:[{key:"i2cAddress",label:"I2C address",type:"select",options:[{value:"0x68",label:"0x68 (AD0 low — default)"},{value:"0x69",label:"0x69 (AD0 tied high — for running two on one bus)"}],default:"0x68"}],hcsr04:[{key:"trigPin",label:"Trigger pin (GPIO)",type:"number",default:5},{key:"echoPin",label:"Echo pin (GPIO)",type:"number",default:18}],dht11:[{key:"dataPin",label:"Data pin (GPIO)",type:"number",default:4}],dht22:[{key:"dataPin",label:"Data pin (GPIO)",type:"number",default:4}],pir:[{key:"pirPin",label:"Output pin (GPIO)",type:"number",default:13}]}),l=(e,i)=>Number.isInteger(e)?e:i;function d({target:e,label:i,protocol:n,filename:r,dependencies:t=[],notes:a,generate:o}){return Object.freeze({id:`${e}-arduino-${n}`,target:e,label:i,environment:"arduino",environmentLabel:"Arduino IDE / ESP32",protocol:n,protocolLabel:n.toUpperCase(),language:"cpp",filename:r,dependencies:Object.freeze(t),notes:Object.freeze(a),generate:o})}let c=Object.freeze([d({target:"bmp280",label:"BMP280 pressure sensor",protocol:"i2c",filename:"bmp280_example.ino",dependencies:[{name:"Adafruit BMP280 Library",version:"^2.6.8"}],notes:["The common I2C addresses are 0x76 and 0x77.","Use 3.3V logic with ESP32 boards."],generate:(e={})=>{let i="0x77"===e.i2cAddress?"0x77":"0x76";return`#include <Wire.h>
#include <Adafruit_BMP280.h>

Adafruit_BMP280 bmp;

void setup() {
  Serial.begin(115200);
  Wire.begin();
  if (!bmp.begin(${i})) {
    Serial.println("BMP280 not found; check wiring and address");
    while (true) delay(10);
  }
}

void loop() {
  Serial.print("Temperature C: "); Serial.println(bmp.readTemperature());
  Serial.print("Pressure hPa: "); Serial.println(bmp.readPressure() / 100.0F);
  delay(1000);
}
`}}),d({target:"ds18b20",label:"DS18B20 temperature sensor",protocol:"onewire",filename:"ds18b20_example.ino",dependencies:[{name:"DallasTemperature",version:"^3.11.0"},{name:"OneWire",version:"^2.3.8"}],notes:["Add a 4.7kΩ pull-up from DATA to VCC.","Several sensors can share one OneWire bus."],generate:(e={})=>{let i=l(e.dataPin,4);return`#include <OneWire.h>
#include <DallasTemperature.h>

constexpr int ONE_WIRE_PIN = ${i};
OneWire oneWire(ONE_WIRE_PIN);
DallasTemperature sensors(&oneWire);

void setup() {
  Serial.begin(115200);
  sensors.begin();
}

void loop() {
  sensors.requestTemperatures();
  Serial.print("Temperature C: ");
  Serial.println(sensors.getTempCByIndex(0));
  delay(1000);
}
`}}),d({target:"bh1750",label:"BH1750 light sensor",protocol:"i2c",filename:"bh1750_example.ino",dependencies:[{name:"BH1750",version:"^1.3.0"}],notes:["Default address is normally 0x23.","Keep the sensor window clear of shadows from the enclosure."],generate:()=>`#include <Wire.h>
#include <BH1750.h>

BH1750 lightMeter;

void setup() {
  Serial.begin(115200);
  Wire.begin();
  if (!lightMeter.begin()) {
    Serial.println("BH1750 not found");
    while (true) delay(10);
  }
}

void loop() {
  Serial.print("Light lx: ");
  Serial.println(lightMeter.readLightLevel());
  delay(500);
}
`}),d({target:"vl53l0x",label:"VL53L0X time-of-flight sensor",protocol:"i2c",filename:"vl53l0x_example.ino",dependencies:[{name:"Adafruit VL53L0X",version:"^1.2.4"}],notes:["The default address is 0x29.","Use the XSHUT pin when assigning unique addresses to multiple sensors."],generate:()=>`#include <Wire.h>
#include <Adafruit_VL53L0X.h>

Adafruit_VL53L0X tof;

void setup() {
  Serial.begin(115200);
  Wire.begin();
  if (!tof.begin()) {
    Serial.println("VL53L0X not found");
    while (true) delay(10);
  }
}

void loop() {
  VL53L0X_RangingMeasurementData_t measure;
  tof.rangingTest(&measure, false);
  if (measure.RangeStatus != 4) Serial.println(measure.RangeMilliMeter);
  else Serial.println("Out of range");
  delay(200);
}
`}),d({target:"ads1115",label:"ADS1115 precision ADC",protocol:"i2c",filename:"ads1115_example.ino",dependencies:[{name:"Adafruit ADS1X15",version:"^2.5.0"}],notes:["The default address is 0x48.","The input must remain inside the configured gain range."],generate:()=>`#include <Wire.h>
#include <Adafruit_ADS1X15.h>

Adafruit_ADS1115 ads;

void setup() {
  Serial.begin(115200);
  if (!ads.begin()) {
    Serial.println("ADS1115 not found");
    while (true) delay(10);
  }
  ads.setGain(GAIN_ONE);
}

void loop() {
  int16_t raw = ads.readADC_SingleEnded(0);
  Serial.print("A0 raw: "); Serial.println(raw);
  delay(500);
}
`}),d({target:"hx711",label:"HX711 load-cell amplifier",protocol:"gpio",filename:"hx711_scale.ino",dependencies:[{name:"HX711 Arduino Library",version:"^0.7.5"}],notes:["Calibrate with a known mass before trusting measurements.","Keep load-cell wiring away from motors and switching supplies."],generate:(e={})=>{let i=l(e.dataPin,19),n=l(e.clockPin,18),r=Number.isFinite(e.calibrationFactor)?e.calibrationFactor:-7050;return`#include <HX711.h>

HX711 scale;
constexpr int DATA_PIN = ${i};
constexpr int CLOCK_PIN = ${n};

void setup() {
  Serial.begin(115200);
  scale.begin(DATA_PIN, CLOCK_PIN);
  scale.set_scale(${r});
  scale.tare();
}

void loop() {
  if (scale.is_ready()) Serial.println(scale.get_units(10));
  else Serial.println("HX711 not ready");
  delay(500);
}
`}}),d({target:"soil-moisture",label:"Capacitive soil-moisture sensor",protocol:"adc",filename:"soil_moisture.ino",notes:["Calibrate dry and wet readings for the exact sensor and soil.","Do not feed a voltage above the board ADC limit."],generate:(e={})=>{let i=l(e.adcPin,34),n=l(e.dryReading,3e3),r=l(e.wetReading,1300);return`constexpr int SENSOR_PIN = ${i};
constexpr int DRY_READING = ${n};
constexpr int WET_READING = ${r};

void setup() {
  Serial.begin(115200);
}

void loop() {
  int raw = analogRead(SENSOR_PIN);
  int percent = constrain(map(raw, DRY_READING, WET_READING, 0, 100), 0, 100);
  Serial.printf("Moisture: %d%% (raw %d)\\n", percent, raw);
  delay(1000);
}
`}}),d({target:"http-client",label:"ESP32 HTTP client",protocol:"http",filename:"http_client.ino",notes:["Replace the Wi-Fi and URL placeholders before uploading.","Use TLS and certificate validation for production endpoints."],generate:()=>`#include <WiFi.h>
#include <HTTPClient.h>

const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const char* API_URL = "https://example.com/api/telemetry";

void setup() {
  Serial.begin(115200);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) delay(250);
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(API_URL);
    int status = http.GET();
    Serial.printf("HTTP status: %d\\n", status);
    if (status > 0) Serial.println(http.getString());
    http.end();
  }
  delay(10000);
}
`}),d({target:"http-server",label:"ESP32 HTTP server",protocol:"http",filename:"http_server.ino",notes:["Replace the Wi-Fi placeholders before uploading.","This starter is a local-network example; add authentication before exposing controls."],generate:()=>`#include <WiFi.h>
#include <WebServer.h>

const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
WebServer server(80);

void setup() {
  Serial.begin(115200);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) delay(250);
  server.on("/", []() { server.send(200, "application/json", "{\\"status\\":\\"ok\\"}"); });
  server.begin();
}

void loop() {
  server.handleClient();
}
`}),d({target:"mqtt-publisher",label:"MQTT publisher",protocol:"mqtt",filename:"mqtt_publisher.ino",dependencies:[{name:"PubSubClient",version:"^2.8"}],notes:["Replace broker and Wi-Fi placeholders.","Use a unique client ID and authenticated TLS broker in production."],generate:()=>p("publish")}),d({target:"mqtt-subscriber",label:"MQTT subscriber",protocol:"mqtt",filename:"mqtt_subscriber.ino",dependencies:[{name:"PubSubClient",version:"^2.8"}],notes:["Replace broker and Wi-Fi placeholders.","Treat incoming payloads as untrusted input before controlling hardware."],generate:()=>p("subscribe")}),d({target:"ble-server",label:"BLE GATT server",protocol:"ble",filename:"ble_server.ino",dependencies:[{name:"NimBLE-Arduino",version:"^2.3.7"}],notes:["Use your own service and characteristic UUIDs for a product.","Advertising consumes power; tune the interval for battery devices."],generate:()=>`#include <NimBLEDevice.h>

#define SERVICE_UUID "12345678-1234-1234-1234-1234567890ab"
#define CHARACTERISTIC_UUID "12345678-1234-1234-1234-1234567890ac"

void setup() {
  NimBLEDevice::init("ESP32 Sensor");
  NimBLEServer* server = NimBLEDevice::createServer();
  NimBLEService* service = server->createService(SERVICE_UUID);
  NimBLECharacteristic* value = service->createCharacteristic(CHARACTERISTIC_UUID, NIMBLE_PROPERTY::READ | NIMBLE_PROPERTY::NOTIFY);
  value->setValue("ready");
  service->start();
  NimBLEDevice::getAdvertising()->addServiceUUID(SERVICE_UUID);
  NimBLEDevice::startAdvertising();
}

void loop() { delay(1000); }
`}),d({target:"ble-client",label:"BLE GATT client",protocol:"ble",filename:"ble_client.ino",dependencies:[{name:"NimBLE-Arduino",version:"^2.3.7"}],notes:["Replace the service UUID with the peripheral's UUID.","Scanning continuously consumes significant power."],generate:()=>`#include <NimBLEDevice.h>

#define SERVICE_UUID "12345678-1234-1234-1234-1234567890ab"

void setup() {
  Serial.begin(115200);
  NimBLEDevice::init("");
  NimBLEScan* scan = NimBLEDevice::getScan();
  scan->setActiveScan(true);
  NimBLEScanResults results = scan->getResults(5 * 1000);
  Serial.printf("Found %d BLE devices\\n", results.getCount());
}

void loop() { delay(5000); }
`}),d({target:"i2c-scanner",label:"I2C bus scanner",protocol:"i2c",filename:"i2c_scanner.ino",notes:["Default ESP32 pins are SDA 21 and SCL 22 on many boards.","A discovered address identifies a device, not its exact model."],generate:()=>`#include <Wire.h>

void setup() {
  Serial.begin(115200);
  Wire.begin();
}

void loop() {
  int found = 0;
  for (uint8_t address = 1; address < 127; address++) {
    Wire.beginTransmission(address);
    if (Wire.endTransmission() == 0) {
      Serial.printf("Found I2C device at 0x%02X\\n", address);
      found++;
    }
  }
  if (!found) Serial.println("No I2C devices found");
  delay(5000);
}
`}),d({target:"spi-transfer",label:"SPI full-duplex transfer",protocol:"spi",filename:"spi_transfer.ino",notes:["Confirm SCK, MOSI, MISO, and CS pins for your board.","Match SPI mode and clock limit to the peripheral datasheet."],generate:(e={})=>{let i=l(e.csPin,5);return`#include <SPI.h>

constexpr int CS_PIN = ${i};

void setup() {
  Serial.begin(115200);
  pinMode(CS_PIN, OUTPUT);
  digitalWrite(CS_PIN, HIGH);
  SPI.begin();
}

void loop() {
  SPI.beginTransaction(SPISettings(1000000, MSBFIRST, SPI_MODE0));
  digitalWrite(CS_PIN, LOW);
  uint8_t response = SPI.transfer(0x00);
  digitalWrite(CS_PIN, HIGH);
  SPI.endTransaction();
  Serial.printf("SPI response: 0x%02X\\n", response);
  delay(1000);
}
`}})]);function p(e){return`#include <WiFi.h>
#include <PubSubClient.h>

const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const char* MQTT_BROKER = "YOUR_MQTT_BROKER";
WiFiClient network;
PubSubClient client(network);

void connectMqtt() {
  while (!client.connected()) {
    if (client.connect("esp32-workbench")) { ${"publish"===e?'client.publish("workbench/telemetry", "{\\"temperature\\":24.5}");':'client.subscribe("workbench/commands");'} }
    else delay(1000);
  }
}

void setup() {
  Serial.begin(115200);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) delay(250);
  client.setServer(MQTT_BROKER, 1883);
}

void loop() {
  if (!client.connected()) connectMqtt();
  client.loop();
  ${"publish"===e?'static unsigned long last = 0; if (millis() - last > 5000) { client.publish("workbench/telemetry", "online"); last = millis(); }':"delay(10);"}
}
`}let u=Object.freeze([Object.freeze({id:"sensor",label:"Sensors",summary:"Read physical measurements from real devices."}),Object.freeze({id:"communication",label:"Communication",summary:"Move data between boards, services, and apps."}),Object.freeze({id:"interface",label:"Board interfaces",summary:"Bring up buses, cameras, USB, and peripheral links."})]),m=Object.freeze([["bme280","sensor","BME280","Temperature, humidity, and pressure",["i2c"]],["mpu6050","sensor","MPU6050","Acceleration and angular velocity",["i2c"]],["hcsr04","sensor","HC-SR04","Ultrasonic distance",["gpio"]],["irsensor","sensor","IR obstacle sensor","Digital obstacle presence",["gpio"]],["dht11","sensor","DHT11","Basic temperature and humidity",["gpio"]],["dht22","sensor","DHT22","Improved temperature and humidity",["gpio"]],["mq2","sensor","MQ-2","Smoke and combustible gas response",["adc"]],["pir","sensor","HC-SR501 PIR","Motion detection",["gpio"]],["bmp280","sensor","BMP280","Temperature and barometric pressure",["i2c"]],["ds18b20","sensor","DS18B20","Digital temperature on a OneWire bus",["onewire"]],["bh1750","sensor","BH1750","Ambient light in lux",["i2c"]],["vl53l0x","sensor","VL53L0X","Time-of-flight distance",["i2c"]],["ads1115","sensor","ADS1115","16-bit external analog conversion",["i2c"]],["hx711","sensor","HX711 + load cell","Weight and force measurement",["gpio"]],["soil-moisture","sensor","Capacitive soil moisture","Calibrated analog moisture level",["adc"]],["espnow-sender","communication","ESP-NOW sender","Low-latency ESP32 peer messages",["wifi"]],["espnow-receiver","communication","ESP-NOW receiver","Receive ESP32 peer messages",["wifi"]],["uart-comm","communication","UART link","Board-to-board serial communication",["uart"]],["http-client","communication","HTTP client","Send or fetch web API data",["http"]],["http-server","communication","HTTP server","Expose a local device endpoint",["http"]],["mqtt-publisher","communication","MQTT publisher","Publish device telemetry",["mqtt"]],["mqtt-subscriber","communication","MQTT subscriber","Receive device commands",["mqtt"]],["ble-server","communication","BLE GATT server","Advertise readable or notifiable data",["ble"]],["ble-client","communication","BLE GATT client","Scan and connect to peripherals",["ble"]],["esp32s3-usb-cdc","interface","ESP32-S3 USB CDC","Native USB serial bring-up",["usb"]],["esp32s3-camera","interface","OV2640 camera","ESP32-S3 camera capture",["i2s"]],["i2c-scanner","interface","I2C bus scanner","Discover device addresses",["i2c"]],["spi-transfer","interface","SPI transfer","Full-duplex peripheral exchange",["spi"]]].map(([e,i,n,r,t])=>Object.freeze({id:e,family:i,label:n,summary:r,protocols:Object.freeze(t)}))),b=Object.freeze([["weather-station","sensor","bme280","Weather station","Read temperature, humidity, and pressure together",{i2cAddress:"0x76"}],["tank-distance","sensor","vl53l0x","Tank distance","Measure short-range distance without an ultrasonic echo",{}],["load-cell-scale","sensor","hx711","Load-cell scale","Start a calibrated weight measurement",{dataPin:19,clockPin:18,calibrationFactor:-7050}],["light-monitor","sensor","bh1750","Light monitor","Report ambient illuminance in lux",{}],["plant-moisture","sensor","soil-moisture","Plant moisture","Calibrate dry and wet soil readings",{adcPin:34,dryReading:3e3,wetReading:1300}],["temperature-bus","sensor","ds18b20","Temperature bus","Read a waterproof OneWire temperature probe",{dataPin:4}],["board-telemetry","communication","mqtt-publisher","Publish telemetry","Send periodic device state through MQTT",{}],["remote-command","communication","mqtt-subscriber","Receive commands","Subscribe to a command topic",{}],["local-api","communication","http-server","Local device API","Expose a JSON health endpoint",{}],["peer-link","communication","espnow-sender","ESP-NOW peer link","Send a compact message between ESP32 boards",{}],["bus-diagnostics","interface","i2c-scanner","I2C diagnostics","Find addresses during hardware bring-up",{}],["spi-bring-up","interface","spi-transfer","SPI bring-up","Verify chip-select and transfer wiring",{csPin:5}]].map(([e,i,n,r,t,a])=>Object.freeze({id:e,family:i,target:n,title:r,summary:t,params:Object.freeze(a)}))),f=Object.freeze({...s,bmp280:s.bme280,ds18b20:[{key:"dataPin",label:"Data pin (GPIO)",type:"number",default:4}],hx711:[{key:"dataPin",label:"Data pin (GPIO)",type:"number",default:19},{key:"clockPin",label:"Clock pin (GPIO)",type:"number",default:18},{key:"calibrationFactor",label:"Calibration factor",type:"number",default:-7050}],"soil-moisture":[{key:"adcPin",label:"ADC pin",type:"number",default:34},{key:"dryReading",label:"Dry calibration reading",type:"number",default:3e3},{key:"wetReading",label:"Wet calibration reading",type:"number",default:1300}],"spi-transfer":[{key:"csPin",label:"Chip-select pin",type:"number",default:5}]}),g=new Map(m.map(({id:e,family:i})=>[e,i])),h=Object.freeze({i2c:["Connect SDA and SCL to the board I2C pins.","Connect a common ground and use the module's supported supply voltage."],gpio:["Connect signal pins exactly as configured and share ground."],adc:["Connect the analog output to an ADC-capable pin and share ground."],onewire:["Connect DATA to the configured GPIO with the required pull-up resistor."],wifi:["No signal wires are required; both devices need compatible 2.4 GHz radio settings."],http:["No peripheral wiring is required beyond board power and network connectivity."],mqtt:["No peripheral wiring is required beyond board power and network connectivity."],ble:["No peripheral wiring is required beyond board power and BLE radio availability."],uart:["Cross TX to RX, RX to TX, and connect grounds."],usb:["Use the board's native USB connector and a data-capable cable."],i2s:["Camera data and clock pins must match the board module pinout."],spi:["Connect SCK, MOSI, MISO, CS, power, and a common ground."]}),S=Object.freeze([...o.map(e=>Object.freeze({...e,target:e.sensor,label:e.sensorLabel,family:g.get(e.sensor)})),...c.map(e=>Object.freeze({...e,family:g.get(e.target)}))]);function _(e){return S.find(i=>i.target===e)}e.s(["default",0,function(){let[e,s]=(0,n.useState)({family:"sensor",target:"bme280",environment:"arduino",protocol:"i2c"}),[l,d]=(0,n.useState)({}),[p,g]=(0,n.useState)("weather-station"),v=(0,n.useMemo)(()=>m.filter(i=>i.family===e.family),[e.family]),I=(0,n.useMemo)(()=>S.filter(i=>i.target===e.target),[e.target]),P=(0,n.useMemo)(()=>[...new Map(I.map(e=>[e.environment,e.environmentLabel])).entries()],[I]),E=(0,n.useMemo)(()=>[...new Map(I.filter(i=>i.environment===e.environment).map(e=>[e.protocol,e.protocolLabel])).entries()],[e.environment,I]),D=(0,n.useMemo)(()=>b.filter(i=>i.family===e.family),[e.family]),T=f[e.target]??[],y=l[e.target]??{},A=(0,n.useMemo)(()=>(function(e,i={}){let n=e.target??e.sensor,r=m.find(({id:e})=>e===n);if(!r||e.family&&e.family!==r.family)return{ok:!1,error:"UNSUPPORTED_CONFIGURATION",code:"",filename:null,dependencies:[],notes:[],wiring:[]};let t=c.find(i=>i.target===n&&i.environment===e.environment&&i.protocol===e.protocol),a=t?{ok:!0,code:t.generate(i),filename:t.filename,language:t.language,dependencies:t.dependencies,notes:t.notes}:function(e,i={}){let n=o.find(i=>i.sensor===e.sensor&&i.environment===e.environment&&i.protocol===e.protocol);return n?{ok:!0,code:n.generate(i),filename:n.filename,language:n.language,dependencies:n.dependencies,notes:n.notes}:{ok:!1,error:"UNSUPPORTED_CONFIGURATION",code:"",filename:null,dependencies:[],notes:[]}}({sensor:n,environment:e.environment,protocol:e.protocol},i);return{...a,wiring:a.ok?[...h[e.protocol]??["Check the selected board and module documentation before wiring."]]:[]}})(e,y),[e,y]),O=(i,n)=>{d(r=>({...r,[e.target]:{...r[e.target],[i.key]:"number"===i.type?Number(n):n}}))};return(0,i.jsx)(a.ToolShell,{title:"Embedded Code Workbench",description:"Choose a sensor, communication workflow, or board interface. Start from a working example, adjust real wiring values, and copy a documented starter project.",children:(0,i.jsxs)("div",{className:"embedded-workbench",children:[(0,i.jsx)("div",{className:"embedded-family-tabs",role:"tablist","aria-label":"Embedded code family",children:u.map(n=>(0,i.jsxs)("button",{className:`embedded-family-tab${e.family===n.id?" is-active":""}`,type:"button",role:"tab","aria-selected":e.family===n.id,"aria-pressed":e.family===n.id,onClick:()=>{let e;(e=function(e){let i=b.find(i=>i.family===e);if(!i)return null;let n=S.find(e=>e.target===i.target);return n?{example:i,params:{...i.params},selection:{family:e,target:i.target,environment:n.environment,protocol:n.protocol}}:null}(n.id))&&(g(e.example.id),d(i=>({...i,[e.selection.target]:e.params})),s(e.selection))},children:[(0,i.jsx)("strong",{children:n.label}),(0,i.jsx)("span",{children:n.summary})]},n.id))}),(0,i.jsx)(r,{examples:D,activeExampleId:p,onSelect:e=>{let i=_(e.target);i&&(g(e.id),d(i=>({...i,[e.target]:{...e.params}})),s({family:e.family,target:e.target,environment:i.environment,protocol:i.protocol}))}}),(0,i.jsxs)("div",{className:"embedded-workbench-grid",children:[(0,i.jsxs)("section",{className:"embedded-controls","aria-labelledby":"embedded-configuration-title",children:[(0,i.jsxs)("div",{className:"embedded-section-heading",children:[(0,i.jsx)("span",{className:"mono",children:"CONFIGURATION"}),(0,i.jsx)("h2",{id:"embedded-configuration-title",children:"Choose the hardware path"})]}),(0,i.jsxs)("label",{className:"tool-input",children:[(0,i.jsx)("span",{children:"sensor"===e.family?"Sensor":"communication"===e.family?"Communication workflow":"Board interface"}),(0,i.jsx)("select",{value:e.target,onChange:i=>((i,n=e.family)=>{let r=_(i);r&&s({family:n,target:i,environment:r.environment,protocol:r.protocol})})(i.target.value),children:v.map(e=>(0,i.jsxs)("option",{value:e.id,children:[e.label," — ",e.summary]},e.id))})]}),(0,i.jsxs)("label",{className:"tool-input",children:[(0,i.jsx)("span",{children:"Target environment"}),(0,i.jsx)("select",{value:e.environment,onChange:e=>{var i;let n;return i=e.target.value,void((n=I.find(e=>e.environment===i))&&s(e=>({...e,environment:i,protocol:n.protocol})))},children:P.map(([e,n])=>(0,i.jsx)("option",{value:e,children:n},e))})]}),(0,i.jsxs)("label",{className:"tool-input",children:[(0,i.jsx)("span",{children:"Protocol or bus"}),(0,i.jsx)("select",{value:e.protocol,onChange:e=>s(i=>({...i,protocol:e.target.value})),children:E.map(([e,n])=>(0,i.jsx)("option",{value:e,children:n},e))})]}),T.length?(0,i.jsxs)("div",{className:"embedded-parameter-group",children:[(0,i.jsx)("h3",{children:"Wiring and calibration"}),T.map(e=>(0,i.jsxs)("label",{className:"tool-input",children:[(0,i.jsx)("span",{children:e.label}),"select"===e.type?(0,i.jsx)("select",{value:String(y[e.key]??e.default),onChange:i=>O(e,i.target.value),children:e.options?.map(e=>(0,i.jsx)("option",{value:e.value,children:e.label},e.value))}):(0,i.jsx)("input",{type:"number",value:String(y[e.key]??e.default),onChange:i=>O(e,i.target.value)})]},e.key))]}):null]}),(0,i.jsxs)("section",{className:"embedded-output","aria-live":"polite","aria-labelledby":"embedded-output-title",children:[(0,i.jsxs)("div",{className:"embedded-section-heading",children:[(0,i.jsx)("span",{className:"mono",children:"GENERATED STARTER"}),(0,i.jsx)("h2",{id:"embedded-output-title",children:"Code, wiring, and dependencies"})]}),A.ok?(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(t,{code:A.code,label:A.filename||"main.cpp"}),(0,i.jsxs)("div",{className:"embedded-notes-grid",children:[(0,i.jsxs)("div",{children:[(0,i.jsx)("h3",{children:"Wiring"}),(0,i.jsx)("ul",{children:A.wiring.map(e=>(0,i.jsx)("li",{children:e},e))})]}),(0,i.jsxs)("div",{children:[(0,i.jsx)("h3",{children:"Notes"}),(0,i.jsx)("ul",{children:A.notes.map(e=>(0,i.jsx)("li",{children:e},e))})]}),(0,i.jsxs)("div",{children:[(0,i.jsx)("h3",{children:"Dependencies"}),A.dependencies.length?(0,i.jsx)("ul",{children:A.dependencies.map(e=>(0,i.jsxs)("li",{children:[e.name," ",(0,i.jsx)("code",{children:e.version})]},e.name))}):(0,i.jsx)("p",{children:"Uses board-core libraries only."})]})]})]}):(0,i.jsxs)("div",{className:"embedded-error",children:[(0,i.jsx)("strong",{children:"That combination is not available."}),(0,i.jsx)("p",{children:"Choose one of the environment and protocol pairs shown in the controls."})]})]})]})]})})}],15004)},8380,e=>{"use strict";var i=e.i(43476),n=e.i(22016);function r({title:e,action:n}){return(0,i.jsxs)("div",{className:"section-heading",children:[(0,i.jsx)("div",{children:(0,i.jsx)("h2",{children:e})}),n]})}e.s(["ToolShell",0,function({title:e,description:t,children:a}){return(0,i.jsxs)("section",{className:"section shell tool-page",children:[(0,i.jsxs)("div",{className:"tool-shell-heading",children:[(0,i.jsx)(n.default,{href:"/tools",className:"text-link tool-shell-back",children:"Back to Tools"}),(0,i.jsx)(r,{title:e}),(0,i.jsx)("p",{className:"section-intro tool-shell-description",children:t})]}),(0,i.jsx)("div",{className:"tool-grid",children:a})]})}],8380)}]);