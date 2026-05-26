import Image from "next/image";
import Nav from "@/components/Nav";
import DiceHero from "@/components/DiceHero";
import FooterRollButton from "@/components/FooterRollButton";

export default function Home() {
  return (
    <>
      <Nav />

      <section className="min-h-[90vh] flex flex-col justify-center items-center text-center pt-32 pb-24 px-6">
        <div className="mb-8 w-full flex justify-center">
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
        <p className="text-sm sm:text-base font-light text-mid max-w-sm mt-6 leading-relaxed">
          Trading card games and community. Marrero, Louisiana.
        </p>
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
