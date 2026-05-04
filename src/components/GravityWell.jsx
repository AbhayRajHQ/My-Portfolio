
// @ts-nocheck
// ── FILE 6 / 10 : src/components/GravityWell.jsx ─────────────────

import { useRef, useState, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import useStore from "../store/useThemeStore";
import { IDENTITY, STATUS_META } from "../config/identity";

// ── Drifting star-field ───────────────────────────────────────────
function ParticleField() {
  const ref   = useRef();
  const COUNT = 380;

  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const speeds    = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 55;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 55;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20 - 5;
      speeds[i]             = 0.2 + Math.random() * 0.5;
    }
    return { positions, speeds };
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position.array;
    const t   = clock.getElapsedTime();
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3 + 1] += speeds[i] * 0.004;
      if (pos[i * 3 + 1] > 27) pos[i * 3 + 1] = -27;
      pos[i * 3]     += Math.sin(t * 0.08 + i) * 0.002;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.035} color="#5555ee"
        transparent opacity={0.45}
        sizeAttenuation depthWrite={false}
      />
    </points>
  );
}

// ── Single physics orb (manual spring — no cannon needed) ─────────
function ProjectOrb({ project, initPos }) {
  const setSelected  = useStore((s) => s.setSelectedProject);
  const selected     = useStore((s) => s.selectedProject);
  const [hovered, setHovered] = useState(false);
  const isSelected   = selected?.id === project.id;

  const meshRef   = useRef();
  const ringRef   = useRef();
  const pos       = useRef(new THREE.Vector3(...initPos));
  const vel       = useRef(new THREE.Vector3(
    (Math.random() - 0.5) * 0.05,
    (Math.random() - 0.5) * 0.05,
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

    // Attraction toward cursor
    const toMouse = tmpCursor.current.clone().sub(pos.current);
    const dist    = Math.max(toMouse.length(), 1.2);
    const str     = (hovered ? 0.018 : 0.006) * project.mass;
    toMouse.normalize().multiplyScalar(str / (dist * 0.04));
    vel.current.add(toMouse);

    // Z centering + boundary walls
    vel.current.z -= pos.current.z * 0.04;
    const B = 9;
    if (Math.abs(pos.current.x) > B)        vel.current.x -= Math.sign(pos.current.x) * 0.02;
    if (Math.abs(pos.current.y) > B * 0.65) vel.current.y -= Math.sign(pos.current.y) * 0.02;

    vel.current.multiplyScalar(0.93);       // damping
    pos.current.add(vel.current);           // integrate

    meshRef.current.position.copy(pos.current);
    meshRef.current.rotation.y += 0.006;
    meshRef.current.rotation.x += 0.003;

    if (ringRef.current) {
      ringRef.current.position.copy(pos.current);
      ringRef.current.rotation.z = clock.getElapsedTime() * 0.4;
    }
  });

  const radius  = 0.48 + project.mass * 0.22;
  const badge   = STATUS_META[project.status];
  const hasLink = project.link &&
    !["ADD_LINK_LATER", "UNDER_DEVELOPMENT", "PLANNING_PHASE"].includes(project.link);

  return (
    <>
      <mesh
        ref={meshRef}
        position={initPos}
        onPointerOver={() => { setHovered(true);  document.body.style.cursor = "pointer"; }}
        onPointerOut ={() => { setHovered(false); document.body.style.cursor = "auto";    }}
        onClick={() => setSelected(isSelected ? null : project)}
      >
        <sphereGeometry args={[radius, 52, 52]} />
        <meshPhysicalMaterial
          color={project.color}
          emissive={project.color}
          emissiveIntensity={hovered || isSelected ? 0.6 : 0.18}
          metalness={0.65} roughness={0.12}
          clearcoat={1}    clearcoatRoughness={0.08}
        />

        {/* Label */}
        <Html center distanceFactor={12} position={[0, -(radius + 0.48), 0]} style={{ pointerEvents: "none" }}>
          <div style={{ textAlign: "center", fontFamily: "'Space Mono',monospace", userSelect: "none" }}>
            <div style={{ fontSize: hovered || isSelected ? 11 : 9, color: hovered || isSelected ? project.color : "rgba(255,255,255,0.45)", whiteSpace: "nowrap", letterSpacing: "0.12em", textTransform: "uppercase", textShadow: `0 0 14px ${project.color}88`, transition: "all 0.25s ease" }}>
              {project.title}
            </div>
            <div style={{ fontSize: 7, letterSpacing: "0.15em", color: badge.color, marginTop: 3, opacity: hovered || isSelected ? 1 : 0.55, transition: "opacity 0.25s" }}>
              {badge.label}
            </div>
          </div>
        </Html>

        {/* Detail panel */}
        {isSelected && (
          <Html position={[radius + 0.3, 0.4, 0]} distanceFactor={10} style={{ width: 265, pointerEvents: "all" }}>
            <div style={{ background: "rgba(4,4,14,0.94)", border: `1px solid ${project.color}55`, borderRadius: 12, padding: "18px 20px", fontFamily: "'Space Mono',monospace", color: "#fff", boxShadow: `0 0 40px ${project.color}22`, backdropFilter: "blur(20px)" }}>
              <div style={{ fontSize: 8, color: badge.color, letterSpacing: "0.18em", marginBottom: 5 }}>{badge.label}</div>
              <div style={{ fontSize: 8, color: project.color, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 6 }}>{project.category}</div>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, lineHeight: 1.3 }}>{project.title}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", lineHeight: 1.75, marginBottom: 14 }}>{project.description}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 }}>
                {project.tech.map((t) => (
                  <span key={t} style={{ fontSize: 7, padding: "3px 7px", border: `1px solid ${project.color}44`, borderRadius: 20, color: project.color }}>{t}</span>
                ))}
              </div>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", lineHeight: 1.65, borderLeft: `2px solid ${project.color}44`, paddingLeft: 10, marginBottom: 14 }}>
                {project.layers.logic}
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                {hasLink
                  ? <a href={project.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 8, color: project.color, textDecoration: "none", letterSpacing: "0.15em", textTransform: "uppercase", borderBottom: `1px solid ${project.color}66`, paddingBottom: 2 }}>View Project →</a>
                  : <span style={{ fontSize: 8, color: "rgba(255,255,255,0.22)", letterSpacing: "0.12em", textTransform: "uppercase" }}>{project.status === "IN_PROGRESS" ? "In Development" : "Coming Soon"}</span>
                }
                <button onClick={() => setSelected(null)} style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", background: "none", border: "none", cursor: "pointer", marginLeft: "auto" }}>
                  Close ×
                </button>
              </div>
            </div>
          </Html>
        )}
      </mesh>

      {/* Glow ring */}
      {(hovered || isSelected) && (
        <mesh ref={ringRef} position={initPos}>
          <ringGeometry args={[radius * 1.13, radius * 1.22, 64]} />
          <meshBasicMaterial color={project.color} transparent opacity={0.28} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      )}
    </>
  );
}

