// @ts-nocheck
// ── FILE 6 / 10 : src/components/GravityWell.jsx  (MOBILE FIXED) ─

import { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import useStore from "../store/useThemeStore";
import { IDENTITY, STATUS_META } from "../config/identity";

// ── Detect mobile once ────────────────────────────────────────────
const isMobile = window.innerWidth < 768;

// ── Drifting star-field ───────────────────────────────────────────
function ParticleField() {
  const ref   = useRef();
  const COUNT = isMobile ? 180 : 380;

  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const speeds    = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 15 - 5;
      speeds[i]             = 0.1 + Math.random() * 0.3;
    }
    return { positions, speeds };
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position.array;
    const t   = clock.getElapsedTime();
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3 + 1] += speeds[i] * 0.003;
      if (pos[i * 3 + 1] > 20) pos[i * 3 + 1] = -20;
      pos[i * 3]     += Math.sin(t * 0.06 + i) * 0.001;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={isMobile ? 0.055 : 0.035}
        color="#5555ee"
        transparent opacity={0.5}
        sizeAttenuation depthWrite={false}
      />
    </points>
  );
}

// ── Project orb with manual spring physics ────────────────────────
function ProjectOrb({ project, initPos }) {
  const setSelected  = useStore((s) => s.setSelectedProject);
  const selected     = useStore((s) => s.selectedProject);
  const [hovered, setHovered] = useState(false);
  const isSelected   = selected?.id === project.id;

  const meshRef   = useRef();
  const ringRef   = useRef();
  const pos       = useRef(new THREE.Vector3(...initPos));
  const vel       = useRef(new THREE.Vector3(
    (Math.random() - 0.5) * 0.02,
    (Math.random() - 0.5) * 0.02,
    0,
  ));
  const tmpCursor = useRef(new THREE.Vector3());

  useFrame(({ mouse, viewport, clock }) => {
    if (!meshRef.current) return;

    // Cursor world position
    tmpCursor.current.set(
      (mouse.x * viewport.width)  / 2,
      (mouse.y * viewport.height) / 2,
      0,
    );

    // Softer attraction — mobile needs gentler forces
    const toMouse = tmpCursor.current.clone().sub(pos.current);
    const dist    = Math.max(toMouse.length(), 1.5);
    const str     = (hovered ? 0.010 : 0.003) * project.mass;
    toMouse.normalize().multiplyScalar(str / (dist * 0.05));
    vel.current.add(toMouse);

    // Z centering + tighter boundary for mobile
    vel.current.z -= pos.current.z * 0.06;
    const B = isMobile ? 4.5 : 7;
    if (Math.abs(pos.current.x) > B)        vel.current.x -= Math.sign(pos.current.x) * 0.03;
    if (Math.abs(pos.current.y) > B * 0.6)  vel.current.y -= Math.sign(pos.current.y) * 0.03;

    // Higher damping = slower movement on mobile
    vel.current.multiplyScalar(isMobile ? 0.86 : 0.92);
    pos.current.add(vel.current);

    meshRef.current.position.copy(pos.current);
    meshRef.current.rotation.y += 0.004;
    meshRef.current.rotation.x += 0.002;

    if (ringRef.current) {
      ringRef.current.position.copy(pos.current);
      ringRef.current.rotation.z = clock.getElapsedTime() * 0.3;
    }
  });

  // Much bigger on mobile so they're visible
  const radius  = isMobile
    ? 0.7 + project.mass * 0.28
    : 0.48 + project.mass * 0.22;
  const badge   = STATUS_META[project.status];
  const hasLink = project.link &&
    !["ADD_LINK_LATER","UNDER_DEVELOPMENT","PLANNING_PHASE"].includes(project.link);

  // Detail panel: on mobile show below, on desktop show to the right
  const panelPos = isMobile ? [0, -(radius + 2.2), 0] : [radius + 0.3, 0.4, 0];
  const panelW   = isMobile ? 220 : 265;

  return (
    <>
      <mesh
        ref={meshRef}
        position={initPos}
        onPointerOver={() => { setHovered(true);  document.body.style.cursor = "pointer"; }}
        onPointerOut ={() => { setHovered(false); document.body.style.cursor = "auto";    }}
        onClick={() => setSelected(isSelected ? null : project)}
      >
        <sphereGeometry args={[radius, 48, 48]} />
        <meshPhysicalMaterial
          color={project.color}
          emissive={project.color}
          emissiveIntensity={hovered || isSelected ? 0.65 : 0.22}
          metalness={0.6} roughness={0.14}
          clearcoat={1}   clearcoatRoughness={0.08}
        />

        {/* Label — larger font on mobile */}
        <Html
          center
          distanceFactor={isMobile ? 7 : 12}
          position={[0, -(radius + 0.55), 0]}
          style={{ pointerEvents: "none" }}
        >
          <div style={{
            textAlign: "center",
            fontFamily: "'Space Mono',monospace",
            userSelect: "none",
          }}>
            <div style={{
              fontSize: isMobile ? 13 : hovered || isSelected ? 11 : 9,
              color: hovered || isSelected ? project.color : "rgba(255,255,255,0.55)",
              whiteSpace: "nowrap",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              textShadow: `0 0 16px ${project.color}aa`,
              transition: "all 0.25s ease",
              fontWeight: isMobile ? 700 : 400,
            }}>
              {project.title}
            </div>
            <div style={{
              fontSize: isMobile ? 10 : 7,
              letterSpacing: "0.12em",
              color: badge.color,
              marginTop: 4,
              opacity: hovered || isSelected ? 1 : 0.6,
            }}>
              {badge.label}
            </div>
          </div>
        </Html>

        {/* Detail panel */}
        {isSelected && (
          <Html
            position={panelPos}
            distanceFactor={isMobile ? 6 : 10}
            style={{ width: panelW, pointerEvents: "all" }}
          >
            <div style={{
              background: "rgba(4,4,14,0.95)",
              border: `1px solid ${project.color}66`,
              borderRadius: 14,
              padding: isMobile ? "14px 16px" : "18px 20px",
              fontFamily: "'Space Mono',monospace",
              color: "#fff",
              boxShadow: `0 0 40px ${project.color}28`,
              backdropFilter: "blur(20px)",
            }}>
              <div style={{ fontSize: 9, color: badge.color, letterSpacing: "0.16em", marginBottom: 5 }}>{badge.label}</div>
              <div style={{ fontSize: 9, color: project.color, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 6 }}>{project.category}</div>
              <div style={{ fontSize: isMobile ? 14 : 13, fontWeight: 700, marginBottom: 8, lineHeight: 1.3 }}>{project.title}</div>
              <div style={{ fontSize: isMobile ? 10 : 9, color: "rgba(255,255,255,0.55)", lineHeight: 1.75, marginBottom: 12 }}>{project.description}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
                {project.tech.map((t) => (
                  <span key={t} style={{ fontSize: 8, padding: "3px 8px", border: `1px solid ${project.color}44`, borderRadius: 20, color: project.color }}>{t}</span>
                ))}
              </div>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.32)", lineHeight: 1.65, borderLeft: `2px solid ${project.color}44`, paddingLeft: 10, marginBottom: 14 }}>
                {project.layers.logic}
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                {hasLink
                  ? <a href={project.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 9, color: project.color, textDecoration: "none", letterSpacing: "0.12em", textTransform: "uppercase", borderBottom: `1px solid ${project.color}66`, paddingBottom: 2 }}>View Project →</a>
                  : <span style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{project.status === "IN_PROGRESS" ? "In Development" : "Coming Soon"}</span>
                }
                <button onClick={() => setSelected(null)} style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", background: "none", border: "none", cursor: "pointer", marginLeft: "auto", padding: "4px 8px" }}>
                  ✕
                </button>
              </div>
            </div>
          </Html>
        )}
      </mesh>

      {/* Glow ring */}
      {(hovered || isSelected) && (
        <mesh ref={ringRef} position={initPos}>
          <ringGeometry args={[radius * 1.12, radius * 1.22, 64]} />
          <meshBasicMaterial color={project.color} transparent opacity={0.3} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      )}
    </>
  );
}

