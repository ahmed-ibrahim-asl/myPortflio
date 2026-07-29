"use client";

import styles from "./SecurityMission.module.css";

export function SecurityWarningPanel({
  authorizationContext,
  privilege,
  warnings = [],
}: {
  authorizationContext?: string;
  privilege?: string;
  warnings?: string[];
}) {
  const notices = [
    authorizationContext !== "certification-lab"
      ? `Authorization context: ${authorizationContext}. Confirm the target remains inside explicit scope.`
      : null,
    privilege === "elevated"
      ? "This command needs elevated local privileges."
      : null,
    ...warnings,
  ].filter(Boolean);
  if (notices.length === 0) return null;

  return (
    <div className={styles.warningPanel}>
      {notices.map((notice) => (
        <p key={String(notice)}>
          <strong>Scope notice</strong>
          <span>{notice}</span>
        </p>
      ))}
    </div>
  );
}
