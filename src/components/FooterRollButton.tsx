"use client";

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
      className="group inline-flex items-center justify-center cursor-pointer text-ink/70 hover:text-accent transition-colors duration-300 my-8"
    >
      <svg
        width="48"
        height="48"
        viewBox="0 0 32 32"
        fill="none"
        className="transition-transform duration-[800ms] ease-out group-hover:rotate-[360deg]"
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
    </button>
  );
}
