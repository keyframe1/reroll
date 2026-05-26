import Nav from "@/components/Nav";
import DiceHero from "@/components/DiceHero";
import FooterRollButton from "@/components/FooterRollButton";
import Reveal from "@/components/Reveal";

const events = [
  { day: "Mon", name: "Commander Night", time: "6:00 PM" },
  { day: "Tue", name: "Yu-Gi-Oh Locals", time: "6:00 PM" },
  { day: "Wed", name: "Draft Night", time: "6:30 PM" },
  { day: "Thu", name: "One Piece / Flesh and Blood", time: "6:00 PM" },
  { day: "Fri", name: "Friday Night Magic", time: "6:30 PM" },
  { day: "Sat", name: "Pokémon League", time: "10:00 AM / Free" },
  { day: "Sat", name: "Modern / Pioneer", time: "2:00 PM" },
  { day: "Sun", name: "Commander + Open Play", time: "12:00 PM" },
];

const formats = [
  "Magic: The Gathering", "Pokémon TCG", "Yu-Gi-Oh!", "Commander / EDH",
  "One Piece", "Flesh and Blood", "Star Wars Unlimited", "Warhammer 40K", "Board Games",
];

const services = [
  { title: "We Buy Singles", desc: "Bring your cards. We buy at competitive market rates, cash or store credit. Collections appraised while you wait." },
  { title: "Pre-Orders", desc: "Reserve your spot on every new release. Guaranteed allocation on high-demand sets. Pick up on release day." },
  { title: "Pokémon League", desc: "Free every Saturday morning. All ages, all skill levels. Learn, trade, and play. No purchase required." },
];

const tiers = [
  { name: "Insider", price: "Free", sub: "", perks: ["Join the Discord", "Event announcements", "New release alerts"] },
  { name: "Gold", price: "$10", sub: " / month", perks: ["Everything in Insider", "Priority on allocated product", "1 free draft seat / month", "10% off accessories"] },
  { name: "Platinum", price: "$25", sub: " / month", perks: ["Everything in Gold", "Reserved pre-release seat", "First look at collection buy-ins", "2 free draft seats / month", "Store credit bonus (5%)"] },
];

