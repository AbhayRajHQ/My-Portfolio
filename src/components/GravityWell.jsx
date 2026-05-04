// @ts-nocheck
// FILE 6/10 — src/components/GravityWell.jsx  ── v3 FINAL

import { useRef, useState, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import useStore from "../store/useThemeStore";
import { STATUS_META } from "../config/identity";

const isMobile = window.innerWidth < 768;
const VW = window.innerWidth;
const VH = window.innerHeight;

// ── Shared registry so orbs can repel each other ─────────────────
const orbRegistry = [];

// ── Star-field ────────────────────────────────────────────────────
function ParticleField() {
  const ref = useRef();
  const N   = 200;
  const { positions, speeds } = useMemo(() => {
    const p = new Float32Array(N * 3);
    const s = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      p[i*3]   = (Math.random()-0.5)*50;
      p[i*3+1] = (Math.random()-0.5)*50;
      p[i*3+2] = (Math.random()-0.5)*12 - 6;
      s[i]     = 0.08 + Math.random()*0.25;
    }
    return { positions: p, speeds: s };
  }, []);

  useFrame(() => {
    if (!ref.current) return;
    const a = ref.current.geometry.attributes.position.array;
    for (let i = 0; i < N; i++) {
      a[i*3+1] += speeds[i] * 0.003;
      if (a[i*3+1] > 25) a[i*3+1] = -25;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.045} color="#4444cc" transparent opacity={0.5} sizeAttenuation depthWrite={false} />
    </points>
  );
}

// ── Fullscreen detail overlay (HTML fixed to viewport) ─────────────
function DetailOverlay({ project, onClose }) {
  const badge  = STATUS_META[project.status];
  const hasLink = project.link && !["ADD_LINK_LATER","UNDER_DEVELOPMENT","PLANNING_PHASE"].includes(project.link);

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 100,
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "center",
      pointerEvents: "all",
    }}>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} />

      {/* Sheet — slides up from bottom */}
      <div style={{
        position: "relative",
        width: "100%",
        maxWidth: 520,
        maxHeight: "78vh",
        overflowY: "auto",
        background: "linear-gradient(160deg, #0a0a1e 0%, #0d0d28 100%)",
        border: `1px solid ${project.color}55`,
        borderRadius: "20px 20px 0 0",
        padding: "24px 22px 32px",
        fontFamily: "'Space Mono',monospace",
        color: "#fff",
        boxShadow: `0 -8px 60px ${project.color}33`,
      }}>
        {/* Drag handle */}
        <div style={{ width: 36, height: 4, background: "rgba(255,255,255,0.2)", borderRadius: 2, margin: "0 auto 20px" }} />

        {/* Status + close */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: badge.color, letterSpacing: "0.18em", fontWeight: 700 }}>{badge.label}</div>
          <button onClick={onClose} style={{ fontSize: 18, color: "rgba(255,255,255,0.4)", background: "none", border: "none", cursor: "pointer", lineHeight: 1, padding: "2px 6px" }}>✕</button>
        </div>

        {/* Category */}
        <div style={{ fontSize: 10, color: project.color, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 8 }}>
          {project.category}
        </div>

        {/* Title */}
        <h2 style={{ fontSize: isMobile ? 22 : 26, fontWeight: 700, marginBottom: 14, lineHeight: 1.2, color: "#fff", letterSpacing: "-0.02em" }}>
          {project.title}
        </h2>

        {/* Description */}
        <p style={{ fontSize: isMobile ? 13 : 14, color: "rgba(255,255,255,0.65)", lineHeight: 1.8, marginBottom: 20 }}>
          {project.description}
        </p>

        {/* Logic */}
        <div style={{ fontSize: isMobile ? 11 : 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.75, borderLeft: `3px solid ${project.color}66`, paddingLeft: 14, marginBottom: 22, fontStyle: "italic" }}>
          {project.layers.logic}
        </div>

        {/* Tech pills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 28 }}>
          {project.tech.map((t) => (
            <span key={t} style={{ fontSize: isMobile ? 11 : 12, padding: "6px 14px", border: `1px solid ${project.color}55`, borderRadius: 30, color: project.color, background: `${project.color}14` }}>{t}</span>
          ))}
        </div>

        {/* CTA */}
        {hasLink ? (
          <a href={project.link} target="_blank" rel="noopener noreferrer" style={{
            display: "block", textAlign: "center",
            fontSize: isMobile ? 13 : 14, color: "#000", fontWeight: 700,
            background: project.color, borderRadius: 12,
            padding: "14px 28px", textDecoration: "none",
            letterSpacing: "0.1em", textTransform: "uppercase",
            boxShadow: `0 4px 20px ${project.color}55`,
          }}>
            View Live Project →
          </a>
        ) : (
          <div style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em", textTransform: "uppercase", padding: "14px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }}>
            {project.status === "IN_PROGRESS" ? "⟳ Under Development" : "◌ Planned"}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Single orb ────────────────────────────────────────────────────
