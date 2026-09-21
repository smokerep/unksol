import Link from 'next/link';
import AccessPanel from '../components/AccessPanel';
import Socials from '../components/Socials';

// Small Solana mark (the three slanted bars), shown next to "Solana" mentions.
// Filled with the official purple->green gradient.
function SolanaMark({ size = 12 }: { size?: number }) {
  const id = `solmark-${size}`;
  return (
    <svg className="sol-mark" viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="24" x2="24" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#9945FF" />
          <stop offset="1" stopColor="#14F195" />
        </linearGradient>
      </defs>
      <path fill={`url(#${id})`} d="M6.7 3.7h14.1l-3.5 3.9H3.2z" />
      <path fill={`url(#${id})`} d="M3.2 10.05h14.1l3.5 3.9H6.7z" />
      <path fill={`url(#${id})`} d="M6.7 16.4h14.1l-3.5 3.9H3.2z" />
    </svg>
  );
}

const PRODUCTS = [
  {
    n: '01',
    t: 'EXIT NETWORK',
    icon: '/brand/icons/i7.png',
    d: 'Anonymous WireGuard exits, region by region across the globe. Pick where you surface.',
    href: '#app',
    cta: 'activate →',
  },
  {
    n: '02',
    t: 'SEARCH',
    icon: '/brand/icons/i3.png',
    d: 'Private metasearch across 70+ sources. No tracking, no ads, no logs.',
    href: '/search',
    cta: 'search →',
  },
  {
    n: '03',
    t: 'BROWSER',
    icon: '/brand/icons/i4.png',
    d: 'Our desktop browser: tracker blocking, unk Search built in, one-click exit switching.',
    href: '/download',
    cta: 'download →',
  },
  {
    n: '04',
    t: 'SWAP',
    icon: '/brand/icons/i5.png',
    d: 'Swap straight from your wallet on Solana, routed by Jupiter — no accounts, no middleman.',
    href: '/swap',
    cta: 'swap →',
  },
];

const FEATURES = [
  {
    n: '01',
    t: 'TOKEN-GATED',
    icon: '/brand/icons/i8.png',
    d: 'No accounts, no cards. Hold $UNK and the layer verifies your wallet on-chain.',
  },
  {
    n: '02',
    t: 'ZERO LOG',
    icon: '/brand/icons/i6.png',
    d: 'Nothing stored, nothing to leak. Your activity dissolves behind the layer.',
  },
  {
    n: '03',
    t: 'ENCRYPTED EXITS',
    icon: '/brand/icons/i2.png',
    d: 'Modern WireGuard tunnels — fast, lightweight, end-to-end encrypted.',
  },
  {
    n: '04',
    t: 'ON-CHAIN',
    icon: '/brand/icons/i1.png',
    d: 'Eligibility checked directly on Solana, on every single access.',
  },
];

const STEPS = [
  { n: '01', t: 'Connect your wallet', d: 'Phantom or Solflare. One click.' },
  { n: '02', t: 'Sign', d: 'A message proving the wallet is yours. Free, zero gas.' },
  { n: '03', t: 'Hold $UNK', d: 'As long as you stay above the threshold, the layer is yours.' },
  { n: '04', t: 'Disappear', d: 'Pick an exit country and step behind the layer.' },
];

