
// @ts-nocheck
// ── FILE 8 / 10 : src/components/Assembly.jsx ────────────────────

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Grid, Line } from "@react-three/drei";
import * as THREE from "three";
import useStore from "../store/useThemeStore";
import { IDENTITY, STATUS_META } from "../config/identity";

// Layer definitions for the exploded view
const LAYER_DEFS = [
  { key: "code",   label: "01 · CODE",   color: "#00d4ff", yOff:  2.1, zOff:  0.9 },
  { key: "design", label: "02 · DESIGN", color: "#a8ff78", yOff:  0.7, zOff:  0.3 },
  { key: "logic",  label: "03 · LOGIC",  color: "#ff6b35", yOff: -0.7, zOff: -0.3 },
  { key: "result", label: "04 · RESULT", color: "#ff4da6", yOff: -2.1, zOff: -0.9 },
];

// ── Single floating slab with leader line + annotation ────────────
function LayerSlab({ ld, content, isActive, onClick }) {
  const [hov, setHov] = useState(false);
  const meshRef = useRef();
  const on      = isActive || hov;

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    meshRef.current.position.y = Math.sin(clock.getElapsedTime() * 0.5 + ld.yOff) * 0.055;
  });

  return (
    <group position={[0, ld.yOff, ld.zOff]}>
      {/* Slab geometry */}
      <mesh
        ref={meshRef}
        onPointerOver={() => setHov(true)}
        onPointerOut ={() => setHov(false)}
        onClick={onClick}
      >
        <boxGeometry args={[3.8, 0.52, 0.07]} />
        <meshPhysicalMaterial
          color={on ? ld.color : "#d0d4de"}
          emissive={ld.color}
          emissiveIntensity={on ? 0.22 : 0}
          metalness={0.08} roughness={0.45}
          transparent opacity={on ? 0.94 : 0.72}
        />
      </mesh>

      {/* Layer label */}
      <Html position={[-1.6, 0, 0.08]} distanceFactor={8} style={{ pointerEvents: "none" }}>
        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: on ? ld.color : "#66708a", letterSpacing: "0.12em", whiteSpace: "nowrap", transition: "color 0.3s" }}>
          {ld.label}
        </div>
      </Html>

      {/* Leader line */}
      <Line
        points={[[1.9, 0, 0], [2.3, 0, 0], [3.3, 0, 0]]}
        color={on ? ld.color : "#b0b8cc"}
        lineWidth={on ? 1.5 : 0.7}
        dashed={!on} dashSize={0.07} gapSize={0.04}
      />

      {/* Terminal dot */}
      <mesh position={[3.3, 0, 0]}>
        <circleGeometry args={[0.04, 16]} />
        <meshBasicMaterial color={on ? ld.color : "#aab0c4"} />
      </mesh>

      {/* Annotation */}
      <Html position={[3.46, 0, 0]} distanceFactor={8} style={{ width: 195, pointerEvents: "none" }}>
        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 7.5, color: on ? ld.color : "#7a829a", lineHeight: 1.6, letterSpacing: "0.04em", borderLeft: `2px solid ${on ? ld.color : "#c8cdd8"}`, paddingLeft: 8, transition: "color 0.3s, border-color 0.3s" }}>
          {content}
        </div>
      </Html>
    </group>
  );
}

// ── Full exploded card for one project ────────────────────────────
function ExplodedCard({ project, position }) {
  const [activeLayer, setActiveLayer] = useState(null);
  const groupRef   = useRef();
  const hasLink    = project.link &&
    !["ADD_LINK_LATER","UNDER_DEVELOPMENT","PLANNING_PHASE"].includes(project.link);
  const statusMeta = STATUS_META[project.status];

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.17) * 0.055;
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Title plate */}
      <mesh position={[0, 3.35, 0]}>
        <planeGeometry args={[3.8, 0.75]} />
        <meshBasicMaterial color={project.color} transparent opacity={0.07} />
      </mesh>

      {/* Status dot */}
      <mesh position={[1.78, 3.44, 0.01]}>
        <circleGeometry args={[0.065, 24]} />
        <meshBasicMaterial color={statusMeta.color} />
      </mesh>

      {/* Title + category */}
      <Html position={[-1.6, 3.4, 0.02]} distanceFactor={8} style={{ pointerEvents: "none" }}>
        <div style={{ fontFamily: "'Space Mono',monospace" }}>
          <div style={{ fontSize: 16, color: project.color, fontWeight: 700, letterSpacing: "-0.01em", marginBottom: 2 }}>
            {project.title}
          </div>
          <div style={{ fontSize: 7.5, color: "#8891a8", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            {project.category}
          </div>
        </div>
      </Html>

      {/* Status badge */}
      <Html position={[-1.6, 2.7, 0]} distanceFactor={8} style={{ pointerEvents: "none" }}>
        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 7.5, color: statusMeta.color, letterSpacing: "0.18em", display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: statusMeta.color, display: "inline-block", boxShadow: `0 0 5px ${statusMeta.color}` }} />
          {statusMeta.label.replace(/[●◑○] /, "")}
        </div>
      </Html>

      {/* Vertical spine */}
      <Line points={[[0, 2.5, 0], [0, -2.5, 0]]} color="#c0c6d4" lineWidth={0.5} dashed dashSize={0.1} gapSize={0.06} />

      {/* Four exploded layers */}
      {LAYER_DEFS.map((ld) => (
        <LayerSlab
          key={ld.key} ld={ld}
          content={project.layers[ld.key]}
          isActive={activeLayer === ld.key}
          onClick={() => setActiveLayer(activeLayer === ld.key ? null : ld.key)}
        />
      ))}

      {/* Tech tags */}
      <Html position={[-1.9, -3.1, 0]} distanceFactor={8} style={{ width: 340, pointerEvents: "none" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, fontFamily: "'Space Mono',monospace" }}>
          {project.tech.map((t) => (
            <span key={t} style={{ fontSize: 7, padding: "2px 8px", border: `1px solid ${project.color}50`, borderRadius: 3, color: project.color, background: `${project.color}0d` }}>{t}</span>
          ))}
        </div>
      </Html>

      {/* CTA */}
      <Html position={[-1.9, -3.62, 0]} distanceFactor={8} style={{ pointerEvents: "all" }}>
        {hasLink
          ? <a href={project.link} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: project.color, textDecoration: "none", letterSpacing: "0.15em", textTransform: "uppercase", borderBottom: `1px solid ${project.color}66`, paddingBottom: 2 }}>View Live Project →</a>
          : <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: "#8891a8", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              {project.status === "IN_PROGRESS" ? "⟳ Under Development" : "◌ Planned"}
            </span>
        }
      </Html>
    </group>
  );
}

