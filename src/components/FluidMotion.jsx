// @ts-nocheck
// ── FILE 7 / 10 : src/components/FluidMotion.jsx  (MOBILE FIXED) ─

import { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import useStore from "../store/useThemeStore";
import { IDENTITY, SKILL_MATRIX, STATUS_META } from "../config/identity";

// ── Responsive breakpoints ────────────────────────────────────────
const vw       = window.innerWidth;
const isMobile = vw < 600;
const isTablet = vw >= 600 && vw < 1024;

const COLS  = isMobile ? 1 : isTablet ? 2 : 3;
const CARD_W = isMobile ? Math.min(vw - 32, 340) : isTablet ? 280 : 276;
const GAP    = 12;
const GRID_W = COLS * CARD_W + (COLS - 1) * GAP;

// ── GLSL Wave Background ──────────────────────────────────────────
const waveVert = /* glsl */`
  varying vec2 vUv;
  varying float vWave;
  uniform float uTime;
  void main() {
    vUv = uv;
    vec3 p = position;
    float w = sin(p.x*1.2+uTime*0.6)*0.18
            + sin(p.y*1.8+uTime*0.4)*0.12
            + sin((p.x+p.y)*0.9+uTime*0.3)*0.08;
    p.z += w;
    vWave = w;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.0);
  }
`;
const waveFrag = /* glsl */`
  varying vec2 vUv;
  varying float vWave;
  uniform float uTime;
  void main() {
    vec3 deep   = vec3(0.01,0.04,0.12);
    vec3 mid    = vec3(0.02,0.14,0.32);
    vec3 bright = vec3(0.0,0.50,0.78);
    float g  = smoothstep(0.0,1.0,vUv.y+vWave*0.3);
    vec3 col = mix(deep,mix(mid,bright,g*0.6),g);
    vec2 gr  = vUv*24.0;
    vec2 gf  = fract(gr);
    float ln = max(1.0-smoothstep(0.0,0.04,gf.x), 1.0-smoothstep(0.0,0.04,gf.y));
    col     += vec3(0.0,0.55,0.9)*ln*(0.08+vWave*0.12);
    float sp = pow(max(0.0,vWave*2.5),3.0)*0.4;
    col     += vec3(sp*0.4,sp*0.8,sp);
    gl_FragColor = vec4(col,1.0);
  }
`;

function WaveBackground() {
  const matRef   = useRef();
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  useFrame(({ clock }) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = clock.getElapsedTime();
  });
  return (
    <mesh position={[0, 0, -8]} rotation={[-Math.PI * 0.12, 0, 0]}>
      <planeGeometry args={[85, 52, isMobile ? 40 : 120, isMobile ? 30 : 80]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={waveVert}
        fragmentShader={waveFrag}
        uniforms={uniforms}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ── Project Card ──────────────────────────────────────────────────
function ProjectCard({ project }) {
  const setSelected   = useStore((s) => s.setSelectedProject);
  const sel           = useStore((s) => s.selectedProject);
  const [hov, setHov] = useState(false);
  const [ripples, setRipples] = useState([]);
  const cardRef  = useRef();
  const rippleId = useRef(0);
  const isSel    = sel?.id === project.id;
  const badge    = STATUS_META[project.status];
  const hasLink  = project.link &&
    !["ADD_LINK_LATER","UNDER_DEVELOPMENT","PLANNING_PHASE"].includes(project.link);

  const onMove = (e) => {
    if (!cardRef.current || isMobile) return;
    const r  = cardRef.current.getBoundingClientRect();
    const id = rippleId.current++;
    setRipples((prev) => [...prev.slice(-2), { id, x: e.clientX - r.left, y: e.clientY - r.top }]);
    setTimeout(() => setRipples((prev) => prev.filter((rr) => rr.id !== id)), 900);
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onMouseMove={onMove}
      onClick={() => setSelected(isSel ? null : project)}
      style={{
        position: "relative", overflow: "hidden",
        borderRadius: 14, padding: "18px 18px",
        cursor: "pointer", width: CARD_W,
        background: hov || isSel
          ? `linear-gradient(135deg,${project.color}28 0%,rgba(0,212,255,0.1) 100%)`
          : "rgba(255,255,255,0.05)",
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        border: `1px solid ${isSel ? project.color : hov ? project.color+"66" : "rgba(255,255,255,0.1)"}`,
        boxShadow: isSel
          ? `0 0 0 1px ${project.color}44, 0 8px 40px ${project.color}22`
          : hov ? `0 4px 20px ${project.color}18` : "0 2px 10px rgba(0,0,0,0.3)",
        transition: "all 0.35s cubic-bezier(0.23,1,0.32,1)",
        transform: isSel ? "scale(1.01)" : hov ? "translateY(-2px)" : "translateY(0)",
        fontFamily: "'Space Mono',monospace",
      }}
    >
      {/* Ripples */}
      {ripples.map((r) => (
        <span key={r.id} style={{ position: "absolute", left: r.x, top: r.y, width: 0, height: 0, borderRadius: "50%", background: `${project.color}28`, transform: "translate(-50%,-50%)", animation: "ripple 0.9s ease-out forwards", pointerEvents: "none" }} />
      ))}

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontSize: 8, letterSpacing: "0.16em", color: project.color, textTransform: "uppercase", padding: "3px 8px", border: `1px solid ${project.color}44`, borderRadius: 20 }}>
            {project.category}
          </div>
          <div style={{ fontSize: 8, color: badge.color, letterSpacing: "0.1em", flexShrink: 0 }}>{badge.label}</div>
        </div>

        {/* Title */}
        <h3 style={{ fontSize: isMobile ? 15 : 14, color: "#fff", marginBottom: 8, lineHeight: 1.3, letterSpacing: "-0.01em" }}>
          {project.title}
        </h3>

        {/* Description */}
        <p style={{
          fontSize: isMobile ? 11 : 9,
          color: "rgba(255,255,255,0.6)",
          lineHeight: 1.75, marginBottom: 12,
          display: isSel ? "block" : "-webkit-box",
          WebkitLineClamp: isSel ? "unset" : 3,
          WebkitBoxOrient: "vertical",
          overflow: isSel ? "visible" : "hidden",
        }}>
          {project.description}
        </p>

        {/* Tech pills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {project.tech.map((t) => (
            <span key={t} style={{ fontSize: isMobile ? 9 : 7.5, color: "rgba(255,255,255,0.5)", padding: "3px 8px", background: "rgba(255,255,255,0.06)", borderRadius: 5, border: "1px solid rgba(255,255,255,0.1)" }}>{t}</span>
          ))}
        </div>

        {/* Expanded section */}
        {isSel && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: isMobile ? 10 : 8, color: "rgba(255,255,255,0.38)", lineHeight: 1.7, borderLeft: `2px solid ${project.color}44`, paddingLeft: 10, marginBottom: 14 }}>
              {project.layers.logic}
            </div>
            {hasLink
              ? <a href={project.link} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{ fontSize: isMobile ? 11 : 9, color: project.color, textDecoration: "none", letterSpacing: "0.12em", textTransform: "uppercase", borderBottom: `1px solid ${project.color}66`, paddingBottom: 2 }}>View Project →</a>
              : <span style={{ fontSize: isMobile ? 10 : 8, color: "rgba(255,255,255,0.28)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{project.status === "IN_PROGRESS" ? "In Development" : "Coming Soon"}</span>
            }
          </div>
        )}
      </div>
    </div>
  );
}

