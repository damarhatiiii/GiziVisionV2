import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import { LayoutDashboard, History, Upload, Microscope } from 'lucide-react';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'GiziVision — Analisis Nutrisi Makanan Indonesia',
  description: 'Platform analisis kandungan nutrisi makanan Indonesia berbasis computer vision dan dataset gizi pangan nasional.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className="dark">
      <body className={`${inter.className} antialiased min-h-screen flex flex-col bg-bg`}>
        
        {/* ── NAVBAR ── */}
        <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur-sm">
          <nav className="container mx-auto px-6 max-w-7xl h-14 flex items-center justify-between">
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-7 h-7 rounded-md bg-brown flex items-center justify-center flex-shrink-0">
                <Microscope className="w-4 h-4 text-text-primary" />
              </div>
              <span className="font-bold text-[15px] tracking-tight text-text-primary">
                Gizi<span className="text-gold">Vision</span>
              </span>
            </Link>

            {/* Nav Links */}
            <div className="flex items-center gap-1 sm:gap-2">
              <Link href="/" className="nav-link">Beranda</Link>
              <Link href="/upload" className="nav-link">Pindai</Link>
              <Link href="/dashboard" className="nav-link">Dashboard</Link>
              <Link href="/history" className="nav-link">Riwayat</Link>
            </div>

            {/* CTA */}
            <div className="flex items-center gap-3">
              <Link
                href="/upload"
                className="btn-primary text-sm py-2 px-3 sm:px-4"
              >
                <Upload className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mulai Analisis</span>
              </Link>
            </div>

          </nav>
        </header>

        {/* ── PAGE CONTENT ── */}
        <main className="flex-1 flex flex-col">
          {children}
        </main>

        {/* ── FOOTER ── */}
        <footer className="border-t border-border py-8 mt-auto">
          <div className="container mx-auto px-6 max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-muted">GiziVision</span>
              <span className="text-text-disabled">·</span>
              <span className="text-xs text-text-muted">Platform Analisis Nutrisi Pangan Indonesia</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-xs text-text-muted hover:text-text-secondary transition-colors">Dashboard</Link>
              <Link href="/history" className="text-xs text-text-muted hover:text-text-secondary transition-colors">Riwayat</Link>
            </div>
          </div>
        </footer>

      </body>
    </html>
  );
}
