'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Shield,
  LayoutDashboard,
  Search,
  Globe2,
  History,
  Settings,
  LogOut,
  Bell,
  User,
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface AppShellProps {
  children: React.ReactNode;
  breadcrumbTitle?: string;
}

export default function AppShell({ children, breadcrumbTitle }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Scanner', href: '/scanner', icon: Search },
    { label: 'Threat Intel', href: '/threats', icon: Globe2 },
    { label: 'Scan History', href: '/history', icon: History },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#050209] flex text-gray-100">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-[#050209]/90 backdrop-blur-xl flex flex-col justify-between fixed top-0 bottom-0 left-0 z-40">
        <div>
          {/* Logo Header */}
          <div className="p-6 border-b border-white/10 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00F0FF]/20 to-[#FF0055]/20 border border-[#00F0FF]/40 flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#00F0FF]" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-lg tracking-wider text-white">
                PHISHER<span className="text-[#00F0FF]">MAN</span>
              </h1>
              <p className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">Command Center</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-white/5 text-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.1)]'
                      : 'text-gray-400 hover:text-[#00F0FF] hover:bg-white/[0.03]'
                  }`}
                >
                  {/* Active Indicator Bar */}
                  {isActive && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#00F0FF] rounded-r-full shadow-[0_0_10px_#00F0FF]" />
                  )}
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-[#00F0FF]' : 'text-gray-400 group-hover:text-[#00F0FF]'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Footer / Logout */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 border border-white/5">
            <div className="w-8 h-8 rounded-full bg-[#00F0FF]/20 border border-[#00F0FF]/40 flex items-center justify-center">
              <User className="w-4 h-4 text-[#00F0FF]" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">{currentUser?.name || 'Operator 01'}</p>
              <p className="text-[10px] text-gray-400 truncate">{currentUser?.email || 'admin@phisherman.cyber'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors border border-red-500/20"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 pl-64 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="h-16 border-b border-white/10 bg-[#050209]/80 backdrop-blur-xl px-8 flex items-center justify-between sticky top-0 z-30">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm font-mono text-gray-400">
            <span className="text-gray-500">Enterprise</span>
            <span className="text-gray-600">/</span>
            <span className="text-[#00F0FF] font-semibold">{breadcrumbTitle || 'Command Center'}</span>
          </div>

          {/* Quick Actions & Profile */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Quick scan URL or IP..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value) {
                    router.push(`/scanner?url=${encodeURIComponent(e.currentTarget.value)}`);
                  }
                }}
                className="w-64 bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF] transition-all"
              />
            </div>

            <div className="h-4 w-[1px] bg-white/10" />

            <button className="relative p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors border border-white/5">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#FF0055] shadow-[0_0_8px_#FF0055]" />
            </button>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
