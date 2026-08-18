'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import Link from 'next/link';

export default function LandingPage() {
  useEffect(() => {
    // Function to initialize scripts once libraries load
    const initScripts = () => {
      const windowObj = window as any;
      const hasGSAP = typeof windowObj.gsap !== 'undefined';
      const hasThree = typeof windowObj.THREE !== 'undefined';

      if (hasGSAP && windowObj.ScrollTrigger) {
        windowObj.gsap.registerPlugin(windowObj.ScrollTrigger);
      }

      /* ---------------- NAVBAR ---------------- */
      const nav = document.getElementById('navbar');
      const handleScroll = () => {
        if (nav) nav.classList.toggle('scrolled', window.scrollY > 50);
      };
      window.addEventListener('scroll', handleScroll, { passive: true });

      /* ---------------- THREE.JS GLOBE ---------------- */
      if (hasThree) {
        const THREE = windowObj.THREE;
        const canvas = document.getElementById('globe-canvas') as HTMLCanvasElement;
        if (canvas) {
          const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
          renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
          const scene = new THREE.Scene();
          const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
          camera.position.z = 6.2;

          const resizeGlobe = () => {
            const wrap = document.getElementById('globe-wrap');
            if (wrap) {
              const size = wrap.clientWidth;
              renderer.setSize(size, size, false);
              camera.aspect = 1;
              camera.updateProjectionMatrix();
            }
          };
          resizeGlobe();
          window.addEventListener('resize', resizeGlobe);

          const globeGroup = new THREE.Group();
          scene.add(globeGroup);

          // Starfield
          const starGeo = new THREE.BufferGeometry();
          const starCount = 600;
          const starPos = new Float32Array(starCount * 3);
          for (let i = 0; i < starCount; i++) {
            const r = 14 + Math.random() * 22;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            starPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            starPos[i * 3 + 2] = r * Math.cos(phi);
          }
          starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
          const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.045, transparent: true, opacity: 0.5 });
          const stars = new THREE.Points(starGeo, starMat);
          scene.add(stars);

          // Core earth sphere
          const loader = new THREE.TextureLoader();
          const earthTexture = loader.load(
            'https://cdn.jsdelivr.net/npm/three-globe@2.31.0/example/img/earth-night.jpg',
            undefined,
            undefined,
            () => {
              earthMesh.material.map = null;
              earthMesh.material.color.set(0x0a2530);
              earthMesh.material.needsUpdate = true;
            }
          );
          const coreGeo = new THREE.SphereGeometry(2, 64, 64);
          const coreMat = new THREE.MeshPhongMaterial({
            map: earthTexture,
            color: 0x224455,
            emissive: 0x001a22,
            emissiveIntensity: 0.6,
            shininess: 4,
            transparent: true,
            opacity: 0.96,
          });
          const earthMesh = new THREE.Mesh(coreGeo, coreMat);
          globeGroup.add(earthMesh);

          // Wireframe shell
          const wireGeo = new THREE.IcosahedronGeometry(2.03, 3);
          const wireMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, wireframe: true, transparent: true, opacity: 0.1 });
          globeGroup.add(new THREE.Mesh(wireGeo, wireMat));

          // Atmosphere rim glow
          const atmoGeo = new THREE.SphereGeometry(2.14, 48, 48);
          const atmoMat = new THREE.ShaderMaterial({
            transparent: true,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide,
            uniforms: { glowColor: { value: new THREE.Color(0x00f0ff) } },
            vertexShader: `varying vec3 vNormal; void main(){ vNormal = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
            fragmentShader: `varying vec3 vNormal; uniform vec3 glowColor; void main(){ float intensity = pow(0.62 - dot(vNormal, vec3(0,0,1.0)), 2.5); gl_FragColor = vec4(glowColor, intensity*0.85); }`,
          });
          globeGroup.add(new THREE.Mesh(atmoGeo, atmoMat));

          // Beacons
          const nodeCount = 70;
          const nodePositions: any[] = [];
          const nodeGeo = new THREE.BufferGeometry();
          const posArr = new Float32Array(nodeCount * 3);
          for (let i = 0; i < nodeCount; i++) {
            const phi = Math.acos(-1 + (2 * i) / nodeCount);
            const theta = Math.sqrt(nodeCount * Math.PI) * phi;
            const r = 2.05;
            const x = r * Math.cos(theta) * Math.sin(phi);
            const y = r * Math.sin(theta) * Math.sin(phi);
            const z = r * Math.cos(phi);
            posArr[i * 3] = x;
            posArr[i * 3 + 1] = y;
            posArr[i * 3 + 2] = z;
            nodePositions.push(new THREE.Vector3(x, y, z));
          }
          nodeGeo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
          const nodeMat = new THREE.PointsMaterial({ color: 0x00f0ff, size: 0.032, transparent: true, opacity: 0.9 });
          const nodePoints = new THREE.Points(nodeGeo, nodeMat);
          globeGroup.add(nodePoints);

          const makeArc = (p1: any, p2: any, color: number, opacity: number) => {
            const mid = p1.clone().add(p2).multiplyScalar(0.5);
            mid.normalize().multiplyScalar(2 + p1.distanceTo(p2) * 0.6);
            const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
            const geo = new THREE.TubeGeometry(curve, 32, 0.006, 6, false);
            const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity });
            return new THREE.Mesh(geo, mat);
          };

          const arcs: any[] = [];
          for (let i = 0; i < 10; i++) {
            const a = nodePositions[Math.floor(Math.random() * nodeCount)];
            const b = nodePositions[Math.floor(Math.random() * nodeCount)];
            const arc = makeArc(a, b, 0x00f0ff, 0);
            arcs.push(arc);
            globeGroup.add(arc);
          }
          const strikeArcs: any[] = [];
          for (let i = 0; i < 3; i++) {
            const a = nodePositions[Math.floor(Math.random() * nodeCount)];
            const b = nodePositions[Math.floor(Math.random() * nodeCount)];
            const arc = makeArc(a, b, 0xff0055, 0);
            strikeArcs.push(arc);
            globeGroup.add(arc);
          }

          scene.add(new THREE.AmbientLight(0xffffff, 0.7));
          const keyLight = new THREE.PointLight(0x00f0ff, 1.4, 20);
          keyLight.position.set(4, 2, 5);
          scene.add(keyLight);
          const rimLight = new THREE.PointLight(0xff0055, 0.6, 20);
          rimLight.position.set(-5, -2, -3);
          scene.add(rimLight);

          if (hasGSAP) {
            arcs.forEach((arc, i) => {
              windowObj.gsap.to(arc.material, { opacity: 0.55, duration: 1, delay: 0.4 + i * 0.12, ease: 'power2.out' });
            });
            strikeArcs.forEach((arc, i) => {
              windowObj.gsap.to(arc.material, { opacity: 0.9, duration: 0.3, delay: 2.2 + i * 0.25, ease: 'power2.out', yoyo: true, repeat: 1 });
            });
          } else {
            arcs.forEach((arc) => (arc.material.opacity = 0.55));
            strikeArcs.forEach((arc) => (arc.material.opacity = 0.7));
          }

          let targetTiltX = 0.15, targetTiltY = 0;
          let curTiltX = 0.15, curTiltY = 0;
          const handleMouseMove = (e: MouseEvent) => {
            const nx = e.clientX / window.innerWidth - 0.5;
            const ny = e.clientY / window.innerHeight - 0.5;
            targetTiltY = nx * 0.5;
            targetTiltX = 0.15 + ny * 0.25;
          };
          window.addEventListener('mousemove', handleMouseMove);

          const clock = new THREE.Clock();
          let animId: number;
          const animateGlobe = () => {
            animId = requestAnimationFrame(animateGlobe);
            const t = clock.getElapsedTime();
            globeGroup.rotation.y += 0.0016;
            curTiltX += (targetTiltX - curTiltX) * 0.03;
            curTiltY += (targetTiltY - curTiltY) * 0.03;
            globeGroup.rotation.x = curTiltX;
            globeGroup.rotation.z = curTiltY * 0.3;
            stars.rotation.y += 0.00025;
            nodeMat.opacity = 0.65 + Math.sin(t * 2) * 0.25;
            renderer.render(scene, camera);
          };
          animateGlobe();

          const globeWrap = document.getElementById('globe-wrap');
          if (hasGSAP && globeWrap) {
            windowObj.gsap.set(globeWrap, { xPercent: -50, yPercent: -50, top: '50%', left: '50%', scale: 1 });
            windowObj.gsap
              .timeline({
                scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 },
              })
              .to(globeWrap, { top: '130px', left: '85%', scale: 0.4, ease: 'none' }, 0);
          }
        }
      }

      /* ---------------- HERO GSAP FADE ---------------- */
      if (hasGSAP) {
        windowObj.gsap
          .timeline({
            scrollTrigger: { trigger: '.hero', start: 'top top', end: '70% top', scrub: 0.6 },
          })
          .to('.hero-inner', { yPercent: -40, opacity: 0, ease: 'none' }, 0);
      }

      /* ---------------- SCAN WIDGET WITH BACKEND API INTEGRATION ---------------- */
      const scanBox = document.getElementById('scanBox');
      const scanInput = document.getElementById('scanInput') as HTMLInputElement;
      const scanBtn = document.getElementById('scanBtn');
      const scanProgress = document.getElementById('scanProgress');
      const hologram = document.getElementById('hologram');
      const scanLabel = document.getElementById('scanLabel');
      const hologramTitle = hologram?.querySelector('h4');
      const hologramDesc = hologram?.querySelector('p');

      if (scanProgress) {
        scanProgress.style.transition = 'width .9s cubic-bezier(.4,0,.2,1), background .3s ease';
      }

      if (scanInput && scanBox) {
        scanInput.addEventListener('focus', () => scanBox.classList.add('focused'));
        scanInput.addEventListener('blur', () => scanBox.classList.remove('focused'));
      }

      const ctaScan = document.getElementById('cta-scan');
      if (ctaScan && scanInput) {
        ctaScan.addEventListener('click', (e) => {
          e.preventDefault();
          document.getElementById('scan')?.scrollIntoView({ behavior: 'smooth' });
          setTimeout(() => scanInput.focus(), 600);
        });
      }

      const runScan = async () => {
        if (!scanInput || !scanBox || !scanProgress || !scanLabel || !hologram) return;
        const val = scanInput.value.trim();
        if (!val) {
          scanInput.focus();
          return;
        }

        hologram.classList.remove('show');
        scanBox.classList.remove('threat');
        scanProgress.style.background = 'var(--cyan)';
        scanProgress.style.width = '0%';

        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            scanProgress.style.width = '100%';
          })
        );

        scanLabel.textContent = 'Inspecting DNS, WHOIS, SSL certs & DOM tree in backend…';

        try {
          const res = await fetch('/api/scan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: val }),
          });
          const data = await res.json();

          setTimeout(() => {
            const isThreat = data.overallScore >= 40 || data.verdict === 'QUARANTINED' || data.verdict === 'PHISHING';
            if (isThreat) {
              scanBox.classList.add('threat', 'shaking');
              scanProgress.style.background = 'var(--magenta)';
              scanLabel.textContent = `Verdict: ${data.verdict || 'QUARANTINED'} — Risk Score: ${data.overallScore}/100`;

              if (hologramTitle) hologramTitle.textContent = `Threat Blocked — ${data.verdict} (${data.overallScore}/100)`;
              if (hologramDesc) hologramDesc.textContent = data.aiExplanation || 'Connection quarantined before render.';
              hologram.classList.add('show');
              setTimeout(() => scanBox.classList.remove('shaking'), 500);
            } else {
              scanLabel.textContent = `Verdict: SAFE — Risk Score: ${data.overallScore}/100 (Clean domain)`;
              scanBox.style.boxShadow = '0 0 40px rgba(0,240,255,.35)';
              setTimeout(() => {
                scanBox.style.boxShadow = '';
              }, 500);
            }
            setTimeout(() => {
              scanProgress.style.width = '0%';
            }, 900);
          }, 950);
        } catch (err) {
          setTimeout(() => {
            scanLabel.textContent = 'Scan completed.';
            scanProgress.style.width = '0%';
          }, 900);
        }
      };

      if (scanBtn) scanBtn.addEventListener('click', runScan);
      if (scanInput) {
        scanInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') runScan();
        });
      }

      /* ---------------- PIPELINE TRACK & STEPS ---------------- */
      const track = document.getElementById('pipelineTrack');
      const line = document.getElementById('pipelineLine');
      const packet = document.getElementById('packet');
      const steps = [1, 2, 3, 4].map((n) => document.getElementById('step' + n));

      const isDesktopLayout = () => window.innerWidth > 900;

      const layoutSteps = () => {
        if (!track || !line) return;
        if (!isDesktopLayout()) {
          steps.forEach((s) => {
            if (s) s.style.top = '';
          });
          track.style.minHeight = '';
          line.style.height = '';
          return;
        }
        let cursor = 20;
        const gap = 130;
        steps.forEach((step) => {
          if (step) {
            step.style.top = cursor + 'px';
            cursor += step.offsetHeight + gap;
          }
        });
        const finalHeight = cursor - gap + 60;
        track.style.minHeight = finalHeight + 'px';
        line.style.height = finalHeight + 'px';
      };

      layoutSteps();
      window.addEventListener('resize', layoutSteps);

      if (hasGSAP && windowObj.ScrollTrigger && track && line && packet) {
        windowObj.ScrollTrigger.create({
          trigger: '#pipelineTrack',
          start: 'top center',
          end: 'bottom center',
          scrub: 0.5,
          onUpdate: (self: any) => {
            const p = self.progress;
            const trackH = track.offsetHeight;
            packet.style.top = p * trackH + 'px';
            line.style.setProperty('--line-progress', p * 100 + '%');
            packet.classList.toggle('hot', p > 0.26);
          },
        });

        steps.forEach((step) => {
          if (!step) return;
          const dir = step.classList.contains('left') ? -60 : 60;
          windowObj.gsap.fromTo(
            step,
            { opacity: 0, x: dir },
            {
              opacity: 1,
              x: 0,
              duration: 0.8,
              ease: 'power2.out',
              scrollTrigger: { trigger: step, start: 'top 78%', toggleActions: 'play none none reverse' },
            }
          );
          windowObj.ScrollTrigger.create({
            trigger: step,
            start: 'top 70%',
            end: 'bottom 30%',
            onEnter: () => step.classList.add('in-view'),
            onLeave: () => step.classList.remove('in-view'),
            onEnterBack: () => step.classList.add('in-view'),
            onLeaveBack: () => step.classList.remove('in-view'),
          });
        });
      } else {
        if (packet) packet.style.display = 'none';
        steps.forEach((step) => step?.classList.add('in-view'));
      }

      ['dots1'].forEach((id) => {
        const el = document.getElementById(id);
        if (el && el.children.length === 0) {
          for (let i = 0; i < 32; i++) {
            const s = document.createElement('span');
            el.appendChild(s);
          }
        }
      });

      /* ---------------- FEATURE CARDS ---------------- */
      document.querySelectorAll('.feature-card').forEach((card: any, i) => {
        if (hasGSAP && windowObj.ScrollTrigger) {
          windowObj.gsap.fromTo(
            card,
            { opacity: 0, y: 50 },
            {
              opacity: 1,
              y: 0,
              duration: 0.7,
              delay: (i % 3) * 0.12,
              ease: 'power2.out',
              scrollTrigger: { trigger: '#featuresGrid', start: 'top 80%' },
            }
          );
        }
        card.addEventListener('mousemove', (e: MouseEvent) => {
          const r = card.getBoundingClientRect();
          const mx = e.clientX - r.left, my = e.clientY - r.top;
          card.style.setProperty('--mx', mx + 'px');
          card.style.setProperty('--my', my + 'px');
          const rx = (my / r.height - 0.5) * -10;
          const ry = (mx / r.width - 0.5) * 10;
          card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
        });
        card.addEventListener('mouseleave', () => {
          card.style.transform = 'rotateX(0) rotateY(0)';
        });
      });

      /* ---------------- STAT COUNTERS ---------------- */
      const animateCount = (el: any, target: number, suffix: string, decimals: number) => {
        if (hasGSAP) {
          const obj = { val: 0 };
          windowObj.gsap.to(obj, {
            val: target,
            duration: 2,
            ease: 'power2.out',
            onUpdate: () => {
              el.textContent = (decimals ? obj.val.toFixed(decimals) : Math.floor(obj.val).toLocaleString()) + suffix;
            },
          });
        } else {
          el.textContent = (decimals ? target.toFixed(decimals) : Math.floor(target).toLocaleString()) + suffix;
        }
      };

      const statEls = document.querySelectorAll('.stat-num');
      if (hasGSAP && windowObj.ScrollTrigger) {
        statEls.forEach((el: any) => {
          const target = parseFloat(el.dataset.target);
          const suffix = el.dataset.suffix || '';
          const decimals = parseInt(el.dataset.decimals || '0');
          windowObj.ScrollTrigger.create({
            trigger: el,
            start: 'top 85%',
            once: true,
            onEnter: () => animateCount(el, target, suffix, decimals),
          });
        });
      }
    };

    // Retry script initialization if libraries load asynchronously
    const timer = setTimeout(initScripts, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* 100% Verbatim External Fonts & Scripts from landing_page.html */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />

      <Script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js" strategy="beforeInteractive" />
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js" strategy="beforeInteractive" />
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js" strategy="beforeInteractive" />

      {/* 100% Verbatim Inline CSS from landing_page.html */}
      <style jsx global>{`
        :root{
          --bg:#050209;
          --cyan:#00F0FF;
          --magenta:#FF0055;
          --glass-bg: rgba(255,255,255,0.05);
          --glass-border: rgba(255,255,255,0.10);
          --text-dim: rgba(255,255,255,0.6);
        }
        *{margin:0;padding:0;box-sizing:border-box;}
        html{scroll-behavior:smooth;}
        body{
          background:var(--bg);
          color:#fff;
          font-family:'Inter',sans-serif;
          overflow-x:hidden;
          position:relative;
        }
        h1,h2,h3,.numeral{font-family:'Space Grotesk',sans-serif;}
        a{color:inherit;text-decoration:none;}
        ::selection{background:var(--magenta);color:#fff;}

        .void-grid{
          position:fixed;inset:0;z-index:0;pointer-events:none;
          background-image:
            linear-gradient(rgba(0,240,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,240,255,0.04) 1px, transparent 1px);
          background-size:48px 48px;
          mask-image:radial-gradient(ellipse 80% 60% at 50% 0%, black 20%, transparent 75%);
        }

        nav{
          position:fixed;top:0;left:0;right:0;z-index:100;
          display:flex;align-items:center;justify-content:space-between;
          padding:22px 48px;
          border-bottom:1px solid transparent;
          transition:background .4s ease, border-color .4s ease, backdrop-filter .4s ease, padding .3s ease;
        }
        nav.scrolled{
          background:rgba(5,2,9,0.55);
          backdrop-filter:blur(20px);
          -webkit-backdrop-filter:blur(20px);
          border-bottom:1px solid rgba(0,240,255,0.25);
          padding:14px 48px;
        }
        .logo{display:flex;align-items:center;gap:10px;font-weight:600;font-size:1.1rem;letter-spacing:.5px;}
        .logo-mark{width:26px;height:26px;border-radius:7px;background:linear-gradient(135deg,var(--cyan),var(--magenta));display:inline-block;box-shadow:0 0 18px rgba(0,240,255,.6);}
        .nav-links{display:flex;gap:38px;}
        .nav-links a{position:relative;font-size:.92rem;color:var(--text-dim);padding-bottom:4px;transition:color .25s;}
        .nav-links a::after{
          content:'';position:absolute;left:0;bottom:0;width:100%;height:1.5px;
          background:var(--cyan);box-shadow:0 0 8px var(--cyan);
          transform:scaleX(0);transform-origin:center;transition:transform .3s ease;
        }
        .nav-links a:hover{color:#fff;}
        .nav-links a:hover::after{transform:scaleX(1);}
        .nav-actions{display:flex;gap:14px;align-items:center;}
        .btn{
          font-family:'Inter',sans-serif;font-weight:600;font-size:.88rem;
          padding:10px 22px;border-radius:999px;cursor:pointer;border:1px solid transparent;
          transition:transform .25s ease, box-shadow .25s ease, background .25s ease;
        }
        .btn:active{transform:scale(.96);}
        .btn-ghost{background:transparent;border:1px solid var(--glass-border);color:#fff;}
        .btn-ghost:hover{border-color:var(--cyan);box-shadow:0 0 20px rgba(0,240,255,.25);}
        .btn-solid{background:linear-gradient(135deg,var(--cyan),#0090a8);color:#001217;}
        .btn-solid:hover{box-shadow:0 0 28px rgba(0,240,255,.55);transform:translateY(-1px);}

        #globe-wrap{
          position:fixed;top:50%;left:50%;
          width:640px;height:640px;
          z-index:1;pointer-events:none;
          will-change:transform;
          filter:drop-shadow(0 0 60px rgba(0,240,255,.18));
        }
        #globe-wrap canvas{width:100% !important;height:100% !important;}

        section{position:relative;z-index:2;}

        .hero{
          height:100vh;display:flex;align-items:center;
          padding:0 48px;
        }
        .hero-inner{max-width:640px;}
        .eyebrow{
          display:inline-flex;align-items:center;gap:8px;
          font-size:.75rem;letter-spacing:2px;text-transform:uppercase;color:var(--cyan);
          border:1px solid rgba(0,240,255,.3);padding:6px 14px;border-radius:999px;
          margin-bottom:22px;background:rgba(0,240,255,.05);
        }
        .eyebrow .dot{width:6px;height:6px;border-radius:50%;background:var(--magenta);box-shadow:0 0 8px var(--magenta);animation:pulse 1.6s infinite;}
        @keyframes pulse{0%,100%{opacity:1;}50%{opacity:.3;}}
        .hero h1{
          font-size:clamp(2.6rem,5.2vw,4.4rem);
          line-height:1.05;font-weight:700;letter-spacing:-1px;
          background:linear-gradient(100deg,#fff 10%, var(--cyan) 45%, var(--magenta) 90%);
          -webkit-background-clip:text;background-clip:text;color:transparent;
          margin-bottom:22px;
        }
        .hero p{color:var(--text-dim);font-size:1.05rem;max-width:480px;margin-bottom:34px;line-height:1.6;}
        .hero-ctas{display:flex;gap:16px;}
        .btn-lg{padding:14px 30px;font-size:.95rem;}
        .scroll-cue{
          position:absolute;bottom:36px;left:48px;display:flex;align-items:center;gap:10px;
          color:var(--text-dim);font-size:.75rem;letter-spacing:1.5px;text-transform:uppercase;
        }
        .scroll-cue .line{width:1px;height:36px;background:linear-gradient(var(--cyan),transparent);animation:scrolldown 1.8s infinite;}
        @keyframes scrolldown{0%{opacity:0;transform:translateY(-8px);}50%{opacity:1;}100%{opacity:0;transform:translateY(8px);}}

        .scan-section{padding:140px 48px 160px;display:flex;justify-content:center;}
        .scan-box{
          width:100%;max-width:760px;
          background:var(--glass-bg);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
          border:1px solid var(--glass-border);border-radius:20px;
          padding:12px;position:relative;overflow:hidden;
          transition:border-color .3s ease, box-shadow .3s ease;
        }
        .scan-box.focused{border-color:var(--cyan);box-shadow:0 0 40px rgba(0,240,255,.25);}
        .scan-box.threat{border-color:var(--magenta);box-shadow:0 0 40px rgba(255,0,85,.35);}
        @keyframes shake{
          10%,90%{transform:translateX(-2px);}20%,80%{transform:translateX(4px);}
          30%,50%,70%{transform:translateX(-8px);}40%,60%{transform:translateX(8px);}
        }
        .scan-box.shaking{animation:shake .5s ease;}
        .scan-row{display:flex;gap:10px;align-items:center;padding:8px;}
        .scan-row input{
          flex:1;background:transparent;border:none;outline:none;color:#fff;
          font-family:'Inter',sans-serif;font-size:1rem;padding:14px 16px;
        }
        .scan-row input::placeholder{color:rgba(255,255,255,.35);}
        .scan-progress{position:absolute;bottom:0;left:0;height:2px;width:0%;background:var(--cyan);box-shadow:0 0 10px var(--cyan);transition:background .3s ease;}
        .scan-section .label{text-align:center;color:var(--text-dim);font-size:.85rem;margin-top:16px;letter-spacing:.3px;}
        .hologram{
          max-width:760px;width:100%;margin:20px auto 0;
          border:1px solid rgba(255,0,85,.4);border-radius:16px;padding:20px 22px;
          background:linear-gradient(180deg, rgba(255,0,85,.08), rgba(255,0,85,.02));
          display:none;align-items:center;gap:16px;
        }
        .hologram.show{display:flex;}
        .hologram .icon{width:40px;height:40px;flex:none;border-radius:10px;background:rgba(255,0,85,.15);display:flex;align-items:center;justify-content:center;color:var(--magenta);font-weight:700;font-family:'Space Grotesk';}
        .hologram h4{color:var(--magenta);font-size:.95rem;margin-bottom:3px;}
        .hologram p{color:var(--text-dim);font-size:.82rem;margin:0;}

        .pipeline-section{padding:100px 48px 60px;}
        .pipeline-heading{text-align:center;margin-bottom:70px;}
        .pipeline-heading h2{font-size:clamp(1.8rem,3vw,2.6rem);margin-bottom:12px;}
        .pipeline-heading p{color:var(--text-dim);max-width:520px;margin:0 auto;}
        .pipeline-track{position:relative;max-width:1000px;margin:0 auto;min-height:1600px;}
        .pipeline-line{
          position:absolute;left:50%;top:0;width:2px;transform:translateX(-50%);
          background:var(--glass-border);
        }
        .pipeline-line::after{
          content:'';position:absolute;left:0;top:0;width:100%;
          background:linear-gradient(var(--cyan),var(--cyan));
          box-shadow:0 0 12px var(--cyan);
          height:var(--line-progress,0%);
          transition:background .3s ease;
        }
        .packet{
          position:absolute;left:50%;width:16px;height:16px;border-radius:50%;
          background:var(--cyan);box-shadow:0 0 18px 4px var(--cyan);
          transform:translate(-50%,-50%);top:0;
          transition:background .4s ease, box-shadow .4s ease;
          z-index:5;
        }
        .packet.hot{background:var(--magenta);box-shadow:0 0 22px 6px var(--magenta);}
        .step{
          position:absolute;width:44%;
          background:var(--glass-bg);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);
          border:1px solid var(--glass-border);border-radius:18px;padding:28px 26px;
          transition:border-color .4s ease;
        }
        .step .kicker{font-size:.7rem;letter-spacing:2px;color:var(--cyan);text-transform:uppercase;margin-bottom:8px;}
        .step h3{font-size:1.3rem;margin-bottom:10px;}
        .step p{color:var(--text-dim);font-size:.9rem;line-height:1.55;}
        .step.left{left:0;}
        .step.right{right:0;}
        .step.magenta .kicker{color:var(--magenta);}
        .step.magenta{border-color:rgba(255,0,85,.35);}
        .step-visual{
          margin-top:16px;height:90px;border-radius:12px;background:rgba(255,255,255,.03);
          border:1px solid var(--glass-border);position:relative;overflow:hidden;
        }
        .step-visual .laser{
          position:absolute;left:0;top:-4px;width:100%;height:3px;background:var(--cyan);
          box-shadow:0 0 12px var(--cyan);opacity:0;
        }
        .step.in-view .step-visual .laser{animation:sweep 2.2s ease-in-out infinite;}
        @keyframes sweep{0%{top:-4px;opacity:0;}10%{opacity:1;}90%{opacity:1;}100%{top:100%;opacity:0;}}
        .grid-dots{display:grid;grid-template-columns:repeat(8,1fr);gap:5px;padding:12px;height:100%;}
        .grid-dots span{background:rgba(0,240,255,.18);border-radius:2px;}
        .step.in-view .grid-dots span{animation:blink 1.6s infinite;}
        @keyframes blink{0%,100%{background:rgba(0,240,255,.15);}50%{background:rgba(0,240,255,.6);}}
        .verdict-ring{
          width:70px;height:70px;border-radius:50%;
          background:conic-gradient(var(--cyan) 78%, rgba(255,255,255,.08) 0);
          display:flex;align-items:center;justify-content:center;margin:8px auto;
        }
        .verdict-ring span{width:52px;height:52px;border-radius:50%;background:var(--bg);display:flex;align-items:center;justify-content:center;font-family:'Space Grotesk';font-weight:600;font-size:.9rem;}

        .features-section{padding:120px 48px;}
        .features-heading{text-align:center;margin-bottom:60px;}
        .features-heading h2{font-size:clamp(1.8rem,3vw,2.6rem);}
        .features-grid{
          max-width:1100px;margin:0 auto;
          display:grid;grid-template-columns:repeat(3,1fr);gap:22px;
        }
        .feature-card{
          position:relative;padding:30px 26px;border-radius:18px;
          background:var(--glass-bg);border:1px solid var(--glass-border);
          overflow:hidden;transform-style:preserve-3d;perspective:800px;
          transition:border-color .3s ease;
          cursor:default;
        }
        .feature-card::before{
          content:'';position:absolute;inset:0;border-radius:18px;pointer-events:none;
          background:radial-gradient(220px circle at var(--mx,50%) var(--my,50%), rgba(0,240,255,.15), transparent 70%);
          opacity:0;transition:opacity .3s ease;
        }
        .feature-card:hover::before{opacity:1;}
        .feature-card:hover{border-color:rgba(0,240,255,.4);}
        .feature-icon{
          width:44px;height:44px;border-radius:12px;margin-bottom:18px;
          background:linear-gradient(135deg, rgba(0,240,255,.18), rgba(255,0,85,.1));
          display:flex;align-items:center;justify-content:center;font-size:1.2rem;
        }
        .feature-card h3{font-size:1.08rem;margin-bottom:8px;}
        .feature-card p{color:var(--text-dim);font-size:.87rem;line-height:1.55;}

        .stats-section{padding:100px 48px;}
        .stats-grid{max-width:1100px;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);gap:20px;text-align:center;}
        .stat-num{font-size:clamp(2rem,4vw,3.2rem);font-weight:700;background:linear-gradient(120deg,var(--cyan),var(--magenta));-webkit-background-clip:text;background-clip:text;color:transparent;}
        .stat-label{color:var(--text-dim);font-size:.85rem;margin-top:6px;letter-spacing:.3px;}

        footer{
          padding:50px 48px 40px;border-top:1px solid rgba(0,240,255,.15);
          display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:20px;
          background:#030106;
        }
        footer .foot-links{display:flex;gap:26px;}
        footer .foot-links a{color:var(--text-dim);font-size:.85rem;transition:color .2s;}
        footer .foot-links a:hover{color:var(--cyan);}
        footer .copy{color:rgba(255,255,255,.35);font-size:.78rem;}

        @media(max-width:900px){
          .nav-links{display:none;}
          #globe-wrap{width:420px;height:420px;}
          .step{width:100%;left:0 !important;right:0 !important;position:relative;margin-bottom:40px;}
          .pipeline-line{display:none;}
          .pipeline-track{min-height:auto;}
          .features-grid{grid-template-columns:1fr 1fr;}
          .stats-grid{grid-template-columns:1fr 1fr;}
        }
      `}</style>

      {/* 100% Verbatim Markup from landing_page.html */}
      <div className="void-grid"></div>
      <div id="globe-wrap"><canvas id="globe-canvas"></canvas></div>

      <nav id="navbar">
        <div className="logo"><span className="logo-mark"></span>PhisherMan</div>
        <div className="nav-links">
          <Link href="/dashboard">Dashboard</Link>
          <a href="#features">Features</a>
          <a href="#pipeline">How it works</a>
          <Link href="/scanner">Scanner</Link>
        </div>
        <div className="nav-actions">
          <Link className="btn btn-ghost" href="/login">Login</Link>
          <Link className="btn btn-solid" href="/login">Sign Up</Link>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-inner">
          <div className="eyebrow"><span className="dot"></span> Zero-Trust Web Gateway</div>
          <h1>Architecting Internet Immunity</h1>
          <p>PhisherMan inspects every request before it reaches a browser — catching phishing kits, typo-squats and zero-day lookalikes in milliseconds, not headlines.</p>
          <div className="hero-ctas">
            <a className="btn btn-solid btn-lg" id="cta-scan" href="#scan">Check a URL</a>
            <Link className="btn btn-ghost btn-lg" href="/threats">Explore Threat Intel</Link>
          </div>
        </div>
        <div className="scroll-cue"><span className="line"></span>Scroll</div>
      </section>

      <section className="scan-section" id="scan">
        <div style={{ width: '100%', maxWidth: '760px' }}>
          <div className="scan-box" id="scanBox">
            <div className="scan-row">
              <input id="scanInput" type="text" placeholder="Paste a URL to scan — try phisherMan.com or free-gift-verify.ru" />
              <button className="btn btn-solid" id="scanBtn" type="button">Scan</button>
            </div>
            <div className="scan-progress" id="scanProgress"></div>
          </div>
          <div className="label" id="scanLabel">Runs live against Prisma SQLite threat database & DNS/WHOIS engine.</div>
          <div className="hologram" id="hologram">
            <div className="icon">!</div>
            <div>
              <h4>Threat Blocked — Phishing Kit Detected</h4>
              <p>Domain matched a known credential-harvesting template. Connection quarantined before render.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="pipeline-section" id="pipeline">
        <div className="pipeline-heading">
          <h2>How PhisherMan Works</h2>
          <p>Four checkpoints, one packet's journey — from socket to verdict.</p>
        </div>
        <div className="pipeline-track" id="pipelineTrack">
          <div className="pipeline-line" id="pipelineLine"></div>
          <div className="packet" id="packet"></div>

          <div className="step left" id="step1">
            <div className="kicker">SIH1524 · The Bouncer</div>
            <h3>DNS Filtering</h3>
            <p>Every outbound socket request is intercepted at the DNS layer before a connection ever opens, checked against a live reputation graph of malicious infrastructure.</p>
            <div className="step-visual"><div className="grid-dots" id="dots1"></div></div>
          </div>

          <div className="step right magenta" id="step2">
            <div className="kicker">Threat Detected</div>
            <h3>Packet Quarantined</h3>
            <p>A match against known-bad infrastructure shatters the request instantly — the packet is broken apart and dropped before it can reach the client.</p>
            <div className="step-visual" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="90" height="70" viewBox="0 0 90 70" id="shieldSvg"><path d="M45 4 L80 16 V38 C80 56 63 66 45 68 C27 66 10 56 10 38 V16 Z" fill="none" stroke="#FF0055" strokeWidth="2" /></svg>
            </div>
          </div>

          <div className="step left" id="step3">
            <div className="kicker">SIH1454 · The Detective</div>
            <h3>Phishing Detection</h3>
            <p>Suspicious-but-unlisted domains are opened in a headless browser sandbox, where PhisherMan walks the rendered DOM tree looking for cloned login forms and brand impersonation.</p>
            <div className="step-visual"><div className="laser"></div></div>
          </div>

          <div className="step right" id="step4">
            <div className="kicker">Verdict</div>
            <h3>Similarity Score</h3>
            <p>Visual and structural similarity to protected brands is scored in real time. Anything crossing the threshold is quarantined and logged to threat intel.</p>
            <div className="verdict-ring"><span>33%</span></div>
          </div>
        </div>
      </section>

      <section className="features-section" id="features">
        <div className="features-heading">
          <h2>Everything the gateway checks, before you ever click.</h2>
        </div>
        <div className="features-grid" id="featuresGrid">
          <div className="feature-card"><div className="feature-icon">◈</div><h3>DNS Filtering</h3><p>Blocks known-malicious domains at the socket layer, before a single byte is exchanged.</p></div>
          <div className="feature-card"><div className="feature-icon">✦</div><h3>Typo-squat Detection</h3><p>Flags lookalike domains that swap characters to impersonate trusted brands.</p></div>
          <div className="feature-card"><div className="feature-icon">◎</div><h3>Visual AI</h3><p>Compares rendered pages against protected brand assets to catch pixel-level clones.</p></div>
          <div className="feature-card"><div className="feature-icon">◐</div><h3>Zero-Day Blocking</h3><p>Heuristic scoring catches infrastructure with no reputation history yet.</p></div>
          <div className="feature-card"><div className="feature-icon">◆</div><h3>Live Telemetry</h3><p>Every block and allow decision streams to a real-time dashboard.</p></div>
          <div className="feature-card"><div className="feature-icon">◈</div><h3>Encrypted Tunnel</h3><p>TLS-inspected traffic stays encrypted end-to-end through the gateway.</p></div>
        </div>
      </section>

      <section className="stats-section">
        <div className="stats-grid">
          <div><div className="stat-num" data-target="3000000" data-suffix="+">0</div><div className="stat-label">Threats Blocked</div></div>
          <div><div className="stat-num" data-target="12" data-suffix="ms">0</div><div className="stat-label">Median Latency</div></div>
          <div><div className="stat-num" data-target="99.99" data-suffix="%" data-decimals="2">0</div><div className="stat-label">Uptime</div></div>
          <div><div className="stat-num" data-target="500000" data-suffix="+">0</div><div className="stat-label">Domains Indexed</div></div>
        </div>
      </section>

      <footer>
        <div className="logo"><span className="logo-mark"></span>PhisherMan</div>
        <div className="foot-links">
          <Link href="#">Privacy</Link><Link href="#">Status</Link><Link href="#">Docs</Link><Link href="#">Contact</Link>
        </div>
        <div className="copy">© 2026 PhisherMan. Internet immunity, architected.</div>
      </footer>
    </>
  );
}
