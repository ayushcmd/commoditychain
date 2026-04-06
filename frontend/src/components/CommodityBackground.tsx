"use client";

import { useEffect, useRef } from "react";

const COMMODITIES = [
  { icon: "🛢️", label: "OIL",   color: "#ff6b00" },
  { icon: "🥇", label: "GOLD",  color: "#ffd700" },
  { icon: "⚡", label: "GAS",   color: "#00cfff" },
  { icon: "🚢", label: "SHIP",  color: "#4488ff" },
  { icon: "🌾", label: "WHEAT", color: "#c8a84b" },
  { icon: "🥈", label: "SLVR",  color: "#c0c0c0" },
  { icon: "🌽", label: "CORN",  color: "#f5c518" },
  { icon: "☕", label: "COFE",  color: "#a0522d" },
  { icon: "🔋", label: "COPR",  color: "#b87333" },
  { icon: "💎", label: "PLAT",  color: "#e5e4e2" },
];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  commodity: typeof COMMODITIES[0];
  rotation: number;
  rotationSpeed: number;
  pulsePhase: number;
  trail: { x: number; y: number }[];
}

interface GlowOrb {
  x: number;
  y: number;
  radius: number;
  color: string;
  vx: number;
  vy: number;
  opacity: number;
}

export default function CommodityBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let particles: Particle[] = [];
    let orbs: GlowOrb[] = [];
    let tick = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Init glow orbs — slow-drifting color clouds in background
    const orbColors = ["#ff6b0022", "#ffd70018", "#00cfff14", "#ff440018"];
    orbs = Array.from({ length: 5 }, (_, i) => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      radius: 200 + Math.random() * 300,
      color: orbColors[i % orbColors.length],
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      opacity: 0.4 + Math.random() * 0.4,
    }));

    // Init commodity particles
    particles = Array.from({ length: 22 }, () => {
      const comm = COMMODITIES[Math.floor(Math.random() * COMMODITIES.length)];
      return {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.5,
        vy: -0.2 - Math.random() * 0.4,
        size: 18 + Math.random() * 22,
        opacity: 0.12 + Math.random() * 0.2,
        commodity: comm,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.012,
        pulsePhase: Math.random() * Math.PI * 2,
        trail: [],
      };
    });

    // Horizontal scan line position
    let scanY = 0;

    const draw = () => {
      tick++;
      const W = canvas.width;
      const H = canvas.height;

      // Deep background clear
      ctx.fillStyle = "rgba(6, 6, 10, 0.18)";
      ctx.fillRect(0, 0, W, H);

      // ── Glow orbs ──
      orbs.forEach((orb) => {
        orb.x += orb.vx;
        orb.y += orb.vy;
        if (orb.x < -orb.radius) orb.x = W + orb.radius;
        if (orb.x > W + orb.radius) orb.x = -orb.radius;
        if (orb.y < -orb.radius) orb.y = H + orb.radius;
        if (orb.y > H + orb.radius) orb.y = -orb.radius;

        const grad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius);
        grad.addColorStop(0, orb.color);
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
      });

      // ── Grid overlay ──
      ctx.strokeStyle = "rgba(255,140,0,0.03)";
      ctx.lineWidth = 0.5;
      const gridSize = 80;
      for (let x = 0; x < W; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 0; y < H; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      // ── Scan line ──
      scanY = (scanY + 0.6) % H;
      const scanGrad = ctx.createLinearGradient(0, scanY - 40, 0, scanY + 40);
      scanGrad.addColorStop(0, "transparent");
      scanGrad.addColorStop(0.5, "rgba(255,140,0,0.04)");
      scanGrad.addColorStop(1, "transparent");
      ctx.fillStyle = scanGrad;
      ctx.fillRect(0, scanY - 40, W, 80);

      // ── Connection lines between nearby particles ──
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180) {
            const alpha = (1 - dist / 180) * 0.06;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255,160,50,${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // ── Particles ──
      particles.forEach((p) => {
        // Update
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.pulsePhase += 0.02;

        // Trail
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > 18) p.trail.shift();

        // Wrap
        if (p.y < -60) { p.y = H + 60; p.trail = []; }
        if (p.x < -60) { p.x = W + 60; p.trail = []; }
        if (p.x > W + 60) { p.x = -60; p.trail = []; }

        const pulse = 0.85 + 0.15 * Math.sin(p.pulsePhase);
        const curOpacity = p.opacity * pulse;

        // Draw trail
        p.trail.forEach((pt, i) => {
          const trailAlpha = (i / p.trail.length) * curOpacity * 0.35;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 2, 0, Math.PI * 2);
          ctx.fillStyle = `${p.commodity.color}${Math.round(trailAlpha * 255).toString(16).padStart(2, "0")}`;
          ctx.fill();
        });

        // Glow ring
        const glowR = p.size * 2.2 * pulse;
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowR);
        glow.addColorStop(0, `${p.commodity.color}${Math.round(curOpacity * 60).toString(16).padStart(2, "0")}`);
        glow.addColorStop(1, "transparent");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(p.x, p.y, glowR, 0, Math.PI * 2);
        ctx.fill();

        // Emoji icon
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = curOpacity;
        ctx.font = `${p.size}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(p.commodity.icon, 0, 0);
        ctx.restore();

        // Ticker label
        ctx.save();
        ctx.globalAlpha = curOpacity * 0.6;
        ctx.font = `bold ${8}px 'Courier New', monospace`;
        ctx.fillStyle = p.commodity.color;
        ctx.textAlign = "center";
        ctx.fillText(p.commodity.label, p.x, p.y + p.size * 0.78 + 6);
        ctx.restore();
      });

      // ── Price ticker blips — random floating numbers ──
      if (tick % 90 === 0) {
        const comm = COMMODITIES[Math.floor(Math.random() * COMMODITIES.length)];
        const blipX = Math.random() * W;
        const blipY = Math.random() * H;
        const change = (Math.random() > 0.5 ? "+" : "-") + (Math.random() * 2).toFixed(2) + "%";
        ctx.save();
        ctx.globalAlpha = 0.25;
        ctx.font = "bold 10px 'Courier New', monospace";
        ctx.fillStyle = change.startsWith("+") ? "#22ff88" : "#ff4455";
        ctx.fillText(change, blipX, blipY);
        ctx.restore();
      }

      animId = requestAnimationFrame(draw);
    };

    // First fill to avoid flash
    ctx.fillStyle = "#06060a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
        pointerEvents: "none",
        display: "block",
      }}
      aria-hidden="true"
    />
  );
}
