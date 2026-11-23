import type { Metadata } from 'next';
import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

// Font Extended / Expanded Sans (persis PHOTOCRAFT, HIGHLIGHTS, GET IT)
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Survei Kepuasan Masyarakat - Disperindag',
  description: 'Sistem Informasi Survei Kepuasan Masyarakat Layanan Tera dan Tera Ulang Dinas Perdagangan dan Perindustrian',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable}`}>
      <body className="min-h-screen bg-[#0d0f12] text-[#e6e8eb] antialiased font-sans selection:bg-[#4f52ff] selection:text-white">
        {children}
      </body>
    </html>
  );
}
