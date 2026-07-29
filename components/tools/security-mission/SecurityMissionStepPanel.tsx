"use client";

import React from "react";
import { SecurityControlRenderer, SecurityControlDef } from "./SecurityControlRenderer";
import { SECURITY_OBJECTIVES } from "@/lib/tools/security-mission/objective-registry.js";
import { SECURITY_TOOLS } from "@/lib/tools/security-mission/catalog.js";

export function SecurityMissionStepPanel({
  stepId,
  project,
  dispatch,
  controls,
  validation,
  action,
}: {
  stepId: string;
  project: any;
  dispatch: React.Dispatch<any>;
  controls: SecurityControlDef[];
  validation: { errors: Record<string, string>; warnings: string[] };
  action: any;
}) {
  switch (stepId) {
    case "scope":
      return (
        <div className="space-y-4 font-mono text-xs">
          <div>
            <label className="block text-xs font-bold text-zinc-100 mb-1">
              Authorization Context
            </label>
            <select
              value={project.authorizationContext}
              onChange={(e) =>
                dispatch({
                  type: "set-authorization-context",
                  context: e.target.value,
                })
              }
              className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 text-xs p-2 font-mono focus:border-cyan-500 focus:outline-none rounded-none"
            >
              <option value="certification-lab">Certification Lab (e.g. eCPPT)</option>
              <option value="personal-lab">Personal Lab / Home Lab</option>
              <option value="ctf">Capture The Flag (CTF) Environment</option>
              <option value="client-authorized">Client-Authorized Assessment</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-100 mb-1">Target Operating System</label>
            <select
              value={project.platform}
              onChange={(e) =>
                dispatch({ type: "set-platform", platform: e.target.value })
              }
              className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 text-xs p-2 font-mono focus:border-cyan-500 focus:outline-none rounded-none"
            >
              <option value="linux">Linux</option>
              <option value="windows">Windows</option>
              <option value="macos">macOS</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-100 mb-1">Shell Format</label>
            <select
              value={project.shell}
              onChange={(e) =>
                dispatch({ type: "set-shell", shell: e.target.value })
              }
              className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 text-xs p-2 font-mono focus:border-cyan-500 focus:outline-none rounded-none"
            >
              <option value="bash">Bash / POSIX Shell</option>
              <option value="powershell">PowerShell</option>
              <option value="cmd">Windows Command Prompt (CMD)</option>
            </select>
          </div>
        </div>
      );

    case "objective":
      return (
        <div className="space-y-4 font-mono text-xs">
          <label className="block text-xs font-bold text-zinc-100 mb-1">Selected Objective</label>
          <select
            value={project.objectiveId}
            onChange={(e) =>
              dispatch({ type: "choose-objective", objectiveId: e.target.value })
            }
            className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 text-xs p-2 font-mono focus:border-cyan-500 focus:outline-none rounded-none"
          >
            {SECURITY_OBJECTIVES.map((obj: any) => (
              <option key={obj.id} value={obj.id}>
                {obj.title} ({obj.domain})
              </option>
            ))}
          </select>
        </div>
      );

    case "tool":
      return (
        <div className="space-y-4 font-mono text-xs">
          <label className="block text-xs font-bold text-zinc-100 mb-1">Selected Tool</label>
          <select
            value={project.toolId ?? ""}
            onChange={(e) =>
              dispatch({ type: "choose-tool", toolId: e.target.value || null })
            }
            className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 text-xs p-2 font-mono focus:border-cyan-500 focus:outline-none rounded-none"
          >
            <option value="">-- Choose a tool --</option>
            {SECURITY_TOOLS.map((t: any) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      );

    case "action":
      return (
        <div className="space-y-4 font-mono text-xs">
          <label className="block text-xs font-bold text-zinc-100 mb-1">
            Selected Action Recipe
          </label>
          <div className="text-zinc-400 text-xs mb-2">
            {action ? action.title : "Choose an action recipe matching your selected tool."}
          </div>
        </div>
      );

    case "target":
    case "configure":
      return (
        <SecurityControlRenderer
          controls={controls}
          values={project.options}
          errors={validation.errors}
          onChange={(key, val) =>
            dispatch({ type: "patch-options", patch: { [key]: val } })
          }
        />
      );

    case "review":
    case "generate":
      return (
        <div className="font-mono text-xs text-zinc-300 space-y-3">
          <div className="p-3 bg-zinc-900 border border-zinc-800">
            <div className="text-cyan-400 font-bold mb-1">[CONFIGURATION REVIEW]</div>
            <div>Context: {project.authorizationContext}</div>
            <div>Platform: {project.platform} ({project.shell})</div>
            <div>Learning Level: {project.learningLevel}</div>
          </div>
        </div>
      );

    default:
      return null;
  }
}
