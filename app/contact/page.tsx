import React from "react";
import { SocialIcon } from "@/components/SocialIcon";
import { profile } from "@/data/portfolio";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Contact for Hardware and IoT Projects",
  description:
    "Contact Ahmed Asl about hardware prototypes, IoT products, embedded systems, robotics, connected products, mechatronics, or engineering collaboration.",
  pathname: "/contact/"
});

export default function ContactPage() {
  return (
    <section className="contact-page shell">
      <div className="contact-lead">
        <h1>Bring me the problem, even if the solution is not clear yet.</h1>
        <p>
          Tell me what you are trying to build or fix, what already exists, and where
          you are stuck. I will tell you whether I can help and what the next useful
          step should be.
        </p>
      </div>

      <div className="contact-grid">
        <form
          className="contact-form"
          action={`https://formsubmit.co/${profile.email}`}
          method="POST"
        >
          <input type="hidden" name="_subject" value="New portfolio inquiry" />
          <input type="hidden" name="_captcha" value="false" />
          <label>
            <span>Name or organization</span>
            <input name="name" required placeholder="Your name" />
          </label>
          <label>
            <span>Email address</span>
            <input name="email" type="email" required placeholder="you@example.com" />
          </label>
          <label>
            <span>Project brief</span>
            <textarea
              name="details"
              required
              rows={8}
              placeholder="Describe the system, constraints, current state, and desired result."
            />
          </label>
          <button className="button primary" type="submit">
            Send your project brief
          </button>
        </form>

        <aside className="contact-aside">
          <div>
            <div className="contact-socials">
              <a href={`mailto:${profile.email}`} aria-label="Email Ahmed directly">
                <span className="social-link-text">Email directly</span>
              </a>
              <a href={profile.whatsapp} target="_blank" rel="noreferrer" aria-label="Message Ahmed on WhatsApp">
                <span className="social-link-text">Message on WhatsApp</span>
              </a>
            </div>
          </div>
          <div>
            <div className="contact-socials">
              <a href={profile.cv} target="_blank" rel="noreferrer" aria-label="Open CV for employment evaluation">
                <span className="social-link-text">Open CV</span>
              </a>
              <a href={profile.scholar} target="_blank" rel="noreferrer" aria-label="Open Google Scholar for academic evaluation">
                <span className="social-link-text">Open Publications</span>
              </a>
            </div>
          </div>
          <div>
            <div className="contact-socials">
              {profile.socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${social.label} profile (opens in a new tab)`}
                >
                  <SocialIcon label={social.label} />
                  <span className="social-link-text">{social.label}</span>
                </a>
              ))}
            </div>
          </div>
          <p className="availability-note">
            <span className="status-dot" aria-hidden="true" />
            {profile.availability}
          </p>
        </aside>
      </div>
    </section>
  );
}