const hours = [
  ["Monday", "12 PM – 8 PM"], ["Tuesday", "12 PM – 9 PM"], ["Wednesday", "12 PM – 9 PM"],
  ["Thursday", "12 PM – 9 PM"], ["Friday", "12 PM – 11 PM"], ["Saturday", "10 AM – 11 PM"], ["Sunday", "12 PM – 8 PM"],
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
        <div className="mb-8 w-full flex justify-center">
          <DiceHero />
        </div>
        <h1
          className="font-black text-4xl sm:text-5xl uppercase"
          style={{ letterSpacing: "0.14em" }}
        >
          REROLL
        </h1>
        <p
          className="text-base sm:text-lg text-mid uppercase mt-1"
          style={{ letterSpacing: "0.35em" }}
        >
          Gaming
        </p>
        <p className="text-sm sm:text-base font-light text-mid max-w-sm mt-6 leading-relaxed">
          Trading card games, organized play, and community.
          <br />
          Marrero, Louisiana. Open 7 days.
        </p>
      </section>

      <section
        id="events"
        className="border-t border-ink/10 px-6 py-24 md:py-32"
      >
        <div className="max-w-[720px] mx-auto">
          <Reveal delay={0}>
            <SectionLabel>Weekly Events</SectionLabel>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mt-5 mb-3">
              Something fires every night.
            </h2>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="text-sm text-mid leading-relaxed max-w-md">
              $5 entry for constructed events. Pokémon League is always free.
            </p>
          </Reveal>
          <div className="mt-12 border-t border-ink/10">
            {events.map((ev, i) => (
              <Reveal key={i} delay={0.24 + i * 0.08}>
                <div className="grid grid-cols-[64px_1fr] sm:grid-cols-[110px_1fr_auto] gap-x-4 gap-y-1 py-4 px-3 border-b border-ink/5 hover:bg-ink/[0.03] transition-colors duration-200">
                  <span
                    className="font-mono uppercase text-accent tracking-widest self-baseline"
                    style={{ fontSize: "0.7rem" }}
                  >
                    {ev.day}
                  </span>
                  <span className="text-sm sm:text-base font-medium self-baseline">
                    {ev.name}
                  </span>
                  <span
                    className="font-mono text-light col-start-2 sm:col-start-auto text-left sm:text-right self-baseline"
                    style={{ fontSize: "0.75rem" }}
                  >
                    {ev.time}
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-ink/10 px-6 py-24 md:py-32">
        <div className="max-w-[720px] mx-auto">
          <Reveal delay={0}>
            <SectionLabel>We Carry</SectionLabel>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mt-5 mb-3">
              All the games.
            </h2>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="text-sm text-mid leading-relaxed max-w-md">
              Sealed product, singles, accessories, and sleeves for every major TCG.
            </p>
          </Reveal>
          <div className="mt-10 flex flex-wrap gap-2">
            {formats.map((f, i) => (
              <Reveal key={f} delay={0.24 + i * 0.05}>
                <span
                  className="inline-flex items-center rounded-full border border-ink/10 font-mono text-mid cursor-default transition-all duration-200 hover:border-accent hover:text-accent hover:bg-accent/5 hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(192,57,43,0.08)]"
                  style={{
                    fontSize: "0.75rem",
                    padding: "4px 14px",
                  }}
                >
                  {f}
                </span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section
        id="services"
        className="border-t border-ink/10 px-6 py-24 md:py-32"
      >
        <div className="max-w-[720px] mx-auto">
          <Reveal delay={0}>
            <SectionLabel>Services</SectionLabel>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mt-5 mb-10">
              More than a card shop.
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
            {services.map((s, i) => (
              <Reveal key={s.title} delay={0.16 + i * 0.08}>
                <div className="border-t-2 border-ink pt-4 hover:border-accent transition-colors duration-300 h-full">
                  <h3
                    className="font-bold uppercase mb-3"
                    style={{ fontSize: "0.875rem", letterSpacing: "0.05em" }}
                  >
                    {s.title}
                  </h3>
                  <p className="text-sm font-light text-mid leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section
        id="membership"
        className="border-t border-ink/10 px-6 py-24 md:py-32"
      >
        <div className="max-w-[720px] mx-auto">
          <Reveal delay={0}>
            <SectionLabel>Membership</SectionLabel>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mt-5 mb-3">
              Priority access.
            </h2>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="text-sm text-mid leading-relaxed max-w-md">
              Members get first dibs on allocated product, reserved pre-release seats, and early access to collection buy-ins.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
            {tiers.map((t, i) => (
              <Reveal key={t.name} delay={0.24 + i * 0.08}>
                <div className="border border-ink/10 p-8 transition-all duration-300 hover:border-accent hover:-translate-y-[2px] hover:shadow-[0_12px_32px_rgba(192,57,43,0.08)] h-full">
                  <h3
                    className="font-mono uppercase mb-5"
                    style={{ fontSize: "1.25rem", letterSpacing: "0.1em" }}
                  >
                    {t.name}
                  </h3>
                  <div className="mb-6 flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-accent">
                      {t.price}
                    </span>
                    {t.sub && (
                      <span className="text-xs font-light text-light">
                        {t.sub}
                      </span>
                    )}
                  </div>
                  <ul className="space-y-2.5">
                    {t.perks.map((p) => (
                      <li
                        key={p}
                        className="text-sm font-light text-mid flex items-baseline gap-2 leading-snug"
                      >
                        <span className="text-accent leading-none flex-shrink-0">·</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section
        id="location"
        className="border-t border-ink/10 px-6 py-24 md:py-32"
      >
        <div className="max-w-[720px] mx-auto">
          <Reveal delay={0}>
            <SectionLabel>Visit</SectionLabel>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mt-5 mb-10">
              Come play.
            </h2>
          </Reveal>
          <Reveal delay={0.16}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 mt-2">
              <div>
                <h3 className="font-bold text-lg tracking-tight mb-3">
                  Reroll Gaming
                </h3>
                <p className="text-sm font-light text-mid mb-5">
                  Marrero, LA 70072
                </p>
                <div className="flex gap-4 mt-4">
                  <a
                    href="https://discord.gg/"
                    target="_blank"
                    rel="noopener"
                    className="font-mono text-xs text-accent underline underline-offset-4 hover:text-ink transition-colors"
                  >
                    Discord
                  </a>
                  <a
                    href="https://www.facebook.com/"
                    target="_blank"
                    rel="noopener"
                    className="font-mono text-xs text-accent underline underline-offset-4 hover:text-ink transition-colors"
                  >
                    Facebook
                  </a>
                </div>
              </div>
              <table className="w-full">
                <tbody>
                  {hours.map(([day, time]) => (
                    <tr key={day} className="border-b border-ink/10 last:border-b-0">
                      <td className="py-2.5 text-sm font-medium w-28">{day}</td>
                      <td className="py-2.5 text-sm font-light text-mid">
                        {time}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="border-t border-ink/10 pt-20 pb-14 px-6">
        <div className="max-w-[720px] mx-auto flex flex-col items-center gap-4">
          <FooterRollButton />
          <p
            className="font-mono text-light tracking-wide text-center"
            style={{ fontSize: "0.7rem", letterSpacing: "0.1em" }}
          >
            Reroll Gaming · Marrero, Louisiana
          </p>
        </div>
      </footer>
    </>
  );
}
