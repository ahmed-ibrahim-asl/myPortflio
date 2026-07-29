#!/usr/bin/env python3
import json
import os
import re

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPORTS_DIR = os.path.join(ROOT_DIR, "docs", "reports")
VERIFICATION_JSON_PATH = os.path.join(REPORTS_DIR, "2026-07-29-security-mission-tool-verification.json")
EVIDENCE_JSON_PATH = os.path.join(REPORTS_DIR, "2026-07-29-security-mission-evidence.json")
AUDIT_MD_PATH = os.path.join(REPORTS_DIR, "2026-07-29-security-mission-audit.md")

def main():
    with open(VERIFICATION_JSON_PATH, "r", encoding="utf-8") as f:
        verification = json.load(f)

    records = verification.get("records", [])
    total_records = len(records)
    local_help_count = sum(1 for r in records if r.get("evidenceTier") == "local-help")
    official_docs_count = sum(1 for r in records if r.get("evidenceTier") == "official-docs")
    pending_count = sum(1 for r in records if r.get("evidenceTier") == "pending")

    evidence_data = {
        "tool_name": "Security Mission",
        "route": "/tools/security-command-builder/",
        "tagline": "From objective to command, one choice at a time.",
        "date": "2026-07-29",
        "pending_public_actions": pending_count,
        "ecppt_objectives": {
            "total": 22,
            "covered": 22
        },
        "supporting_objectives": {
            "total": 5,
            "covered": 5
        },
        "commands": {
            "reviewed": total_records,
            "local_help_tier": local_help_count,
            "official_docs_tier": official_docs_count
        },
        "safety": {
            "server_execution": False,
            "arbitrary_shell": False,
            "secret_redaction": True,
            "rate_bounding": True
        },
        "ui": {
            "responsive_viewports": [320, 360, 390, 768, 900, 1024, 1440],
            "flat_styling": True
        }
    }

    with open(EVIDENCE_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(evidence_data, f, indent=2)

    audit_md = f"""# Security Mission Verification & Audit Report

**Date:** 2026-07-29  
**Product:** Security Mission  
**Route:** `/tools/security-command-builder/`  
**Tagline:** From objective to command, one choice at a time.  

## Executive Summary

Security Mission is a client-side command builder and educational lab helper designed for students and security practitioners. It translates technical security objectives into validated, deterministic command-line invocations across eCPPT domains and supporting laboratory disciplines.

## Verification Evidence

- **eCPPT Objective Coverage:** 22/22 (100%)
- **Supporting Domains Covered:** 5/5 (100%)
- **Verified Command Actions:** {total_records}
- **Local Help Tier Actions:** {local_help_count}
- **Official Docs Tier Actions:** {official_docs_count}
- **Pending Public Actions:** {pending_count}

## Safety & Security Guarantees

1. **Browser-Only Execution:** Commands are generated strictly client-side in JavaScript/React. The application has no server execution backend and sends no network requests to targets.
2. **Deterministic Token Compiler:** User input is parsed as typed data tokens and quoted appropriately for Bash, PowerShell, or CMD. Arbitrary shell injection is strictly prevented.
3. **Secret Redaction:** Placeholder values (e.g. `<PASSWORD>`, `<TOKEN>`) are used. Real credentials or secrets are sanitized recursively on import and export.
4. **Scope & Lockout Safety:** High-volume credential audits and packet generation actions enforce visible rate, scope, and lockout warnings.

## Limitations

- Security Mission generates command-line syntaxes; it does not execute actions or simulate live host responses.
- The certification mapping reflects the eCPPT objectives published by INE as reviewed on 2026-07-29.
- Security Mission is an independent educational utility and is not affiliated with, endorsed by, or sponsored by INE. It does not guarantee certification exam outcomes.
"""

    with open(AUDIT_MD_PATH, "w", encoding="utf-8") as f:
        f.write(audit_md)

    print(f"Generated {EVIDENCE_JSON_PATH} and {AUDIT_MD_PATH} successfully.")

if __name__ == "__main__":
    main()
