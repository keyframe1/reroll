"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import gsap from "gsap";

const INK_COLOR = "#2d2a26";
const GOLD_COLOR = "#D4AF37";
const RED_COLOR = "#8B0000";
const BASE_SCALE = 1.72;
const TUBE_RADIUS = 0.025;
const TUBE_RADIAL_SEGMENTS = 6;
const CAMERA_POS: [number, number, number] = [0, 2, 5];
const PARTICLE_COUNT = 36;
const PARTICLE_LIFETIME = 1.2;
const PARTICLE_GRAVITY = 4;
const INK_RGB = new THREE.Color(INK_COLOR);
const GOLD_RGB = new THREE.Color(GOLD_COLOR);

// D Twenty's voice. Roll-count milestones fire once at their number; the
// nat20/nat1 pools override milestones and always fire; from roll 25 onward a
// random quip can fire (30% chance, handled at the call site).
const ROLL_MILESTONES: Record<number, string> = {
  3: "Hey. I'm D.",
  7: "You can stop now.",
  10: "My full name is D Twenty, actually.",
  15: "Are you okay?",
  20: "I'm getting dizzy.",
};
const NAT20_LINES = [
  "NATURAL TWENTY, BABY.",
  "You're welcome.",
  "I was saving that one.",
  "Tell the bard I said you're welcome.",
  "Crit happens.",
];
const NAT1_LINES = [
  "...we don't talk about that one.",
  "That wasn't my fault.",
  "Fumble. Ouch.",
  "The dice gods are displeased.",
  "I meant to do that.",
];
const RANDOM_LINES = [
  "Stop poking me.",
  "Hey, that's rude.",
  "I have feelings, you know.",
  "Roll me one more time. I dare you.",
  "This is my life now.",
  "Do I get overtime for this?",
  "You could at least buy me dice sleeves.",
];

type D20Handle = {
  roll: () => void;
  finishRoll: () => void;
};

type Particle = {
  active: boolean;
  velocity: THREE.Vector3;
  rotationSpeed: THREE.Vector3;
  spawnTime: number;
};

function makeParticle(): Particle {
  return {
    active: false,
    velocity: new THREE.Vector3(),
    rotationSpeed: new THREE.Vector3(),
    spawnTime: 0,
  };
}

function computeFaceEulers(): THREE.Euler[] {
  const geom = new THREE.IcosahedronGeometry(1, 0);
  const pos = geom.attributes.position;
  const camDir = new THREE.Vector3(...CAMERA_POS).normalize();
  const eulers: THREE.Euler[] = [];
  const faceCount = pos.count / 3;

  for (let f = 0; f < faceCount; f++) {
    const i = f * 3;
    const a = new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i));
    const b = new THREE.Vector3(pos.getX(i + 1), pos.getY(i + 1), pos.getZ(i + 1));
    const c = new THREE.Vector3(pos.getX(i + 2), pos.getY(i + 2), pos.getZ(i + 2));
    const centroid = a.clone().add(b).add(c).divideScalar(3);
    const normal = centroid.normalize();
    const quat = new THREE.Quaternion().setFromUnitVectors(normal, camDir);
    eulers.push(new THREE.Euler().setFromQuaternion(quat, "XYZ"));
  }

  geom.dispose();
  return eulers;
}

function shortestDelta(from: number, to: number): number {
  const TWO_PI = Math.PI * 2;
  return ((((to - from) % TWO_PI) + 3 * Math.PI) % TWO_PI) - Math.PI;
}

type D20Props = {
  onRollStart: () => void;
  onRollLanded: (num: number) => void;
};

