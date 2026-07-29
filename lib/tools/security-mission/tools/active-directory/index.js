import { CONTROLS as ACTIVE_DIRECTORY_CONTROLS } from "./controls.js";
import { TOOLS as ACTIVE_DIRECTORY_TOOLS } from "./tools.js";
import { NETEXEC_ACTIONS } from "./netexec.js";
import { IMPACKET_ACTIONS } from "./impacket.js";
import { ENUMERATION_ACTIONS } from "./enumeration.js";
import { WINDOWS_COMPANIONS_ACTIONS } from "./windows-companions.js";

export const ACTIVE_DIRECTORY_ACTIONS = [
  ...NETEXEC_ACTIONS,
  ...IMPACKET_ACTIONS,
  ...ENUMERATION_ACTIONS,
  ...WINDOWS_COMPANIONS_ACTIONS
];
export { ACTIVE_DIRECTORY_TOOLS };
export { ACTIVE_DIRECTORY_CONTROLS };
