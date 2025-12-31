import React from 'react';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'WrapQuote - Vinyl Wrap Material & Pricing Calculator',
  description: 'Calculate vinyl material and pricing accurately and quickly for wrap installers',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

