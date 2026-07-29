import { CONTROLS as TRAFFIC_CONTROLS } from "./controls.js";
import { TOOLS as TRAFFIC_TOOLS } from "./tools.js";
import { PACKET_CRAFTING_ACTIONS } from "./packet-crafting.js";
import { CAPTURE_AND_ANALYSIS_ACTIONS } from "./capture-and-analysis.js";

export const TRAFFIC_ACTIONS = [
  ...PACKET_CRAFTING_ACTIONS,
  ...CAPTURE_AND_ANALYSIS_ACTIONS
];
export { TRAFFIC_TOOLS };
export { TRAFFIC_CONTROLS };
