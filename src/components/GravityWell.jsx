// @ts-nocheck
// FILE 6/10 — src/components/GravityWell.jsx  ── v4 FINAL
// 3D SCENE ONLY — all detail panels live in UILayer outside Canvas

import { useRef, useState, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import useStore from "../store/useThemeStore";
import { STATUS_META } from "../config/identity";

const isMobile = window.innerWidth < 768;

// Registry so orbs repel each other
const registry = {};

// ── Star field ────────────────────────────────────────────────────
function ParticleField() {
  const ref = useRef();
  const N = 200;
  const { pos, spd } = useMemo(() => {
    const pos = new Float32Array(N * 3);
    const spd = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      pos[i*3]   = (Math.random()-0.5)*55;
      pos[i*3+1] = (Math.random()-0.5)*55;
      pos[i*3+2] = (Math.random()-0.5)*14 - 6;
      spd[i]     = 0.06 + Math.random()*0.2;
    }
    return { pos, spd };
  }, []);

  useFrame(() => {
    if (!ref.current) return;
    const a = ref.current.geometry.attributes.position.array;
    for (let i = 0; i < N; i++) {
      a[i*3+1] += spd[i] * 0.003;
      if (a[i*3+1] > 27) a[i*3+1] = -27;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[pos, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.045} color="#4444bb" transparent opacity={0.55} sizeAttenuation depthWrite={false} />
    </points>
  );
}

// ── Single orb ────────────────────────────────────────────────────
function ProjectOrb({ project, initPos, idx }) {
  const setSelected = useStore(s => s.setSelectedProject);
  const selected    = useStore(s => s.selectedProject);
  const isSelected  = selected?.id === project.id;

  const meshRef      = useRef();
  const glowRef      = useRef();
  const posVec       = useRef(new THREE.Vector3(...initPos));
  const velVec       = useRef(new THREE.Vector3((Math.random()-0.5)*0.025, (Math.random()-0.5)*0.025, 0));
  const curScaleRef  = useRef(1);
  const cursor       = useRef(new THREE.Vector3());

  useEffect(() => {
    registry[idx] = posVec.current;
    return () => { delete registry[idx]; };
  }, [idx]);

  useFrame(({ mouse, viewport, clock }) => {
    if (!meshRef.current) return;
    const targetScale = isSelected ? (isMobile ? 2.0 : 1.7) : 1.0;
    curScaleRef.current += (targetScale - curScaleRef.current) * 0.09;
    meshRef.current.scale.setScalar(curScaleRef.current);
    if (glowRef.current) glowRef.current.scale.setScalar(curScaleRef.current * 1.18);

    if (isSelected) {
      // Drift to center, slow down
      posVec.current.lerp(new THREE.Vector3(0, 0.5, 0), 0.045);
      velVec.current.multiplyScalar(0.6);
      meshRef.current.position.copy(posVec.current);
      if (glowRef.current) glowRef.current.position.copy(posVec.current);
      meshRef.current.rotation.y += 0.007;
      return;
    }

    // Cursor attraction
    cursor.current.set((mouse.x * viewport.width)/2, (mouse.y * viewport.height)/2, 0);
    const toCursor = cursor.current.clone().sub(posVec.current);
    const dc = Math.max(toCursor.length(), 2.0);
    toCursor.normalize().multiplyScalar(0.0018 / dc);
    velVec.current.add(toCursor);

    // Repel from other orbs
    Object.entries(registry).forEach(([key, otherPos]) => {
      if (Number(key) === idx || !otherPos) return;
      const diff = posVec.current.clone().sub(otherPos);
      const d = Math.max(diff.length(), 0.5);
      if (d < 3.8) {
        diff.normalize().multiplyScalar(0.022 / (d * d));
        velVec.current.add(diff);
      }
    });

    // Boundary walls
    const BX = isMobile ? 4.2 : 6.5;
    const BY = isMobile ? 2.8 : 4.5;
    if (posVec.current.x >  BX) velVec.current.x -= 0.045;
    if (posVec.current.x < -BX) velVec.current.x += 0.045;
    if (posVec.current.y >  BY) velVec.current.y -= 0.045;
    if (posVec.current.y < -BY) velVec.current.y += 0.045;
    velVec.current.z -= posVec.current.z * 0.05;

    velVec.current.multiplyScalar(0.87);
    posVec.current.add(velVec.current);

    meshRef.current.position.copy(posVec.current);
    if (glowRef.current) glowRef.current.position.copy(posVec.current);
    meshRef.current.rotation.y += 0.005;
    meshRef.current.rotation.x += 0.002;
  });

  const base   = isMobile ? 0.6 : 0.48;
  const radius = base + project.mass * (isMobile ? 0.24 : 0.19);
  const badge  = STATUS_META[project.status];

  return (
    <>
      {/* Glow ring (separate mesh, follows orb) */}
      <mesh ref={glowRef} position={initPos}>
        <ringGeometry args={[radius * 1.08, radius * 1.2, 64]} />
        <meshBasicMaterial
          color={project.color}
          transparent
          opacity={isSelected ? 0.45 : 0.18}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Core sphere */}
      <mesh
        ref={meshRef}
        position={initPos}
        onClick={() => setSelected(isSelected ? null : project)}
        onPointerOver={() => { document.body.style.cursor = "pointer"; }}
        onPointerOut ={() => { document.body.style.cursor = "auto"; }}
      >
        <sphereGeometry args={[radius, 48, 48]} />
        <meshPhysicalMaterial
          color={project.color}
          emissive={project.color}
          emissiveIntensity={isSelected ? 0.65 : 0.2}
          metalness={0.55}
          roughness={0.15}
          clearcoat={1}
          clearcoatRoughness={0.08}
        />

        {/* Small floating label — Html inside mesh (follows it) */}
        <Html
          center
          distanceFactor={isMobile ? 6 : 10}
          position={[0, -(radius + 0.52), 0]}
          style={{ pointerEvents: "none" }}
        >
          <div style={{ textAlign: "center", fontFamily: "'Space Mono',monospace", userSelect: "none" }}>
            <div style={{ fontSize: isMobile ? 12 : 10, color: project.color, whiteSpace: "nowrap", letterSpacing: "0.1em", textTransform: "uppercase", textShadow: `0 0 16px ${project.color}`, fontWeight: 700 }}>
              {project.title}
            </div>
            <div style={{ fontSize: isMobile ? 9 : 7, color: badge.color, marginTop: 3, letterSpacing: "0.12em" }}>
              {badge.label}
            </div>
            {!isSelected && (
              <div style={{ fontSize: isMobile ? 8 : 7, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>
                {isMobile ? "tap" : "click"}
              </div>
            )}
          </div>
        </Html>
      </mesh>
    </>
  );
}

// Spread orbs in a circle so they don't cluster
function makePositions(n) {
  const R = isMobile ? 3.0 : 5.2;
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return [
      Math.cos(a) * R * (0.75 + Math.random() * 0.5),
      Math.sin(a) * R * 0.5 * (0.75 + Math.random() * 0.5),
      (Math.random() - 0.5) * 2,
    ];
  });
}

export default function GravityWell() {
  const projects  = useStore(s => s.projects);
  const positions = useMemo(() => makePositions(projects.length), [projects.length]);

  return (
    <>
      <color attach="background" args={["#04040f"]} />
      <ambientLight intensity={0.4} color="#b0c0ff" />
      <pointLight position={[0,0,0]} intensity={0.7} color="#5050ee" distance={14} />
      <directionalLight position={[6,10,6]} intensity={1.1} color="#ff6b35" castShadow />

      <ParticleField />

      <mesh>
        <sphereGeometry args={[0.1, 32, 32]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.07} />
      </mesh>

      {projects.map((p, i) => (
        <ProjectOrb key={p.id} project={p} initPos={positions[i]} idx={i} />
      ))}
    </>
  );
}
