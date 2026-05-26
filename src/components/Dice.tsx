"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import gsap from "gsap";

export default function Dice() {
  const bodyRef = useRef<SVGSVGElement>(null);
  const resultRef = useRef<HTMLSpanElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [rolling, setRolling] = useState(false);
  const [hinted, setHinted] = useState(true);

  // Idle float
  useEffect(() => {
    if (!bodyRef.current) return;
    const ctx = gsap.context(() => {
      gsap.to(bodyRef.current, {
        y: 4,
        rotateX: 2,
        duration: 2.5,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
    });
    return () => ctx.revert();
  }, []);

  const roll = useCallback(() => {
    if (rolling || !bodyRef.current || !resultRef.current) return;
    setRolling(true);
    setHinted(false);

    const body = bodyRef.current;
    const result = resultRef.current;
    const glow = glowRef.current;
    const num = Math.floor(Math.random() * 20) + 1;

    // Kill idle float during roll
    gsap.killTweensOf(body);

    // Reset result
    gsap.set(result, { opacity: 0, scale: 0, y: 0 });

    // 3D tumble
    gsap.to(body, {
      rotateX: 360,
      rotateY: 360,
      rotateZ: gsap.utils.random(-40, 40),
      scale: 0.82,
      duration: 0.35,
      ease: "power2.in",
      onComplete: () => {
        // Settle with spring
        gsap.to(body, {
          rotateX: 0,
          rotateY: 0,
          rotateZ: 0,
          scale: 1,
          duration: 0.4,
          ease: "back.out(2.5)",
          onComplete: () => {
            // Restart idle float
            gsap.to(body, {
              y: 4,
              rotateX: 2,
              duration: 2.5,
              ease: "sine.inOut",
              yoyo: true,
              repeat: -1,
            });
            setRolling(false);
          },
        });
      },
    });

    // Show result
    gsap.to(result, {
      opacity: 1,
      scale: 1,
      duration: 0.4,
      delay: 0.4,
      ease: "back.out(3)",
      onStart: () => {
        result.textContent = String(num);
        result.className = `absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-black text-5xl pointer-events-none select-none ${
          num === 20
            ? "text-red-500 drop-shadow-[0_0_20px_rgba(231,76,60,.6)]"
            : num === 1
            ? "text-[var(--light)]"
            : "text-[var(--accent)]"
        }`;
      },
    });

    // Fade out result
    gsap.to(result, {
      opacity: 0,
      y: -12,
      scale: 0.7,
      duration: 0.35,
      delay: 1.1,
      ease: "power2.in",
    });

    // Glow on nat 20
    if (num === 20 && glow) {
      gsap.fromTo(
        glow,
        { opacity: 0.7, scale: 0.8 },
        { opacity: 0, scale: 1.3, duration: 0.8, ease: "power2.out" }
      );
    }
  }, [rolling]);

  return (
    <div className="flex flex-col items-center mb-6">
      <div
        ref={containerRef}
        onClick={roll}
        className="relative w-40 h-40 cursor-pointer select-none group"
        style={{ perspective: "600px" }}
      >
        <svg
          ref={bodyRef}
          className="w-full h-full transition-[filter] duration-400 group-hover:drop-shadow-[0_4px_24px_rgba(192,57,43,.15)]"
          viewBox="0 0 160 160"
          style={{ transformStyle: "preserve-3d" }}
        >
          <polygon
            points="80,8 152,44 152,116 80,152 8,116 8,44"
            fill="none"
            stroke="#1a1a18"
            strokeWidth="2.2"
          />
          <line x1="80" y1="8" x2="80" y2="152" stroke="#1a1a18" strokeWidth="1" />
          <line x1="8" y1="44" x2="152" y2="116" stroke="#1a1a18" strokeWidth="1" />
          <line x1="152" y1="44" x2="8" y2="116" stroke="#1a1a18" strokeWidth="1" />
          <line x1="80" y1="8" x2="8" y2="116" stroke="#1a1a18" strokeWidth="1" />
          <line x1="80" y1="8" x2="152" y2="116" stroke="#1a1a18" strokeWidth="1" />
          <line x1="8" y1="44" x2="80" y2="152" stroke="#1a1a18" strokeWidth="1" />
          <line x1="152" y1="44" x2="80" y2="152" stroke="#1a1a18" strokeWidth="1" />
          <line x1="8" y1="44" x2="152" y2="44" stroke="#1a1a18" strokeWidth="1" />
          <line x1="8" y1="116" x2="152" y2="116" stroke="#1a1a18" strokeWidth="1" />
        </svg>
        <span
          ref={resultRef}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-black text-5xl text-[var(--accent)] pointer-events-none select-none"
          style={{ opacity: 0 }}
        />
        <div
          ref={glowRef}
          className="absolute -inset-5 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(192,57,43,.15), transparent 70%)",
            opacity: 0,
          }}
        />
      </div>
      <p
        className={`font-mono text-[11px] tracking-[.12em] text-[var(--light)] mt-2 transition-all duration-500 ${
          hinted ? "opacity-100" : "opacity-0 -translate-y-2"
        }`}
      >
        Click the die
      </p>
    </div>
  );
}
