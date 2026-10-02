import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TechFossil — Preserving the Evolution of Technology',
  description:
    'An open-source, continuously growing archive of software, AI, research, security, and developer ecosystem changes.',
  openGraph: {
    title: 'TechFossil — Preserving the Evolution of Technology',
    description:
      'An open-source, continuously growing archive of software, AI, research, security, and developer ecosystem changes.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TechFossil — Preserving the Evolution of Technology',
    description:
      'An open-source, continuously growing archive of software, AI, research, security, and developer ecosystem changes.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0c0d0e] text-[#ededed] antialiased selection:bg-[#2e3135] selection:text-white min-h-screen" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
