"use client";

import React, { useState, useMemo } from "react";
import { SECURITY_TOOLS } from "@/lib/tools/security-mission/catalog.js";

export function ToolBrowser({
  onSelectTool,
}: {
  onSelectTool: (toolId: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filteredTools = useMemo(() => {
    const query = search.trim().toLowerCase();
    return SECURITY_TOOLS.filter((tool: any) => {
      const matchesSearch =
        !query ||
        tool.name.toLowerCase().includes(query) ||
        (tool.aliases ?? []).some((a: string) => a.toLowerCase().includes(query)) ||
        tool.description.toLowerCase().includes(query);

      const matchesCategory =
        categoryFilter === "all" ||
        (tool.categories ?? []).includes(categoryFilter);

      return matchesSearch && matchesCategory;
    });
  }, [search, categoryFilter]);

  return (
    <div className="tool-browser font-mono text-xs space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tools or aliases (e.g., nmap, nc, hydra)..."
          className="flex-1 bg-zinc-900 border border-zinc-700 text-zinc-100 text-xs p-2 font-mono focus:border-cyan-500 focus:outline-none rounded-none"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-zinc-900 border border-zinc-700 text-zinc-100 text-xs p-2 font-mono focus:border-cyan-500 focus:outline-none rounded-none"
        >
          <option value="all">All Categories</option>
          <option value="network">Network</option>
          <option value="credential-auditing">Credential Auditing</option>
          <option value="web">Web Application</option>
          <option value="exploitation">Exploitation</option>
          <option value="pivoting">Pivoting</option>
          <option value="exploit-development">Exploit Dev</option>
          <option value="active-directory">Active Directory</option>
          <option value="traffic">Traffic Analysis</option>
          <option value="wireless">Wireless</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {filteredTools.map((tool: any) => (
          <div
            key={tool.id}
            onClick={() => onSelectTool(tool.id)}
            className="p-3 bg-zinc-900 border border-zinc-700 hover:border-cyan-500 cursor-pointer transition-colors"
          >
            <div className="flex justify-between items-start mb-1">
              <span className="font-bold text-cyan-400">{tool.name}</span>
              <span className="text-[10px] px-1 py-0.5 bg-zinc-800 text-zinc-400">
                {tool.interface}
              </span>
            </div>
            <p className="text-zinc-400 text-[11px] mb-2">{tool.description}</p>
            {tool.aliases && tool.aliases.length > 0 && (
              <div className="text-[10px] text-zinc-500">
                Aliases: {tool.aliases.join(", ")}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
