import Nav from "@/components/Nav";
import Dice from "@/components/Dice";
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

export default function Home() {
  return (
    <>
      <Nav />
      <section className="min-h-[90vh] flex flex-col justify-center items-center text-center pt-28 pb-20 px-6">
        <Dice />
        <h1 className="font-black text-5xl tracking-[.14em] uppercase">REROLL</h1>
        <p className="text-lg tracking-[.35em] text-[var(--mid)] uppercase mt-0.5">Gaming</p>
        <p className="text-base font-light text-[var(--mid)] max-w-sm mt-5 leading-relaxed">
          Trading card games, organized play, and community.<br />Marrero, Louisiana. Open 7 days.
        </p>
      </section>
      <hr className="sep" />
      <section id="events" className="max-w-[960px] mx-auto px-6 py-20">
        <Reveal><span className="block font-mono text-[10px] tracking-[.22em] uppercase text-[var(--accent)] mb-4">Weekly Events</span></Reveal>
        <Reveal delay={0.1}><h2 className="text-3xl font-bold tracking-tight mb-2">Something fires every night.</h2></Reveal>
        <Reveal delay={0.2}><p className="text-sm font-light text-[var(--mid)] max-w-md mb-10">$5 entry for constructed events. Pokémon League is always free.</p></Reveal>
        <div>{events.map((ev, i) => (
          <Reveal key={i} delay={0.15 + i * 0.05}>
            <div className="grid grid-cols-[100px_1fr_auto] gap-4 items-baseline py-3.5 border-b border-[var(--faint)] first:border-t hover:bg-[rgba(192,57,43,.02)] hover:pl-2 hover:pr-2 transition-all duration-200">
              <span className="font-mono text-xs tracking-[.1em] uppercase text-[var(--accent)]">{ev.day}</span>
              <span className="font-medium">{ev.name}</span>
              <span className="font-mono text-xs text-[var(--light)] text-right">{ev.time}</span>
            </div>
          </Reveal>
        ))}</div>
      </section>
      <hr className="sep" />
      <section className="max-w-[960px] mx-auto px-6 py-20">
        <Reveal><span className="block font-mono text-[10px] tracking-[.22em] uppercase text-[var(--accent)] mb-4">We Carry</span></Reveal>
        <Reveal delay={0.1}><h2 className="text-3xl font-bold tracking-tight mb-2">All the games.</h2></Reveal>
        <Reveal delay={0.2}><p className="text-sm font-light text-[var(--mid)] max-w-md mb-10">Sealed product, singles, accessories, and sleeves for every major TCG.</p></Reveal>
        <Reveal delay={0.3}><div className="flex flex-wrap gap-2">{formats.map((f) => (
          <span key={f} className="px-5 py-2.5 border border-[var(--faint)] font-mono text-[13px] text-[var(--mid)] cursor-default transition-all duration-200 hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-[rgba(192,57,43,.04)] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(192,57,43,.08)]">{f}</span>
        ))}</div></Reveal>
      </section>
      <hr className="sep" />
      <section id="services" className="max-w-[960px] mx-auto px-6 py-20">
        <Reveal><span className="block font-mono text-[10px] tracking-[.22em] uppercase text-[var(--accent)] mb-4">Services</span></Reveal>
        <Reveal delay={0.1}><h2 className="text-3xl font-bold tracking-tight mb-10">More than a card shop.</h2></Reveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{services.map((s, i) => (
          <Reveal key={s.title} delay={0.15 + i * 0.1}>
            <div className="border-t-2 border-[var(--ink)] pt-4 hover:border-[var(--accent)] transition-colors duration-300">
              <h3 className="font-bold text-sm uppercase tracking-[.05em] mb-2.5">{s.title}</h3>
              <p className="text-sm font-light text-[var(--mid)] leading-relaxed">{s.desc}</p>
            </div>
          </Reveal>
        ))}</div>
      </section>
      <hr className="sep" />
      <section id="membership" className="max-w-[960px] mx-auto px-6 py-20">
        <Reveal><span className="block font-mono text-[10px] tracking-[.22em] uppercase text-[var(--accent)] mb-4">Membership</span></Reveal>
        <Reveal delay={0.1}><h2 className="text-3xl font-bold tracking-tight mb-2">Priority access.</h2></Reveal>
        <Reveal delay={0.2}><p className="text-sm font-light text-[var(--mid)] max-w-md mb-10">Members get first dibs on allocated product, reserved pre-release seats, and early access to collection buy-ins.</p></Reveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{tiers.map((t, i) => (
          <Reveal key={t.name} delay={0.15 + i * 0.1}>
            <div className="border border-[var(--faint)] p-7 hover:border-[var(--accent)] hover:shadow-[0_8px_32px_rgba(192,57,43,.06)] hover:-translate-y-0.5 transition-all duration-300">
              <span className="block font-bold text-[13px] uppercase tracking-[.08em]">{t.name}</span>
              <span className="block font-bold text-3xl text-[var(--accent)] mt-3.5 mb-2">{t.price}{t.sub && <small className="text-[13px] font-light text-[var(--light)]">{t.sub}</small>}</span>
              <ul className="mt-4 space-y-0.5">{t.perks.map((p) => (
                <li key={p} className="text-[13px] font-light text-[var(--mid)] before:content-['·'] before:mr-2 before:text-[var(--accent)]">{p}</li>
              ))}</ul>
            </div>
          </Reveal>
        ))}</div>
      </section>
      <hr className="sep" />
      <section id="location" className="max-w-[960px] mx-auto px-6 py-20">
        <Reveal><span className="block font-mono text-[10px] tracking-[.22em] uppercase text-[var(--accent)] mb-4">Visit</span></Reveal>
        <Reveal delay={0.1}><h2 className="text-3xl font-bold tracking-tight mb-10">Come play.</h2></Reveal>
        <Reveal delay={0.2}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="font-bold text-lg mb-3">Reroll Gaming</h3>
              <p className="text-sm font-light text-[var(--mid)] mb-4">Marrero, LA 70072</p>
              <div className="flex gap-4 mt-4">
                <a href="https://discord.gg/" target="_blank" rel="noopener" className="font-mono text-xs text-[var(--accent)] underline underline-offset-2 hover:text-[var(--ink)] transition-colors">Discord</a>
                <a href="https://www.facebook.com/" target="_blank" rel="noopener" className="font-mono text-xs text-[var(--accent)] underline underline-offset-2 hover:text-[var(--ink)] transition-colors">Facebook</a>
              </div>
            </div>
            <table className="w-full"><tbody>{hours.map(([day, time]) => (
              <tr key={day} className="border-b border-[var(--faint)]">
                <td className="py-2 text-sm font-medium w-28">{day}</td>
                <td className="py-2 text-sm font-light text-[var(--mid)]">{time}</td>
              </tr>
            ))}</tbody></table>
          </div>
        </Reveal>
      </section>
      <footer className="text-center py-12 font-mono text-[11px] text-[var(--light)] border-t border-[var(--faint)] tracking-wide">Reroll Gaming · Marrero, Louisiana</footer>
    </>
  );
}