const CARD_SPACING = 11;

// ── Assembly scene root ───────────────────────────────────────────
export default function Assembly() {
  const projects = useStore((s) => s.projects);
  const [idx, setIdx] = useState(0);
  const groupRef = useRef();

  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.position.x = THREE.MathUtils.lerp(
      groupRef.current.position.x,
      -idx * CARD_SPACING,
      0.07,
    );
  });

  return (
    <>
      <color attach="background" args={["#eef0f4"]} />
      <ambientLight intensity={1.8} color="#ffffff" />
      <directionalLight position={[5, 10, 5]}   intensity={0.6} color="#e8eaf6" />
      <directionalLight position={[-5, -3, -5]}  intensity={0.3} color="#c5cae9" />

      <Grid
        position={[0, -5, 0]} args={[200, 200]}
        cellSize={1} cellThickness={0.3} cellColor="#c8cdd8"
        sectionSize={5} sectionThickness={0.6} sectionColor="#a0a8b8"
        fadeDistance={60} fadeStrength={1.5} infiniteGrid
      />

      {/* Header */}
      <Html position={[-8, 5.5, 0]} style={{ pointerEvents: "none" }} distanceFactor={14}>
        <div style={{ fontFamily: "'Space Mono',monospace" }}>
          <div style={{ fontSize: 8, letterSpacing: "0.3em", color: "#888fa0", textTransform: "uppercase", marginBottom: 4 }}>
            Deconstruct · Exploded View
          </div>
          <div style={{ fontSize: 18, color: "#1a1a2e", letterSpacing: "-0.02em" }}>
            {IDENTITY.name} · <span style={{ color: projects[idx]?.color }}>{projects[idx]?.title}</span>
          </div>
        </div>
      </Html>

      {/* Carousel */}
      <group ref={groupRef}>
        {projects.map((p, i) => (
          <ExplodedCard key={p.id} project={p} position={[i * CARD_SPACING, 0, 0]} />
        ))}
      </group>

      {/* Navigation */}
      <Html position={[0, -4.5, 0]} transform={false} style={{ pointerEvents: "all" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", fontFamily: "'Space Mono',monospace" }}>
          <button
            onClick={() => setIdx(Math.max(0, idx - 1))}
            disabled={idx === 0}
            style={{ background: "none", border: "1px solid #999", borderRadius: 4, padding: "4px 10px", cursor: idx === 0 ? "default" : "pointer", color: idx === 0 ? "#ccc" : "#333", fontSize: 11, fontFamily: "inherit" }}
          >←</button>

          {projects.map((p, i) => (
            <button key={p.id} onClick={() => setIdx(i)}
              style={{ width: i === idx ? 24 : 7, height: 7, borderRadius: 4, border: "none", background: i === idx ? p.color : "#b0b8c8", cursor: "pointer", transition: "all 0.3s", padding: 0, boxShadow: i === idx ? `0 0 8px ${p.color}88` : "none" }}
            />
          ))}

          <button
            onClick={() => setIdx(Math.min(projects.length - 1, idx + 1))}
            disabled={idx === projects.length - 1}
            style={{ background: "none", border: "1px solid #999", borderRadius: 4, padding: "4px 10px", cursor: idx === projects.length - 1 ? "default" : "pointer", color: idx === projects.length - 1 ? "#ccc" : "#333", fontSize: 11, fontFamily: "inherit" }}
          >→</button>

          <span style={{ fontSize: 9, color: "#888", letterSpacing: "0.12em", marginLeft: 4 }}>
            {String(idx + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
          </span>
        </div>
      </Html>
    </>
  );
}