// ── Skill row ─────────────────────────────────────────────────────
function SkillGroup({ g }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
        <div style={{ fontSize: isMobile ? 9 : 7.5, letterSpacing: "0.18em", color: g.color, textTransform: "uppercase", fontFamily: "'Space Mono',monospace" }}>{g.domain}</div>
        <div style={{ flex: 1, minWidth: 20, height: 1, background: `${g.color}30` }} />
        <div style={{ fontSize: isMobile ? 8 : 6.5, color: g.color, padding: "2px 7px", border: `1px solid ${g.color}40`, borderRadius: 10, fontFamily: "'Space Mono',monospace", letterSpacing: "0.1em", whiteSpace: "nowrap" }}>{g.tier}</div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {g.skills.map((s) => (
          <span key={s} style={{ fontFamily: "'Space Mono',monospace", fontSize: isMobile ? 10 : 8, padding: "4px 10px", background: `${g.color}12`, border: `1px solid ${g.color}35`, borderRadius: 5, color: "rgba(255,255,255,0.72)", whiteSpace: "nowrap" }}>{s}</span>
        ))}
      </div>
    </div>
  );
}

// ── FluidMotion root ──────────────────────────────────────────────
export default function FluidMotion() {
  const projects = useStore((s) => s.projects);

  // Calculate the distanceFactor to make content fill the screen nicely
  const df = isMobile ? 6 : isTablet ? 12 : 18;

  return (
    <>
      <color attach="background" args={["#03090f"]} />
      <ambientLight intensity={0.4} color="#c8d8ff" />
      <WaveBackground />
      <fogExp2 attach="fog" color="#020c1a" density={0.018} />

      {/* ── Project grid — centred HTML overlay ────────────────── */}
      <Html
        center
        position={[0, isMobile ? 2.5 : 1.6, 0]}
        transform={false}
        distanceFactor={df}
        style={{
          width: GRID_W,
          pointerEvents: "all",
          // Force centre on all screens
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -54%)",
          maxHeight: isMobile ? "60vh" : "65vh",
          overflowY: "auto",
          paddingBottom: 8,
        }}
      >
        <style>{`
          @keyframes ripple{0%{width:0;height:0;opacity:.6}100%{width:290px;height:290px;opacity:0}}
          ::-webkit-scrollbar{width:3px}
          ::-webkit-scrollbar-thumb{background:rgba(0,212,255,0.3);border-radius:2px}
        `}</style>

        {/* Header */}
        <div style={{ fontFamily: "'Space Mono',monospace", textAlign: "center", marginBottom: isMobile ? 16 : 22, paddingTop: 8 }}>
          <div style={{ fontSize: isMobile ? 10 : 8, letterSpacing: "0.3em", color: "#00d4ff99", textTransform: "uppercase", marginBottom: 6 }}>Selected Work</div>
          <div style={{ fontSize: isMobile ? 22 : 20, color: "#fff", letterSpacing: "-0.02em", fontWeight: 700 }}>{IDENTITY.name}</div>
          <div style={{ fontSize: isMobile ? 10 : 8, color: "rgba(255,255,255,0.32)", letterSpacing: "0.08em", marginTop: 6, lineHeight: 1.5 }}>{IDENTITY.tagline}</div>
        </div>

        {/* Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: `repeat(${COLS}, ${CARD_W}px)`,
          gap: `${GAP}px`,
          justifyContent: "center",
        }}>
          {projects.map((p) => <ProjectCard key={p.id} project={p} />)}
        </div>
      </Html>

      {/* ── Skill matrix — bottom overlay ──────────────────────── */}
      <Html
        center
        transform={false}
        style={{
          width: Math.min(GRID_W, vw - 24),
          pointerEvents: "none",
          position: "fixed",
          bottom: isMobile ? 60 : 28,
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        <div style={{ background: "rgba(2,12,26,0.88)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)", border: "1px solid rgba(0,212,255,0.15)", borderRadius: 14, padding: isMobile ? "16px 16px" : "18px 22px" }}>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: isMobile ? 9 : 7.5, letterSpacing: "0.28em", color: "#00d4ff88", textTransform: "uppercase", marginBottom: isMobile ? 14 : 12 }}>Skill Matrix</div>
          {SKILL_MATRIX.map((g) => <SkillGroup key={g.domain} g={g} />)}
          <div style={{ marginTop: 8, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.07)", fontFamily: "'Space Mono',monospace", fontSize: isMobile ? 9 : 7.5, color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em" }}>
            ⚡ {IDENTITY.fitness.philosophy} · {IDENTITY.fitness.focus}
          </div>
        </div>
      </Html>
    </>
  );
}
