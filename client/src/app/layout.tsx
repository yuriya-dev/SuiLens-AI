import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SuiLens AI — AI Onchain Research Assistant for Sui',
  description: 'Understand Sui wallets, detect risks, track whales, and generate premium research reports with AI conversational intelligence, Tatum RPCs, and Walrus decentralized persistence.',
  icons: {
    icon: '/favicon.ico',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} h-full antialiased dark`}>
      <body className="h-full bg-background text-foreground antialiased selection:bg-cyan-glow/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
