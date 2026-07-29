import test from "node:test";
import assert from "node:assert/strict";
import { getSecurityAction } from "../../lib/tools/security-mission/catalog.js";

test("traffic and wireless tools are registered and verified", () => {
  const expected = [
    "hping3-bounded-send", "tcpdump-capture", "tshark-capture", "wireshark-analyze",
    "iw-interface-info", "rfkill-unblock", "airmon-ng-monitor",
    "airodump-ng-capture", "aireplay-ng-deauth", "aircrack-ng-crack"
  ];
  for (const actionId of expected) {
    const action = getSecurityAction(actionId);
    assert.ok(action, actionId);
    assert.ok(["local-help", "official-docs"].includes(action.verification.evidenceTier), actionId);
  }
});
