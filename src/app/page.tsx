import Image from "next/image";
import Nav from "@/components/Nav";
import DiceHero from "@/components/DiceHero";
import FooterRollButton from "@/components/FooterRollButton";
import FooterSocial from "@/components/FooterSocial";
import Reveal from "@/components/Reveal";

const events = [
  { day: "SAT", name: "Commander + Cardfight!! Vanguard", time: "6:00 PM" },
  { day: "SUN", name: "Riftbound + Freeplay", time: "6:00 PM" },
  { day: "MON", name: "Tabletop Demos", time: "12:00 PM" },
  { day: "TUE", name: "Tabletop Demos", time: "12:00 PM" },
  { day: "WED", name: "Tabletop Demos", time: "12:00 PM" },
  { day: "THU", name: "Magic Standard", time: "6:00 PM" },
  { day: "FRI", name: "Friday Night Magic", time: "6:00 PM" },
];

function SectionLabel({ children }: { children: string }) {
  return (
    <span
      className="inline-block font-mono uppercase text-accent border-l border-accent pl-2"
      style={{ fontSize: "0.75rem", letterSpacing: "0.15em" }}
    >
      {children}
    </span>
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
      </section>

      <section id="events" className="border-t border-ink/10 px-6 py-24 md:py-32">
        <div className="max-w-[720px] mx-auto">
          <Reveal delay={0}>
            <SectionLabel>Weekly Events</SectionLabel>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mt-5">
              Something happens every night.
            </h2>
          </Reveal>
          <div className="mt-12 border-t border-ink/10">
            {events.map((ev, i) => (
              <Reveal key={i} delay={0.16 + i * 0.06}>
                <div className="grid grid-cols-[64px_1fr] sm:grid-cols-[110px_1fr_auto] gap-x-4 gap-y-1 py-4 px-3 border-b border-ink/5 hover:bg-ink/[0.03] transition-colors duration-200">
                  <span
                    className="font-mono uppercase text-accent tracking-widest self-baseline"
                    style={{ fontSize: "0.7rem" }}
                  >
                    {ev.day}
                  </span>
                  <span className="text-sm sm:text-base self-baseline">
                    {ev.name}
                  </span>
                  <span
                    className="font-mono col-start-2 sm:col-start-auto text-left sm:text-right self-baseline"
                    style={{ fontSize: "0.75rem", opacity: 0.5 }}
                  >
                    {ev.time}
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <footer
        className="border-t border-ink/10 px-6"
        style={{ paddingTop: "3rem", paddingBottom: "3rem" }}
      >
        <div className="max-w-[720px] mx-auto flex flex-col items-center">
          <FooterRollButton />
          <div style={{ marginTop: "1.5rem" }}>
            <FooterSocial />
          </div>
          <p
            className="font-mono text-center"
            style={{
              fontSize: "0.7rem",
              letterSpacing: "0.1em",
              opacity: 0.4,
              marginTop: "1rem",
            }}
          >
            Marrero, Louisiana
          </p>
        </div>
      </footer>
    </>
  );
}
