'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import AttackHeatmap from '@/components/AttackHeatmap';

export default function ThreatIntelPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [timeStr, setTimeStr] = useState('--:--:--');
  const [dateStr, setDateStr] = useState('---, --- --');

  useEffect(() => {
    const storedUser = localStorage.getItem('phisherman_user');
    if (!storedUser) {
      router.push('/login');
      return;
    }
    const updateClock = () => {
      const now = new Date();
      const hrs = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      const secs = String(now.getSeconds()).padStart(2, '0');
      setTimeStr(`${hrs}:${mins}:${secs}`);

      const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
      const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      setDateStr(`${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`);
    };
    updateClock();
    const clockInterval = setInterval(updateClock, 1000);

    const loadThreats = async () => {
      try {
        const res = await fetch('/api/threats');
        if (res.ok) {
          const data = await res.json();
          if (data.campaigns) setCampaigns(data.campaigns);
        }
      } catch (err) {
        console.error('Threats API error:', err);
      }
    };
    loadThreats();

    return () => clearInterval(clockInterval);
  }, []);

  const defaultCampaigns = [
    { name: 'PayFlow Recovery Wave', brand: 'PayPal', domains: 14, sev: 'high', seen: '2h ago' },
    { name: 'Google Account Lockout', brand: 'Google', domains: 9, sev: 'high', seen: '6h ago' },
    { name: 'Prime Billing Refresh', brand: 'Amazon', domains: 11, sev: 'high', seen: '9h ago' },
    { name: 'MFA Reset Notice', brand: 'Microsoft', domains: 6, sev: 'medium', seen: '13h ago' },
    { name: 'Card Verification Hold', brand: 'Chase', domains: 5, sev: 'medium', seen: '15h ago' },
    { name: 'Subscription Renewal', brand: 'Netflix', domains: 3, sev: 'low', seen: '22h ago' },
    { name: 'Device Sign-in Alert', brand: 'Apple', domains: 4, sev: 'medium', seen: '1d ago' },
  ];

  const list = campaigns.length > 0 ? campaigns : defaultCampaigns;

  return (
    <>
      {/* 100% Verbatim External Fonts & CSS from threat_intel.html */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />

      <style jsx global>{`
        :root {
          --bg: #050209;
          --panel-glass: rgba(255, 255, 255, 0.045);
          --line: rgba(255, 255, 255, 0.1);
          --cyan: #00F0FF;
          --magenta: #FF0055;
          --amber: #ffb020;
          --text: #eef2f7;
          --text-muted: #8b96a8;
          --text-faint: #4c5568;
          --font-display: 'Space Grotesk', sans-serif;
          --font-body: 'Inter', sans-serif;
          --font-mono: 'IBM Plex Mono', monospace;
          --sidebar-w: 240px;
        }

        * { box-sizing: border-box; }
        body { margin: 0; background: var(--bg); color: var(--text); font-family: var(--font-body); }

        .app { position: relative; min-height: 100vh; }
        .shell { position: relative; z-index: 2; display: flex; min-height: 100vh; }

        .sidebar {
          width: var(--sidebar-w); flex-shrink: 0; display: flex; flex-direction: column;
          border-right: 1px solid var(--line); background: rgba(255,255,255,0.025); backdrop-filter: blur(18px);
          padding: 24px 16px;
        }

        .brand { display: flex; align-items: center; gap: 12px; padding: 8px 6px 32px; border-bottom: 1px solid var(--line); margin-bottom: 20px; }
        .radar-mark {
          position: relative; width: 34px; height: 34px; border-radius: 50%;
          border: 1px solid rgba(0,240,255,0.4); display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 16px rgba(0,240,255,0.15);
        }
        .radar-mark::before {
          content: ""; position: absolute; inset: 0; border-radius: 50%;
          background: conic-gradient(from 0deg, rgba(0,240,255,0.65), transparent 28%, transparent 100%);
          animation: sweep 3.2s linear infinite;
          -webkit-mask: radial-gradient(circle, transparent 55%, black 56%);
                  mask: radial-gradient(circle, transparent 55%, black 56%);
        }
        .radar-mark .dot { width: 5px; height: 5px; border-radius: 50%; background: var(--cyan); box-shadow: 0 0 10px 2px rgba(0,240,255,0.8); z-index: 1; }
        @keyframes sweep { to { transform: rotate(360deg); } }

        .wordmark .n1 { font-family: var(--font-display); font-weight: 700; font-size: 18px; color: var(--text); }
        .wordmark .n3 { font-family: var(--font-body); font-weight: 500; font-size: 10px; color: var(--text-faint); text-transform: uppercase; }

        .nav { display: flex; flex-direction: column; gap: 6px; }
        .nav-item {
          display: flex; align-items: center; gap: 14px; padding: 12px 14px; border-radius: 9px;
          color: var(--text-muted); font-size: 14px; font-weight: 600; text-decoration: none;
        }
        .nav-item.active, .nav-item:hover { color: var(--text); background: rgba(0,240,255,0.06); }

        .content-col { flex: 1; min-width: 0; display: flex; flex-direction: column; }
        .topbar {
          display: flex; align-items: center; justify-content: space-between; padding: 0 32px; height: 72px;
          border-bottom: 1px solid var(--line); background: rgba(5,2,9,0.4); backdrop-filter: blur(18px);
        }

        .main { padding: 28px 36px 60px; }

        .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 20px; }
        .stat-card { padding: 18px 20px; border-radius: 16px; border: 1px solid var(--line); background: var(--panel-glass); }
        .stat-label { font-family: var(--font-mono); font-size: 10px; text-transform: uppercase; color: var(--text-faint); margin-bottom: 10px; }
        .stat-value { font-family: var(--font-display); font-weight: 700; font-size: 28px; }

        .panel { border-radius: 16px; border: 1px solid var(--line); background: var(--panel-glass); backdrop-filter: blur(20px); }
        .history-table { width: 100%; border-collapse: collapse; }
        .history-table thead th {
          text-align: left; font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase;
          color: var(--text-faint); padding: 12px 16px; border-bottom: 1px solid var(--line);
        }
        .history-table tbody td { padding: 13px 16px; border-bottom: 1px solid var(--line); font-size: 12.5px; }

        .sev { font-family: var(--font-mono); font-size: 10px; padding: 4px 9px; border-radius: 999px; display: inline-block; text-transform: uppercase; }
        .sev.critical, .sev.high { color: var(--magenta); border: 1px solid rgba(255,0,85,0.35); background: rgba(255,0,85,0.06); }
        .sev.medium { color: var(--amber); border: 1px solid rgba(255,176,32,0.35); background: rgba(255,176,32,0.06); }
        .sev.low { color: var(--cyan); border: 1px solid rgba(0,240,255,0.35); background: rgba(0,240,255,0.06); }
      `}</style>

      {/* 100% Verbatim Markup from threat_intel.html */}
      <div className="app">
        <div className="shell">
          <Sidebar activeRoute="threats" />

          <div className="content-col">
            <header className="topbar">
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-faint)' }}>Workspace</span> / <span style={{ color: 'var(--text)' }}>Threat Intelligence</span>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                {timeStr} | {dateStr}
              </div>
            </header>

            <main className="main">
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--cyan)', textTransform: 'uppercase' }}>Threat Intelligence</div>
                <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '26px', margin: 0 }}>Global Attack Heat Map &amp; Active Campaigns</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '6px 0 0' }}>Real-time host density heat zones, active phishing infrastructure, and brand-mimicry clusters observed in the last 24h.</p>
              </div>

              {/* Global Cyber Attack Heat Map */}
              <AttackHeatmap />

              <div className="stat-grid">
                <div className="stat-card">
                  <div className="stat-label">Active campaigns</div>
                  <div className="stat-value" style={{ color: '#FF0055' }}>7</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: '#FF0055', marginTop: '6px' }}>+2 vs yesterday</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">New IOCs today</div>
                  <div className="stat-value">341</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: '#00F0FF', marginTop: '6px' }}>Feed synced 4m ago</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Most mimicked brand</div>
                  <div className="stat-value" style={{ color: '#00F0FF', fontSize: '20px' }}>PayPal</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '6px' }}>38% of flagged domains</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Avg time to detect</div>
                  <div className="stat-value">1.8s</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: '#00F0FF', marginTop: '6px' }}>Down from 2.4s</div>
                </div>
              </div>

              <div className="panel" style={{ padding: '6px 8px' }}>
                <table className="history-table">
                  <thead>
                    <tr><th>Campaign Name</th><th>Brand Mimicked</th><th>Malicious Domains / Count</th><th>Severity</th><th>First Seen</th></tr>
                  </thead>
                  <tbody>
                    {list.map((c: any, i: number) => {
                      const sevClass = (c.sev || c.threatLevel || 'HIGH').toLowerCase();
                      return (
                        <tr key={i}>
                          <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text)' }}>{c.name}</td>
                          <td style={{ color: 'var(--text-muted)' }}>{c.brand || c.target}</td>
                          <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--cyan)', fontSize: '11.5px' }}>
                            {c.domains || 12}
                          </td>
                          <td><span className={`sev ${sevClass}`}>{c.sev || c.threatLevel || 'HIGH'}</span></td>
                          <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-faint)', fontSize: '11px' }}>{c.seen || '2h ago'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
