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
  const [menuOpen, setMenuOpen] = useState(false);

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
      <div className="max-w-[1080px] mx-auto px-6 py-4 flex justify-between items-center">
        <a
          href="#"
          className="flex items-center gap-2.5 group"
          onClick={() => setMenuOpen(false)}
        >
          <svg
            className="w-6 h-6 transition-transform duration-400 ease-[cubic-bezier(.34,1.56,.64,1)] group-hover:rotate-[30deg]"
            viewBox="0 0 32 32"
            fill="none"
          >
            <polygon
              points="16,2 30,9 30,23 16,30 2,23 2,9"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <line x1="16" y1="2" x2="16" y2="30" stroke="currentColor" strokeWidth=".6" />
            <line x1="2" y1="9" x2="30" y2="23" stroke="currentColor" strokeWidth=".6" />
            <line x1="30" y1="9" x2="2" y2="23" stroke="currentColor" strokeWidth=".6" />
            <line x1="16" y1="2" x2="2" y2="23" stroke="currentColor" strokeWidth=".6" />
            <line x1="16" y1="2" x2="30" y2="23" stroke="currentColor" strokeWidth=".6" />
            <line x1="2" y1="9" x2="16" y2="30" stroke="currentColor" strokeWidth=".6" />
            <line x1="30" y1="9" x2="16" y2="30" stroke="currentColor" strokeWidth=".6" />
          </svg>
          <span className="font-bold text-sm tracking-[0.12em] uppercase">Reroll</span>
        </a>

        <div className="hidden sm:flex gap-8 items-center">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="font-mono text-[11px] tracking-[0.1em] uppercase text-light hover:text-ink transition-colors duration-300 relative after:absolute after:bottom-[-6px] after:left-0 after:right-0 after:h-px after:bg-accent after:scale-x-0 after:origin-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-left"
            >
              {l.label}
            </a>
          ))}
        </div>

        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
          className="sm:hidden flex flex-col justify-center items-center w-9 h-9 cursor-pointer"
        >
          <span
            className={`block w-5 h-px bg-ink transition-all duration-300 ${
              menuOpen ? "translate-y-[3px] rotate-45" : "-translate-y-[3px]"
            }`}
          />
          <span
            className={`block w-5 h-px bg-ink transition-all duration-300 ${
              menuOpen ? "-translate-y-px -rotate-45" : "translate-y-[3px]"
            }`}
          />
        </button>
      </div>

      <div
        className={`sm:hidden overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${
          menuOpen ? "max-h-64 opacity-100 border-t border-ink/10" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-6 py-4 flex flex-col gap-4 bg-bg/95 backdrop-blur-[12px]">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="font-mono text-xs tracking-[0.1em] uppercase text-mid hover:text-accent transition-colors duration-200"
            >
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
