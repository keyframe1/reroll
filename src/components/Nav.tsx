"use client";

import { useEffect, useState } from "react";

const links = [
  { href: "#events", label: "Events" },
  { href: "#services", label: "Services" },
  { href: "#membership", label: "Membership" },
  { href: "#location", label: "Visit" },
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 border-b ${
        scrolled
          ? "bg-[var(--bg)]/92 backdrop-blur-xl border-[var(--faint)]"
          : "bg-transparent backdrop-blur-0 border-transparent"
      }`}
    >
      <div className="max-w-[960px] mx-auto px-6 py-3 flex justify-between items-center">
        <a href="#" className="flex items-center gap-2.5 group">
          <svg
            className="w-6 h-6 transition-transform duration-400 ease-[cubic-bezier(.34,1.56,.64,1)] group-hover:rotate-[30deg]"
            viewBox="0 0 32 32"
          >
            <polygon points="16,2 30,9 30,23 16,30 2,23 2,9" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <line x1="16" y1="2" x2="16" y2="30" stroke="currentColor" strokeWidth=".6" />
            <line x1="2" y1="9" x2="30" y2="23" stroke="currentColor" strokeWidth=".6" />
            <line x1="30" y1="9" x2="2" y2="23" stroke="currentColor" strokeWidth=".6" />
            <line x1="16" y1="2" x2="2" y2="23" stroke="currentColor" strokeWidth=".6" />
            <line x1="16" y1="2" x2="30" y2="23" stroke="currentColor" strokeWidth=".6" />
            <line x1="2" y1="9" x2="16" y2="30" stroke="currentColor" strokeWidth=".6" />
            <line x1="30" y1="9" x2="16" y2="30" stroke="currentColor" strokeWidth=".6" />
          </svg>
          <span className="font-bold text-sm tracking-[.08em] uppercase">Reroll</span>
        </a>
        <div className="flex gap-7">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="font-mono text-[11px] tracking-[.1em] uppercase text-[var(--light)] hover:text-[var(--ink)] transition-colors duration-300 relative after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-px after:bg-[var(--accent)] after:scale-x-0 after:origin-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-left"
            >
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
