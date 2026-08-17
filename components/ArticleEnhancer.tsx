"use client";

import { useEffect } from "react";

export function ArticleEnhancer() {
  useEffect(() => {
    const blocks = document.querySelectorAll<HTMLElement>(".article-body pre");
    const handlers: Array<[HTMLButtonElement, () => Promise<void>]> = [];

    blocks.forEach((block) => {
      if (block.querySelector(".copy-code")) return;
      const button = document.createElement("button");
      button.className = "copy-code";
      button.type = "button";
      button.textContent = "Copy";

      const handler = async () => {
        const code = block.querySelector("code")?.textContent || "";
        try {
          await navigator.clipboard.writeText(code);
          button.textContent = "Copied";
          window.setTimeout(() => {
            button.textContent = "Copy";
          }, 1500);
        } catch {
          button.textContent = "Error";
        }
      };

      button.addEventListener("click", handler);
      block.appendChild(button);
      handlers.push([button, handler]);
    });

    return () => {
      handlers.forEach(([button, handler]) =>
        button.removeEventListener("click", handler)
      );
    };
  }, []);

  return null;
}