export default function Home() {
  return (
    <>
      <header className="nav">
        <a className="brand" href="#top">
          <img src="/brand/logo.png" alt="unk" className="brand-logo-img" />
          <span className="brand-name">unk</span>
          <span className="brand-cursor">█</span>
        </a>
        <nav className="nav-links">
          <a href="#features">features</a>
          <a href="#how">how it works</a>
          <Link href="/search">search</Link>
          <Link href="/download">download</Link>
          <Link href="/swap">swap</Link>
          <Socials />
          <a className="nav-cta" href="#app">[ launch<span className="cta-word"> app</span> ]</a>
        </nav>
      </header>

      <main id="top" className="page">
        {/* HERO */}
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">
              {'// THE PRIVATE LAYER · $UNK · '}
              <SolanaMark /> SOLANA
            </p>
            <h1 className="title">
              The private <span className="under">layer</span>
              <br />
              of Solana.
            </h1>
            <p className="lead">
              An anonymous layer wrapped around the chain: a growing network of exit
              nodes, private search, an anonymous browser and private swaps. No
              accounts, no logs — hold $UNK and the layer is yours.
            </p>
            <div className="cta-row">
              <a className="btn primary" href="#app">[ connect wallet ]</a>
              <a className="btn" href="#how">how it works →</a>
            </div>
            <p className="statusline">
              <span className="blink">●</span> layer: boot sequence — first exit regions coming
              online &nbsp;·&nbsp; logs: 0
            </p>
          </div>

          <div className="art-band hero-keyhole" aria-hidden="true">
            <div className="keyhole-img" />
            <div className="keyhole-glow" />
            <div className="keyhole-pulse" />
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="features">
          <p className="section-label">// why unk</p>
          <div className="feature-grid">
            {FEATURES.map((f) => (
              <article key={f.n} className="feature">
                <img src={f.icon} alt="" className="feature-icon" />
                <span className="feature-n">{f.n}</span>
                <h3 className="feature-t">{f.t}</h3>
                <p className="feature-d">{f.d}</p>
              </article>
            ))}
          </div>
        </section>

        {/* PRODUCTS */}
        <section id="products" className="products">
          <p className="section-label">// the layer</p>
          <h2 className="section-title">Four products. One layer.</h2>
          <div className="product-grid">
            {PRODUCTS.map((p) =>
              p.href.startsWith('/') ? (
                <Link key={p.n} className="product" href={p.href}>
                  <img src={p.icon} alt="" className="feature-icon" />
                  <span className="feature-n">{p.n}</span>
                  <h3 className="feature-t">{p.t}</h3>
                  <p className="feature-d">{p.d}</p>
                  <span className="product-cta">{p.cta}</span>
                </Link>
              ) : (
                <a key={p.n} className="product" href={p.href}>
                  <img src={p.icon} alt="" className="feature-icon" />
                  <span className="feature-n">{p.n}</span>
                  <h3 className="feature-t">{p.t}</h3>
                  <p className="feature-d">{p.d}</p>
                  <span className="product-cta">{p.cta}</span>
                </a>
              ),
            )}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" className="how">
          <p className="section-label">// how it works</p>
          <h2 className="section-title">From wallet to the layer in four steps.</h2>
          <ol className="steps">
            {STEPS.map((s) => (
              <li key={s.n} className="step">
                <span className="step-n">{s.n}</span>
                <div>
                  <h3 className="step-t">{s.t}</h3>
                  <p className="step-d">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* APP / ACCESS */}
        <section id="app" className="access">
          <div className="access-copy">
            <p className="section-label">// enter the layer</p>
            <h2 className="section-title">Connect your wallet and step inside.</h2>
            <p className="lead">
              Eligibility is verified on-chain. If you hold $UNK, you immediately get
              your WireGuard configuration — pick a country, import, disappear.
            </p>
            <ul className="access-notes">
              <li>→ signing costs no gas and creates no transaction</li>
              <li>→ if you sell the token, access is revoked automatically</li>
            </ul>
          </div>
          <AccessPanel />
        </section>

        {/* TOKEN */}
        <section id="token" className="token">
          <p className="section-label">// the token</p>
          <div className="token-grid">
            <div>
              <span className="token-badge">SPL TOKEN · LAUNCHING ON PUMP.FUN</span>
              <h2 className="section-title">One token. The whole layer.</h2>
              <p className="lead">
                $UNK is the key: hold it and every product of the layer unlocks for
                your wallet — no subscriptions, no accounts, no cards.
              </p>
              <ul className="token-points">
                <li>
                  → <b>Access</b> — VPN exits, browser and gated downloads verify your
                  balance on-chain, on every access
                </li>
                <li>
                  → <b>Self-revoking</b> — sell below the threshold and the layer
                  closes behind you, automatically
                </li>
                <li>
                  → <b>No promises</b> — utility from day one; the roadmap below is
                  built in public
                </li>
              </ul>
            </div>
            <div className="token-card">
              <div className="rowline"><span className="k">name</span><span className="v">unk</span></div>
              <div className="rowline"><span className="k">ticker</span><span className="v">$UNK</span></div>
              <div className="rowline"><span className="k">chain</span><span className="v">Solana</span></div>
              <div className="rowline"><span className="k">launch</span><span className="v">pump.fun</span></div>
              <div className="rowline"><span className="k">contract</span><span className="v">revealed at launch</span></div>
              <div className="rowline"><span className="k">utility</span><span className="v">token-gated privacy layer</span></div>
            </div>
          </div>
        </section>

        {/* ROADMAP */}
        <section id="roadmap" className="roadmap">
          <p className="section-label">// roadmap</p>
          <h2 className="section-title">Built in public, phase by phase.</h2>
          <div className="phase-grid">
            <article className="phase">
              <span className="phase-status live">LIVE</span>
              <h3 className="phase-t">01 · RAILS</h3>
              <p className="phase-d">
                Site, API and the on-chain gate: wallet sign-in, balance checks,
                WireGuard provisioning.
              </p>
            </article>
            <article className="phase">
              <span className="phase-status next">NEXT</span>
              <h3 className="phase-t">02 · EXIT FLEET</h3>
              <p className="phase-d">
                Anonymous exit nodes come online region by region — pick the country
                you surface from.
              </p>
            </article>
            <article className="phase">
              <span className="phase-status">SOON</span>
              <h3 className="phase-t">03 · BROWSER + SEARCH</h3>
              <p className="phase-d">
                The unk desktop browser and private metasearch open to all holders.
              </p>
            </article>
            <article className="phase">
              <span className="phase-status">LATER</span>
              <h3 className="phase-t">04 · SWAP &amp; BEYOND</h3>
              <p className="phase-d">
                Private swaps routed by Jupiter, straight from your wallet. Then the
                next chapter.
              </p>
            </article>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="faq">
          <p className="section-label">// faq</p>
          <h2 className="section-title">Questions, answered straight.</h2>
          <div className="faq-list">
            <details className="faq-item">
              <summary>What is unk?</summary>
              <p>
                A privacy layer wrapped around Solana: anonymous VPN exits, private
                search, a desktop browser and private swaps — all unlocked by holding
                the $UNK token. No accounts, no logs.
              </p>
            </details>
            <details className="faq-item">
              <summary>How does the token gate work?</summary>
              <p>
                You connect a wallet and sign a free message (no gas, no transaction).
                The API checks your $UNK balance directly on-chain. Hold enough → you
                are in. Sell below the threshold → access revokes automatically.
              </p>
            </details>
            <details className="faq-item">
              <summary>Do you ever touch my keys or funds?</summary>
              <p>
                Never. The signature only proves the wallet is yours. Nothing is
                custodial, nothing moves, and there is no account to create.
              </p>
            </details>
            <details className="faq-item">
              <summary>What do I need to enter?</summary>
              <p>
                A Solana wallet (Phantom or Solflare) holding $UNK above the access
                threshold, announced at launch. That is all.
              </p>
            </details>
            <details className="faq-item">
              <summary>What is live today?</summary>
              <p>
                The rails: site, API, wallet sign-in and the on-chain gate — in open
                beta. Exit regions come online one by one; the browser and search
                follow. We ship in public, no fake numbers.
              </p>
            </details>
            <details className="faq-item">
              <summary>Where do I buy $UNK?</summary>
              <p>
                On pump.fun at launch. The contract address will be published here and
                on our X — trust only those two sources.
              </p>
            </details>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-grid">
          <div className="f-col f-brand">
            <span className="brand">
              <img src="/brand/logo.png" alt="" className="brand-logo-img" width={22} height={22} />
              <span className="brand-name">unk</span>
            </span>
            <p className="f-tag">The private layer of Solana. No accounts, no logs.</p>
            <Socials />
          </div>
          <div className="f-col">
            <span className="f-head">product</span>
            <a href="#app">vpn</a>
            <Link href="/search">search</Link>
            <Link href="/download">download</Link>
            <Link href="/swap">swap</Link>
          </div>
          <div className="f-col">
            <span className="f-head">learn</span>
            <a href="#how">how it works</a>
            <a href="#token">the token</a>
            <a href="#roadmap">roadmap</a>
            <a href="#faq">faq</a>
          </div>
        </div>
        <div className="footer-row">
          <span className="footer-meta">
            built on <SolanaMark size={11} /> Solana · © 2026
          </span>
          <span className="f-disclaimer">
            unk is experimental beta software · nothing here is financial advice
          </span>
        </div>
      </footer>
    </>
  );
}
