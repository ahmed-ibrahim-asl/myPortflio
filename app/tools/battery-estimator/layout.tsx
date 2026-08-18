import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "ESP32 Battery Life and Power Estimator",
  description:
    "Estimate ESP32 runtime, average current, Wi-Fi energy, sleep current, and usable battery capacity for an embedded design.",
  pathname: "/tools/battery-estimator/",
});

export default function BatteryEstimatorLayout({ children }: { children: ReactNode }) {
  return children;
}
