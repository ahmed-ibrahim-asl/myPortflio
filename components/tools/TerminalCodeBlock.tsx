"use client";

import React, { useState } from "react";

export function TerminalCodeBlock({ code, label = "TERMINAL_OUTPUT" }: { code: string, label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="terminal-code-block">
      <div className="terminal-code-header">
        <div className="terminal-code-label">
          <span>{">"}</span>
          <span>{label}</span>
        </div>
        <button 
          onClick={handleCopy}
          className="terminal-code-copy"
        >
          {copied ? "COPIED" : "COPY"}
        </button>
      </div>
      <pre className="terminal-code-pre">
        <code>{code}</code>
      </pre>
    </div>
  );
}
