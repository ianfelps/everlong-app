import type { Metadata, Viewport } from 'next';
import { Inter, Space_Mono, Yellowtail } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});
const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
  display: 'swap',
});
const yellowtail = Yellowtail({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-yellowtail',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Everlong',
  description: 'Álbum de memórias do casal',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0e2a3c',
};

const fontVars = [inter.variable, spaceMono.variable, yellowtail.variable].join(
  ' ',
);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={fontVars}>
      <body>
        <div className="app-bg" aria-hidden="true" />
        <div className="app-grain" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
