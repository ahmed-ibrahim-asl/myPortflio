import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Embedded Code Generator for Sensors and Communication",
  description:
    "Generate Arduino, ESP-IDF, and PlatformIO examples for sensors, ESP-NOW, MQTT, BLE, UART, I2C, SPI, USB, and camera interfaces.",
  pathname: "/tools/sensor-code-generator/",
});

export default function SensorCodeGeneratorLayout({ children }: { children: ReactNode }) {
  return children;
}
