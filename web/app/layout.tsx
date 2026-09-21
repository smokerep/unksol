import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'unk — the private layer of Solana',
  description:
    'An anonymous exit network in 10 countries, private search, an anonymous browser and private swaps — gated by $UNK on Solana. Hold the token, own the layer.',
};

export const viewport: Viewport = {
  themeColor: '#06070a',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
