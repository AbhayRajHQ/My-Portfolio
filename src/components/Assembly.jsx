// @ts-nocheck
// ── FILE 8 / 10 : src/components/Assembly.jsx  (MOBILE FIXED) ────

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Grid, Line } from "@react-three/drei";
import * as THREE from "three";
import useStore from "../store/useThemeStore";
import { IDENTITY, STATUS_META } from "../config/identity";

// ── Responsive ────────────────────────────────────────────────────
const vw       = window.innerWidth;
const isMobile = vw < 768;

// ── Layer definitions ─────────────────────────────────────────────
const LAYER_DEFS = [
  { key: "code",   label: "01 · CODE",   color: "#0088cc", yOff:  2.0, zOff:  0.8 },
  { key: "design", label: "02 · DESIGN", color: "#338833", yOff:  0.7, zOff:  0.3 },
  { key: "logic",  label: "03 · LOGIC",  color: "#cc4400", yOff: -0.7, zOff: -0.3 },
  { key: "result", label: "04 · RESULT", color: "#993366", yOff: -2.0, zOff: -0.8 },
];

// ── Single exploded layer slab ────────────────────────────────────
function LayerSlab({ ld, content, isActive, onClick }) {
  const [hov, setHov] = useState(false);
  const meshRef = useRef();
  const on      = isActive || hov;

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    meshRef.current.position.y = Math.sin(clock.getElapsedTime() * 0.5 + ld.yOff) * 0.04;
  });

  // On mobile: no leader lines going far right, annotation goes below
  const slabW = isMobile ? 3.2 : 3.8;

  return (
    <group position={[0, ld.yOff, ld.zOff]}>
      {/* Slab */}
      <mesh
        ref={meshRef}
        onPointerOver={() => setHov(true)}
        onPointerOut ={() => setHov(false)}
        onClick={onClick}
      >
        <boxGeometry args={[slabW, 0.5, 0.07]} />
        <meshPhysicalMaterial
          color={on ? ld.color : "#b8bcc8"}
          emissive={ld.color}
          emissiveIntensity={on ? 0.18 : 0}
          metalness={0.06} roughness={0.5}
          transparent opacity={on ? 0.96 : 0.75}
        />
      </mesh>

      {/* Layer label — DARK text on light slab, always readable */}
      <Html
        position={[-(slabW / 2) + 0.15, 0, 0.08]}
        distanceFactor={isMobile ? 5 : 7}
        style={{ pointerEvents: "none" }}
      >
        <div style={{
          fontFamily: "'Space Mono',monospace",
          fontSize: isMobile ? 11 : 9,
          color: on ? "#ffffff" : "#2a3040",
          letterSpacing: "0.1em",
          whiteSpace: "nowrap",
          fontWeight: on ? 700 : 400,
          textShadow: on ? `0 0 8px ${ld.color}` : "none",
          transition: "all 0.3s",
        }}>
          {ld.label}
        </div>
      </Html>

      {/* Leader line — only on desktop */}
      {!isMobile && (
        <>
          <Line
            points={[[slabW / 2, 0, 0], [slabW / 2 + 0.4, 0, 0], [slabW / 2 + 1.4, 0, 0]]}
            color={on ? ld.color : "#9098ac"}
            lineWidth={on ? 1.5 : 0.6}
            dashed={!on} dashSize={0.07} gapSize={0.04}
          />
          <mesh position={[slabW / 2 + 1.4, 0, 0]}>
            <circleGeometry args={[0.04, 16]} />
            <meshBasicMaterial color={on ? ld.color : "#9098ac"} />
          </mesh>
          <Html
            position={[slabW / 2 + 1.55, 0, 0]}
            distanceFactor={7}
            style={{ width: 190, pointerEvents: "none" }}
          >
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: on ? ld.color : "#505870", lineHeight: 1.6, letterSpacing: "0.04em", borderLeft: `2px solid ${on ? ld.color : "#c0c6d4"}`, paddingLeft: 8, transition: "color 0.3s, border-color 0.3s" }}>
              {content}
            </div>
          </Html>
        </>
      )}

      {/* Mobile: annotation appears below when active */}
      {isMobile && on && (
        <Html position={[0, -0.55, 0]} distanceFactor={5} style={{ width: 260, pointerEvents: "none" }}>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: "#1a2030", lineHeight: 1.65, letterSpacing: "0.04em", background: "rgba(255,255,255,0.92)", borderLeft: `3px solid ${ld.color}`, paddingLeft: 10, paddingTop: 5, paddingBottom: 5, borderRadius: "0 6px 6px 0", boxShadow: "0 2px 12px rgba(0,0,0,0.1)" }}>
            {content}
          </div>
        </Html>
      )}
    </group>
  );
}

