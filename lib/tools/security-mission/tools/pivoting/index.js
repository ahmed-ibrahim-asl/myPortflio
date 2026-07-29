import { CONTROLS as PIVOTING_CONTROLS } from "./controls.js";
import { TOOLS as PIVOTING_TOOLS } from "./tools.js";
import { SSH_TUNNELS_ACTIONS } from "./ssh-tunnels.js";
import { PROXY_TUNNELS_ACTIONS } from "./proxy-tunnels.js";

export const PIVOTING_ACTIONS = [
  ...SSH_TUNNELS_ACTIONS,
  ...PROXY_TUNNELS_ACTIONS
];
export { PIVOTING_TOOLS };
export { PIVOTING_CONTROLS };
