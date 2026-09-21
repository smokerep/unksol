import Link from 'next/link';
import type { Metadata } from 'next';
import BackgroundFX from '../../components/BackgroundFX';
import DownloadApp from '../../components/DownloadApp';
import Socials from '../../components/Socials';

export const metadata: Metadata = {
  title: 'Download — unk browser',
  description: 'Download the unk private browser. Free for $UNK holders.',
};

export default function DownloadPage() {
  return (
    <>
      <BackgroundFX bg="bg3" />

      <header className="nav">
        <Link className="brand" href="/">
          <img src="/brand/logo.png" alt="unk" className="brand-logo-img" />
          <span className="brand-name">unk</span>
          <span className="brand-cursor">█</span>
        </Link>
        <nav className="nav-links">
          <Link href="/">home</Link>
          <Link href="/search">search</Link>
          <Link href="/swap">swap</Link>
          <Socials />
          <span className="nav-cta nav-current">download</span>
        </nav>
      </header>

      <main className="page download-page">
        <p className="eyebrow">// DESKTOP BROWSER · FOR HOLDERS</p>
        <h1 className="search-heading">
          Download <span className="under">unk</span>
        </h1>
        <p className="lead search-lead">
          A privacy browser with VPN and private search built in. Free for $UNK holders — connect
          your wallet to unlock the download.
        </p>
        <DownloadApp />

        <section className="install-notes">
          <p className="section-label">// first launch</p>
          <p className="muted install-intro">
            It&apos;s an unsigned beta, so your OS warns you the first time. It&apos;s safe — here&apos;s how to open it:
          </p>
          <div className="install-grid">
            <div className="install-os">
              <h4>macOS</h4>
              <p>If it says <em>&ldquo;unk is damaged&rdquo;</em>, open <b>Terminal</b> and run:</p>
              <code>xattr -cr /Applications/unk.app</code>
              <p>then open the app normally.</p>
            </div>
            <div className="install-os">
              <h4>Windows</h4>
              <p>On the SmartScreen popup:</p>
              <p><b>More info</b> → <b>Run anyway</b>.</p>
            </div>
            <div className="install-os">
              <h4>Linux</h4>
              <p>Make the AppImage executable, then run it:</p>
              <code>chmod +x unk-*.AppImage</code>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
