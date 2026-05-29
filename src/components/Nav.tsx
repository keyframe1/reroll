"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const navLinks = [
  { label: "Events", href: "#events" },
  { label: "Social", href: "#social" },
  { label: "Visit", href: "#visit" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 60);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        scrolled
          ? "bg-bg/90 backdrop-blur-[12px] border-ink/10"
          : "bg-transparent backdrop-blur-0 border-transparent"
      }`}
    >
      <div className="max-w-[1080px] mx-auto px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between gap-4">
        <a href="#" className="inline-flex items-center" aria-label="Reroll Gaming">
          <Image
            src="/header.png"
            alt="Reroll Gaming"
            width={964}
            height={270}
            priority
            className="h-12 sm:h-[72px] w-auto"
            style={{ mixBlendMode: "multiply" }}
          />
        </a>
        <div className="flex items-center gap-x-4 sm:gap-x-8">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="nav-link font-mono uppercase">
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
