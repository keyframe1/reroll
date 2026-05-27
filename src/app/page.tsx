import Image from "next/image";
import Nav from "@/components/Nav";
import DiceHero from "@/components/DiceHero";
import FooterRollButton from "@/components/FooterRollButton";

const DISCORD_URL = "https://discord.gg/3BsXNP77u";

function DiscordIcon({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="1 3 20 18"
      fill="currentColor"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.36-.77-.54-1.09-.01-.02-.04-.03-.07-.03-1.5.26-2.93.71-4.27 1.33-.01 0-.02.01-.03.02-2.72 4.07-3.47 8.03-3.1 11.95 0 .02.01.04.03.05 1.8 1.32 3.53 2.12 5.24 2.65.03.01.06 0 .07-.02.4-.55.76-1.13 1.07-1.74.02-.04 0-.08-.04-.09-.41-.16-.8-.33-1.17-.56-.04-.02-.04-.08-.01-.11.08-.06.16-.12.24-.18a.06.06 0 0 1 .06-.01c2.45 1.12 5.1 1.12 7.52 0 .02-.01.05-.01.06.01.08.06.16.12.24.18.04.03.03.09-.01.11-.37.22-.76.4-1.17.56-.04.01-.05.06-.04.09.32.61.68 1.19 1.07 1.74.02.02.05.03.07.02 1.72-.53 3.45-1.33 5.24-2.65.02-.01.03-.03.03-.05.44-4.53-.73-8.46-3.1-11.95-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12 0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12 0 1.17-.83 2.12-1.89 2.12z" />
    </svg>
  );
}

export default function Home() {
  return (
    <>
      <Nav />

      <section className="min-h-[90vh] flex flex-col justify-center items-center text-center pt-32 pb-24 px-6">
        <div className="mb-2 w-full flex justify-center">
          <DiceHero />
        </div>
        <Image
          src="/rerollbig.png"
          alt="Reroll Gaming"
          width={699}
          height={298}
          priority
          style={{
            width: "min(420px, 80vw)",
            height: "auto",
            mixBlendMode: "multiply",
          }}
        />
        <p className="text-sm sm:text-base font-medium text-mid max-w-sm mt-6 leading-relaxed">
          Trading card games and community.
        </p>
      </section>

      <section className="border-t border-ink/[8%] px-6 py-16 flex justify-center">
        <a
          href={DISCORD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 opacity-70 hover:opacity-100 text-[#2d2a26] hover:text-[#5865F2] transition-all duration-300"
        >
          <DiscordIcon style={{ width: 20, height: 20 }} />
          <span
            className="font-mono"
            style={{ fontSize: "0.8rem", letterSpacing: "0.08em" }}
          >
            Join the community
          </span>
        </a>
      </section>

      <footer className="border-t border-ink/10 pt-20 pb-14 px-6">
        <div className="max-w-[720px] mx-auto flex flex-col items-center gap-4">
          <FooterRollButton />
          <Image
            src="/reroll-logo.png"
            alt="Reroll Gaming"
            width={400}
            height={240}
            style={{
              width: "140px",
              height: "auto",
              mixBlendMode: "multiply",
            }}
          />
          <div className="flex justify-center" style={{ gap: "1.5rem" }}>
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Join the Discord community"
              className="opacity-50 hover:opacity-100 text-[#2d2a26] hover:text-[#5865F2] transition-all duration-300"
            >
              <DiscordIcon style={{ width: 20, height: 20 }} />
            </a>
          </div>
          <p
            className="font-mono text-light text-center"
            style={{ fontSize: "0.7rem", letterSpacing: "0.1em" }}
          >
            Marrero, Louisiana
          </p>
        </div>
      </footer>
    </>
  );
}
