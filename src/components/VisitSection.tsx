import Reveal from "@/components/Reveal";
import SectionLabel from "@/components/SectionLabel";

const hours: [string, string][] = [
  ["Monday", "12 PM – 8 PM"],
  ["Tuesday", "12 PM – 9 PM"],
  ["Wednesday", "12 PM – 9 PM"],
  ["Thursday", "12 PM – 9 PM"],
  ["Friday", "12 PM – 11 PM"],
  ["Saturday", "10 AM – 11 PM"],
  ["Sunday", "12 PM – 8 PM"],
];

export default function VisitSection() {
  return (
    <section id="visit" className="border-t border-ink/10 px-6 py-24 md:py-32 scroll-mt-28">
      <div className="max-w-[720px] mx-auto">
        <Reveal delay={0}>
          <SectionLabel>Visit</SectionLabel>
        </Reveal>
        <Reveal delay={0.08}>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mt-5">
            Come play.
          </h2>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 mt-12 items-start">
          <Reveal delay={0.16}>
            <p className="text-lg font-bold">Reroll Gaming</p>
            <p className="mt-1" style={{ opacity: 0.5 }}>
              Marrero, LA 70072
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="border-t border-ink/10">
              {hours.map(([day, time]) => (
                <div
                  key={day}
                  className="grid grid-cols-[1fr_auto] gap-x-4 py-3 px-1 border-b border-ink/5"
                >
                  <span className="text-sm font-bold self-baseline">{day}</span>
                  <span
                    className="font-mono text-sm text-right self-baseline"
                    style={{ opacity: 0.5 }}
                  >
                    {time}
                  </span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
