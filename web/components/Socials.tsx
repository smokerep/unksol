'use client';

import { useState } from 'react';

// ── Update these for unk / $UNK ───────────────────────────────────────────────
const TWITTER = 'https://x.com/unkprivacylayer'; // official unk X account
const GITHUB = 'https://github.com/smokerep/unksol'; // open source — don't trust, verify
const CONTRACT = 'EFCCHXG8ppKbpmLRm2adhCTeszYJKLNUE9ekjR5q4TL2'; // $UNK mint on Solana (stonkfun launch, 2026-09-22)
const DEXSCREENER = CONTRACT ? `https://dexscreener.com/solana/${CONTRACT}` : '';
// ──────────────────────────────────────────────────────────────────────────────

function GhIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function DexIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M7 3v18M17 3v18" />
      <rect x="4.5" y="8" width="5" height="7" rx="1" fill="currentColor" stroke="none" />
      <rect x="14.5" y="6" width="5" height="6" rx="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

export default function Socials() {
  const [copied, setCopied] = useState(false);

  function copyCA() {
    if (!CONTRACT || typeof navigator === 'undefined' || !navigator.clipboard) return;
    navigator.clipboard.writeText(CONTRACT).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    });
  }

  return (
    <div className="socials">
      <a
        className="social"
        href={TWITTER}
        target="_blank"
        rel="noreferrer"
        title="X / Twitter"
        aria-label="X (Twitter)"
      >
        <XIcon />
      </a>
      <a
        className="social"
        href={GITHUB}
        target="_blank"
        rel="noreferrer"
        title="GitHub — open source"
        aria-label="GitHub"
      >
        <GhIcon />
      </a>
      {DEXSCREENER && (
        <a
          className="social"
          href={DEXSCREENER}
          target="_blank"
          rel="noreferrer"
          title="Dexscreener"
          aria-label="Dexscreener"
        >
          <DexIcon />
        </a>
      )}
      <button
        type="button"
        className="social"
        onClick={copyCA}
        title={CONTRACT ? 'Copy contract address' : 'Contract address — coming soon'}
        aria-label="Contract address"
      >
        <CopyIcon />
        <span className="ca-text">{copied ? 'copied' : CONTRACT ? 'CA' : 'CA · soon'}</span>
      </button>
    </div>
  );
}