const D20 = forwardRef<D20Handle, D20Props>(function D20(
  { onRollStart, onRollLanded },
  ref,
) {
  const groupRef = useRef<THREE.Group>(null);
  const edgeMaterialRef = useRef<THREE.MeshBasicMaterial | null>(null);
  const faceEulers = useMemo(() => computeFaceEulers(), []);

  // Build edges as actual 3D tubes (one cylinder per icosahedron edge, merged
  // into a single draw call). Thickness is geometric, so it doesn't flicker
  // with camera angle, depth, DPR, or GPU. Constructed once on mount.
  const edgeMesh = useMemo(() => {
    const baseGeom = new THREE.IcosahedronGeometry(1, 0);
    const edgesGeom = new THREE.EdgesGeometry(baseGeom, 1);
    const pos = edgesGeom.attributes.position;

    const parts: THREE.BufferGeometry[] = [];
    const seenVerts = new Set<string>();

    for (let i = 0; i < pos.count; i += 2) {
      const start = new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i));
      const end = new THREE.Vector3(
        pos.getX(i + 1),
        pos.getY(i + 1),
        pos.getZ(i + 1),
      );
      const curve = new THREE.LineCurve3(start, end);
      parts.push(
        new THREE.TubeGeometry(curve, 1, TUBE_RADIUS, TUBE_RADIAL_SEGMENTS, false),
      );

      // Triangular pyramid caps at each unique vertex: fill the gaps where
      // the tubes' hexagonal open ends meet, and give the vertex a slight
      // outward point. Cone with 3 radial segments = tetrahedron, apex
      // pointing along the vertex direction (outward from icosahedron center).
      for (const v of [start, end]) {
        const key = `${v.x.toFixed(4)},${v.y.toFixed(4)},${v.z.toFixed(4)}`;
        if (!seenVerts.has(key)) {
          seenVerts.add(key);
          const dir = v.clone().normalize();
          const h = TUBE_RADIUS * 1.5;
          const cap = new THREE.ConeGeometry(TUBE_RADIUS, h, 3);
          // Cone defaults to centered at origin with +Y apex.
          // Shift up so base is at origin → rotate so apex tracks `dir` →
          // translate to the vertex so the base sits exactly at it.
          cap.translate(0, h * 0.5, 0);
          cap.applyQuaternion(
            new THREE.Quaternion().setFromUnitVectors(
              new THREE.Vector3(0, 1, 0),
              dir,
            ),
          );
          cap.translate(v.x, v.y, v.z);
          parts.push(cap);
        }
      }
    }

    const merged = mergeGeometries(parts);
    baseGeom.dispose();
    edgesGeom.dispose();
    parts.forEach((g) => g.dispose());

    if (!merged) {
      // Shouldn't happen — all tubes share identical attribute layout.
      throw new Error("Failed to merge edge geometries for d20 wireframe");
    }

    const mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(INK_COLOR),
    });
    edgeMaterialRef.current = mat;

    return new THREE.Mesh(merged, mat);
  }, []);

  useEffect(() => {
    return () => {
      edgeMesh.geometry.dispose();
      (edgeMesh.material as THREE.MeshBasicMaterial).dispose();
    };
  }, [edgeMesh]);
  const stateRef = useRef({
    rolling: false,
    needsResetBase: false,
    baseX: 0,
    baseY: 0,
    baseZ: 0,
    idleStartT: 0,
  });
  const nat20CountRef = useRef(0);
  const particlesRef = useRef<Particle[]>(
    Array.from({ length: PARTICLE_COUNT }, makeParticle),
  );
  const particleMeshRefs = useRef<Array<THREE.Mesh | null>>(
    Array(PARTICLE_COUNT).fill(null),
  );

  const spawnParticles = useCallback(
    (clockT: number, gold: boolean) => {
      const color = gold ? GOLD_COLOR : INK_COLOR;
      particlesRef.current.forEach((p, i) => {
        const mesh = particleMeshRefs.current[i];
        if (!mesh) return;
        const speed = 2.5 + Math.random() * 3.5;
        const phi = Math.random() * Math.PI * 2;
        const theta = Math.acos(2 * Math.random() - 1);
        p.velocity.set(
          Math.sin(theta) * Math.cos(phi) * speed,
          Math.cos(theta) * speed,
          Math.sin(theta) * Math.sin(phi) * speed,
        );
        p.rotationSpeed.set(
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10,
        );
        p.spawnTime = clockT;
        p.active = true;

        mesh.position.set(0, 0, 0);
        mesh.rotation.set(0, 0, 0);
        mesh.visible = true;
        const mat = mesh.material as THREE.MeshBasicMaterial;
        mat.color.set(color);
        mat.opacity = 1;
      });
    },
    [],
  );

  useFrame((state, delta) => {
    const g = groupRef.current;
    if (!g) return;

    if (stateRef.current.needsResetBase) {
      stateRef.current.baseX = g.rotation.x;
      stateRef.current.baseY = g.rotation.y;
      stateRef.current.baseZ = g.rotation.z;
      stateRef.current.idleStartT = state.clock.elapsedTime;
      stateRef.current.needsResetBase = false;
    }

    if (!stateRef.current.rolling) {
      stateRef.current.baseY += 0.3 * delta;
      const t = state.clock.elapsedTime - stateRef.current.idleStartT;
      g.rotation.y = stateRef.current.baseY;
      g.rotation.x =
        stateRef.current.baseX +
        Math.sin(t * (Math.PI / 2)) * ((5 * Math.PI) / 180);
      g.rotation.z = stateRef.current.baseZ;
      g.position.x = 0;
      g.position.y = Math.sin(t * ((2 * Math.PI) / 3)) * 0.1;
    }

    // Particle update — runs whether rolling or not
    particlesRef.current.forEach((p, i) => {
      if (!p.active) return;
      const mesh = particleMeshRefs.current[i];
      if (!mesh) return;

      const elapsed = state.clock.elapsedTime - p.spawnTime;
      if (elapsed >= PARTICLE_LIFETIME) {
        p.active = false;
        mesh.visible = false;
        return;
      }

      mesh.position.x += p.velocity.x * delta;
      mesh.position.y += p.velocity.y * delta;
      mesh.position.z += p.velocity.z * delta;
      p.velocity.y -= PARTICLE_GRAVITY * delta;

      mesh.rotation.x += p.rotationSpeed.x * delta;
      mesh.rotation.y += p.rotationSpeed.y * delta;
      mesh.rotation.z += p.rotationSpeed.z * delta;

      const mat = mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.max(0, 1 - elapsed / PARTICLE_LIFETIME);
    });
  });

  const triggerNat20 = useCallback(
    (clockT: number) => {
      nat20CountRef.current += 1;
      const useGoldParticles = nat20CountRef.current === 3;

      spawnParticles(clockT, useGoldParticles);

      const edgesMat = edgeMaterialRef.current;
      if (edgesMat) {
        gsap.killTweensOf(edgesMat.color);
        // Black -> gold over 0.2s
        gsap.to(edgesMat.color, {
          r: GOLD_RGB.r,
          g: GOLD_RGB.g,
          b: GOLD_RGB.b,
          duration: 0.2,
          ease: "power2.out",
        });
        // Fade back to ink in lockstep with the number's scale-dissolve exit
        // (number starts exit at entry+hold = 2.0s, exit takes 0.7s; matching
        // delay + duration + ease so the edges and the number leave together).
        gsap.to(edgesMat.color, {
          r: INK_RGB.r,
          g: INK_RGB.g,
          b: INK_RGB.b,
          duration: 0.7,
          delay: 2.0,
          ease: "power2.in",
        });
      }
    },
    [spawnParticles],
  );

  const triggerNat1 = useCallback(() => {
    const edgesMat = edgeMaterialRef.current;
    if (edgesMat) {
      gsap.killTweensOf(edgesMat.color);
      // Two red flickers over 0.2s
      const tl = gsap.timeline();
      tl.call(() => edgesMat.color.set(RED_COLOR), [], 0);
      tl.call(() => edgesMat.color.set(INK_COLOR), [], 0.05);
      tl.call(() => edgesMat.color.set(RED_COLOR), [], 0.1);
      tl.call(() => edgesMat.color.set(INK_COLOR), [], 0.15);
    }

    const g = groupRef.current;
    if (g) {
      const startY = g.position.y;
      gsap.to(g.position, {
        y: startY - 0.15,
        duration: 0.125,
        ease: "power2.inOut",
        yoyo: true,
        repeat: 1,
      });
    }
  }, []);

  const startRoll = useCallback(() => {
    const g = groupRef.current;
    if (!g || stateRef.current.rolling) return;
    stateRef.current.rolling = true;
    onRollStart();

    const num = Math.floor(Math.random() * 20) + 1;
    const targetEuler = faceEulers[num - 1];

    const sign = () => (Math.random() < 0.5 ? -1 : 1);
    const tumbleX = g.rotation.x + sign() * (4 + Math.random() * 4) * Math.PI;
    const tumbleY = g.rotation.y + sign() * (4 + Math.random() * 4) * Math.PI;
    const tumbleZ = g.rotation.z + sign() * (2 + Math.random() * 2) * Math.PI;

    const finalX = tumbleX + shortestDelta(tumbleX, targetEuler.x);
    const finalY = tumbleY + shortestDelta(tumbleY, targetEuler.y);
    const finalZ = tumbleZ + shortestDelta(tumbleZ, targetEuler.z);

    g.position.x = 0;
    g.position.y = 0;

    const tl = gsap.timeline({
      onComplete: () => {
        if (num === 20) {
          // clockT pulled from a Three-managed clock via the mesh — fall back to
          // performance.now() if needed. Using performance.now/1000 keeps
          // spawnTime in same units as state.clock.elapsedTime is monotonic.
          triggerNat20(performance.now() / 1000);
        } else if (num === 1) {
          triggerNat1();
        }
        onRollLanded(num);
      },
    });

    // Roll mechanics scaled to 0.85× the previous timing — same shape,
    // less dead air between click and result.
    tl.to(
      g.scale,
      {
        x: BASE_SCALE * 0.85,
        y: BASE_SCALE * 0.85,
        z: BASE_SCALE * 0.85,
        duration: 0.13,
        ease: "power2.in",
      },
      0,
    );

    tl.to(
      g.rotation,
      {
        x: tumbleX,
        y: tumbleY,
        z: tumbleZ,
        duration: 0.68,
        ease: "power2.out",
      },
      0.13,
    );
    tl.to(
      g.scale,
      {
        x: BASE_SCALE,
        y: BASE_SCALE,
        z: BASE_SCALE,
        duration: 0.68,
        ease: "back.out(1.5)",
      },
      0.13,
    );

    tl.to(
      g.rotation,
      {
        x: finalX,
        y: finalY,
        z: finalZ,
        duration: 0.25,
        ease: "elastic.out(1, 0.4)",
      },
      0.81,
    );
  }, [faceEulers, onRollStart, onRollLanded, triggerNat20, triggerNat1]);

  const finishRoll = useCallback(() => {
    stateRef.current.rolling = false;
    stateRef.current.needsResetBase = true;
  }, []);

  useImperativeHandle(
    ref,
    () => ({ roll: startRoll, finishRoll }),
    [startRoll, finishRoll],
  );

  return (
    <>
      <group ref={groupRef} scale={BASE_SCALE}>
        <mesh>
          <icosahedronGeometry args={[1, 0]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <primitive object={edgeMesh} />
      </group>

      {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
        <mesh
          key={`particle-${i}`}
          ref={(el) => {
            particleMeshRefs.current[i] = el;
          }}
          visible={false}
        >
          <icosahedronGeometry args={[0.08, 0]} />
          <meshBasicMaterial
            color={INK_COLOR}
            wireframe
            transparent
            opacity={1}
          />
        </mesh>
      ))}
    </>
  );
});

