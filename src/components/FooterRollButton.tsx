"use client";

import Image from "next/image";

export default function FooterRollButton() {
  const handleClick = () => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    window.dispatchEvent(new CustomEvent("dice:roll"));
  };

  return (
    <button
      type="button"
      aria-label="Scroll to top and roll the dice"
      onClick={handleClick}
      className="group inline-flex items-center justify-center cursor-pointer my-8"
    >
      <Image
        src="/dice.png"
        alt=""
        width={448}
        height={400}
        aria-hidden="true"
        className="transition-transform duration-[800ms] ease-out group-hover:rotate-[360deg]"
        style={{
          width: "auto",
          height: "56px",
          mixBlendMode: "multiply",
        }}
      />
    </button>
  );
}
