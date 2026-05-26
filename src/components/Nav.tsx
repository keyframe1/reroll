"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

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
      <div className="max-w-[1080px] mx-auto px-8 py-5 flex items-center">
        <a href="#" className="inline-flex items-center" aria-label="Reroll Gaming">
          <Image
            src="/header.png"
            alt="Reroll Gaming"
            width={964}
            height={270}
            priority
            style={{
              height: "72px",
              width: "auto",
              mixBlendMode: "multiply",
            }}
          />
        </a>
      </div>
    </nav>
  );
}
