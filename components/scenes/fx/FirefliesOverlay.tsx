"use client";

import { useRef, useEffect } from "react";

interface Firefly {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  size: number;
  glowRadius: number;
  phase: number;
  phaseSpeed: number;
  brightness: number;
  hue: number;
  speed: number;
}

const FIREFLY_COUNT = 35;
const RETARGET_CHANCE = 0.005;

function createFireflies(width: number, height: number): Firefly[] {
  return Array.from({ length: FIREFLY_COUNT }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    targetX: Math.random() * width,
    targetY: Math.random() * height,
    size: 1.5 + Math.random() * 2,
    glowRadius: 8 + Math.random() * 16,
    phase: Math.random() * Math.PI * 2,
    phaseSpeed: 0.01 + Math.random() * 0.025,
    brightness: 0.5 + Math.random() * 0.5,
    hue: 40 + Math.random() * 25,
    speed: 0.3 + Math.random() * 0.7,
  }));
}

export function FirefliesOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const firefliesRef = useRef<Firefly[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      firefliesRef.current = createFireflies(canvas.width, canvas.height);
    };

    resize();
    window.addEventListener("resize", resize);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const f of firefliesRef.current) {
        f.phase += f.phaseSpeed;

        // Pulsing glow — smoothly fades in and out
        const glow = Math.max(0, Math.sin(f.phase)) * f.brightness;

        if (glow > 0.01) {
          // Outer glow
          const gradient = ctx.createRadialGradient(
            f.x,
            f.y,
            0,
            f.x,
            f.y,
            f.glowRadius
          );
          gradient.addColorStop(0, `hsla(${f.hue}, 80%, 70%, ${glow * 0.35})`);
          gradient.addColorStop(
            0.4,
            `hsla(${f.hue}, 70%, 60%, ${glow * 0.12})`
          );
          gradient.addColorStop(1, `hsla(${f.hue}, 60%, 50%, 0)`);

          ctx.beginPath();
          ctx.arc(f.x, f.y, f.glowRadius, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();

          // Bright core
          ctx.beginPath();
          ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${f.hue}, 90%, 85%, ${glow * 0.9})`;
          ctx.fill();
        }

        // Lazy organic movement toward target
        const dx = f.targetX - f.x;
        const dy = f.targetY - f.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 1) {
          f.x += (dx / dist) * f.speed;
          f.y += (dy / dist) * f.speed;
        }

        // Randomly pick a new target
        if (Math.random() < RETARGET_CHANCE || dist < 2) {
          f.targetX = f.x + (Math.random() - 0.5) * 300;
          f.targetY = f.y + (Math.random() - 0.5) * 200;
          f.targetX = Math.max(0, Math.min(canvas.width, f.targetX));
          f.targetY = Math.max(0, Math.min(canvas.height, f.targetY));
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-10"
      aria-hidden="true"
    />
  );
}
