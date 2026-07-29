import { CONTROLS as WEB_CONTROLS } from "./controls.js";
import { TOOLS as WEB_TOOLS } from "./tools.js";
import { HTTP_CLIENTS_ACTIONS } from "./http-clients.js";
import { FINGERPRINTING_ACTIONS } from "./fingerprinting.js";
import { CONTENT_DISCOVERY_ACTIONS } from "./content-discovery.js";
import { WEB_AUDIT_ACTIONS } from "./web-audit.js";
import { GUI_COMPANIONS_ACTIONS } from "./gui-companions.js";

export const WEB_ACTIONS = [
  ...HTTP_CLIENTS_ACTIONS,
  ...FINGERPRINTING_ACTIONS,
  ...CONTENT_DISCOVERY_ACTIONS,
  ...WEB_AUDIT_ACTIONS,
  ...GUI_COMPANIONS_ACTIONS
];
export { WEB_TOOLS };
export { WEB_CONTROLS };
