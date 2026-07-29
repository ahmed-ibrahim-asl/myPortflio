import { verificationFor } from "../../verification-helpers.js";
export const NMAP_ACTIONS = Object.freeze([
  "nmap-host-discovery", "nmap-tcp-scan", "nmap-udp-scan",
  "nmap-service-enumeration", "nmap-nse-scan"
].map(id => {
  const isDiscovery = id === "nmap-host-discovery";
  const fixed = isDiscovery ? [{ type: "flag", value: "-sn" }] : [];
  return {
    id,
    toolId: "nmap",
    title: id.replace(/-/g, ' '),
    objectiveIds: ["host-discovery-port-scanning"],
    risk: "low",
    executable: { linux: "nmap", windows: "nmap.exe", macos: "nmap" },
    fixedTokens: fixed,
    argumentRules: [
      { positional: true, valuePath: "target.network" }
    ],
    verification: verificationFor(id),
  };
}));