function ProjectOrb({ project, initPos, orbIndex }) {
  const setSelected = useStore((s) => s.setSelectedProject);
  const selected    = useStore((s) => s.selectedProject);
  const isSelected  = selected?.id === project.id;

  const meshRef = useRef();
  const pos     = useRef(new THREE.Vector3(...initPos));
  const vel     = useRef(new THREE.Vector3(
    (Math.random()-0.5)*0.03,
    (Math.random()-0.5)*0.03,
    0,
  ));
  const targetScale = useRef(1);
  const scaleRef    = useRef(1);

  // Register in global registry for repulsion
  useEffect(() => {
    orbRegistry[orbIndex] = pos.current;
    return () => { orbRegistry[orbIndex] = null; };
  }, [orbIndex]);

  const cursor = useRef(new THREE.Vector3());

  useFrame(({ mouse, viewport, clock }) => {
    if (!meshRef.current) return;

    // Target scale: grow big when selected
    targetScale.current = isSelected ? (isMobile ? 2.2 : 1.8) : 1.0;
    scaleRef.current += (targetScale.current - scaleRef.current) * 0.08;
    meshRef.current.scale.setScalar(scaleRef.current);

    if (isSelected) {
      // Freeze: drift to center and stop
      pos.current.lerp(new THREE.Vector3(0, 0, 0), 0.04);
      vel.current.multiplyScalar(0.7);
      meshRef.current.position.copy(pos.current);
      meshRef.current.rotation.y += 0.008;
      return;
    }

    // ── Normal physics ──────────────────────────────────────────
    cursor.current.set(
      (mouse.x * viewport.width)  / 2,
      (mouse.y * viewport.height) / 2,
      0,
    );

    // Weak cursor attraction
    const toCursor = cursor.current.clone().sub(pos.current);
    const dCursor  = Math.max(toCursor.length(), 2.0);
    toCursor.normalize().multiplyScalar(0.002 / dCursor);
    vel.current.add(toCursor);

    // Inter-orb repulsion — keep orbs apart
    orbRegistry.forEach((otherPos, i) => {
      if (i === orbIndex || !otherPos) return;
      const diff = pos.current.clone().sub(otherPos);
      const d    = Math.max(diff.length(), 0.5);
      if (d < 3.5) {
        diff.normalize().multiplyScalar(0.025 / (d * d));
        vel.current.add(diff);
      }
    });

    // Boundary — push back from edges
    const BX = isMobile ? 4.5 : 7;
    const BY = isMobile ? 3.0 : 5;
    if (pos.current.x >  BX) vel.current.x -= 0.04;
    if (pos.current.x < -BX) vel.current.x += 0.04;
    if (pos.current.y >  BY) vel.current.y -= 0.04;
    if (pos.current.y < -BY) vel.current.y += 0.04;

    // Z centering
    vel.current.z -= pos.current.z * 0.05;

    // Damping
    vel.current.multiplyScalar(0.88);
    pos.current.add(vel.current);

    meshRef.current.position.copy(pos.current);
    meshRef.current.rotation.y += 0.005;
    meshRef.current.rotation.x += 0.002;
  });

  const base   = isMobile ? 0.65 : 0.50;
  const radius = base + project.mass * (isMobile ? 0.25 : 0.20);
  const badge  = STATUS_META[project.status];

  return (
    <mesh
      ref={meshRef}
      position={initPos}
      onClick={() => setSelected(isSelected ? null : project)}
      onPointerOver={() => { document.body.style.cursor = "pointer"; }}
      onPointerOut ={() => { document.body.style.cursor = "auto"; }}
    >
      <sphereGeometry args={[radius, 52, 52]} />
      <meshPhysicalMaterial
        color={project.color}
        emissive={project.color}
        emissiveIntensity={isSelected ? 0.7 : 0.2}
        metalness={0.55} roughness={0.15}
        clearcoat={1}   clearcoatRoughness={0.06}
      />

      {/* Label — always visible below orb */}
      {!isSelected && (
        <Html center distanceFactor={isMobile ? 6 : 10} position={[0, -(radius + 0.5), 0]} style={{ pointerEvents: "none" }}>
          <div style={{ textAlign: "center", fontFamily: "'Space Mono',monospace", userSelect: "none" }}>
            <div style={{ fontSize: isMobile ? 12 : 10, color: project.color, whiteSpace: "nowrap", letterSpacing: "0.1em", textTransform: "uppercase", textShadow: `0 0 18px ${project.color}`, fontWeight: 700 }}>
              {project.title}
            </div>
            <div style={{ fontSize: isMobile ? 9 : 7, color: badge.color, marginTop: 3, letterSpacing: "0.12em" }}>
              {badge.label}
            </div>
            <div style={{ fontSize: isMobile ? 8 : 7, color: "rgba(255,255,255,0.35)", marginTop: 2, letterSpacing: "0.08em" }}>
              {isMobile ? "tap to open" : "click to open"}
            </div>
          </div>
        </Html>
      )}

      {/* Pulsing ring when selected */}
      {isSelected && (
        <Html center distanceFactor={isMobile ? 6 : 10} position={[0, 0, 0]} style={{ pointerEvents: "none" }}>
          <div style={{ fontSize: isMobile ? 11 : 9, color: project.color, fontFamily: "'Space Mono',monospace", letterSpacing: "0.1em", textShadow: `0 0 20px ${project.color}`, whiteSpace: "nowrap" }}>
            {project.title}
          </div>
        </Html>
      )}
    </mesh>
  );
}

