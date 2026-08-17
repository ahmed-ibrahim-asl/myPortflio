"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SystemHud } from "@/components/SystemHud";

const links = [
  { href: "/work", label: "01 / Work" },
  { href: "/about", label: "02 / About" },
  { href: "/writing", label: "03 / Writing" },
  { href: "/tools", label: "04 / Tools" },
  { href: "/contact", label: "05 / Contact" }
];

export function SiteHeader() {
  const pathname = usePathname() || "";
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link
          className="brand"
          href="/"
          onClick={() => setOpen(false)}
          aria-label="Ahmed Asl portfolio home"
        >
          <span className="brand-mark" aria-hidden="true">A1</span>
          <span>AHMED ASL // EMBEDDED SYSTEMS</span>
        </Link>

        <SystemHud />

        <button
          className="menu-toggle"
          type="button"
          aria-expanded={open}
          aria-controls="site-navigation"
          onClick={() => setOpen((value) => !value)}
        >
          <span>{open ? "Close menu" : "Open menu"}</span>
          <span aria-hidden="true">{open ? "×" : "+"}</span>
        </button>

        <nav
          id="site-navigation"
          className={`site-nav ${open ? "is-open" : ""}`}
          aria-label="Primary navigation"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={pathname.startsWith(link.href) ? "active" : ""}
              aria-current={pathname.startsWith(link.href) ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
