import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nguyễn Minh Hạ Studio',
  description: 'Emotional Story Music Generator'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
