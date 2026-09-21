import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://super-bombolone-a4ec35.netlify.app'),
  title: 'unk — the private layer of Solana',
  description:
    'An anonymous exit network, private search, an anonymous browser and private swaps — gated by $UNK on Solana. Hold the token, own the layer.',
};

export const viewport: Viewport = {
  themeColor: '#faf8f3',
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
