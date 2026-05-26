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
import gsap from "gsap";

const INK_COLOR = "#2d2a26";
const ACCENT_COLOR = "#c0392b";
const BASE_SCALE = 1.5;
const CAMERA_POS: [number, number, number] = [0, 2, 5];

type D20Handle = {
  roll: () => void;
  finishRoll: () => void;
};

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
  const pointLightRef = useRef<THREE.PointLight>(null);
  const faceEulers = useMemo(() => computeFaceEulers(), []);
  const stateRef = useRef({
    rolling: false,
    needsResetBase: false,
    baseX: 0,
    baseY: 0,
    baseZ: 0,
    idleStartT: 0,
  });

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

    if (stateRef.current.rolling) return;

    stateRef.current.baseY += 0.3 * delta;
    const t = state.clock.elapsedTime - stateRef.current.idleStartT;

    g.rotation.y = stateRef.current.baseY;
    g.rotation.x =
      stateRef.current.baseX +
      Math.sin(t * (Math.PI / 2)) * ((5 * Math.PI) / 180);
    g.rotation.z = stateRef.current.baseZ;
    g.position.x = 0;
    g.position.y = Math.sin(t * ((2 * Math.PI) / 3)) * 0.1;
  });

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
        if (num === 1) {
          const shakeT = gsap.timeline();
          const segDur = 0.2 / 6;
          for (let i = 0; i < 6; i++) {
            const x = (i % 2 === 0 ? 1 : -1) * 0.05;
            const y = (Math.random() - 0.5) * 0.05;
            shakeT.to(g.position, { x, y, duration: segDur });
          }
          shakeT.to(g.position, { x: 0, y: 0, duration: 0.02 });
        }
        if (num === 20 && pointLightRef.current) {
          const pl = pointLightRef.current;
          gsap.to(pl, { intensity: 2, duration: 0.2, ease: "power2.out" });
          gsap.to(pl, {
            intensity: 0,
            duration: 0.2,
            delay: 0.2,
            ease: "power2.in",
          });
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
  }, [faceEulers, onRollStart, onRollLanded]);

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
          <meshBasicMaterial color={INK_COLOR} wireframe />
        </mesh>
        <mesh scale={0.99}>
          <icosahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color={INK_COLOR}
            transparent
            opacity={0.04}
            depthWrite={false}
          />
        </mesh>
      </group>
      <pointLight
        ref={pointLightRef}
        position={[0, 0, 0]}
        color={ACCENT_COLOR}
        intensity={0}
        distance={6}
      />
    </>
  );
});

export default function Dice3DCanvas() {
  const d20Ref = useRef<D20Handle>(null);
  const resultRef = useRef<HTMLSpanElement>(null);
  const nat20CountRef = useRef(0);
  const [hintVisible, setHintVisible] = useState(true);
  const [rolling, setRolling] = useState(false);

  const triggerRoll = useCallback(() => {
    d20Ref.current?.roll();
  }, []);

  const handleRollStart = useCallback(() => {
    setHintVisible(false);
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
    el.style.textShadow =
      num === 20 ? "0 0 30px var(--color-accent, var(--accent))" : "none";

    if (num === 20) {
      nat20CountRef.current += 1;
      if (nat20CountRef.current === 3) {
        document.body.classList.add("nat20-flash");
        window.setTimeout(() => {
          document.body.classList.remove("nat20-flash");
        }, 200);
      }
    }

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
          height: "clamp(300px, 50vw, 400px)",
          cursor: rolling ? "grabbing" : "pointer",
        }}
      >
        <Canvas
          gl={{ alpha: true, antialias: true }}
          camera={{ position: CAMERA_POS, fov: 50 }}
          style={{ background: "transparent" }}
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[-3, 5, 3]} intensity={0.7} />
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
              color: "var(--color-accent, var(--accent))",
              opacity: 0,
              display: "inline-block",
            }}
          />
        </div>
      </div>
      <p
        className="font-mono mt-3 transition-opacity duration-500"
        style={{
          fontSize: "0.7rem",
          opacity: hintVisible ? 0.4 : 0,
          letterSpacing: "0.1em",
        }}
      >
        Click the die
      </p>
    </div>
  );
}
