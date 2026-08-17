"use client";

import React, { useEffect } from "react";
import Link from "next/link";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("Uncaught App Router error:", error);
  }, [error]);

  return (
    <div className="shell page-section">
      <div
        style={{
          margin: "40px auto",
          maxWidth: "680px",
          padding: "32px",
          background: "#0c1023",
          border: "2px solid #3a446d",
          boxShadow: "8px 8px 0 #02030a"
        }}
      >
        <h1 style={{ fontSize: "1.8rem", marginBottom: "16px", color: "var(--ink)" }}>
          Execution Boundary Tripped
        </h1>
        <p style={{ color: "#c6cdea", marginBottom: "24px" }}>
          A runtime component encountered an exception. The static site boundary recovered safely to prevent total application failure.
        </p>
        <div style={{ display: "flex", gap: "14px" }}>
          <button onClick={() => reset()} className="button primary" type="button">
            RETRY COMPONENT
          </button>
          <Link href="/" className="button light">
            RETURN TO HERO
          </Link>
        </div>
      </div>
    </div>
  );
}
