import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PhisherMan | Cyber-Void Internet Immunity & Phishing Scanner',
  description: 'Enterprise AI Phishing Detection & Real-Time Threat Intelligence Pipeline',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#050209] text-gray-100 min-h-screen selection:bg-[#00F0FF] selection:text-black">
        {children}
      </body>
    </html>
  );
}
