'use client';

import Link from 'next/link';

interface SidebarProps {
  activeRoute: 'dashboard' | 'scanner' | 'history' | 'threats' | 'settings';
}

export default function Sidebar({ activeRoute }: SidebarProps) {
  return (
    <>
      <style jsx global>{`
        :root {
          --bg: #050209;
          --cyan: #00F0FF;
          --cyan-rgb: 0, 240, 255;
          --cyan-soft: #7CE8F0;
          --magenta: #FF0055;
          --magenta-rgb: 255, 0, 85;
          --text: #f2f4f8;
          --text-dim: #9aa3b2;
          --text-faint: #5a6172;
          --glass-border: rgba(255, 255, 255, 0.1);
          --font-display: 'Space Grotesk', sans-serif;
          --font-body: 'Inter', sans-serif;
          --font-mono: 'Inter', sans-serif;
          --sidebar-w: 240px;
        }

        .sidebar {
          width: var(--sidebar-w); flex-shrink: 0; position: sticky; top: 0; align-self: flex-start; height: 100vh;
          display: flex; flex-direction: column; background: rgba(8, 4, 14, 0.6);
          backdrop-filter: blur(20px) saturate(140%);
          -webkit-backdrop-filter: blur(20px) saturate(140%);
          border-right: 1px solid var(--glass-border); z-index: 30;
        }

        .sidebar-brand { display: flex; align-items: center; gap: 12px; padding: 22px 18px 18px; border-bottom: 1px solid var(--glass-border); margin-bottom: 14px; }

        .radar-mark {
          position: relative; width: 34px; height: 34px; border-radius: 50%;
          border: 1px solid rgba(var(--cyan-rgb), 0.4);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
          box-shadow: 0 0 16px rgba(var(--cyan-rgb), 0.15);
        }
        .radar-mark::before {
          content: ""; position: absolute; inset: 0; border-radius: 50%;
          background: conic-gradient(from 0deg, rgba(var(--cyan-rgb), 0.65), transparent 28%, transparent 100%);
          animation: sweep 3.2s linear infinite;
          -webkit-mask: radial-gradient(circle, transparent 55%, black 56%);
                  mask: radial-gradient(circle, transparent 55%, black 56%);
        }
        .radar-mark .dot { width: 5px; height: 5px; border-radius: 50%; background: var(--cyan); box-shadow: 0 0 10px 2px rgba(var(--cyan-rgb), 0.8); z-index: 1; }
        @keyframes sweep { to { transform: rotate(360deg); } }

        .sidebar-brand .name {
          font-family: var(--font-display); font-weight: 700; font-size: 17px; letter-spacing: 0.06em; line-height: 1;
          background: linear-gradient(90deg, var(--text), var(--cyan-soft));
          -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
        }
        .sidebar-brand .sub { font-size: 9.5px; color: var(--text-faint); letter-spacing: 0.08em; text-transform: uppercase; margin-top: 3px; }

        nav.nav-list { padding: 0 12px; display: flex; flex-direction: column; gap: 3px; flex: 1; }

        .nav-item {
          position: relative; display: flex; align-items: center; gap: 12px;
          padding: 10px 14px 10px 17px; border-radius: 9px; color: var(--text-dim);
          font-size: 13px; font-weight: 500; text-decoration: none; overflow: hidden;
          transition: color .2s ease, background .2s ease, box-shadow .2s ease, transform .2s ease;
        }
        .nav-item::before {
          content: ""; position: absolute; left: 0; top: 50%; width: 3px; height: 0; background: var(--cyan);
          border-radius: 0 4px 4px 0; box-shadow: 0 0 12px rgba(var(--cyan-rgb), 0.85); transform: translateY(-50%);
          transition: height .3s cubic-bezier(.3, .8, .3, 1);
        }
        .nav-item svg { width: 16px; height: 16px; flex-shrink: 0; transition: color .2s ease, filter .2s ease; }
        .nav-item .label { flex: 1; }
        .nav-item .nav-badge { width: 6px; height: 6px; border-radius: 50%; background: var(--magenta); box-shadow: 0 0 8px rgba(var(--magenta-rgb), 0.8); flex-shrink: 0; }

        .nav-item:hover { background: rgba(var(--cyan-rgb), 0.09); color: var(--cyan); box-shadow: inset 0 0 0 1px rgba(var(--cyan-rgb), 0.16), 0 0 18px -6px rgba(var(--cyan-rgb), 0.35); transform: translateX(2px); }
        .nav-item:hover svg { color: var(--cyan); filter: drop-shadow(0 0 5px rgba(var(--cyan-rgb), 0.55)); }
        .nav-item:hover::before { height: 38%; }

        .nav-item.active { color: var(--text); background: rgba(var(--cyan-rgb), 0.09); }
        .nav-item.active svg { color: var(--cyan); filter: drop-shadow(0 0 4px rgba(var(--cyan-rgb), 0.6)); }
        .nav-item.active::before { height: 58%; }

        .sidebar-footer { padding: 14px 18px 20px; margin-top: auto; border-top: 1px solid var(--glass-border); display: flex; align-items: center; gap: 9px; }
        .sidebar-footer .sdot { width: 7px; height: 7px; border-radius: 50%; background: var(--cyan); box-shadow: 0 0 8px var(--cyan); }
        .sidebar-footer .stext { font-family: var(--font-mono); font-size: 11px; color: var(--text-faint); }
      `}</style>

      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="radar-mark"><div className="dot"></div></div>
          <div>
            <div className="name">VIGIL</div>
            <div className="sub">COMMAND CENTER</div>
          </div>
        </div>

        <nav className="nav-list">
          <Link href="/dashboard" className={`nav-item ${activeRoute === 'dashboard' ? 'active' : ''}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></svg>
            <span className="label">Dashboard</span>
          </Link>
          <Link href="/scanner" className={`nav-item ${activeRoute === 'scanner' ? 'active' : ''}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /><path d="M11 8v3l2 2" /></svg>
            <span className="label">Scanner</span>
          </Link>
          <Link href="/history" className={`nav-item ${activeRoute === 'history' ? 'active' : ''}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" /><path d="M12 7v5l3 3" /></svg>
            <span className="label">History</span>
          </Link>
          <Link href="/threats" className={`nav-item ${activeRoute === 'threats' ? 'active' : ''}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2 4 6v6c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10V6z" /><path d="M12 8v5M12 16h.01" /></svg>
            <span className="label">Threat Intel</span>
            <span className="nav-badge" title="New threat intel available"></span>
          </Link>
          <Link href="/settings" className={`nav-item ${activeRoute === 'settings' ? 'active' : ''}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
            <span className="label">Settings</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <span className="sdot"></span>
          <span className="stext">All systems operational</span>
        </div>
      </aside>
    </>
  );
}
