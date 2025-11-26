
import React from "react";

export default function Footer({
  ownerName = "Toqa Kamal",
  ownerLinkedIn = "https://www.linkedin.com/in/toqa-kamal/",
}) {
  const year = new Date().getFullYear();

  const normalizeUrl = (url) => (url?.startsWith("http") ? url : `https://${url}`);
  const lk = normalizeUrl(ownerLinkedIn);

  return (
    <footer className="border-top bg-body-tertiary text-body-secondary py-3">
      <div className="container d-flex flex-column flex-md-row align-items-center justify-content-between gap-2">

        <div className="d-flex align-items-center gap-2">
          <small className="text-body-tertiary">© {year} • All rights reserved</small>
          <a
            href={lk}
            target="_blank"
            rel="noopener noreferrer"
            className="text-decoration-none"
            title="My LinkedIn"
          >
            <span className="badge rounded-pill bg-body text-body-emphasis border px-3 py-2">
              {ownerName}
            </span>
          </a>
        </div>


        <nav className="d-flex align-items-center gap-3 small">
          <a href="#" className="link-body-emphasis text-decoration-none">Privacy</a>
          <span className="text-body-tertiary">•</span>
          <a href="#" className="link-body-emphasis text-decoration-none">Terms</a>
          <span className="text-body-tertiary">•</span>
          <a href="#" className="link-body-emphasis text-decoration-none">Contact</a>
        </nav>


        <div className="d-flex align-items-center gap-2">
          <a
            href={lk}
            target="_blank"
            rel="noopener noreferrer"
            className="text-body-secondary"
            aria-label="LinkedIn"
            title="LinkedIn"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" className="d-block">
              <path fill="currentColor" d="M4.98 3.5A2.5 2.5 0 1 1 2.48 6 2.5 2.5 0 0 1 4.98 3.5M3 8.98h3.96V21H3zM9.5 8.98h3.8v1.64h.05c.53-.95 1.84-1.94 3.8-1.94 4.07 0 4.82 2.68 4.82 6.16V21H18V15.5c0-1.31-.02-3-1.83-3-1.83 0-2.11 1.43-2.11 2.9V21H9.5z"/>
            </svg>
          </a>
        </div>

      </div>
    </footer>
  );
}
