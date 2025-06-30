import type React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { Providers } from '@/components/providers/session-provider';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SpotifyWrapped - Your Week in Music',
  description: 'Discover your weekly listening patterns and get an AI-generated music persona',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Providers session={session}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
