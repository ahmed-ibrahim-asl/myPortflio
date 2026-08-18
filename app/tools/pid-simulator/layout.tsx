import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Interactive PID Control Simulator",
  description:
    "Tune proportional, integral, and derivative gains and see the live response of thermal and mass-spring systems.",
  pathname: "/tools/pid-simulator/",
});

export default function PidSimulatorLayout({ children }: { children: ReactNode }) {
  return children;
}
