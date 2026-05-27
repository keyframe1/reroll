"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";

const DISCORD_URL = "https://discord.gg/3BsXNP77u";
const RADIUS = 70;
const ICON_SIZE = 28;
const HIT_AREA = 44;

const DISCORD_PATH =
  "M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.36-.77-.54-1.09-.01-.02-.04-.03-.07-.03-1.5.26-2.93.71-4.27 1.33-.01 0-.02.01-.03.02-2.72 4.07-3.47 8.03-3.1 11.95 0 .02.01.04.03.05 1.8 1.32 3.53 2.12 5.24 2.65.03.01.06 0 .07-.02.4-.55.76-1.13 1.07-1.74.02-.04 0-.08-.04-.09-.41-.16-.8-.33-1.17-.56-.04-.02-.04-.08-.01-.11.08-.06.16-.12.24-.18a.06.06 0 0 1 .06-.01c2.45 1.12 5.1 1.12 7.52 0 .02-.01.05-.01.06.01.08.06.16.12.24.18.04.03.03.09-.01.11-.37.22-.76.4-1.17.56-.04.01-.05.06-.04.09.32.61.68 1.19 1.07 1.74.02.02.05.03.07.02 1.72-.53 3.45-1.33 5.24-2.65.02-.01.03-.03.03-.05.44-4.53-.73-8.46-3.1-11.95-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12 0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12 0 1.17-.83 2.12-1.89 2.12z";

const INSTAGRAM_PATH =
  "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z";

const TIKTOK_PATH =
  "M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-.81-.05l-.38.15z";

const FACEBOOK_PATH =
  "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z";

type SocialItem = {
  name: string;
  href: string;
  brand: string;
  path: string;
  viewBox: string;
  active: boolean;
};

// Order — sequenced for the stagger AND mapped to the arc positions below.
// Index 0 → lower-left, 1 → upper-left, 2 → upper-right, 3 → lower-right.
// Discord (the live one) sits at upper-left for visual prominence.
const items: SocialItem[] = [
  {
    name: "TikTok",
    href: "#",
    brand: "#000000",
    path: TIKTOK_PATH,
    viewBox: "0 0 24 24",
    active: false,
  },
  {
    name: "Discord",
    href: DISCORD_URL,
    brand: "#5865F2",
    path: DISCORD_PATH,
    viewBox: "1 3 20 18",
    active: true,
  },
  {
    name: "Instagram",
    href: "#",
    brand: "#E4405F",
    path: INSTAGRAM_PATH,
    viewBox: "0 0 24 24",
    active: false,
  },
  {
    name: "Facebook",
    href: "#",
    brand: "#1877F2",
    path: FACEBOOK_PATH,
    viewBox: "0 0 24 24",
    active: false,
  },
];

// 4 icons spanning a 180° semicircle above the d20 (9 o'clock through 12 to
// 3 o'clock). Math angles (CCW from +x axis): 180°, 120°, 60°, 0° with 60°
// steps. Keeps every icon at or above the d20's horizontal axis so the
// lower icons don't collide with the "Marrero, Louisiana" text below.
const positions = items.map((_, i) => {
  const angleRad = ((180 - i * 60) * Math.PI) / 180;
  return {
    x: Math.cos(angleRad) * RADIUS,
    y: -Math.sin(angleRad) * RADIUS,
  };
});

export default function SocialMenu() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const iconRefs = useRef<Array<HTMLAnchorElement | null>>(
    new Array(items.length).fill(null),
  );
  const firstRender = useRef(true);

  // Click-away — only attached while menu is open
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // Icon animation: stagger out from center on open, reverse on close
  useEffect(() => {
    iconRefs.current.forEach((icon, i) => {
      if (!icon) return;

      // On initial mount, snap to hidden without animation
      if (firstRender.current) {
        gsap.set(icon, { x: 0, y: 0, opacity: 0, scale: 0.3 });
        return;
      }

      gsap.killTweensOf(icon);

      if (open) {
        const pos = positions[i];
        gsap.fromTo(
          icon,
          { x: 0, y: 0, opacity: 0, scale: 0.3 },
          {
            x: pos.x,
            y: pos.y,
            opacity: 1,
            scale: 1,
            duration: 0.25,
            delay: i * 0.05,
            ease: "back.out(2)",
          },
        );
      } else {
        const reverseIndex = iconRefs.current.length - 1 - i;
        gsap.to(icon, {
          x: 0,
          y: 0,
          opacity: 0,
          scale: 0.3,
          duration: 0.25,
          delay: reverseIndex * 0.05,
          ease: "back.in(2)",
        });
      }
    });

    if (firstRender.current) firstRender.current = false;
  }, [open]);

  useEffect(() => {
    const refs = iconRefs.current;
    return () => {
      refs.forEach((icon) => {
        if (icon) gsap.killTweensOf(icon);
      });
    };
  }, []);

  const toggle = useCallback(() => setOpen((o) => !o), []);
  const handleIconClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, active: boolean) => {
      if (!active) e.preventDefault();
      setOpen(false);
    },
    [],
  );

  return (
    <div
      ref={containerRef}
      style={{ position: "relative", width: 48, height: 48 }}
    >
      {items.map((item, i) => (
        <a
          key={item.name}
          ref={(el) => {
            iconRefs.current[i] = el;
          }}
          href={item.href}
          target={item.active ? "_blank" : undefined}
          rel={item.active ? "noopener noreferrer" : undefined}
          aria-label={item.name}
          aria-disabled={!item.active}
          onClick={(e) => handleIconClick(e, item.active)}
          className={`social-link ${item.active ? "active" : "placeholder"}`}
          style={
            {
              position: "absolute",
              top: "50%",
              left: "50%",
              marginLeft: -HIT_AREA / 2,
              marginTop: -HIT_AREA / 2,
              width: HIT_AREA,
              height: HIT_AREA,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              color: "#2d2a26",
              opacity: 0,
              cursor: item.active ? "pointer" : "not-allowed",
              "--brand": item.brand,
            } as React.CSSProperties
          }
        >
          <svg
            width={ICON_SIZE}
            height={ICON_SIZE}
            viewBox={item.viewBox}
            aria-hidden="true"
            style={{ opacity: item.active ? 1 : 0.35 }}
          >
            <path d={item.path} fill="currentColor" stroke="none" />
          </svg>
        </a>
      ))}

      <button
        type="button"
        className={`d20-hub${open ? " open" : ""}`}
        onClick={toggle}
        aria-label={open ? "Close social menu" : "Open social menu"}
        aria-expanded={open}
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: 0,
          width: 48,
          height: 48,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Image
          src="/dice.png"
          alt=""
          width={448}
          height={400}
          aria-hidden="true"
          style={{
            width: 48,
            height: 48,
            objectFit: "contain",
            mixBlendMode: "multiply",
          }}
        />
      </button>
    </div>
  );
}