// Tighter spiral for mobile
function spiralPos(count) {
  const r = isMobile ? 3.5 : 5.5;
  return Array.from({ length: count }, (_, i) => {
    const a = (i / count) * Math.PI * 2 * 2.4;
    const d = r * (0.3 + (i / count) * 0.7);
    return [
      Math.cos(a) * d + (Math.random() - 0.5) * 0.8,
      Math.sin(a) * d * 0.55 + (Math.random() - 0.5) * 0.8,
      (Math.random() - 0.5) * 2.5,
    ];
  });
}

export default function GravityWell() {
  const projects  = useStore((s) => s.projects);
  const positions = useMemo(() => spiralPos(projects.length), [projects.length]);

  return (
    <>
      <color attach="background" args={["#050510"]} />
      <ambientLight intensity={0.4} color="#c8d8ff" />
      <pointLight position={[0, 0, 0]} intensity={0.6} color="#6060ff" distance={12} />
      <directionalLight position={[5, 8, 5]} intensity={1.0} color="#ff6b35" castShadow />

      <ParticleField />

      {/* Central attractor */}
      <mesh>
        <sphereGeometry args={[isMobile ? 0.1 : 0.15, 32, 32]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.08} />
      </mesh>

      {/* Watermark */}
      <Html position={[0, isMobile ? -6 : -8, 0]} distanceFactor={14} style={{ pointerEvents: "none", textAlign: "center" }}>
        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: isMobile ? 10 : 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.1)", textTransform: "uppercase", whiteSpace: "nowrap" }}>
          @{IDENTITY.handle}
        </div>
      </Html>

      {projects.map((p, i) => (
        <ProjectOrb key={p.id} project={p} initPos={positions[i]} />
      ))}
    </>
  );
}
