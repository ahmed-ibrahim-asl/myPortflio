import { CONTROLS as WIRELESS_CONTROLS } from "./controls.js";
import { TOOLS as WIRELESS_TOOLS } from "./tools.js";
import { INTERFACE_MANAGEMENT_ACTIONS } from "./interface-management.js";
import { AIRCRACK_SUITE_ACTIONS } from "./aircrack-suite.js";

export const WIRELESS_ACTIONS = [
  ...INTERFACE_MANAGEMENT_ACTIONS,
  ...AIRCRACK_SUITE_ACTIONS
];
export { WIRELESS_TOOLS };
export { WIRELESS_CONTROLS };
