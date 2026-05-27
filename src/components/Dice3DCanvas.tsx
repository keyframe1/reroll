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
const BASE_SCALE = 1.5;
const TUBE_RADIUS = 0.025;
const TUBE_RADIAL_SEGMENTS = 6;
const CAMERA_POS: [number, number, number] = [0, 2, 5];
const PARTICLE_COUNT = 36;
const PARTICLE_LIFETIME = 1.2;
const PARTICLE_GRAVITY = 4;
const INK_RGB = new THREE.Color(INK_COLOR);
const GOLD_RGB = new THREE.Color(GOLD_COLOR);

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
        // Hold 2.5s, then transition back over 0.4s
        gsap.to(edgesMat.color, {
          r: INK_RGB.r,
          g: INK_RGB.g,
          b: INK_RGB.b,
          duration: 0.4,
          delay: 2.5,
          ease: "power2.inOut",
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

    tl.to(
      g.scale,
      {
        x: BASE_SCALE * 0.85,
        y: BASE_SCALE * 0.85,
        z: BASE_SCALE * 0.85,
        duration: 0.15,
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
        duration: 0.8,
        ease: "power2.out",
      },
      0.15,
    );
    tl.to(
      g.scale,
      {
        x: BASE_SCALE,
        y: BASE_SCALE,
        z: BASE_SCALE,
        duration: 0.8,
        ease: "back.out(1.5)",
      },
      0.15,
    );

    tl.to(
      g.rotation,
      {
        x: finalX,
        y: finalY,
        z: finalZ,
        duration: 0.3,
        ease: "elastic.out(1, 0.4)",
      },
      0.95,
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

  const triggerRoll = useCallback(() => {
    d20Ref.current?.roll();
  }, []);

  const handleRollStart = useCallback(() => {
    setRolling(true);
  }, []);

  const handleRollLanded = useCallback((num: number) => {
    const el = resultRef.current;
    if (!el) {
      d20Ref.current?.finishRoll();
      setRolling(false);
      return;
    }
    el.textContent = String(num);

    const peakOpacity = num === 1 ? 0.4 : 1;

    gsap.killTweensOf(el);
    const tl = gsap.timeline({
      onComplete: () => {
        d20Ref.current?.finishRoll();
        setRolling(false);
      },
    });
    tl.fromTo(
      el,
      { scale: 0, opacity: 0, y: 0 },
      {
        scale: 1.1,
        opacity: peakOpacity,
        duration: 0.25,
        ease: "power2.out",
      },
    );
    tl.to(el, { scale: 1.0, duration: 0.15, ease: "power2.in" });
    tl.to(
      el,
      { y: -30, opacity: 0, duration: 0.5, ease: "power2.out" },
      "+=2",
    );
  }, []);

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
          height: "clamp(240px, 40vw, 340px)",
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
      </div>
    </div>
  );
}