// ── Full exploded card ────────────────────────────────────────────
function ExplodedCard({ project, position }) {
  const [activeLayer, setActiveLayer] = useState(null);
  const groupRef   = useRef();
  const hasLink    = project.link &&
    !["ADD_LINK_LATER","UNDER_DEVELOPMENT","PLANNING_PHASE"].includes(project.link);
  const statusMeta = STATUS_META[project.status];

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.15) * 0.04;
  });

  const titleX = isMobile ? -1.4 : -1.6;

  return (
    <group ref={groupRef} position={position}>
      {/* Title plate */}
      <mesh position={[0, 3.0, 0]}>
        <planeGeometry args={[isMobile ? 3.2 : 3.8, 0.85]} />
        <meshBasicMaterial color={project.color} transparent opacity={0.1} />
      </mesh>

      {/* Status dot */}
      <mesh position={[isMobile ? 1.4 : 1.75, 3.12, 0.01]}>
        <circleGeometry args={[0.07, 24]} />
        <meshBasicMaterial color={statusMeta.color} />
      </mesh>

      {/* Title — dark readable text on light bg */}
      <Html position={[titleX, 3.08, 0.02]} distanceFactor={isMobile ? 5 : 7} style={{ pointerEvents: "none" }}>
        <div style={{ fontFamily: "'Space Mono',monospace" }}>
          <div style={{ fontSize: isMobile ? 17 : 16, color: project.color, fontWeight: 700, letterSpacing: "-0.01em", marginBottom: 3, textShadow: "0 1px 3px rgba(0,0,0,0.15)" }}>
            {project.title}
          </div>
          <div style={{ fontSize: isMobile ? 9 : 8, color: "#444c60", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            {project.category}
          </div>
        </div>
      </Html>

      {/* Status badge */}
      <Html position={[titleX, 2.55, 0]} distanceFactor={isMobile ? 5 : 7} style={{ pointerEvents: "none" }}>
        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: isMobile ? 10 : 8, color: statusMeta.color, letterSpacing: "0.16em", display: "flex", alignItems: "center", gap: 6, fontWeight: 700 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: statusMeta.color, display: "inline-block", boxShadow: `0 0 6px ${statusMeta.color}` }} />
          {statusMeta.label.replace(/[●◑○] /, "")}
        </div>
      </Html>

      {/* Vertical spine */}
      <Line points={[[0, 2.2, 0], [0, -2.4, 0]]} color="#8890a4" lineWidth={0.6} dashed dashSize={0.1} gapSize={0.06} />

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
      <Html
        position={[titleX, -2.75, 0]}
        distanceFactor={isMobile ? 5 : 7}
        style={{ width: isMobile ? 280 : 340, pointerEvents: "none" }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, fontFamily: "'Space Mono',monospace" }}>
          {project.tech.map((t) => (
            <span key={t} style={{ fontSize: isMobile ? 9 : 7.5, padding: "3px 9px", border: `1px solid ${project.color}55`, borderRadius: 4, color: project.color, background: `${project.color}12`, fontWeight: 600 }}>{t}</span>
          ))}
        </div>
      </Html>

      {/* CTA */}
      <Html position={[titleX, -3.35, 0]} distanceFactor={isMobile ? 5 : 7} style={{ pointerEvents: "all" }}>
        {hasLink
          ? <a href={project.link} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'Space Mono',monospace", fontSize: isMobile ? 11 : 8.5, color: project.color, textDecoration: "none", letterSpacing: "0.12em", textTransform: "uppercase", borderBottom: `2px solid ${project.color}88`, paddingBottom: 2, fontWeight: 700 }}>View Live →</a>
          : <span style={{ fontFamily: "'Space Mono',monospace", fontSize: isMobile ? 10 : 8, color: "#606878", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              {project.status === "IN_PROGRESS" ? "⟳ In Development" : "◌ Planned"}
            </span>
        }
      </Html>
    </group>
  );
}

