export default function SectionLabel({ children }: { children: string }) {
  return (
    <span
      className="inline-block font-mono uppercase text-accent border-l border-accent pl-2"
      style={{ fontSize: "0.75rem", letterSpacing: "0.15em" }}
    >
      {children}
    </span>
  );
}
