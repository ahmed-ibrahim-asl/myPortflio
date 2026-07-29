"use client";

import {
  useRef,
  useState,
} from "react";

import styles from "./SecurityMission.module.css";

export function SecurityProjectImport({
  importError,
  importMessage,
  onImport,
}: {
  importError?: string;
  importMessage?: string;
  onImport: (json: string) => boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [readingError, setReadingError] = useState("");

  const handleFile = async (file?: File) => {
    if (!file) return;
    try {
      const accepted = onImport(await file.text());
      setReadingError(
        accepted ? "" : "The selected file does not contain valid JSON.",
      );
    } catch {
      setReadingError("The selected file could not be read.");
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const error = readingError || importError;
  return (
    <div className={styles.importPanel}>
      <div>
        <strong>Continue a saved mission</strong>
        <span>Import a local Security Mission JSON file.</span>
      </div>
      <label className={styles.fileButton}>
        Choose JSON
        <input
          ref={inputRef}
          type="file"
          accept="application/json,.json"
          onChange={(event) => handleFile(event.target.files?.[0])}
        />
      </label>
      <p aria-live="polite" data-import-status>
        {error || importMessage || "Values stay in this browser."}
      </p>
    </div>
  );
}