export default function Dice3DCanvas() {
  const d20Ref = useRef<D20Handle>(null);
  const resultRef = useRef<HTMLSpanElement>(null);
  const [rolling, setRolling] = useState(false);

  // Speech bubble — driven imperatively (GSAP + textContent) so rolls never
  // re-render. Counters live in refs per the same no-re-render discipline.
  const bubbleRef = useRef<HTMLDivElement>(null);
  const bubbleTlRef = useRef<gsap.core.Timeline | null>(null);
  const lastLineRef = useRef<string | null>(null);

  // Roll-stats easter egg — all tracking state lives in refs so rolls
  // don't trigger re-renders. The only state toggle is the panel
  // visibility on roll #23.
  const rollsRef = useRef<number[]>([]);
  const [statsVisible, setStatsVisible] = useState(false);
  const totalRef = useRef<HTMLSpanElement>(null);
  const critsRef = useRef<HTMLSpanElement>(null);
  const fumblesRef = useRef<HTMLSpanElement>(null);
  const avgRef = useRef<HTMLSpanElement>(null);
  const streakRef = useRef<HTMLSpanElement>(null);
  const favoriteRef = useRef<HTMLSpanElement>(null);
  const barRefs = useRef<Array<HTMLDivElement | null>>(
    new Array(20).fill(null),
  );

  const updateStats = useCallback(() => {
    const rolls = rollsRef.current;
    if (rolls.length === 0) return;

    let crits = 0;
    let fumbles = 0;
    let sum = 0;
    const counts = new Array(21).fill(0) as number[];
    for (const r of rolls) {
      if (r === 20) crits++;
      if (r === 1) fumbles++;
      sum += r;
      counts[r]++;
    }

    let currentStreak = 0;
    let maxStreak = 0;
    for (const r of rolls) {
      if (r >= 11) {
        currentStreak++;
        if (currentStreak > maxStreak) maxStreak = currentStreak;
      } else {
        currentStreak = 0;
      }
    }

    let max = 0;
    let fav = 1;
    for (let i = 1; i <= 20; i++) {
      if (counts[i] > max) {
        max = counts[i];
        fav = i;
      }
    }

    if (totalRef.current) totalRef.current.textContent = String(rolls.length);
    if (critsRef.current) critsRef.current.textContent = String(crits);
    if (fumblesRef.current) fumblesRef.current.textContent = String(fumbles);
    if (avgRef.current) avgRef.current.textContent = (sum / rolls.length).toFixed(1);
    if (streakRef.current) streakRef.current.textContent = String(maxStreak);
    if (favoriteRef.current) favoriteRef.current.textContent = String(fav);

    for (let i = 0; i < 20; i++) {
      const el = barRefs.current[i];
      if (!el) continue;
      const n = i + 1;
      const count = counts[n];
      const height = max > 0 ? (count / max) * 30 : 0;
      el.style.height = `${height}px`;
      el.style.opacity = n === fav ? "1" : "0.3";
    }
  }, []);

  useEffect(() => {
    if (statsVisible) updateStats();
  }, [statsVisible, updateStats]);

  // Pick from a pool, avoiding an immediate repeat of the last shown line.
  const pickFromPool = useCallback((pool: string[]) => {
    if (pool.length <= 1) return pool[0];
    let choice = pool[Math.floor(Math.random() * pool.length)];
    for (let guard = 0; choice === lastLineRef.current && guard < 12; guard++) {
      choice = pool[Math.floor(Math.random() * pool.length)];
    }
    return choice;
  }, []);

  // Show a bubble: entry (scale up from the tail) → hold 3s → exit (rise +
  // fade). A new bubble immediately replaces whatever is on screen.
  const showBubble = useCallback((text: string) => {
    const el = bubbleRef.current;
    if (!el) return;
    bubbleTlRef.current?.kill();
    gsap.killTweensOf(el);
    el.textContent = text;
    lastLineRef.current = text;
    gsap.set(el, { opacity: 0, scale: 0.7, y: 0 });
    const tl = gsap.timeline();
    tl.to(el, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(2)" });
    tl.to(el, { opacity: 0, y: -8, duration: 0.3, ease: "power2.in" }, "+=3");
    bubbleTlRef.current = tl;
  }, []);

  useEffect(() => {
    return () => {
      bubbleTlRef.current?.kill();
    };
  }, []);

  const triggerRoll = useCallback(() => {
    d20Ref.current?.roll();
  }, []);

  const handleRollStart = useCallback(() => {
    setRolling(true);
  }, []);

  const handleRollLanded = useCallback(
    (num: number) => {
      rollsRef.current.push(num);

      // D Twenty reacts. Nat 20 / nat 1 always speak and override milestones;
      // milestones fire once at their roll number; from roll 25 a random quip
      // has a 30% chance. Only one bubble shows at a time.
      const rollCount = rollsRef.current.length;
      const milestone = ROLL_MILESTONES[rollCount];
      let line: string | null = null;
      if (num === 20) line = pickFromPool(NAT20_LINES);
      else if (num === 1) line = pickFromPool(NAT1_LINES);
      else if (milestone) line = milestone;
      else if (rollCount >= 25 && Math.random() < 0.3)
        line = pickFromPool(RANDOM_LINES);
      if (line) showBubble(line);

      if (rollsRef.current.length === 23) setStatsVisible(true);
      updateStats();

      const el = resultRef.current;
      if (!el) {
        d20Ref.current?.finishRoll();
        setRolling(false);
        return;
      }
      el.textContent = String(num);

      const peakOpacity = num === 1 ? 0.4 : 1;

      // Reset every property an exit might have touched so the next entry
      // doesn't inherit a 0.6 scale, 6px blur, 4px letter-spacing, etc.
      gsap.killTweensOf(el);
      gsap.set(el, {
        opacity: 0,
        scale: 1.3,
        y: 0,
        filter: "blur(0px)",
        letterSpacing: "0px",
      });

      // Pick the exit shape. Nat 20 / Nat 1 are fixed overrides; everything
      // else randomly picks one of 4 styles per roll.
      let exitProps: gsap.TweenVars;
      if (num === 20) {
        exitProps = {
          opacity: 0,
          scale: 0.6,
          duration: 0.7,
          ease: "power2.in",
        };
      } else if (num === 1) {
        exitProps = {
          opacity: 0,
          duration: 0.25,
          ease: "power2.inOut",
        };
      } else {
        const variant = Math.floor(Math.random() * 4);
        switch (variant) {
          case 0:
            // Clean fade in place
            exitProps = {
              opacity: 0,
              duration: 0.5,
              ease: "power2.inOut",
            };
            break;
          case 1:
            // Scale dissolve — sinks into the die
            exitProps = {
              opacity: 0,
              scale: 0.85,
              duration: 0.4,
              ease: "power2.in",
            };
            break;
          case 2:
            // Soft blur fade
            exitProps = {
              opacity: 0,
              filter: "blur(6px)",
              duration: 0.5,
              ease: "power1.inOut",
            };
            break;
          case 3:
          default:
            // Split fade — letter-spacing expansion only for multi-digit
            exitProps =
              num >= 10
                ? {
                    opacity: 0,
                    letterSpacing: "4px",
                    duration: 0.4,
                    ease: "power2.out",
                  }
                : {
                    opacity: 0,
                    duration: 0.4,
                    ease: "power2.out",
                  };
            break;
        }
      }

      const tl = gsap.timeline({
        onComplete: () => {
          d20Ref.current?.finishRoll();
          setRolling(false);
        },
      });
      // Entry: snap in with slight scale-down, 0.2s
      tl.to(el, {
        opacity: peakOpacity,
        scale: 1,
        duration: 0.2,
        ease: "power2.out",
      });
      // Hold 1.8s, then run the chosen exit
      tl.to(el, exitProps, "+=1.8");
    },
    [updateStats, pickFromPool, showBubble],
  );

  useEffect(() => {
    const handler = () => triggerRoll();
    window.addEventListener("dice:roll", handler);
    return () => window.removeEventListener("dice:roll", handler);
  }, [triggerRoll]);

  return (
    <div className="flex flex-col items-center select-none w-full">
      <div
        onClick={triggerRoll}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "500px",
          height: "clamp(350px, 50vw, 500px)",
          cursor: rolling ? "grabbing" : "pointer",
        }}
      >
        <Canvas
          flat
          gl={{ alpha: true, antialias: true }}
          camera={{ position: CAMERA_POS, fov: 50 }}
          style={{ background: "transparent" }}
        >
          <D20
            ref={d20Ref}
            onRollStart={handleRollStart}
            onRollLanded={handleRollLanded}
          />
        </Canvas>
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <span
            ref={resultRef}
            style={{
              fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
              fontSize: "2.5rem",
              color: INK_COLOR,
              opacity: 0,
              display: "inline-block",
            }}
          />
        </div>

        {/* Speech bubble. Outer wrapper owns positioning (centered on the die,
            nudged slightly right); the inner .speech-bubble is GSAP-animated. */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "50%",
            bottom: "82%",
            transform: "translateX(-50%)",
            marginLeft: "26px",
            pointerEvents: "none",
            zIndex: 5,
          }}
        >
          <div ref={bubbleRef} className="speech-bubble" />
        </div>
      </div>

      {statsVisible && (
        <div
          role="region"
          aria-label="Roll statistics"
          className="font-mono"
          style={{
            position: "fixed",
            bottom: "16px",
            right: "16px",
            zIndex: 40,
            background: "#ffffff",
            border: "1px solid rgba(45, 42, 38, 0.15)",
            borderRadius: "8px",
            padding: "1.5rem",
            maxWidth: "220px",
            width: "calc(100vw - 32px)",
            color: INK_COLOR,
            animation: "statsSlideUp 0.4s ease-out",
            boxSizing: "border-box",
          }}
        >
          <button
            type="button"
            aria-label="Close roll statistics"
            onClick={() => setStatsVisible(false)}
            style={{
              position: "absolute",
              top: "8px",
              right: "8px",
              padding: "4px 6px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: "0.85rem",
              lineHeight: 1,
              color: INK_COLOR,
              opacity: 0.4,
              transition: "opacity 0.2s ease-out",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.4")}
          >
            ×
          </button>

          <div
            style={{
              fontSize: "0.65rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              marginBottom: "1rem",
            }}
          >
            Roll Log
          </div>

          {(
            [
              ["rolls", totalRef, "0"],
              ["crits", critsRef, "0"],
              ["fumbles", fumblesRef, "0"],
              ["avg", avgRef, "0.0"],
              ["hot streak", streakRef, "0"],
              ["favorite", favoriteRef, "—"],
            ] as const
          ).map(([label, valueRef, initial]) => (
            <div
              key={label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: "6px",
              }}
            >
              <span style={{ fontSize: "0.7rem", opacity: 0.55 }}>{label}</span>
              <span
                ref={valueRef}
                style={{ fontSize: "0.85rem", fontWeight: 600 }}
              >
                {initial}
              </span>
            </div>
          ))}

          <div
            aria-hidden="true"
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: "2px",
              height: "30px",
              marginTop: "1rem",
            }}
          >
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                ref={(el) => {
                  barRefs.current[i] = el;
                }}
                style={{
                  width: "6px",
                  height: "0px",
                  background: INK_COLOR,
                  opacity: 0.3,
                  transition: "height 0.3s ease-out, opacity 0.3s ease-out",
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
