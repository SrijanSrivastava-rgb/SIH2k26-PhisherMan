'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, Lock, Terminal } from 'lucide-react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#050209]/80 backdrop-blur-xl border-b border-[#00F0FF]/30 py-3 shadow-[0_4px_30px_rgba(0,240,255,0.1)]'
          : 'bg-transparent py-5 border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00F0FF]/20 to-[#FF0055]/20 border border-[#00F0FF]/40 flex items-center justify-center group-hover:border-[#00F0FF] transition-all group-hover:shadow-[0_0_15px_rgba(0,240,255,0.4)]">
            <Shield className="w-5 h-5 text-[#00F0FF] group-hover:scale-110 transition-transform" />
          </div>
          <span className="font-heading font-bold text-xl tracking-wider text-white">
            PHISHER<span className="text-[#00F0FF]">MAN</span>
          </span>
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center gap-8">
          {[
            { label: 'Scanner', href: '/scanner' },
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Threat Intel', href: '/threats' },
            { label: 'History', href: '/history' },
            { label: 'Settings', href: '/settings' },
          ].map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="relative text-sm font-medium text-gray-300 hover:text-white transition-colors group py-1"
            >
              {link.label}
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#00F0FF] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center shadow-[0_0_8px_#00F0FF]" />
            </Link>
          ))}
        </div>

        {/* Auth Action Buttons */}
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium px-4 py-2 text-gray-300 hover:text-[#00F0FF] transition-colors flex items-center gap-2"
          >
            <Lock className="w-4 h-4" />
            Login
          </Link>
          <Link
            href="/dashboard"
            className="text-sm font-semibold px-5 py-2.5 rounded-lg bg-[#00F0FF] text-black hover:bg-[#00F0FF]/90 transition-all shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:shadow-[0_0_30px_rgba(0,240,255,0.7)] flex items-center gap-2"
          >
            <Terminal className="w-4 h-4" />
            Console
          </Link>
        </div>
      </div>
    </nav>
  );
}
