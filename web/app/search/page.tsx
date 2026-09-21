import Link from 'next/link';
import type { Metadata } from 'next';
import SearchApp from '../../components/SearchApp';
import Socials from '../../components/Socials';

export const metadata: Metadata = {
  title: 'unk Search — private, no-logs search',
  description: 'Private metasearch behind the unk layer. No tracking, no ads, no logs.',
};

export default function SearchPage() {
  return (
    <>
      <header className="nav">
        <Link className="brand" href="/">
          <img src="/brand/logo.png" alt="unk" className="brand-logo-img" />
          <span className="brand-name">unk</span>
          <span className="brand-cursor">█</span>
        </Link>
        <nav className="nav-links">
          <Link href="/">home</Link>
          <Link href="/#app">vpn</Link>
          <Link href="/download">download</Link>
          <Link href="/swap">swap</Link>
          <Socials />
          <span className="nav-cta nav-current">search</span>
        </nav>
      </header>

      <main className="page search-page">
        <SearchApp />
      </main>
    </>
  );
}
