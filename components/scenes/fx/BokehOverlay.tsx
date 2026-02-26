"use client";

import { useRef, useEffect } from "react";

interface Orb {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  opacity: number;
  pulseOffset: number;
  pulseSpeed: number;
}

const ORB_COUNT = 20;
const MIN_SIZE = 40;
const MAX_SIZE = 160;

const COLORS: string[] = [
  "rgba(255, 200, 120, VAL)",
  "rgba(255, 180, 100, VAL)",
  "rgba(255, 220, 150, VAL)",
  "rgba(255, 160, 80, VAL)",
  "rgba(255, 240, 200, VAL)",
];

function createOrb(width: number, height: number): Orb {
  const size = MIN_SIZE + Math.random() * (MAX_SIZE - MIN_SIZE);
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.25,
    vy: (Math.random() - 0.5) * 0.25,
    size,
    color: COLORS[Math.floor(Math.random() * COLORS.length)] as string,
    opacity: 0.06 + Math.random() * 0.1,
    pulseOffset: Math.random() * Math.PI * 2,
    pulseSpeed: 0.004 + Math.random() * 0.008,
  };
}

export function BokehOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const orbsRef = useRef<Orb[]>([]);
  const rafRef = useRef<number>(0);
  const tickRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      orbsRef.current = Array.from({ length: ORB_COUNT }, () =>
        createOrb(canvas.width, canvas.height)
      );
      orbsRef.current.sort((a, b) => a.size - b.size);
    };

    resize();
    window.addEventListener("resize", resize);

    const setAlpha = (color: string, alpha: number) =>
      color.replace("VAL", alpha.toString());

    const animate = () => {
      tickRef.current++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const orb of orbsRef.current) {
        orb.x += orb.vx;
        orb.y += orb.vy;

        if (orb.x < -orb.size / 2) orb.x = canvas.width + orb.size / 2;
        if (orb.x > canvas.width + orb.size / 2) orb.x = -orb.size / 2;
        if (orb.y < -orb.size / 2) orb.y = canvas.height + orb.size / 2;
        if (orb.y > canvas.height + orb.size / 2) orb.y = -orb.size / 2;

        const pulse =
          Math.sin(tickRef.current * orb.pulseSpeed + orb.pulseOffset) * 0.1 +
          1;
        const currentSize = orb.size * pulse;
        const r = currentSize / 2;

        const gradient = ctx.createRadialGradient(
          orb.x,
          orb.y,
          0,
          orb.x,
          orb.y,
          r
        );
        gradient.addColorStop(0, setAlpha(orb.color, orb.opacity * 1.2));
        gradient.addColorStop(0.4, setAlpha(orb.color, orb.opacity));
        gradient.addColorStop(0.7, setAlpha(orb.color, orb.opacity * 0.5));
        gradient.addColorStop(1, setAlpha(orb.color, 0));

        ctx.beginPath();
        ctx.arc(orb.x, orb.y, r, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Subtle rim highlight
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, r - 2, 0, Math.PI * 2);
        ctx.strokeStyle = setAlpha(orb.color, orb.opacity * 0.25);
        ctx.lineWidth = 1;
        ctx.stroke();
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
