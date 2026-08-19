'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';

export default function HistoryPage() {
  const router = useRouter();
  const [scans, setScans] = useState<any[]>([]);
  const [filterBand, setFilterBand] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
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

    const loadHistory = async () => {
      let serverScans: any[] = [];
      try {
        const res = await fetch('/api/history');
        if (res.ok) {
          serverScans = await res.json();
        }
      } catch (err) {
        console.error('History API error:', err);
      }

      let localScans: any[] = [];
      try {
        localScans = JSON.parse(localStorage.getItem('phisherman_local_scans') || '[]');
      } catch {}

      const combinedMap = new Map();
      localScans.forEach((s: any) => {
        if (s && (s.domain || s.url)) combinedMap.set(s.url || s.domain, s);
      });
      serverScans.forEach((s: any) => {
        if (s && (s.domain || s.url) && !combinedMap.has(s.url || s.domain)) {
          combinedMap.set(s.url || s.domain, s);
        }
      });

      const mergedList = Array.from(combinedMap.values()).sort(
        (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setScans(mergedList);
    };
    loadHistory();

    return () => clearInterval(clockInterval);
  }, []);

  const filteredScans = scans.filter((scan) => {
    const verdict = (scan.verdict || 'SAFE').toLowerCase();
    if (filterBand === 'safe' && verdict !== 'safe') return false;
    if (filterBand === 'suspicious' && verdict !== 'suspicious') return false;
    if (filterBand === 'phishing' && verdict !== 'phishing' && verdict !== 'quarantined') return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        (scan.domain || '').toLowerCase().includes(q) ||
        (scan.url || '').toLowerCase().includes(q) ||
        (scan.ipAddress || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <>
      {/* 100% Verbatim External Fonts & CSS from history.html */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />

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

        .main { padding: 32px 40px 60px; }

        .history-toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; flex-wrap: wrap; gap: 12px; }
        .filter-chips { display: flex; gap: 8px; }
        .fchip {
          border: 1px solid var(--line); background: rgba(255,255,255,0.03); color: var(--text-muted);
          font-family: var(--font-mono); font-size: 10.5px; padding: 8px 14px; border-radius: 999px; cursor: pointer; text-transform: uppercase;
        }
        .fchip.active { color: var(--text); border-color: rgba(0,240,255,0.4); background: rgba(0,240,255,0.07); }

        .search-box {
          background: rgba(255,255,255,0.04); border: 1px solid var(--line); border-radius: 8px;
          padding: 9px 13px; color: var(--text); font-family: var(--font-mono); font-size: 11.5px; width: 230px;
        }
        .search-box:focus { outline: none; border-color: var(--cyan); }

        .panel { border-radius: 16px; border: 1px solid var(--line); background: var(--panel-glass); backdrop-filter: blur(20px); }
        .history-table { width: 100%; border-collapse: collapse; }
        .history-table thead th {
          text-align: left; font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase;
          color: var(--text-faint); padding: 12px 18px; border-bottom: 1px solid var(--line);
        }
        .history-table tbody td { padding: 14px 18px; border-bottom: 1px solid var(--line); font-size: 12.5px; }

        .badge {
          font-family: var(--font-mono); font-size: 10px; padding: 4px 10px; border-radius: 999px; display: inline-flex; align-items: center; gap: 5px; text-transform: uppercase;
        }
        .badge.safe { color: var(--cyan); border: 1px solid rgba(0,240,255,0.35); background: rgba(0,240,255,0.06); }
        .badge.suspicious { color: var(--amber); border: 1px solid rgba(255,176,32,0.35); background: rgba(255,176,32,0.06); }
        .badge.phishing, .badge.quarantined { color: var(--magenta); border: 1px solid rgba(255,0,85,0.35); background: rgba(255,0,85,0.06); }
      `}</style>

      {/* 100% Verbatim Markup from history.html */}
      <div className="app">
        <div className="shell">
          <Sidebar activeRoute="history" />

          <div className="content-col">
            <header className="topbar">
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-faint)' }}>Workspace</span> / <span style={{ color: 'var(--text)' }}>History</span>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                {timeStr} | {dateStr}
              </div>
            </header>

            <main className="main">
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--cyan)', textTransform: 'uppercase' }}>Audit Trail</div>
                <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '27px', margin: 0 }}>Scan History</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '7px 0 0' }}>Every scan run through this console, most recent first.</p>
              </div>

              <div className="history-toolbar">
                <div className="filter-chips">
                  {['all', 'safe', 'suspicious', 'phishing'].map((band) => (
                    <button
                      key={band}
                      className={`fchip ${filterBand === band ? 'active' : ''}`}
                      onClick={() => setFilterBand(band)}
                    >
                      {band}
                    </button>
                  ))}
                </div>
                <input
                  className="search-box"
                  placeholder="Search domain..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="panel" style={{ padding: '8px' }}>
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Domain</th>
                      <th>Verdict</th>
                      <th>Risk Score</th>
                      <th>IP Address</th>
                      <th>Scanned Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredScans.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
                          No history records match current filter.
                        </td>
                      </tr>
                    ) : (
                      filteredScans.map((scan) => {
                        const verdict = (scan.verdict || 'SAFE').toLowerCase();
                        return (
                          <tr key={scan.id}>
                            <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{scan.domain}</td>
                            <td><span className={`badge ${verdict}`}>{scan.verdict}</span></td>
                            <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: scan.overallScore >= 50 ? '#FF0055' : '#00F0FF' }}>
                              {scan.overallScore} / 100
                            </td>
                            <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-faint)' }}>{scan.ipAddress || '194.26.29.110'}</td>
                            <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-faint)', fontSize: '11px' }}>
                              {new Date(scan.createdAt).toLocaleString()}
                            </td>
                          </tr>
                        );
                      })
                    )}
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
