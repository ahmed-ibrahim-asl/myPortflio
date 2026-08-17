import React from "react";

export default function Loading() {
  return (
    <div className="shell page-section" aria-busy="true" aria-label="Loading content">
      <div
        style={{
          margin: "32px auto",
          maxWidth: "760px",
          padding: "36px",
          background: "#080b1b",
          border: "2px solid #30395e",
          boxShadow: "6px 6px 0 #02030a"
        }}
      >
        <div
          style={{
            height: "14px",
            width: "120px",
            background: "var(--pixel-cyan)",
            marginBottom: "20px"
          }}
        />
        <div
          style={{
            height: "36px",
            width: "80%",
            background: "#161c38",
            marginBottom: "16px"
          }}
        />
        <div
          style={{
            height: "18px",
            width: "100%",
            background: "#12172f",
            marginBottom: "10px"
          }}
        />
        <div style={{ height: "18px", width: "65%", background: "#12172f" }} />
      </div>
    </div>
  );
}
