"use client";

import { Suspense, lazy, useEffect, useState } from "react";

const Dice3DCanvas = lazy(() => import("./Dice3DCanvas"));

function StaticWireframe() {
  return (
    <div className="flex flex-col items-center select-none">
      <div style={{ width: "160px", height: "160px" }}>
        <svg
          viewBox="0 0 200 200"
          fill="none"
          aria-hidden="true"
          style={{
            width: "100%",
            height: "100%",
            stroke: "var(--color-ink, var(--ink))",
          }}
        >
          <polygon
            points="100,10 190,55 190,145 100,190 10,145 10,55"
            strokeWidth="2.75"
          />
          <line x1="100" y1="10" x2="100" y2="190" strokeWidth="1.25" />
          <line x1="10" y1="55" x2="190" y2="145" strokeWidth="1.25" />
          <line x1="190" y1="55" x2="10" y2="145" strokeWidth="1.25" />
          <line x1="100" y1="10" x2="10" y2="145" strokeWidth="1.25" />
          <line x1="100" y1="10" x2="190" y2="145" strokeWidth="1.25" />
          <line x1="10" y1="55" x2="100" y2="190" strokeWidth="1.25" />
          <line x1="190" y1="55" x2="100" y2="190" strokeWidth="1.25" />
          <line x1="10" y1="55" x2="190" y2="55" strokeWidth="1.25" />
          <line x1="10" y1="145" x2="190" y2="145" strokeWidth="1.25" />
        </svg>
      </div>
    </div>
  );
}

export default function DiceHero() {
  const [reducedMotion, setReducedMotion] = useState<boolean | null>(null);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mql.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  if (reducedMotion !== false) {
    return <StaticWireframe />;
  }

  return (
    <Suspense fallback={<StaticWireframe />}>
      <Dice3DCanvas />
    </Suspense>
  );
}
