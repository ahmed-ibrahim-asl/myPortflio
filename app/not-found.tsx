import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <section className="not-found shell">
      <h1>This page could not be found.</h1>
      <p>The address may have changed, or the article may still be a draft.</p>
      <Link className="button primary" href="/">
        Return to the portfolio <span aria-hidden="true">&rarr;</span>
      </Link>
    </section>
  );
}
