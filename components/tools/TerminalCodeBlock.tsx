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
    <div 
      className="terminal-code-block" 
      style={{ 
        background: "#090A0F", 
        border: "1px solid #1A2235", 
        borderRadius: "6px", 
        position: "relative",
        marginTop: "16px",
        overflow: "hidden"
      }}
    >
      {/* Header Area */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "16px 16px 0 16px" }}>
        
        {/* Tab Label */}
        <div style={{
          background: "#1E2E20",
          color: "#7CE38B",
          padding: "8px 16px",
          fontFamily: "monospace",
          fontSize: "0.85rem",
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          <span>{">"}</span>
          <span>{label}</span>
        </div>

        {/* Copy Button */}
        <button 
          onClick={handleCopy}
          style={{
            background: "#98E38B",
            color: "#000",
            border: "none",
            borderRadius: "4px",
            padding: "8px 24px",
            fontWeight: "bold",
            fontSize: "0.85rem",
            cursor: "pointer",
            transition: "background 0.2s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "#7CE38B"}
          onMouseLeave={(e) => e.currentTarget.style.background = "#98E38B"}
        >
          {copied ? "COPIED" : "COPY"}
        </button>

      </div>

      {/* Code Area */}
      <pre 
        style={{ 
          margin: 0, 
          padding: "24px", 
          color: "#E2E8F0", 
          fontFamily: "monospace",
          fontSize: "0.85rem",
          overflowX: "auto",
          whiteSpace: "pre",
        }}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}
