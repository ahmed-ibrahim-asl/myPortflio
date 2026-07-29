"use client";

import React from "react";

export function SecurityWarningPanel({
  authorizationContext,
  privilege,
  warnings = [],
}: {
  authorizationContext?: string;
  privilege?: string;
  warnings?: string[];
}) {
  const showPrivilegeWarning = privilege === "elevated";
  const showAuthContextNotice = authorizationContext && authorizationContext !== "certification-lab";

  if (!showPrivilegeWarning && !showAuthContextNotice && warnings.length === 0) {
    return null;
  }

  return (
    <div className="security-warning-panel mb-4 space-y-2 font-mono text-xs">
      {showAuthContextNotice && (
        <div className="p-2.5 bg-zinc-900 border border-amber-600 text-amber-300">
          <span className="font-bold">[SCOPE NOTICE] </span>
          Authorization context is set to <span className="underline">{authorizationContext}</span>.
          Ensure target is strictly within explicit scope.
        </div>
      )}

      {showPrivilegeWarning && (
        <div className="p-2.5 bg-zinc-900 border border-yellow-600 text-yellow-300">
          <span className="font-bold">[PRIVILEGE WARNING] </span>
          This action requires elevated root/administrator privileges on the target platform (e.g. sudo or Run as Administrator).
        </div>
      )}

      {warnings.map((warn, idx) => (
        <div key={idx} className="p-2.5 bg-zinc-900 border border-red-600 text-red-300">
          <span className="font-bold">[RATE/SCOPE WARNING] </span>
          {warn}
        </div>
      ))}
    </div>
  );
}
