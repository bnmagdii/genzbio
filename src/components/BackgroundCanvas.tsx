"use client";

import React, { useEffect, useRef } from "react";

export const BackgroundCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Dynamic resize
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Track mouse coordinates for parallax
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = (e.clientX - window.innerWidth / 2) * 0.05;
      mouseRef.current.targetY = (e.clientY - window.innerHeight / 2) * 0.05;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Particle Classes
    class Star {
      x: number;
      y: number;
      size: number;
      speed: number;
      brightness: number;
      twinkleSpeed: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 1.5;
        this.speed = Math.random() * 0.05 + 0.01;
        this.brightness = Math.random();
        this.twinkleSpeed = Math.random() * 0.02 + 0.005;
      }

      draw() {
        if (!ctx) return;
        this.brightness += this.twinkleSpeed;
        if (this.brightness > 1 || this.brightness < 0) {
          this.twinkleSpeed = -this.twinkleSpeed;
        }
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.2, this.brightness)})`;
        // Draw star with mouse parallax offset
        const px = this.x - mouseRef.current.x * (this.size * 0.5);
        const py = this.y - mouseRef.current.y * (this.size * 0.5);
        ctx.beginPath();
        ctx.arc(px, py, this.size, 0, Math.PI * 2);
        ctx.fill();
      }

      update() {
        this.y += this.speed;
        if (this.y > height) {
          this.y = 0;
          this.x = Math.random() * width;
        }
      }
    }

    class DustParticle {
      x: number;
      y: number;
      size: number;
      color: string;
      vx: number;
      vy: number;
      alpha: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 3 + 1;
        const colors = ["#7C3AED", "#A855F7", "#D946EF", "#22D3EE"];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.vx = (Math.random() - 0.5) * 0.2;
        this.vy = (Math.random() - 0.5) * 0.2;
        this.alpha = Math.random() * 0.5 + 0.1;
      }

      draw() {
        if (!ctx) return;
        const px = this.x - mouseRef.current.x * 1.2;
        const py = this.y - mouseRef.current.y * 1.2;
        ctx.beginPath();
        ctx.arc(px, py, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.alpha;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.shadowBlur = 0; // reset
        ctx.globalAlpha = 1.0; // reset
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        // Wrap around bounds
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
      }
    }

    class ShootingStar {
      x: number;
      y: number;
      length: number;
      speed: number;
      angle: number;
      opacity: number;
      active: boolean;

      constructor() {
        this.x = 0;
        this.y = 0;
        this.length = 0;
        this.speed = 0;
        this.angle = 0;
        this.opacity = 0;
        this.active = false;
        this.reset();
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * (height / 2);
        this.length = Math.random() * 80 + 40;
        this.speed = Math.random() * 12 + 8;
        this.angle = Math.PI / 6 + (Math.random() - 0.5) * 0.1; // roughly 30 degrees down
        this.opacity = 1;
        this.active = false;
      }

      trigger() {
        this.active = true;
      }

      draw() {
        if (!ctx || !this.active) return;
        ctx.beginPath();
        const grad = ctx.createLinearGradient(
          this.x,
          this.y,
          this.x - Math.cos(this.angle) * this.length,
          this.y - Math.sin(this.angle) * this.length
        );
        grad.addColorStop(0, `rgba(34, 211, 238, ${this.opacity})`); // cyan head
        grad.addColorStop(0.3, `rgba(217, 70, 239, ${this.opacity * 0.5})`); // fuchsia tail
        grad.addColorStop(1, `rgba(124, 58, 237, 0)`); // purple fade
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(
          this.x - Math.cos(this.angle) * this.length,
          this.y - Math.sin(this.angle) * this.length
        );
        ctx.stroke();
      }

      update() {
        if (!this.active) return;
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        this.opacity -= 0.02;

        if (this.opacity <= 0 || this.x > width || this.y > height) {
          this.reset();
        }
      }
    }

    // Populate objects
    const starsCount = 150;
    const dustCount = 40;
    const stars: Star[] = [];
    const dust: DustParticle[] = [];
    const shootingStar = new ShootingStar();

    for (let i = 0; i < starsCount; i++) stars.push(new Star());
    for (let i = 0; i < dustCount; i++) dust.push(new DustParticle());

    // Loop
    const tick = () => {
      // Clear with dark purple space depth fade
      ctx.fillStyle = "#050816";
      ctx.fillRect(0, 0, width, height);

      // Render Aurora/Nebula Gas clouds dynamically in the background
      const time = Date.now() * 0.0001;
      const nx1 = width * 0.3 + Math.sin(time) * 100;
      const ny1 = height * 0.4 + Math.cos(time * 0.8) * 100;
      const nx2 = width * 0.7 + Math.cos(time * 1.1) * 120;
      const ny2 = height * 0.6 + Math.sin(time * 0.7) * 120;

      // Draw Purple Nebula 1
      const neb1 = ctx.createRadialGradient(nx1, ny1, 0, nx1, ny1, Math.min(width, height) * 0.5);
      neb1.addColorStop(0, "rgba(124, 58, 237, 0.18)");
      neb1.addColorStop(0.5, "rgba(168, 85, 247, 0.05)");
      neb1.addColorStop(1, "rgba(5, 8, 22, 0)");
      ctx.fillStyle = neb1;
      ctx.fillRect(0, 0, width, height);

      // Draw Fuchsia Nebula 2
      const neb2 = ctx.createRadialGradient(nx2, ny2, 0, nx2, ny2, Math.min(width, height) * 0.6);
      neb2.addColorStop(0, "rgba(217, 70, 239, 0.12)");
      neb2.addColorStop(0.5, "rgba(34, 211, 238, 0.04)");
      neb2.addColorStop(1, "rgba(5, 8, 22, 0)");
      ctx.fillStyle = neb2;
      ctx.fillRect(0, 0, width, height);

      // Apply smooth easing to mouse coordinates for inertia
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08;

      // Draw Stars
      stars.forEach((star) => {
        star.update();
        star.draw();
      });

      // Draw Dust
      dust.forEach((d) => {
        d.update();
        d.draw();
      });

      // Shooting Star Spawner logic
      if (!shootingStar.active && Math.random() < 0.003) {
        shootingStar.trigger();
      }
      shootingStar.update();
      shootingStar.draw();

      animationId = requestAnimationFrame(tick);
    };

    tick();

    // Cleanups
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 -z-50 w-full h-full pointer-events-none" />;
};
