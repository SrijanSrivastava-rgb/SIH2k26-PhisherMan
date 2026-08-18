'use client';

import { useEffect, useRef } from 'react';

export default function AttackHeatmap() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth || 900);
    let height = (canvas.height = canvas.offsetHeight || 480);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    window.addEventListener('resize', handleResize);

    interface Point {
      x: number;
      y: number;
      baseAlpha: number;
      size: number;
      isMagenta: boolean;
      speed: number;
    }

    const continentPoints: Point[] = [];
    const numPoints = 1400;

    const isLand = (nx: number, ny: number) => {
      // North America
      if (nx > 0.08 && nx < 0.32 && ny > 0.12 && ny < 0.46) {
        if (nx < 0.16 && ny > 0.38) return false;
        return true;
      }
      // Greenland
      if (nx > 0.30 && nx < 0.42 && ny > 0.06 && ny < 0.22) return true;
      // South America
      if (nx > 0.26 && nx < 0.40 && ny > 0.52 && ny < 0.92) {
        if (nx > 0.36 && ny > 0.80) return false;
        return true;
      }
      // Europe
      if (nx > 0.44 && nx < 0.60 && ny > 0.12 && ny < 0.36) return true;
      // Africa
      if (nx > 0.42 && nx < 0.60 && ny > 0.36 && ny < 0.82) {
        if (nx < 0.46 && ny > 0.70) return false;
        return true;
      }
      // Asia
      if (nx > 0.58 && nx < 0.92 && ny > 0.10 && ny < 0.55) {
        if (nx > 0.62 && nx < 0.76 && ny > 0.48) return false;
        return true;
      }
      // India
      if (nx > 0.66 && nx < 0.76 && ny > 0.42 && ny < 0.62) return true;
      // Southeast Asia
      if (nx > 0.76 && nx < 0.88 && ny > 0.50 && ny < 0.68) return true;
      // Australia
      if (nx > 0.78 && nx < 0.94 && ny > 0.68 && ny < 0.92) return true;

      return false;
    };

    while (continentPoints.length < numPoints) {
      const nx = Math.random();
      const ny = Math.random();
      if (isLand(nx, ny)) {
        continentPoints.push({
          x: nx,
          y: ny,
          baseAlpha: 0.3 + Math.random() * 0.7,
          size: 0.8 + Math.random() * 2.2,
          isMagenta: Math.random() < 0.35, // 35% magenta accent nodes, 65% cyan
          speed: 0.002 + Math.random() * 0.005,
        });
      }
    }

    const trajectories = [
      { from: [0.22, 0.32], to: [0.52, 0.22] },
      { from: [0.32, 0.68], to: [0.52, 0.22] },
      { from: [0.52, 0.22], to: [0.82, 0.30] },
      { from: [0.60, 0.20], to: [0.82, 0.30] },
      { from: [0.82, 0.30], to: [0.86, 0.78] },
      { from: [0.22, 0.32], to: [0.82, 0.30] },
      { from: [0.32, 0.68], to: [0.86, 0.78] },
    ];

    let t = 0;

    const render = () => {
      t += 0.015;
      ctx.fillStyle = '#050209';
      ctx.fillRect(0, 0, width, height);

      const pts = continentPoints.map((p) => ({
        px: p.x * width,
        py: p.y * height,
        alpha: Math.min(1, Math.max(0.2, p.baseAlpha + Math.sin(t + p.x * 20) * 0.25)),
        size: p.size,
        isMagenta: p.isMagenta,
      }));

      // Connect close neighbors with cyan & magenta web lines matching website theme
      const maxConnectDist = 38;
      ctx.lineWidth = 0.6;

      for (let i = 0; i < pts.length; i += 3) {
        const p1 = pts[i];
        for (let j = i + 1; j < pts.length; j += 4) {
          const p2 = pts[j];
          const dx = p1.px - p2.px;
          const dy = p1.py - p2.py;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxConnectDist) {
            const lineAlpha = (1 - dist / maxConnectDist) * 0.35 * p1.alpha;
            ctx.strokeStyle = p1.isMagenta
              ? `rgba(255, 0, 85, ${lineAlpha})`
              : `rgba(0, 240, 255, ${lineAlpha})`;
            ctx.beginPath();
            ctx.moveTo(p1.px, p1.py);
            ctx.lineTo(p2.px, p2.py);
            ctx.stroke();
          }
        }
      }

      // Draw particle star nodes (Cyan & Magenta theme)
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        const color = p.isMagenta
          ? `rgba(255, 0, 85, ${p.alpha})`
          : `rgba(0, 240, 255, ${p.alpha})`;

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(p.px, p.py, p.size, 0, Math.PI * 2);
        ctx.fill();

        if (p.size > 2.0) {
          ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * 0.9})`;
          ctx.beginPath();
          ctx.arc(p.px, p.py, p.size * 0.45, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw inter-continental trajectories with Cyan/Magenta glow
      trajectories.forEach((tr, idx) => {
        const sx = tr.from[0] * width;
        const sy = tr.from[1] * height;
        const ex = tr.to[0] * width;
        const ey = tr.to[1] * height;
        const mx = (sx + ex) / 2;
        const my = Math.min(sy, ey) - 60;

        const grad = ctx.createLinearGradient(sx, sy, ex, ey);
        grad.addColorStop(0, 'rgba(0, 240, 255, 0.6)');
        grad.addColorStop(1, 'rgba(255, 0, 85, 0.6)');

        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.quadraticCurveTo(mx, my, ex, ey);
        ctx.stroke();

        // Traveling pulse particle
        const progress = (t * 0.6 + idx * 0.3) % 1;
        const inv = 1 - progress;
        const px = inv * inv * sx + 2 * inv * progress * mx + progress * progress * ex;
        const py = inv * inv * sy + 2 * inv * progress * my + progress * progress * ey;

        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#00F0FF';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(px, py, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="threat-map-card">
      <style jsx>{`
        .threat-map-card {
          background: rgba(11, 15, 26, 0.85);
          border: 1px solid rgba(0, 240, 255, 0.2);
          border-radius: 16px;
          padding: 22px 24px 18px;
          backdrop-filter: blur(20px);
          box-shadow: inset 0 0 30px rgba(0, 240, 255, 0.05), 0 20px 40px rgba(0, 0, 0, 0.7);
          margin-bottom: 24px;
          position: relative;
        }

        .map-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .map-title {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 16px;
          color: #eef2f7;
          letter-spacing: 0.03em;
        }

        .canvas-container {
          width: 100%;
          height: 420px;
          position: relative;
          background: #050209;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid rgba(0, 240, 255, 0.15);
        }

        canvas {
          width: 100%;
          height: 100%;
          display: block;
        }

        .map-legend {
          display: flex;
          align-items: center;
          gap: 24px;
          margin-top: 16px;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          color: #8b96a8;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .legend-dot.high {
          background: #ff0055;
          box-shadow: 0 0 10px #ff0055;
        }

        .legend-dot.active {
          background: #00f0ff;
          box-shadow: 0 0 10px #00f0ff;
        }

        .legend-dot.low {
          background: #7ce8f0;
          box-shadow: 0 0 8px #7ce8f0;
        }
      `}</style>

      <div className="map-header">
        <div className="map-title">Global Threat Map</div>
        <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '11px', color: '#00F0FF' }}>
          ● LIVE VIGIL TELEMETRY MESH
        </div>
      </div>

      <div className="canvas-container">
        <canvas ref={canvasRef} />
      </div>

      <div className="map-legend">
        <div className="legend-item">
          <span className="legend-dot high"></span>
          <span>High Risk Sector (#FF0055)</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot active"></span>
          <span>Active Threat Vector (#00F0FF)</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot low"></span>
          <span>Operational Node (#7CE8F0)</span>
        </div>
      </div>
    </div>
  );
}
