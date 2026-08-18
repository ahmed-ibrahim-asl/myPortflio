(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,8380,e=>{"use strict";var i=e.i(43476),n=e.i(22016);function r({title:e,action:n}){return(0,i.jsxs)("div",{className:"section-heading",children:[(0,i.jsx)("div",{children:(0,i.jsx)("h2",{children:e})}),n]})}e.s(["ToolShell",0,function({title:e,description:t,children:o}){return(0,i.jsxs)("section",{className:"section shell tool-page",children:[(0,i.jsxs)("div",{style:{marginBottom:"32px"},children:[(0,i.jsxs)(n.default,{href:"/tools",className:"text-link",style:{display:"inline-block",marginBottom:"16px"},children:[(0,i.jsx)("span",{"aria-hidden":"true",children:"←"})," Back to Tools"]}),(0,i.jsx)(r,{title:e}),(0,i.jsx)("p",{className:"section-intro",style:{marginTop:"-20px"},children:t})]}),(0,i.jsx)("div",{className:"tool-grid",children:o})]})}],8380)},15004,e=>{"use strict";var i=e.i(43476),n=e.i(71645),r=e.i(8380);function t({code:e,label:r="TERMINAL_OUTPUT"}){let[o,a]=(0,n.useState)(!1);return(0,i.jsxs)("div",{className:"terminal-code-block",style:{background:"#090A0F",border:"1px solid #1A2235",borderRadius:"6px",position:"relative",marginTop:"16px",overflow:"hidden"},children:[(0,i.jsxs)("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"16px 16px 0 16px"},children:[(0,i.jsxs)("div",{style:{background:"#1E2E20",color:"#7CE38B",padding:"8px 16px",fontFamily:"monospace",fontSize:"0.85rem",fontWeight:600,display:"flex",alignItems:"center",gap:"8px"},children:[(0,i.jsx)("span",{children:">"}),(0,i.jsx)("span",{children:r})]}),(0,i.jsx)("button",{onClick:()=>{navigator.clipboard.writeText(e),a(!0),setTimeout(()=>a(!1),2e3)},style:{background:"#98E38B",color:"#000",border:"none",borderRadius:"4px",padding:"8px 24px",fontWeight:"bold",fontSize:"0.85rem",cursor:"pointer",transition:"background 0.2s"},onMouseEnter:e=>e.currentTarget.style.background="#7CE38B",onMouseLeave:e=>e.currentTarget.style.background="#98E38B",children:o?"COPIED":"COPY"})]}),(0,i.jsx)("pre",{style:{margin:0,padding:"24px",color:"#E2E8F0",fontFamily:"monospace",fontSize:"0.85rem",overflowX:"auto",whiteSpace:"pre"},children:(0,i.jsx)("code",{children:e})})]})}let o=[{id:"bme280-arduino-i2c",sensor:"bme280",sensorLabel:"BME280",environment:"arduino",environmentLabel:"Arduino IDE",protocol:"i2c",protocolLabel:"I²C",language:"cpp",filename:"bme280_example.ino",dependencies:[{name:"Adafruit BME280 Library",version:"tested-version"},{name:"Adafruit Unified Sensor",version:"tested-version"}],notes:["Default address is 0x76.","Try 0x77 when the address pin is configured high."],generate:(e={})=>{let i="0x77"===e.i2cAddress?"0x77":"0x76";return`#include <Wire.h>
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
`}],a=Object.freeze({bme280:[{key:"i2cAddress",label:"I2C address",type:"select",options:[{value:"0x76",label:"0x76 (SDO tied to GND — most breakout boards ship this way)"},{value:"0x77",label:"0x77 (SDO tied to VDDIO)"}],default:"0x76"}],mpu6050:[{key:"i2cAddress",label:"I2C address",type:"select",options:[{value:"0x68",label:"0x68 (AD0 low — default)"},{value:"0x69",label:"0x69 (AD0 tied high — for running two on one bus)"}],default:"0x68"}],hcsr04:[{key:"trigPin",label:"Trigger pin (GPIO)",type:"number",default:5},{key:"echoPin",label:"Echo pin (GPIO)",type:"number",default:18}],dht11:[{key:"dataPin",label:"Data pin (GPIO)",type:"number",default:4}],dht22:[{key:"dataPin",label:"Data pin (GPIO)",type:"number",default:4}],pir:[{key:"pirPin",label:"Output pin (GPIO)",type:"number",default:13}]});e.s(["default",0,function(){let[e,l]=(0,n.useState)({sensor:"bme280",environment:"arduino",protocol:"i2c"}),[s,d]=(0,n.useState)({}),p=e=>{let i=new Set;return o.filter(i=>i.sensor===e).forEach(e=>i.add(e.environment)),Array.from(i)},c=(e,i)=>{let n=new Set;return o.filter(n=>n.sensor===e&&n.environment===i).forEach(e=>n.add(e.protocol)),Array.from(n)},u=e=>{let{name:i,value:n}=e.target;l(e=>{let r={...e,[i]:n};if("sensor"===i){let e=p(n);e.includes(r.environment)||(r.environment=e[0]);let i=c(n,r.environment);i.includes(r.protocol)||(r.protocol=i[0])}else if("environment"===i){let e=c(r.sensor,n);e.includes(r.protocol)||(r.protocol=e[0])}return r})},m=a[e.sensor],f=s[e.sensor]||{},_=(i,n,r)=>{d(t=>({...t,[e.sensor]:{...t[e.sensor],[i]:"number"===r?Number(n):n}}))},g=(0,n.useMemo)(()=>(function(e,i={}){let n=o.find(i=>i.sensor===e.sensor&&i.environment===e.environment&&i.protocol===e.protocol);return n?{ok:!0,code:n.generate(i),filename:n.filename,language:n.language,dependencies:n.dependencies,notes:n.notes}:{ok:!1,error:"UNSUPPORTED_CONFIGURATION",code:"",filename:null,dependencies:[],notes:[]}})(e,f),[e,f]);return(0,i.jsxs)(r.ToolShell,{title:"Sensor Code Generator",description:"Generate validated starter code for selected embedded sensors and development environments.",children:[(0,i.jsxs)("div",{className:"tool-controls",children:[(0,i.jsx)("h3",{className:"mono",style:{fontSize:"0.8rem",color:"var(--pixel-gold)"},children:"CONFIGURATION"}),(0,i.jsxs)("div",{className:"tool-input",children:[(0,i.jsx)("label",{htmlFor:"sensor",children:"Sensor"}),(0,i.jsxs)("select",{id:"sensor",name:"sensor",value:e.sensor,onChange:u,children:[(0,i.jsxs)("optgroup",{label:"Sensors",children:[(0,i.jsx)("option",{value:"bme280",children:"BME280 (Temp/Hum/Pres)"}),(0,i.jsx)("option",{value:"mpu6050",children:"MPU6050 (Accel/Gyro)"}),(0,i.jsx)("option",{value:"hcsr04",children:"HC-SR04 (Ultrasonic)"}),(0,i.jsx)("option",{value:"irsensor",children:"IR Obstacle (Digital)"}),(0,i.jsx)("option",{value:"dht11",children:"DHT11 (Temp/Hum)"}),(0,i.jsx)("option",{value:"dht22",children:"DHT22 (Temp/Hum)"}),(0,i.jsx)("option",{value:"mq2",children:"MQ-2 (Smoke/Gas)"}),(0,i.jsx)("option",{value:"pir",children:"HC-SR501 (PIR Motion)"})]}),(0,i.jsxs)("optgroup",{label:"ESP32 Communication",children:[(0,i.jsx)("option",{value:"espnow-sender",children:"ESP-NOW (Sender)"}),(0,i.jsx)("option",{value:"espnow-receiver",children:"ESP-NOW (Receiver)"}),(0,i.jsx)("option",{value:"uart-comm",children:"UART / Serial2"})]}),(0,i.jsxs)("optgroup",{label:"ESP32-S3 Specifics",children:[(0,i.jsx)("option",{value:"esp32s3-usb-cdc",children:"Native USB CDC"}),(0,i.jsx)("option",{value:"esp32s3-camera",children:"OV2640 Camera"})]})]})]}),(0,i.jsxs)("div",{className:"tool-input",children:[(0,i.jsx)("label",{htmlFor:"environment",children:"Target Environment"}),(0,i.jsx)("select",{id:"environment",name:"environment",value:e.environment,onChange:u,children:p(e.sensor).map(e=>(0,i.jsx)("option",{value:e,children:o.find(i=>i.environment===e)?.environmentLabel||e},e))})]}),(0,i.jsxs)("div",{className:"tool-input",children:[(0,i.jsx)("label",{htmlFor:"protocol",children:"Protocol"}),(0,i.jsx)("select",{id:"protocol",name:"protocol",value:e.protocol,onChange:u,children:c(e.sensor,e.environment).map(e=>(0,i.jsx)("option",{value:e,children:o.find(i=>i.protocol===e)?.protocolLabel||e},e))})]}),m&&m.length>0?(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)("h3",{className:"mono",style:{fontSize:"0.8rem",color:"var(--pixel-gold)",margin:"16px 0 4px"},children:"WIRING"}),m.map(e=>(0,i.jsx)("div",{className:"tool-input",children:(0,i.jsxs)("label",{htmlFor:e.key,children:[e.label,"select"===e.type?(0,i.jsx)("select",{id:e.key,value:String(f[e.key]??e.default),onChange:i=>_(e.key,i.target.value,e.type),children:e.options?.map(e=>(0,i.jsx)("option",{value:e.value,children:e.label},e.value))}):(0,i.jsx)("input",{id:e.key,type:"number",value:String(f[e.key]??e.default),onChange:i=>_(e.key,i.target.value,e.type)})]})},e.key))]}):null]}),(0,i.jsx)("div",{style:{display:"flex",flexDirection:"column",gap:"24px"},"aria-live":"polite",children:g.ok?(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(t,{code:g.code,label:g.filename||"main.cpp"}),(0,i.jsxs)("div",{className:"tool-result-card",style:{padding:"16px",background:"rgba(85, 213, 216, 0.05)",borderColor:"#202844"},children:[(0,i.jsx)("span",{className:"mono",style:{color:"var(--pixel-cyan)",fontSize:"0.75rem"},children:"NOTES"}),(0,i.jsx)("ul",{style:{margin:"8px 0 0",paddingLeft:"20px",fontSize:"0.85rem",color:"var(--muted)"},children:g.notes.map((e,n)=>(0,i.jsx)("li",{children:e},n))}),g.dependencies.length>0&&(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)("span",{className:"mono",style:{display:"block",color:"var(--pixel-gold)",fontSize:"0.75rem",marginTop:"16px"},children:"DEPENDENCIES"}),(0,i.jsx)("ul",{style:{margin:"8px 0 0",paddingLeft:"20px",fontSize:"0.85rem",color:"var(--muted)"},children:g.dependencies.map((e,n)=>(0,i.jsxs)("li",{children:[e.name," ",(0,i.jsx)("code",{style:{fontSize:"0.8em"},children:e.version})]},n))})]})]})]}):(0,i.jsxs)("div",{className:"tool-result-card",children:[(0,i.jsx)("span",{className:"hud-card-label mono",style:{color:"var(--tool-error)"},children:"ERROR"}),(0,i.jsx)("div",{className:"metric-value mono",style:{fontSize:"1.5rem"},children:g.error}),(0,i.jsx)("p",{style:{fontSize:"0.85rem",color:"var(--muted)"},children:"This sensor configuration is not currently supported."})]})})]})}],15004)}]);