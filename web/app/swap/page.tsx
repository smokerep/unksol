import Link from 'next/link';
import type { Metadata } from 'next';
import BackgroundFX from '../../components/BackgroundFX';
import Socials from '../../components/Socials';

export const metadata: Metadata = {
  title: 'unk Swap — Solana',
  description: 'Private swaps on Solana, powered by Jupiter — live with the $UNK token.',
};

export default function SwapPage() {
  return (
    <>
      <BackgroundFX bg="bg2" />

      <header className="nav">
        <Link className="brand" href="/">
          <img src="/brand/logo.svg" alt="unk" className="brand-logo-img" />
          <span className="brand-name">unk</span>
          <span className="brand-cursor">█</span>
        </Link>
        <nav className="nav-links">
          <Link href="/">home</Link>
          <Link href="/#app">vpn</Link>
          <Link href="/search">search</Link>
          <Link href="/download">download</Link>
          <Socials />
          <span className="nav-cta nav-current">swap</span>
        </nav>
      </header>

      <main className="page swap-page">
        <div className="swapw">
          <div className="swapw-head">
            <h1 className="swapw-title">
              unk <span className="under">swap</span>
            </h1>
          </div>
          <div className="swapw-card swap-soon">
            <img src="/brand/icons/i5.png" alt="" className="feature-icon" />
            <h2 className="feature-t">goes live with $UNK</h2>
            <p className="feature-d">
              Private swaps straight from your wallet — SOL, $UNK and any Solana token, routed by
              Jupiter across every DEX for the best price. Unlocks right after the token launch.
            </p>
            <p className="swapw-foot">no accounts · no kyc · no middleman</p>
          </div>
        </div>
      </main>
    </>
  );
}