// ── Spread positions — prevent clustering ─────────────────────────
function spreadPositions(count) {
  // Place orbs on a circle + slight randomness
  const positions = [];
  const R = isMobile ? 3.2 : 5.5;
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    positions.push([
      Math.cos(angle) * R * (0.7 + Math.random() * 0.6),
      Math.sin(angle) * R * 0.5 * (0.7 + Math.random() * 0.6),
      (Math.random() - 0.5) * 2.5,
    ]);
  }
  return positions;
}

// ── GravityWell root ──────────────────────────────────────────────
export default function GravityWell() {
  const projects       = useStore((s) => s.projects);
  const selectedProject = useStore((s) => s.selectedProject);
  const setSelected    = useStore((s) => s.setSelectedProject);
  const positions      = useMemo(() => spreadPositions(projects.length), [projects.length]);

  return (
    <>
      <color attach="background" args={["#04040f"]} />
      <ambientLight intensity={0.45} color="#b0c0ff" />
      <pointLight position={[0,0,0]} intensity={0.8} color="#5050ee" distance={14} />
      <directionalLight position={[6, 10, 6]} intensity={1.1} color="#ff6b35" castShadow />

      <ParticleField />

      {/* Subtle central glow */}
      <mesh>
        <sphereGeometry args={[0.12, 32, 32]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.07} />
      </mesh>

      {projects.map((p, i) => (
        <ProjectOrb key={p.id} project={p} initPos={positions[i]} orbIndex={i} />
      ))}

      {/* Fullscreen detail sheet rendered as HTML overlay */}
      {selectedProject && (
        <Html
          transform={false}
          style={{ width: "100vw", height: "100vh", pointerEvents: "all" }}
        >
          <DetailOverlay
            project={selectedProject}
            onClose={() => setSelected(null)}
          />
        </Html>
      )}
    </>
  );
}