// Spiral spawn positions
function spiralPos(count, r = 6) {
  return Array.from({ length: count }, (_, i) => {
    const a = (i / count) * Math.PI * 2 * 2.4;
    const d = r * (0.3 + (i / count) * 0.7);
    return [
      Math.cos(a) * d + (Math.random() - 0.5) * 1.4,
      Math.sin(a) * d * 0.55 + (Math.random() - 0.5) * 1.4,
      (Math.random() - 0.5) * 4,
    ];
  });
}

// ── GravityWell scene root ────────────────────────────────────────
export default function GravityWell() {
  const projects  = useStore((s) => s.projects);
  const positions = useMemo(() => spiralPos(projects.length), [projects.length]);

  return (
    <>
      <color attach="background" args={["#050510"]} />
      <ambientLight intensity={0.35} color="#c8d8ff" />
      <pointLight position={[0, 0, 0]} intensity={0.5} color="#6060ff" distance={10} />
      <directionalLight position={[5, 8, 5]} intensity={0.9} color="#ff6b35" castShadow />

      <ParticleField />

      {/* Central attractor glow */}
      <mesh>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.06} />
      </mesh>

      {/* Watermark */}
      <Html position={[0, -8, 0]} distanceFactor={14} style={{ pointerEvents: "none", textAlign: "center" }}>
        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: "0.25em", color: "rgba(255,255,255,0.1)", textTransform: "uppercase" }}>
          @{IDENTITY.handle} · {projects.length} projects in orbit
        </div>
      </Html>

      {projects.map((p, i) => (
        <ProjectOrb key={p.id} project={p} initPos={positions[i]} />
      ))}
    </>
  );
}
