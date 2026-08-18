import React from "react";
import Link from "next/link";
import { SocialIcon } from "@/components/SocialIcon";
import { profile } from "@/data/portfolio";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <h2>Need help with hardware, firmware, or a connected product?</h2>
        </div>
        <div className="footer-contact">
          <a className="text-link large" href={`mailto:${profile.email}`}>
            Email Ahmed
          </a>
          <div className="footer-links">
            {profile.socials.map((item) => (
              <a
                className="social-link"
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                aria-label={`${item.label} profile (opens in a new tab)`}
              >
                <SocialIcon label={item.label} />
                <span>{item.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>&copy; {new Date().getFullYear()} AHMED ASL</span>
        <span>EMBEDDED SYSTEMS &middot; IOT &middot; ROBOTICS</span>
        <Link href="/writing">READ ENGINEERING NOTES</Link>
      </div>
    </footer>
  );
}
