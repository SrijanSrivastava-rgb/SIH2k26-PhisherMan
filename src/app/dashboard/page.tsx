'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';

export default function DashboardPage() {
  const router = useRouter();
  const [scansCount, setScansCount] = useState(128523);
  const [blockedCount, setBlockedCount] = useState(1287);
  const [phishCount, setPhishCount] = useState(344);
  const [latencyMs, setLatencyMs] = useState(83);

  const [activeRange, setActiveRange] = useState('24h');
  const [activeSev, setActiveSev] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [recentScans, setRecentScans] = useState<any[]>([]);

  const [timeStr, setTimeStr] = useState('20:30:00');
  const [dateStr, setDateStr] = useState('TUE, AUG 18');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Line chart interactive hover state
  const [hoverPoint, setHoverPoint] = useState<{ x: number; y: number; value: number; label: string } | null>(null);

  useEffect(() => {
    // Authentication Check
    const storedUser = localStorage.getItem('phisherman_user');
    if (!storedUser) {
      router.push('/login');
      return;
    }
    // Clock
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

    // Live statistics update simulation & API fetch
    const loadStats = async () => {
      try {
        const res = await fetch('/api/stats');
        if (res.ok) {
          const data = await res.json();
          if (data.recentScans && data.recentScans.length > 0) {
            setRecentScans(data.recentScans);
          }
          if (data.stats) {
            if (data.stats.scansToday) setScansCount(data.stats.scansToday);
            if (data.stats.threatsBlocked) setBlockedCount(data.stats.threatsBlocked);
            if (data.stats.phishingDetected) setPhishCount(data.stats.phishingDetected);
          }
        }
      } catch (err) {
        console.error('Stats API error:', err);
      }
    };
    loadStats();

    // Live ticker simulation
    const ticker = setInterval(() => {
      setScansCount((prev) => prev + Math.floor(Math.random() * 3) + 1);
      if (Math.random() > 0.7) setBlockedCount((prev) => prev + 1);
      if (Math.random() > 0.85) setPhishCount((prev) => prev + 1);
      setLatencyMs(78 + Math.floor(Math.random() * 12));
    }, 3200);

    return () => {
      clearInterval(clockInterval);
      clearInterval(ticker);
    };
  }, []);

  // Default fallback mock telemetry matching original table
  const defaultTelemetries = [
    { id: '1', sev: 'critical', type: 'Phishing Kit', ip: '194.26.29.115', target: 'paypal-auth-secure.com', status: 'blocked', time: '1m ago' },
    { id: '2', sev: 'high', type: 'Credential Harvester', ip: '45.142.214.82', target: 'login-google-security.net', status: 'monitoring', time: '3m ago' },
    { id: '3', sev: 'medium', type: 'Typo-Squat Domain', ip: '185.220.101.5', target: 'micros0ft-verify.org', status: 'blocked', time: '7m ago' },
    { id: '4', sev: 'low', type: 'Suspicious Redirect', ip: '91.240.118.23', target: 'amaz0n-prime-bill.click', status: 'resolved', time: '12m ago' },
    { id: '5', sev: 'critical', type: 'Visual Mimicry', ip: '193.42.33.19', target: 'chase-online-account.tk', status: 'blocked', time: '18m ago' },
  ];

  const displayRows = recentScans.length > 0 ? recentScans.map(s => ({
    id: s.id,
    sev: (s.overallScore >= 80 ? 'critical' : s.overallScore >= 60 ? 'high' : s.overallScore >= 40 ? 'medium' : 'low'),
    type: s.verdict === 'QUARANTINED' ? 'Phishing Kit' : s.verdict === 'PHISHING' ? 'Credential Harvester' : 'Domain Check',
    ip: s.ipAddress || '194.26.29.110',
    target: s.domain,
    status: s.verdict === 'SAFE' ? 'resolved' : 'blocked',
    time: new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  })) : defaultTelemetries;

  const filteredRows = displayRows.filter(row => {
    if (activeSev !== 'all' && row.sev !== activeSev) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return row.target.toLowerCase().includes(q) || row.ip.toLowerCase().includes(q) || row.type.toLowerCase().includes(q);
    }
    return true;
  });

  // Dynamic chart data configurations for 24h, 7d, and 30d range toggles
  const rangeDataConfig: Record<string, {
    subtitle: string;
    yLabels: (number | string)[];
    path: string;
    fillPath: string;
    points: Array<{ x: number; y: number; label: string; value: number }>;
  }> = {
    '24h': {
      subtitle: 'Requests processed per hour',
      yLabels: [6537, 4902, 3268, 1634, 0],
      path: 'M 34 150 C 77 145 120 140 165 110 C 210 80 255 165 300 165 C 345 165 390 195 435 185 C 480 175 525 140 570 125 C 615 110 660 145 705 110 C 720 98 735 90 740 95',
      fillPath: 'M 34 150 C 77 145 120 140 165 110 C 210 80 255 165 300 165 C 345 165 390 195 435 185 C 480 175 525 140 570 125 C 615 110 660 145 705 110 C 720 98 735 90 740 95 L 740 210 L 34 210 Z',
      points: [
        { x: 34, y: 150, label: '00:00', value: 4902 },
        { x: 120, y: 140, label: '04:00', value: 5120 },
        { x: 210, y: 110, label: '08:00', value: 5890 },
        { x: 300, y: 165, label: '12:00', value: 4200 },
        { x: 390, y: 195, label: '16:00', value: 3100 },
        { x: 480, y: 175, label: '20:00', value: 3800 },
        { x: 570, y: 125, label: '22:00', value: 5400 },
        { x: 740, y: 95, label: '24:00', value: 6200 },
      ],
    },
    '7d': {
      subtitle: 'Requests processed per day (7-day total: 346.8K)',
      yLabels: ['80K', '60K', '40K', '20K', '0'],
      path: 'M 34 180 C 85 150 140 120 200 105 C 260 90 320 110 380 130 C 440 100 500 70 560 110 C 620 150 680 125 740 100',
      fillPath: 'M 34 180 C 85 150 140 120 200 105 C 260 90 320 110 380 130 C 440 100 500 70 560 110 C 620 150 680 125 740 100 L 740 210 L 34 210 Z',
      points: [
        { x: 34, y: 180, label: 'Mon', value: 32100 },
        { x: 140, y: 120, label: 'Tue', value: 48500 },
        { x: 260, y: 90, label: 'Wed', value: 59200 },
        { x: 380, y: 130, label: 'Thu', value: 44100 },
        { x: 500, y: 70, label: 'Fri', value: 68400 },
        { x: 620, y: 150, label: 'Sat', value: 38900 },
        { x: 740, y: 100, label: 'Sun', value: 55600 },
      ],
    },
    '30d': {
      subtitle: 'Requests processed per week (30-day total: 1.05M)',
      yLabels: ['350K', '262K', '175K', '87K', '0'],
      path: 'M 34 160 C 147 135 260 110 380 85 C 500 60 620 70 740 80',
      fillPath: 'M 34 160 C 147 135 260 110 380 85 C 500 60 620 70 740 80 L 740 210 L 34 210 Z',
      points: [
        { x: 34, y: 160, label: 'Week 1', value: 198000 },
        { x: 260, y: 110, label: 'Week 2', value: 254000 },
        { x: 500, y: 60, label: 'Week 3', value: 312000 },
        { x: 740, y: 80, label: 'Week 4', value: 289000 },
      ],
    },
  };

  const currentChartConfig = rangeDataConfig[activeRange] || rangeDataConfig['24h'];

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />

      <style jsx global>{`
        :root {
          --bg: #050209;
          --cyan: #00F0FF;
          --cyan-rgb: 0, 240, 255;
          --cyan-soft: #7CE8F0;
          --magenta: #FF0055;
          --magenta-rgb: 255, 0, 85;
          --magenta-soft: #FF5C8A;
          --magenta-soft-rgb: 255, 92, 138;
          --neutral: #9aa0ae;
          --text: #f2f4f8;
          --text-dim: #9aa3b2;
          --text-faint: #5a6172;
          --glass-bg: rgba(255, 255, 255, 0.05);
          --glass-bg-hover: rgba(255, 255, 255, 0.08);
          --glass-border: rgba(255, 255, 255, 0.1);
          --font-display: 'Space Grotesk', sans-serif;
          --font-body: 'Inter', sans-serif;
          --font-mono: 'Inter', sans-serif;
          --radius: 14px;
          --sidebar-w: 240px;
          --topbar-h: 68px;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: var(--bg); color: var(--text); font-family: var(--font-body); min-height: 100%; }

        body {
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
          background-size: 42px 42px;
          background-position: center top;
          position: relative;
        }

        body::before {
          content: ""; position: fixed; inset: 0;
          background:
            radial-gradient(ellipse 900px 500px at 12% -5%, rgba(var(--cyan-rgb), 0.10), transparent 60%),
            radial-gradient(ellipse 700px 550px at 105% 15%, rgba(var(--magenta-rgb), 0.08), transparent 55%),
            radial-gradient(ellipse 900px 700px at 50% 120%, rgba(var(--cyan-rgb), 0.05), transparent 60%);
          pointer-events: none; z-index: 0;
        }

        .app-shell { display: flex; min-height: 100vh; position: relative; z-index: 1; }

        /* ---------- Sidebar ---------- */
        .sidebar {
          width: var(--sidebar-w); flex-shrink: 0; position: sticky; top: 0; height: 100vh;
          display: flex; flex-direction: column; background: rgba(8, 4, 14, 0.6);
          backdrop-filter: blur(20px) saturate(140%); border-right: 1px solid var(--glass-border); z-index: 30;
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
          font-size: 13px; font-weight: 500; text-decoration: none; transition: all .2s ease;
        }
        .nav-item::before {
          content: ""; position: absolute; left: 0; top: 50%; width: 3px; height: 0; background: var(--cyan);
          border-radius: 0 4px 4px 0; box-shadow: 0 0 12px rgba(var(--cyan-rgb), 0.85); transform: translateY(-50%);
          transition: height .3s cubic-bezier(.3, .8, .3, 1);
        }
        .nav-item svg { width: 16px; height: 16px; flex-shrink: 0; }
        .nav-item .label { flex: 1; }
        .nav-item .nav-badge { width: 6px; height: 6px; border-radius: 50%; background: var(--magenta); box-shadow: 0 0 8px rgba(var(--magenta-rgb), 0.8); flex-shrink: 0; }

        .nav-item:hover { background: rgba(var(--cyan-rgb), 0.09); color: var(--cyan); box-shadow: inset 0 0 0 1px rgba(var(--cyan-rgb), 0.16); transform: translateX(2px); }
        .nav-item:hover::before { height: 38%; }
        .nav-item.active { color: var(--text); background: rgba(var(--cyan-rgb), 0.09); }
        .nav-item.active svg { color: var(--cyan); filter: drop-shadow(0 0 4px rgba(var(--cyan-rgb), 0.6)); }
        .nav-item.active::before { height: 58%; }

        .sidebar-footer { padding: 14px 18px 20px; margin-top: auto; border-top: 1px solid var(--glass-border); display: flex; align-items: center; gap: 9px; }
        .sidebar-footer .sdot { width: 7px; height: 7px; border-radius: 50%; background: var(--cyan); box-shadow: 0 0 8px var(--cyan); }
        .sidebar-footer .stext { font-family: var(--font-mono); font-size: 11px; color: var(--text-faint); }

        /* ---------- Shell main ---------- */
        .shell-main { flex: 1; min-width: 0; display: flex; flex-direction: column; }

        header.topbar {
          position: sticky; top: 0; z-index: 20; display: flex; align-items: center; justify-content: space-between;
          gap: 16px; height: var(--topbar-h); padding: 0 32px; border-bottom: 1px solid var(--glass-border);
          background: rgba(5, 2, 9, 0.6); backdrop-filter: blur(20px);
        }

        .breadcrumbs { display: flex; align-items: center; gap: 8px; font-size: 13px; }
        .breadcrumbs .crumb { color: var(--text-faint); }
        .breadcrumbs .crumb.current { color: var(--text); font-weight: 500; font-family: var(--font-display); }

        .topbar-search {
          display: flex; align-items: center; gap: 9px; border: 1px solid var(--glass-border);
          background: rgba(255, 255, 255, 0.03); border-radius: 10px; padding: 8px 12px; width: 320px;
        }
        .topbar-search svg { width: 14px; height: 14px; color: var(--text-faint); }
        .topbar-search input { background: none; border: none; outline: none; color: var(--text); font-family: var(--font-mono); font-size: 12.5px; width: 100%; }
        .kbd { font-family: var(--font-mono); font-size: 10px; color: var(--text-faint); border: 1px solid var(--glass-border); border-radius: 4px; padding: 1px 5px; }

        .topbar-right { display: flex; align-items: center; gap: 16px; }
        .clock { font-family: var(--font-mono); font-size: 13px; color: var(--text-dim); text-align: right; display: flex; flex-direction: column; gap: 2px; }
        .clock .time { color: var(--text); font-size: 13.5px; }
        .clock .date { font-size: 10px; color: var(--text-faint); text-transform: uppercase; }

        .icon-btn {
          position: relative; width: 36px; height: 36px; border-radius: 9px; border: 1px solid var(--glass-border);
          background: var(--glass-bg); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; color: var(--text-dim);
          cursor: pointer;
        }
        .icon-btn .badge {
          position: absolute; top: -4px; right: -4px; width: 15px; height: 15px; border-radius: 50%;
          background: var(--magenta); color: #fff; font-family: var(--font-mono); font-size: 9px; display: flex; align-items: center; justify-content: center;
        }

        .user-chip {
          display: flex; align-items: center; gap: 10px; padding: 6px 12px 6px 6px;
          border: 1px solid var(--glass-border); background: var(--glass-bg); backdrop-filter: blur(10px);
          border-radius: 30px; position: relative; cursor: pointer;
        }
        .avatar {
          width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, var(--cyan), var(--magenta));
          display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-weight: 600; font-size: 11px; color: #050209;
        }
        .user-chip .who { display: flex; flex-direction: column; line-height: 1.2; }
        .user-chip .who .n { font-size: 12.5px; font-weight: 600; }
        .user-chip .who .r { font-size: 10px; color: var(--text-faint); }

        .user-menu {
          position: absolute; top: calc(100% + 10px); right: 0; width: 180px;
          background: rgba(10, 6, 16, 0.95); backdrop-filter: blur(20px);
          border: 1px solid var(--glass-border); border-radius: 10px; padding: 6px; z-index: 40;
        }
        .user-menu button { width: 100%; text-align: left; font-size: 12.5px; padding: 9px 10px; border-radius: 7px; color: var(--text-dim); background: none; border: none; cursor: pointer; display: flex; align-items: center; gap: 8px; }
        .user-menu button:hover { background: rgba(0, 240, 255, 0.1); color: var(--text); }

        main { padding: 36px 40px 60px; }

        .page-head { display: flex; align-items: flex-end; justify-content: space-between; flex-wrap: wrap; gap: 14px; margin-bottom: 22px; }
        .page-head h1 { font-family: var(--font-display); font-size: 26px; font-weight: 600; }
        .page-head p { color: var(--text-faint); font-size: 13px; margin-top: 5px; }

        .live-pill {
          display: flex; align-items: center; gap: 8px; font-family: var(--font-mono); font-size: 11px;
          color: var(--cyan); text-transform: uppercase; border: 1px solid rgba(var(--cyan-rgb), 0.3);
          background: rgba(var(--cyan-rgb), 0.06); padding: 6px 12px; border-radius: 20px;
        }
        .live-pill .p { width: 7px; height: 7px; border-radius: 50%; background: var(--cyan); box-shadow: 0 0 8px var(--cyan); }

        .grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 18px; }

        .panel, .stat-card {
          background: var(--glass-bg); backdrop-filter: blur(20px);
          border: 1px solid var(--glass-border); border-radius: var(--radius); position: relative;
          transition: transform .25s ease, border-color .25s ease, box-shadow .25s ease;
        }
        .panel:hover, .stat-card:hover {
          border-color: rgba(var(--cyan-rgb), 0.6); transform: translateY(-4px);
          box-shadow: 0 20px 40px -15px rgba(0,0,0,0.7), 0 0 30px -5px rgba(var(--cyan-rgb), 0.3);
        }

        .stat-card { grid-column: span 3; padding: 20px 20px 18px; }
        .stat-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
        .stat-icon { width: 34px; height: 34px; border-radius: 9px; display: flex; align-items: center; justify-content: center; border: 1px solid var(--glass-border); color: var(--cyan); background: rgba(var(--cyan-rgb), 0.1); }
        .stat-card[data-tone="magenta"] .stat-icon { color: var(--magenta); background: rgba(var(--magenta-rgb), 0.1); border-color: rgba(var(--magenta-rgb), 0.3); }

        .stat-delta { font-family: var(--font-mono); font-size: 11px; display: flex; align-items: center; gap: 3px; padding: 3px 7px; border-radius: 20px; }
        .stat-delta.tone-cyan { color: var(--cyan); background: rgba(var(--cyan-rgb), 0.1); }
        .stat-delta.tone-magenta { color: var(--magenta); background: rgba(var(--magenta-rgb), 0.1); }

        .stat-label { font-size: 11.5px; color: var(--text-faint); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px; }
        .stat-value { font-family: var(--font-display); font-weight: 700; font-size: 28px; }
        .stat-foot { font-size: 11.5px; color: var(--text-faint); margin-top: 6px; }

        .sparkline { position: absolute; right: 14px; bottom: 12px; opacity: 0.85; }

        .chart-panel { grid-column: span 8; padding: 22px 22px 14px; min-height: 360px; display: flex; flex-direction: column; }
        .donut-panel { grid-column: span 4; padding: 22px 20px 18px; display: flex; flex-direction: column; }
        .table-panel { grid-column: span 12; padding: 22px; }

        .panel-head { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 12px; }
        .panel-title { font-family: var(--font-display); font-size: 15.5px; font-weight: 600; }
        .panel-sub { font-size: 11.5px; color: var(--text-faint); margin-top: 3px; }

        .range-toggle { display: flex; gap: 2px; background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); border-radius: 8px; padding: 3px; }
        .range-toggle button { font-family: var(--font-mono); font-size: 11px; padding: 5px 10px; border-radius: 6px; color: var(--text-faint); background: none; border: none; cursor: pointer; }
        .range-toggle button.active { background: rgba(var(--cyan-rgb), 0.14); color: var(--cyan); }

        .donut-body { display: flex; align-items: center; gap: 18px; margin-top: 14px; flex: 1; }
        .donut-svg-wrap { position: relative; width: 150px; height: 150px; flex-shrink: 0; }
        .donut-center { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .donut-center .n { font-family: var(--font-display); font-weight: 700; font-size: 24px; }
        .donut-center .l { font-size: 9.5px; color: var(--text-faint); text-transform: uppercase; letter-spacing: 0.07em; }

        .legend { display: flex; flex-direction: column; gap: 11px; flex: 1; }
        .legend-item { display: flex; align-items: center; gap: 9px; font-size: 12.5px; }
        .legend-dot { width: 9px; height: 9px; border-radius: 3px; flex-shrink: 0; }
        .legend-label { flex: 1; color: var(--text-dim); }
        .legend-pct { font-family: var(--font-mono); font-size: 12px; color: var(--text); font-weight: 500; }

        .table-controls { display: flex; align-items: center; justify-content: space-between; margin: 16px 0 6px; }
        .chip-row { display: flex; gap: 7px; }
        .chip { font-family: var(--font-mono); font-size: 11px; padding: 6px 12px; border-radius: 20px; border: 1px solid var(--glass-border); color: var(--text-faint); background: rgba(255,255,255,0.02); cursor: pointer; }
        .chip.active { color: var(--cyan); border-color: rgba(var(--cyan-rgb), 0.45); background: rgba(var(--cyan-rgb), 0.1); }

        .search-box { display: flex; align-items: center; gap: 8px; border: 1px solid var(--glass-border); border-radius: 9px; padding: 7px 12px; background: rgba(255,255,255,0.02); }
        .search-box input { background: none; border: none; outline: none; color: var(--text); font-family: var(--font-mono); font-size: 12px; }

        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        thead th { text-align: left; font-size: 10.5px; text-transform: uppercase; color: var(--text-faint); padding: 10px 12px; border-bottom: 1px solid var(--glass-border); }
        tbody td { padding: 12px; font-size: 12.5px; border-bottom: 1px solid rgba(255,255,255,0.06); }

        .sev-badge { font-family: var(--font-mono); font-size: 10.5px; text-transform: uppercase; padding: 4px 9px; border-radius: 20px; display: inline-flex; align-items: center; gap: 6px; }
        .sev-badge.critical { color: var(--magenta); background: rgba(var(--magenta-rgb), 0.12); border: 1px solid rgba(var(--magenta-rgb), 0.3); }
        .sev-badge.high { color: var(--magenta-soft); background: rgba(var(--magenta-soft-rgb), 0.1); border: 1px solid rgba(var(--magenta-soft-rgb), 0.28); }
        .sev-badge.medium { color: var(--cyan); background: rgba(var(--cyan-rgb), 0.1); border: 1px solid rgba(var(--cyan-rgb), 0.28); }
        .sev-badge.low { color: var(--neutral); background: rgba(154,160,174, 0.1); border: 1px solid rgba(154,160,174, 0.25); }
      `}</style>

      {/* Verbatim Dashboard Structure */}
      <div className="app-shell">
        <Sidebar activeRoute="dashboard" />

        <div className="shell-main">
          <header className="topbar">
            <div className="breadcrumbs">
              <span className="crumb">Workspace</span>
              <span style={{ color: 'var(--text-faint)' }}>/</span>
              <span className="crumb current">Dashboard</span>
            </div>

            <div className="topbar-search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
              <input type="text" placeholder="Search threats, IPs, reports…" />
              <span className="kbd">/</span>
            </div>

            <div className="topbar-right">
              <div className="clock">
                <span className="time">{timeStr}</span>
                <span className="date">{dateStr}</span>
              </div>

              <button className="icon-btn" aria-label="Notifications">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                <span className="badge">3</span>
              </button>

              <div className="user-chip" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                <div className="avatar">AR</div>
                <div className="who">
                  <span className="n">Alex Reyes</span>
                  <span className="r">SOC Analyst</span>
                </div>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6" /></svg>
                {userMenuOpen && (
                  <div className="user-menu">
                    <button><Link href="/settings">Settings</Link></button>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        localStorage.removeItem('phisherman_user');
                        await fetch('/api/auth/logout', { method: 'POST' });
                        router.push('/login');
                      }}
                    >
                      Log out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main>
            <div className="page-head">
              <div>
                <h1>Mission Control</h1>
                <p>Real-time visibility across your monitored perimeter</p>
              </div>
              <div className="live-pill"><span className="p"></span>Live feed connected</div>
            </div>

            <div className="grid">
              {/* Stat Card 1: Scans Today */}
              <div className="stat-card" data-tone="cyan">
                <div className="stat-top">
                  <div className="stat-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></svg>
                  </div>
                  <div className="stat-delta tone-cyan">▲ 4.2%</div>
                </div>
                <div className="stat-label">Scans Today</div>
                <div className="stat-value">{scansCount.toLocaleString()}</div>
                <div className="stat-foot">vs. 123,301 yesterday</div>
                <svg className="sparkline" width="90" height="26" viewBox="0 0 90 26">
                  <polyline points="0,20 12,16 24,18 36,10 48,13 60,6 72,9 90,3" fill="none" stroke="#00F0FF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              {/* Stat Card 2: Threats Blocked */}
              <div className="stat-card" data-tone="cyan">
                <div className="stat-top">
                  <div className="stat-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /></svg>
                  </div>
                  <div className="stat-delta tone-cyan">▲ 8.1%</div>
                </div>
                <div className="stat-label">Threats Blocked</div>
                <div className="stat-value">{blockedCount.toLocaleString()}</div>
                <div className="stat-foot">across 6 vectors</div>
                <svg className="sparkline" width="90" height="26" viewBox="0 0 90 26">
                  <polyline points="0,18 12,19 24,14 36,15 48,9 60,11 72,5 90,7" fill="none" stroke="#00F0FF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              {/* Stat Card 3: Phishing Detected */}
              <div className="stat-card" data-tone="magenta">
                <div className="stat-top">
                  <div className="stat-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
                  </div>
                  <div className="stat-delta tone-magenta">▼ 2.4%</div>
                </div>
                <div className="stat-label">Phishing Detected</div>
                <div className="stat-value">{phishCount.toLocaleString()}</div>
                <div className="stat-foot">last one 4m ago</div>
                <svg className="sparkline" width="90" height="26" viewBox="0 0 90 26">
                  <polyline points="0,6 12,10 24,8 36,14 48,12 60,17 72,15 90,19" fill="none" stroke="#FF0055" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              {/* Stat Card 4: API Health */}
              <div className="stat-card" data-tone="cyan">
                <div className="stat-top">
                  <div className="stat-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
                  </div>
                </div>
                <div className="stat-label">API Health</div>
                <div className="stat-value">99.98%</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--cyan)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--cyan)', boxShadow: '0 0 6px var(--cyan)' }} />
                  Operational
                </div>
                <div className="stat-foot">Avg response {latencyMs}ms</div>
              </div>

              {/* Traffic Overview Line Chart */}
              <div className="panel chart-panel">
                <div className="panel-head">
                  <div>
                    <div className="panel-title">Traffic</div>
                    <div className="panel-sub">{currentChartConfig.subtitle}</div>
                  </div>
                  <div className="range-toggle">
                    {['24h', '7d', '30d'].map((r) => (
                      <button key={r} className={activeRange === r ? 'active' : ''} onClick={() => setActiveRange(r)}>
                        {r.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ position: 'relative', flex: 1, marginTop: '16px' }}>
                  <svg
                    viewBox="0 0 760 220"
                    width="100%"
                    height="100%"
                    preserveAspectRatio="none"
                    onMouseMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const mouseX = e.clientX - rect.left;
                      const ratio = mouseX / rect.width;
                      const idx = Math.min(currentChartConfig.points.length - 1, Math.max(0, Math.round(ratio * (currentChartConfig.points.length - 1))));
                      setHoverPoint(currentChartConfig.points[idx]);
                    }}
                    onMouseLeave={() => setHoverPoint(null)}
                  >
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#00F0FF" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal Grid lines & Y Axis */}
                    {[0, 50, 100, 150, 200].map((y, idx) => (
                      <g key={idx}>
                        <line x1="30" y1={y + 10} x2="760" y2={y + 10} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                        <text x="0" y={y + 14} fill="rgba(255,255,255,0.3)" fontSize="10" fontFamily="Inter, sans-serif">
                          {currentChartConfig.yLabels[idx]}
                        </text>
                      </g>
                    ))}

                    {/* Dynamic Smooth Neon Line Path */}
                    <path
                      d={currentChartConfig.path}
                      fill="none"
                      stroke="#00F0FF"
                      strokeWidth="2.8"
                      strokeLinecap="round"
                      style={{ filter: 'drop-shadow(0 0 10px #00F0FF)', transition: 'd 0.3s ease' }}
                    />
                    <path
                      d={currentChartConfig.fillPath}
                      fill="url(#chartGrad)"
                      style={{ transition: 'd 0.3s ease' }}
                    />

                    {/* Hover Guide & Marker */}
                    {hoverPoint && (
                      <g>
                        <line x1={hoverPoint.x} y1="10" x2={hoverPoint.x} y2="210" stroke="rgba(255,255,255,0.2)" strokeDasharray="3 3" />
                        <circle cx={hoverPoint.x} cy={hoverPoint.y} r="5" fill="#00F0FF" stroke="#050209" strokeWidth="2" />
                      </g>
                    )}
                  </svg>

                  {hoverPoint && (
                    <div style={{
                      position: 'absolute',
                      left: `${(hoverPoint.x / 760) * 100}%`,
                      top: `${(hoverPoint.y / 220) * 100}%`,
                      transform: 'translate(-50%, -120%)',
                      background: 'rgba(10,6,16,0.9)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: '8px',
                      padding: '6px 10px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      pointerEvents: 'none',
                      whiteSpace: 'nowrap'
                    }}>
                      <div style={{ color: '#00F0FF', fontWeight: 600 }}>{hoverPoint.value.toLocaleString()} req</div>
                      <div style={{ color: 'var(--text-faint)', fontSize: '10px' }}>{hoverPoint.label}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Threat Distribution Donut Panel */}
              <div className="panel donut-panel">
                <div className="panel-head">
                  <div>
                    <div className="panel-title">Threat Distribution</div>
                    <div className="panel-sub">By category, last 24h</div>
                  </div>
                </div>

                <div className="donut-body">
                  <div className="donut-svg-wrap">
                    <svg viewBox="0 0 180 180" width="150" height="150">
                      <circle cx="90" cy="90" r="70" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="17" />
                      {/* Phishing 38% */}
                      <circle cx="90" cy="90" r="70" fill="none" stroke="#FF0055" strokeWidth="17" strokeDasharray="167 272" transform="rotate(-90 90 90)" strokeLinecap="round" />
                      {/* Malware 27% */}
                      <circle cx="90" cy="90" r="70" fill="none" stroke="#FF5C8A" strokeWidth="17" strokeDasharray="118 321" transform="rotate(46 90 90)" strokeLinecap="round" />
                      {/* DDoS 16% */}
                      <circle cx="90" cy="90" r="70" fill="none" stroke="#00F0FF" strokeWidth="17" strokeDasharray="70 369" transform="rotate(143 90 90)" strokeLinecap="round" />
                      {/* Brute Force 12% */}
                      <circle cx="90" cy="90" r="70" fill="none" stroke="#7CE8F0" strokeWidth="17" strokeDasharray="52 387" transform="rotate(200 90 90)" strokeLinecap="round" />
                      {/* Botnet 7% */}
                      <circle cx="90" cy="90" r="70" fill="none" stroke="#9aa0ae" strokeWidth="17" strokeDasharray="30 409" transform="rotate(243 90 90)" strokeLinecap="round" />
                    </svg>

                    <div className="donut-center">
                      <span className="n">1,284</span>
                      <span className="l">TOTAL</span>
                    </div>
                  </div>

                  <div className="legend">
                    {[
                      { label: 'Phishing', pct: '38%', count: '488', color: '#FF0055' },
                      { label: 'Malware', pct: '27%', count: '347', color: '#FF5C8A' },
                      { label: 'DDoS', pct: '16%', count: '205', color: '#00F0FF' },
                      { label: 'Brute Force', pct: '12%', count: '154', color: '#7CE8F0' },
                      { label: 'Botnet / Other', pct: '7%', count: '90', color: '#9aa0ae' },
                    ].map((item, i) => (
                      <div key={i} className="legend-item">
                        <span className="legend-dot" style={{ background: item.color }} />
                        <span className="legend-label">{item.label}</span>
                        <span className="legend-pct">{item.pct} · {item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Live Telemetry Table */}
              <div className="panel table-panel">
                <div className="panel-head">
                  <div>
                    <div className="panel-title">Recent Threats</div>
                    <div className="panel-sub">Newest events surface first</div>
                  </div>
                  <div className="live-pill" style={{ padding: '4px 10px' }}><span className="p"></span>Live</div>
                </div>

                <div className="table-controls">
                  <div className="chip-row">
                    {['all', 'critical', 'high', 'medium', 'low'].map((sev) => (
                      <button key={sev} className={`chip ${activeSev === sev ? 'active' : ''}`} onClick={() => setActiveSev(sev)}>
                        {sev.toUpperCase()}
                      </button>
                    ))}
                  </div>

                  <div className="search-box">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                    <input type="text" placeholder="Search IP, type, target..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  </div>
                </div>

                <table>
                  <thead>
                    <tr>
                      <th>Severity</th>
                      <th>Threat Type</th>
                      <th>Source IP</th>
                      <th>Target Domain</th>
                      <th>Status</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((row) => (
                      <tr key={row.id}>
                        <td><span className={`sev-badge ${row.sev}`}>{row.sev.toUpperCase()}</span></td>
                        <td style={{ fontWeight: 500 }}>{row.type}</td>
                        <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>{row.ip}</td>
                        <td style={{ fontFamily: 'var(--font-mono)', color: '#00F0FF', fontWeight: 500 }}>{row.target}</td>
                        <td>
                          <span style={{ color: row.status === 'blocked' ? '#00F0FF' : row.status === 'monitoring' ? '#FF5C8A' : 'var(--text-faint)', fontSize: '12px' }}>
                            ● {row.status}
                          </span>
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-faint)', fontSize: '11px' }}>{row.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
