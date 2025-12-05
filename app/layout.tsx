import type { Metadata } from 'next';
import './globals.scss';

export const metadata: Metadata = {
  title: 'Government Web Performance Dashboard',
  description: 'Analyze and compare the performance and accessibility metrics of government websites using Google Lighthouse reports.',
  keywords: ['government', 'performance', 'accessibility', 'lighthouse', 'web performance'],
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