const CARD_SPACING = isMobile ? 8 : 11;

// ── Assembly root ─────────────────────────────────────────────────
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
      <ambientLight intensity={2.2} color="#ffffff" />
      <directionalLight position={[5, 10, 5]}   intensity={0.7} color="#e8eaf6" />
      <directionalLight position={[-5, -3, -5]}  intensity={0.4} color="#c5cae9" />
      {/* Extra fill light for text visibility */}
      <ambientLight intensity={1.0} color="#dde0ea" />

      <Grid
        position={[0, -5, 0]} args={[200, 200]}
        cellSize={1} cellThickness={0.3} cellColor="#b8bec8"
        sectionSize={5} sectionThickness={0.6} sectionColor="#8890a4"
        fadeDistance={isMobile ? 30 : 60} fadeStrength={1.5} infiniteGrid
      />

      {/* Header — dark text on light background */}
      <Html
        position={[isMobile ? -3.5 : -8, isMobile ? 5.0 : 5.5, 0]}
        style={{ pointerEvents: "none" }}
        distanceFactor={isMobile ? 9 : 14}
      >
        <div style={{ fontFamily: "'Space Mono',monospace" }}>
          <div style={{ fontSize: isMobile ? 9 : 8, letterSpacing: "0.3em", color: "#505870", textTransform: "uppercase", marginBottom: 5 }}>
            Deconstruct · Exploded View
          </div>
          <div style={{ fontSize: isMobile ? 16 : 18, color: "#1a1a2e", letterSpacing: "-0.02em", fontWeight: 700 }}>
            {IDENTITY.name} ·{" "}
            <span style={{ color: projects[idx]?.color }}>
              {projects[idx]?.title}
            </span>
          </div>
          <div style={{ fontSize: isMobile ? 9 : 8, color: "#606878", letterSpacing: "0.08em", marginTop: 5 }}>
            {isMobile ? "Tap a layer to inspect" : "Click any layer to annotate · use ← → to navigate"}
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
      <Html
        position={[0, isMobile ? -4.0 : -4.5, 0]}
        transform={false}
        style={{ pointerEvents: "all" }}
      >
        <div style={{
          display: "flex", gap: isMobile ? 12 : 10,
          alignItems: "center",
          fontFamily: "'Space Mono',monospace",
          background: "rgba(238,240,244,0.9)",
          padding: isMobile ? "10px 16px" : "8px 14px",
          borderRadius: 40,
          border: "1px solid rgba(30,30,60,0.12)",
          boxShadow: "0 2px 16px rgba(0,0,0,0.1)",
        }}>
          <button
            onClick={() => setIdx(Math.max(0, idx - 1))}
            disabled={idx === 0}
            style={{ background: "none", border: "1px solid #9098ac", borderRadius: 4, padding: isMobile ? "6px 14px" : "4px 10px", cursor: idx === 0 ? "default" : "pointer", color: idx === 0 ? "#b0b8c8" : "#1a2030", fontSize: isMobile ? 14 : 11, fontFamily: "inherit" }}
          >←</button>

          {projects.map((p, i) => (
            <button key={p.id} onClick={() => setIdx(i)}
              style={{ width: i === idx ? 28 : isMobile ? 10 : 7, height: isMobile ? 10 : 7, borderRadius: 5, border: "none", background: i === idx ? p.color : "#9098ac", cursor: "pointer", transition: "all 0.3s", padding: 0, boxShadow: i === idx ? `0 0 10px ${p.color}aa` : "none" }}
            />
          ))}

          <button
            onClick={() => setIdx(Math.min(projects.length - 1, idx + 1))}
            disabled={idx === projects.length - 1}
            style={{ background: "none", border: "1px solid #9098ac", borderRadius: 4, padding: isMobile ? "6px 14px" : "4px 10px", cursor: idx === projects.length - 1 ? "default" : "pointer", color: idx === projects.length - 1 ? "#b0b8c8" : "#1a2030", fontSize: isMobile ? 14 : 11, fontFamily: "inherit" }}
          >→</button>

          <span style={{ fontSize: isMobile ? 11 : 9, color: "#606878", letterSpacing: "0.1em", marginLeft: 2 }}>
            {String(idx + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
          </span>
        </div>
      </Html>
    </>
  );
}
