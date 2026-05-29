import Image from "next/image";

const navLinks = [
  { label: "Events", href: "#events" },
  { label: "Connect", href: "#connect" },
  { label: "Visit", href: "#visit" },
];

export default function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-ink/10 bg-[#C8C8C8]/85 backdrop-blur-[12px]">
      <div className="max-w-[1080px] mx-auto px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between gap-4">
        <a href="#" className="inline-flex items-center" aria-label="Reroll Gaming">
          <Image
            src="/header2.png"
            alt="Reroll Gaming"
            width={1474}
            height={324}
            priority
            className="h-10 sm:h-[64px] w-auto"
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
