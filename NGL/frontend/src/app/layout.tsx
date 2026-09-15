import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Node Graph Editor - Next.js & Express',
  description: 'A modern, self-contained interactive Node Graph Editor web application built with Next.js, TypeScript, Express, and MongoDB.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="antialiased bg-[#090d16] text-slate-100 overflow-hidden min-h-screen select-none"
      >
        {children}
      </body>
    </html>
  );
}
