import { CONTROLS as CREDENTIAL_CONTROLS } from "./controls.js";
import { TOOLS as CREDENTIAL_TOOLS } from "./tools.js";
import { AUDITORS_ACTIONS } from "./auditors.js";
import { REMOTE_ACCESS_ACTIONS } from "./remote-access.js";

export const CREDENTIAL_ACTIONS = [
  ...AUDITORS_ACTIONS,
  ...REMOTE_ACCESS_ACTIONS
];
export { CREDENTIAL_TOOLS };
export { CREDENTIAL_CONTROLS };
