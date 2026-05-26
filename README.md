# Reroll Gaming

Website for [rerollgaming.com](https://rerollgaming.com)

## Stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS · Framer Motion · GSAP · Geist

Matches the Attested stack exactly.

## Development

```bash
npm install
npm run dev
```

Runs on [localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
```

## Structure

```
src/
├── app/
│   ├── layout.tsx       # Root layout, Geist font, metadata
│   ├── page.tsx          # All sections composed
│   └── globals.css       # Tailwind base + CSS custom properties
├── components/
│   ├── Dice.tsx          # D20 with GSAP 3D tumble + idle float
│   ├── Nav.tsx           # Scroll-reactive navigation
│   └── Reveal.tsx        # Framer Motion scroll reveal wrapper
```

## Animations

- **Dice**: GSAP 3D rotation (`rotateX`, `rotateY`, `rotateZ`) with `back.out(2.5)` spring settle. Idle sine float. Nat 20 glow. Result spring via `back.out(3)`.
- **Scroll reveals**: Framer Motion `whileInView` with `[0.16, 1, 0.3, 1]` easing. Staggered delays per element.
- **Nav**: Transparent → frosted glass on scroll via `requestAnimationFrame` throttling.
- **Hovers**: Tailwind transitions on tags, tiers, events, services.
