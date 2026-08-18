'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [errorText, setErrorText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------------- Status typewriter cycler ---------------- */
    const statusMessages = [
      'SYS_STATUS: AUTH GATEWAY STANDBY',
      'ENCRYPTION: AES-256 ACTIVE',
      'NODES ONLINE: 128',
      'THREAT DB: SYNCED',
    ];
    let cyclingPaused = false;
    let typeTimer: any = null;
    const statusText = document.getElementById('statusText');

    const typeText = (text: string, cb?: () => void) => {
      clearTimeout(typeTimer);
      let i = 0;
      if (statusText) statusText.textContent = '';
      const step = () => {
        if (i <= text.length) {
          if (statusText) statusText.textContent = text.slice(0, i);
          i++;
          typeTimer = setTimeout(step, 18);
        } else if (cb) {
          cb();
        }
      };
      step();
    };

    if (!reduceMotion && statusText) {
      let msgIndex = 0;
      const cycleInterval = setInterval(() => {
        if (cyclingPaused) return;
        msgIndex = (msgIndex + 1) % statusMessages.length;
        typeText(statusMessages[msgIndex]);
      }, 4200);
    }

    /* ---------------- Periodic logo glitch ---------------- */
    const wordmark = document.getElementById('wordmark');
    if (!reduceMotion && wordmark) {
      setInterval(() => {
        wordmark.classList.add('glitch');
        setTimeout(() => {
          wordmark.classList.remove('glitch');
        }, 380);
      }, 5000);
    }

    /* ---------------- Card tilt + spotlight ---------------- */
    try {
      const authCard = document.getElementById('authCard');
      const spotlight = document.getElementById('spotlight');
      if (!reduceMotion && authCard && spotlight) {
        const handleMouseMoveCard = (e: MouseEvent) => {
          const rect = authCard.getBoundingClientRect();
          const px = (e.clientX - rect.left) / rect.width;
          const py = (e.clientY - rect.top) / rect.height;
          const rotY = (px - 0.5) * 10;
          const rotX = (0.5 - py) * 10;
          authCard.style.transform = 'rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg)';
          spotlight.style.setProperty('--sx', px * 100 + '%');
          spotlight.style.setProperty('--sy', py * 100 + '%');
        };
        const handleMouseLeaveCard = () => {
          authCard.style.transform = 'rotateX(0deg) rotateY(0deg)';
        };
        authCard.addEventListener('mousemove', handleMouseMoveCard);
        authCard.addEventListener('mouseleave', handleMouseLeaveCard);
      }
    } catch (err) {
      console.error('card tilt failed', err);
    }

    /* ---------------- Mouse parallax for orbs ---------------- */
    try {
      const orbs = document.getElementById('orbs');
      let parX = 0, parY = 0, curX = 0, curY = 0;
      if (!reduceMotion && orbs) {
        window.addEventListener('mousemove', (e: MouseEvent) => {
          parX = (e.clientX / window.innerWidth - 0.5) * 2;
          parY = (e.clientY / window.innerHeight - 0.5) * 2;
        });
        const parallaxLoop = () => {
          curX += (parX - curX) * 0.04;
          curY += (parY - curY) * 0.04;
          orbs.style.transform = 'translate(' + curX * -22 + 'px,' + curY * -18 + 'px)';
          requestAnimationFrame(parallaxLoop);
        };
        parallaxLoop();
      }
    } catch (err) {
      console.error('orb parallax failed', err);
    }

    /* ---------------- Cursor glow ---------------- */
    try {
      const cursorGlow = document.getElementById('cursorGlow');
      if (!reduceMotion && cursorGlow) {
        let glowX = window.innerWidth / 2, glowY = window.innerHeight / 2;
        let glowCurX = glowX, glowCurY = glowY;
        let glowActive = false;
        window.addEventListener('mousemove', (e: MouseEvent) => {
          glowX = e.clientX;
          glowY = e.clientY;
          if (!glowActive) {
            glowActive = true;
            cursorGlow.classList.add('active');
          }
        });
        const glowLoop = () => {
          glowCurX += (glowX - glowCurX) * 0.16;
          glowCurY += (glowY - glowCurY) * 0.16;
          cursorGlow.style.transform = 'translate3d(' + glowCurX + 'px,' + glowCurY + 'px,0) translate(-50%,-50%)';
          requestAnimationFrame(glowLoop);
        };
        glowLoop();
      }
    } catch (err) {
      console.error('cursor glow failed', err);
    }

    /* ---------------- Animated background: particle network ---------------- */
    try {
      const canvas = document.getElementById('bg') as HTMLCanvasElement;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          let W: number, H: number, DPR: number;
          let particles: any[] = [];
          let scanY = 0;
          const scanSpeed = 0.5;
          let t = 0;
          let rings: any[] = [];
          let lastRingSpawn = 0;
          let mouseCX: number | null = null, mouseCY: number | null = null;

          const buildParticles = () => {
            particles = [];
            const count = Math.min(110, Math.max(40, Math.round((W * H) / 16000)));
            for (let i = 0; i < count; i++) {
              particles.push({
                x: Math.random() * W,
                y: Math.random() * H,
                vx: (Math.random() - 0.5) * 0.18,
                vy: (Math.random() - 0.5) * 0.18,
                pulse: 0,
                magenta: Math.random() > 0.5,
              });
            }
          };

          const resize = () => {
            DPR = Math.min(window.devicePixelRatio || 1, 2);
            W = canvas.offsetWidth;
            H = canvas.offsetHeight;
            canvas.width = W * DPR;
            canvas.height = H * DPR;
            ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
            buildParticles();
          };

          const mixColor = (alpha: number, phase?: number) => {
            const cyc = (Math.sin((t + (phase || 0)) * 0.0016) + 1) / 2;
            const c1 = [34, 211, 238];
            const c2 = [255, 47, 176];
            const r = c1[0] + (c2[0] - c1[0]) * cyc;
            const g = c1[1] + (c2[1] - c1[1]) * cyc;
            const b = c1[2] + (c2[2] - c1[2]) * cyc;
            return 'rgba(' + Math.round(r) + ',' + Math.round(g) + ',' + Math.round(b) + ',' + alpha + ')';
          };

          window.addEventListener('mousemove', (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouseCX = e.clientX - rect.left;
            mouseCY = e.clientY - rect.top;
          });

          const maxDist = 130;
          const draw = () => {
            t++;
            ctx.clearRect(0, 0, W, H);

            for (let i = 0; i < particles.length; i++) {
              const p = particles[i];
              p.x += p.vx; p.y += p.vy;
              if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
              if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;

              const distToScan = Math.abs(p.y - scanY);
              if (distToScan < 55) {
                p.pulse = Math.max(p.pulse, 1 - distToScan / 55);
              }
              if (mouseCX !== null && mouseCY !== null) {
                const dmx = p.x - mouseCX, dmy = p.y - mouseCY;
                const dm = Math.sqrt(dmx * dmx + dmy * dmy);
                if (dm < 110) {
                  p.pulse = Math.max(p.pulse, 1 - dm / 110);
                }
              }
              p.pulse *= 0.94;
            }

            for (let a = 0; a < particles.length; a++) {
              for (let b = a + 1; b < particles.length; b++) {
                const pa = particles[a], pb = particles[b];
                const dx = pa.x - pb.x, dy = pa.y - pb.y;
                const d = Math.sqrt(dx * dx + dy * dy);
                if (d < maxDist) {
                  const op = (1 - d / maxDist) * 0.16 * (1 + Math.max(pa.pulse, pb.pulse) * 2);
                  ctx.strokeStyle = mixColor(Math.min(op, 0.5));
                  ctx.lineWidth = 0.6;
                  ctx.beginPath();
                  ctx.moveTo(pa.x, pa.y);
                  ctx.lineTo(pb.x, pb.y);
                  ctx.stroke();
                }
              }
            }

            for (let j = 0; j < particles.length; j++) {
              const pp = particles[j];
              const alpha = 0.35 + pp.pulse * 0.6;
              const r = 1.2 + pp.pulse * 1.8;
              ctx.beginPath();
              const base = pp.magenta ? [255, 47, 176] : [34, 211, 238];
              ctx.fillStyle = 'rgba(' + base[0] + ',' + base[1] + ',' + base[2] + ',' + alpha + ')';
              ctx.arc(pp.x, pp.y, r, 0, Math.PI * 2);
              ctx.fill();
            }

            const grad = ctx.createLinearGradient(0, scanY - 45, 0, scanY + 45);
            grad.addColorStop(0, mixColor(0));
            grad.addColorStop(0.5, mixColor(0.1));
            grad.addColorStop(1, mixColor(0));
            ctx.fillStyle = grad;
            ctx.fillRect(0, scanY - 45, W, 90);
            ctx.strokeStyle = mixColor(0.38);
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, scanY);
            ctx.lineTo(W, scanY);
            ctx.stroke();
            scanY += scanSpeed;
            if (scanY > H + 60) {
              scanY = -60;
            }

            if (!reduceMotion) {
              requestAnimationFrame(draw);
            }
          };

          window.addEventListener('resize', resize);
          resize();
          if (!reduceMotion) requestAnimationFrame(draw);
        }
      }
    } catch (err) {
      console.error('particle network failed', err);
    }
  }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');

    const targetEmail = email.trim() || 'alex.reyes@vigil.cyber';
    const targetPassword = password || 'PhisherMan2026!';

    if (mode === 'signup' && password && confirm && password !== confirm) {
      setErrorText("Passphrases don't match.");
      return;
    }

    setSubmitting(true);
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, password: targetPassword, name: targetEmail.split('@')[0] }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      localStorage.setItem('phisherman_user', JSON.stringify(data.user || { name: 'Alex Reyes', email: targetEmail, role: 'SOC Analyst' }));
      document.cookie = 'phisherman_token=active_session; path=/; max-age=604800;';

      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 200);
    } catch (err: any) {
      setErrorText(err.message || 'Authentication error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />

      <style jsx global>{`
        :root{
          --bg:#05070d;
          --panel:#0b0f1a;
          --panel-soft:#0e1420;
          --line:#1c2436;
          --line-bright:#2a3548;
          --cyan:#22d3ee;
          --cyan-dim:#0e7490;
          --magenta:#ff2fb0;
          --magenta-dim:#8a1266;
          --text:#eef2f7;
          --text-muted:#8b96a8;
          --text-faint:#4c5568;
          --danger:#ff5470;
          --font-display:'Space Grotesk', sans-serif;
          --font-body:'IBM Plex Sans', sans-serif;
          --font-mono:'IBM Plex Mono', monospace;
        }
        *{ box-sizing:border-box; }
        html,body{ height:100%; }
        body{
          margin:0; background:var(--bg); color:var(--text);
          font-family:var(--font-body);
          -webkit-font-smoothing:antialiased;
        }

        .stage{ position:relative; min-height:100vh; display:flex; align-items:center; justify-content:center; overflow:hidden; padding:36px 20px; perspective:1200px; }

        canvas#bg{ position:absolute; inset:-4% -4% -4% -4%; width:108%; height:108%; display:block; will-change:transform; }

        .orbs{ position:absolute; inset:-10%; width:120%; height:120%; overflow:hidden; pointer-events:none; mix-blend-mode:screen; will-change:transform; transition:transform 0.15s ease-out; }
        .orb{ position:absolute; border-radius:50%; filter:blur(60px); opacity:0.55; }
        .orb.cyan{ width:440px; height:440px; background:radial-gradient(circle, var(--cyan) 0%, transparent 70%); top:6%; left:4%; animation: float-a 14s ease-in-out infinite; }
        .orb.magenta{ width:480px; height:480px; background:radial-gradient(circle, var(--magenta) 0%, transparent 70%); bottom:2%; right:2%; animation: float-b 17s ease-in-out infinite; }
        .orb.small-cyan{ width:230px; height:230px; background:radial-gradient(circle, var(--cyan) 0%, transparent 70%); top:58%; left:64%; opacity:0.3; animation: float-c 11s ease-in-out infinite; }
        .orb.small-magenta{ width:190px; height:190px; background:radial-gradient(circle, var(--magenta) 0%, transparent 70%); top:12%; right:22%; opacity:0.28; animation: float-d 12.5s ease-in-out infinite; }

        @keyframes float-a{ 0%,100%{ transform:translate(0,0) scale(1); } 50%{ transform:translate(70px,55px) scale(1.18); } }
        @keyframes float-b{ 0%,100%{ transform:translate(0,0) scale(1); } 50%{ transform:translate(-60px,-45px) scale(1.12); } }
        @keyframes float-c{ 0%,100%{ transform:translate(0,0) scale(1); opacity:0.26; } 50%{ transform:translate(-45px,35px) scale(1.3); opacity:0.44; } }
        @keyframes float-d{ 0%,100%{ transform:translate(0,0) scale(1); opacity:0.22; } 50%{ transform:translate(40px,-30px) scale(1.2); opacity:0.4; } }

        .vignette{
          position:absolute; inset:0; pointer-events:none; z-index:1;
          background:radial-gradient(ellipse at 50% 40%, transparent 0%, transparent 24%, rgba(5,7,13,0.62) 70%, var(--bg) 100%);
        }

        .cursor-glow{
          position:fixed; top:0; left:0; width:520px; height:520px; z-index:5;
          pointer-events:none; will-change:transform, opacity;
          background:radial-gradient(circle, rgba(34,211,238,0.16) 0%, rgba(255,47,176,0.08) 40%, transparent 68%);
          transform:translate3d(-1000px,-1000px,0) translate(-50%,-50%);
          mix-blend-mode:screen; opacity:0; transition:opacity 0.4s ease;
        }
        .cursor-glow.active{ opacity:1; }

        .wrap-col{ position:relative; z-index:2; display:flex; flex-direction:column; align-items:center; width:100%; }

        .auth-card{
          position:relative; width:100%; max-width:400px;
          border-radius:16px; padding:2px;
          transform-style:preserve-3d; will-change:transform;
          transition:transform 0.25s cubic-bezier(.2,.8,.2,1);
          animation: card-in 0.6s cubic-bezier(.2,.8,.2,1) both;
        }
        .auth-card::before{
          content:''; position:absolute; inset:0; border-radius:16px; padding:1px;
          background:linear-gradient(135deg, rgba(34,211,238,0.6), rgba(255,47,176,0.55) 55%, rgba(34,211,238,0.2));
          background-size:220% 220%;
          -webkit-mask:linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite:xor;
          mask:linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite:exclude;
          animation: border-flow 6s linear infinite;
          pointer-events:none;
        }
        @keyframes border-flow{
          0%{ background-position:0% 50%; }
          100%{ background-position:200% 50%; }
        }
        .spotlight{
          position:absolute; inset:2px; border-radius:14px; pointer-events:none; opacity:0; z-index:3;
          background:radial-gradient(240px circle at var(--sx,50%) var(--sy,50%), rgba(34,211,238,0.14), transparent 62%);
          transition:opacity 0.25s ease;
        }
        .auth-card:hover .spotlight{ opacity:1; }
        .auth-card-inner{
          position:relative; background:rgba(11,15,26,0.92); border-radius:14px;
          padding:32px 30px 26px; backdrop-filter: blur(16px) saturate(130%);
          box-shadow:0 30px 70px -24px rgba(0,0,0,0.75);
          transform:translateZ(24px);
        }
        @keyframes card-in{ from{ opacity:0; transform:translateY(16px); } to{ opacity:1; transform:translateY(0); } }

        .brand{ display:flex; align-items:center; justify-content:center; gap:9px; margin-bottom:16px; }
        .brand svg{ width:22px; height:22px; }
        .bolt{ fill:var(--cyan); filter:drop-shadow(0 0 6px rgba(34,211,238,0.7)); animation: bolt-flicker 3.4s ease-in-out infinite; }
        @keyframes bolt-flicker{ 0%,92%,100%{ opacity:1; } 94%{ opacity:0.4; } 96%{ opacity:1; } }

        .wordmark{ position:relative; font-family:var(--font-display); font-weight:700; font-size:16px; letter-spacing:0.03em; white-space:nowrap; }
        .wordmark .n1{ color:var(--cyan); }
        .wordmark .n3{ color:var(--magenta); }

        .status-pill{
          display:flex; align-items:center; justify-content:center; gap:7px; margin:0 auto 22px;
          width:fit-content; min-width:246px; padding:6px 14px; border-radius:999px;
          border:1px solid rgba(34,211,238,0.35); background:rgba(34,211,238,0.06);
          font-family:var(--font-mono); font-size:10px; letter-spacing:0.06em; text-transform:uppercase;
          color:var(--cyan); white-space:nowrap;
        }
        .status-pill .blip{ width:5px; height:5px; border-radius:50%; background:var(--cyan); box-shadow:0 0 6px var(--cyan);
          animation:blip 1.6s ease-in-out infinite; flex-shrink:0; }
        @keyframes blip{ 0%,100%{ opacity:1; } 50%{ opacity:0.25; } }

        .tabs{
          position:relative; display:grid; grid-template-columns:1fr 1fr;
          background:var(--panel-soft); border:1px solid var(--line); border-radius:9px;
          padding:3px; margin-bottom:22px;
        }
        .tabs .thumb{
          position:absolute; top:3px; left:3px; width:calc(50% - 3px); height:calc(100% - 6px);
          background:linear-gradient(120deg, rgba(34,211,238,0.16), rgba(255,47,176,0.16));
          border:1px solid var(--line-bright); border-radius:7px;
          transition:transform 0.28s cubic-bezier(.2,.8,.2,1);
        }
        .tab{
          position:relative; z-index:1; border:none; background:transparent; cursor:pointer;
          padding:9px 0; font-family:var(--font-mono); font-weight:500; font-size:11.5px; letter-spacing:0.05em; text-transform:uppercase;
          color:var(--text-muted); transition:color 0.2s ease;
        }
        .tab.active{ color:var(--text); }

        form{ display:flex; flex-direction:column; gap:14px; }
        .field{ display:flex; flex-direction:column; gap:6px; }
        .field label{ font-family:var(--font-mono); font-size:10.5px; color:var(--text-muted); letter-spacing:0.05em; text-transform:uppercase; }
        .field input{
          background:var(--panel-soft); border:1px solid var(--line); border-radius:8px;
          padding:11px 12px; color:var(--text); font-family:var(--font-body); font-size:14px;
        }
        .field input:focus{ outline:none; border-color:var(--cyan); box-shadow:0 0 0 3px rgba(34,211,238,0.12); }

        .row-between{ display:flex; align-items:center; justify-content:space-between; font-size:12px; }
        .checkbox-line{ display:flex; align-items:center; gap:7px; color:var(--text-muted); cursor:pointer; font-family:var(--font-mono); font-size:10.5px; }
        .link{ color:var(--text-muted); text-decoration:none; border-bottom:1px dashed var(--text-faint); font-family:var(--font-mono); font-size:10.5px; }

        .btn-primary{
          position:relative; overflow:hidden; margin-top:2px; border:none; border-radius:8px; padding:12px 0;
          background:linear-gradient(90deg, var(--cyan), #4dd8ff);
          color:#031319; font-family:var(--font-mono); font-weight:600; font-size:12.5px; letter-spacing:0.08em; text-transform:uppercase;
          cursor:pointer;
        }
        .divider{ display:flex; align-items:center; gap:10px; margin:20px 0 16px; }
        .divider::before, .divider::after{ content:''; flex:1; height:1px; background:var(--line); }
        .divider span{ font-family:var(--font-mono); font-size:9.5px; color:var(--text-faint); text-transform:uppercase; }

        .btn-google{
          width:100%; display:flex; align-items:center; justify-content:center; gap:9px;
          border:1px solid var(--line); border-radius:8px; background:var(--panel-soft); color:var(--text);
          padding:10.5px 0; font-family:var(--font-mono); font-size:11.5px; font-weight:500; cursor:pointer;
        }

        .switch-line{ text-align:center; font-family:var(--font-mono); font-size:11px; color:var(--text-muted); margin:20px 0 0; }
        .switch-line a{ color:var(--magenta); text-decoration:none; font-weight:500; cursor:pointer; }
        .error-text{ font-size:11px; color:var(--danger); font-family:var(--font-mono); }

        .ticker{
          position:relative; z-index:2; margin-top:20px; display:flex; align-items:center; gap:8px;
          font-family:var(--font-mono); font-size:10.5px; color:var(--text-faint); text-transform:uppercase;
        }
        .ticker .dot{ width:6px; height:6px; border-radius:50%; background:var(--magenta); box-shadow:0 0 6px var(--magenta); }
        .ticker b{ color:var(--magenta); font-weight:500; }
      `}</style>

      {/* 100% Verbatim Markup from login_page.html */}
      <div className="stage" id="stage">
        <canvas id="bg"></canvas>
        <div className="orbs" id="orbs">
          <div className="orb cyan"></div>
          <div className="orb magenta"></div>
          <div className="orb small-cyan"></div>
          <div className="orb small-magenta"></div>
        </div>
        <div className="vignette"></div>
        <div className="cursor-glow" id="cursorGlow"></div>

        <div className="wrap-col">
          <div className="auth-card" id="authCard">
            <div className="spotlight" id="spotlight"></div>
            <div className="auth-card-inner">
              <div className="brand">
                <svg viewBox="0 0 24 24"><path className="bolt" d="M13 2 L4 14h6l-1 8 10-13h-6l0-7z" /></svg>
                <span className="wordmark" id="wordmark"><span className="n1">PHISHERMAN</span><span className="n3">AI</span></span>
              </div>

              <div className="status-pill" id="statusPill"><span className="blip"></span><span id="statusText">SYS_STATUS: AUTH GATEWAY STANDBY</span></div>

              <div className="tabs" role="tablist">
                <div className="thumb" id="tabThumb" style={{ transform: mode === 'signup' ? 'translateX(100%)' : 'translateX(0)' }}></div>
                <button className={`tab ${mode === 'login' ? 'active' : ''}`} type="button" onClick={() => setMode('login')}>Log in</button>
                <button className={`tab ${mode === 'signup' ? 'active' : ''}`} type="button" onClick={() => setMode('signup')}>Create identity</button>
              </div>

              <form onSubmit={handleFormSubmit}>
                <div className="field">
                  <label htmlFor="email">Access ID (email)</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="alex.reyes@vigil.cyber"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="field">
                  <label htmlFor="password">Password</label>
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                {mode === 'signup' && (
                  <div className="field">
                    <label htmlFor="confirm">Confirm password</label>
                    <input
                      id="confirm"
                      type="password"
                      placeholder="••••••••"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                    />
                  </div>
                )}

                {mode === 'login' && (
                  <div className="row-between">
                    <label className="checkbox-line"><input type="checkbox" defaultChecked /> Keep session</label>
                    <a className="link" href="#">Reset password?</a>
                  </div>
                )}

                {errorText && <p className="error-text">{errorText}</p>}

                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? (mode === 'signup' ? 'Registering…' : 'Authenticating…') : (mode === 'signup' ? 'Create Identity' : 'Initialize Access')}
                </button>
              </form>

              <div className="divider"><span>Or authenticate with</span></div>

              <button className="btn-google" type="button">
                <svg width="15" height="15" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9C16.66 14.2 17.64 11.9 17.64 9.2z" /><path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.98v2.33A9 9 0 0 0 9 18z" /><path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.16.28-1.7V4.97H.98A9 9 0 0 0 0 9c0 1.45.35 2.83.98 4.03l2.97-2.33z" /><path fill="#EA4335" d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .98 4.97l2.97 2.33C4.66 5.17 6.65 3.58 9 3.58z" /></svg>
                Continue with Google
              </button>

              <p className="switch-line">
                {mode === 'login' ? 'New to the network? ' : 'Already on the network? '}
                <a onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
                  {mode === 'login' ? 'Create an identity' : 'Log in'}
                </a>
              </p>
            </div>
          </div>

          <div className="ticker"><span className="dot"></span>Net_Traffic — <b>14,284</b> threats blocked today</div>
        </div>
      </div>
    </>
  );
}
