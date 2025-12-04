import type { Metadata } from 'next';
import './globals.scss';

export const metadata: Metadata = {
  title: 'European Government Website Performance Dashboard',
  description: 'Analyze and compare the performance and accessibility metrics of European government websites using Google Lighthouse reports.',
  keywords: ['government', 'performance', 'accessibility', 'lighthouse', 'europe', 'web performance'],
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
