'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';

export default function SettingsPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('Riya Kapoor');
  const [workEmail, setWorkEmail] = useState('riya.kapoor@phishguard.ai');
  const [autoQuarantine, setAutoQuarantine] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [newCampaignAlerts, setNewCampaignAlerts] = useState(false);
  const [apiKeyRevealed, setApiKeyRevealed] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('phisherman_user');
    if (!storedUser) {
      router.push('/login');
      return;
    }
    const loadSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.alertEmail) setWorkEmail(data.alertEmail);
          if (typeof data.autoQuarantine === 'boolean') setAutoQuarantine(data.autoQuarantine);
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          autoQuarantine,
          alertEmail: workEmail,
        }),
      });
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 2000);
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  };

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />

      <style jsx global>{`
        :root {
          --bg: #050209;
          --panel-glass: rgba(255, 255, 255, 0.045);
          --line: rgba(255, 255, 255, 0.1);
          --cyan: #00F0FF;
          --magenta: #FF0055;
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

        .page-head-center { max-width: 680px; margin: 0 auto 24px auto; }

        .settings-grid { display: flex; flex-direction: column; gap: 16px; max-width: 680px; margin: 0 auto; }
        .settings-panel { padding: 22px 24px; border-radius: 16px; border: 1px solid var(--line); background: var(--panel-glass); }
        .settings-row { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 14px 0; border-bottom: 1px solid var(--line); }
        .settings-row:last-child { border-bottom: none; }
        .settings-label { font-size: 13px; color: var(--text); font-weight: 500; }
        .settings-hint { font-family: var(--font-mono); font-size: 10.5px; color: var(--text-faint); margin-top: 3px; }
        .settings-input { background: rgba(255,255,255,0.04); border: 1px solid var(--line); border-radius: 8px; padding: 9px 12px; color: var(--text); font-family: var(--font-mono); font-size: 12px; width: 230px; text-align: right; }

        .switch { position: relative; display: inline-block; width: 38px; height: 22px; }
        .switch input { opacity: 0; width: 0; height: 0; }
        .switch-track { position: absolute; inset: 0; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.18); border-radius: 999px; cursor: pointer; }
        .switch-track::before { content: ''; position: absolute; width: 16px; height: 16px; left: 2px; top: 2px; background: var(--text-faint); border-radius: 50%; transition: transform 0.18s ease; }
        .switch input:checked + .switch-track { background: rgba(0,240,255,0.18); border-color: rgba(0,240,255,0.5); }
        .switch input:checked + .switch-track::before { transform: translateX(16px); background: var(--cyan); box-shadow: 0 0 6px var(--cyan); }

        .btn-primary { border: none; border-radius: 8px; padding: 10px 20px; background: linear-gradient(90deg, var(--cyan), #4dd8ff); color: #031319; font-family: var(--font-mono); font-weight: 600; font-size: 11px; text-transform: uppercase; cursor: pointer; }
        .btn-secondary { border: 1px solid var(--line); background: rgba(255,255,255,0.03); color: var(--text); font-family: var(--font-mono); font-size: 10.5px; padding: 9px 16px; border-radius: 8px; cursor: pointer; }
      `}</style>

      {/* HTML Markup centered matching settings.html */}
      <div className="app">
        <div className="shell">
          <Sidebar activeRoute="settings" />

          <div className="content-col">
            <header className="topbar">
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-faint)' }}>Workspace</span> / <span style={{ color: 'var(--text)' }}>Settings</span>
              </div>
            </header>

            <main className="main">
              <div className="page-head-center">
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--cyan)', textTransform: 'uppercase' }}>Workspace</div>
                <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '26px', margin: 0 }}>Settings</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '6px 0 0' }}>Manage your account, notifications and API access.</p>
              </div>

              <div className="settings-grid">
                <div className="settings-panel">
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '16px' }}>Account</div>
                  <div className="settings-row">
                    <div><div className="settings-label">Full name</div><div className="settings-hint">Shown on shared reports</div></div>
                    <input className="settings-input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                  </div>
                  <div className="settings-row">
                    <div><div className="settings-label">Work email</div><div className="settings-hint">Used for alerts and login</div></div>
                    <input className="settings-input" value={workEmail} onChange={(e) => setWorkEmail(e.target.value)} />
                  </div>
                  <div className="settings-row">
                    <div><div className="settings-label">Role</div><div className="settings-hint">Set by workspace owner</div></div>
                    <input className="settings-input" value="Security Admin" disabled />
                  </div>
                </div>

                <div className="settings-panel">
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '16px' }}>Notifications & Automation</div>
                  <div className="settings-row">
                    <div><div className="settings-label">Auto-Quarantine alerts</div><div className="settings-hint">Automatically block & quarantine when scan risk score &gt; 65</div></div>
                    <label className="switch">
                      <input type="checkbox" checked={autoQuarantine} onChange={(e) => setAutoQuarantine(e.target.checked)} />
                      <span className="switch-track"></span>
                    </label>
                  </div>
                  <div className="settings-row">
                    <div><div className="settings-label">Weekly digest</div><div className="settings-hint">Summary of scans & threat trends</div></div>
                    <label className="switch">
                      <input type="checkbox" checked={weeklyDigest} onChange={(e) => setWeeklyDigest(e.target.checked)} />
                      <span className="switch-track"></span>
                    </label>
                  </div>
                  <div className="settings-row">
                    <div><div className="settings-label">New campaign detected</div><div className="settings-hint">Notify when a new phishing cluster targets your brands</div></div>
                    <label className="switch">
                      <input type="checkbox" checked={newCampaignAlerts} onChange={(e) => setNewCampaignAlerts(e.target.checked)} />
                      <span className="switch-track"></span>
                    </label>
                  </div>
                </div>

                <div className="settings-panel">
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '16px' }}>API Access</div>
                  <div className="settings-row">
                    <div><div className="settings-label">API Key</div><div className="settings-hint">Use this to call the scan endpoint programmatically</div></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', background: 'rgba(255,255,255,0.04)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--line)' }}>
                        {apiKeyRevealed ? 'pg_live_8a41c9f3b0e2d67f2a' : 'pg_live_••••••••••••7f2a'}
                      </span>
                      <button className="btn-secondary" onClick={() => setApiKeyRevealed(!apiKeyRevealed)}>
                        {apiKeyRevealed ? 'Hide' : 'Reveal'}
                      </button>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px' }}>
                  {savedToast && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--cyan)' }}>Saved!</span>}
                  <button className="btn-primary" onClick={handleSave}>Save Changes</button>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
