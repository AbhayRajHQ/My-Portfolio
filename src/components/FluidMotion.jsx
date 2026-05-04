
// @ts-nocheck
// ── FILE 7 / 10 : src/components/FluidMotion.jsx ─────────────────

import { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import useStore from "../store/useThemeStore";
import { IDENTITY, SKILL_MATRIX, STATUS_META } from "../config/identity";

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
      <planeGeometry args={[85, 52, 120, 80]} />
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

// ── Project Card with glassmorphism + ripple ──────────────────────
function ProjectCard({ project }) {
  const setSelected  = useStore((s) => s.setSelectedProject);
  const sel          = useStore((s) => s.selectedProject);
  const [hov, setHov] = useState(false);
  const [ripples, setRipples] = useState([]);
  const cardRef  = useRef();
  const rippleId = useRef(0);
  const isSel    = sel?.id === project.id;
  const badge    = STATUS_META[project.status];
  const hasLink  = project.link &&
    !["ADD_LINK_LATER","UNDER_DEVELOPMENT","PLANNING_PHASE"].includes(project.link);

  const onMove = (e) => {
    if (!cardRef.current) return;
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
        position: "relative", overflow: "hidden", borderRadius: 16,
        padding: "20px 22px", cursor: "pointer",
        background: hov || isSel
          ? `linear-gradient(135deg,${project.color}22 0%,rgba(0,212,255,0.08) 100%)`
          : "rgba(255,255,255,0.04)",
        backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
        border: `1px solid ${isSel ? project.color : hov ? project.color + "55" : "rgba(255,255,255,0.08)"}`,
        boxShadow: isSel
          ? `0 0 0 1px ${project.color}44, 0 8px 40px ${project.color}22`
          : hov ? `0 4px 24px ${project.color}18` : "0 2px 12px rgba(0,0,0,0.3)",
        transition: "all 0.35s cubic-bezier(0.23,1,0.32,1)",
        transform: isSel ? "scale(1.02)" : hov ? "translateY(-3px)" : "translateY(0)",
        fontFamily: "'Space Mono',monospace",
      }}
    >
      {/* Ripple circles */}
      {ripples.map((r) => (
        <span key={r.id} style={{ position: "absolute", left: r.x, top: r.y, width: 0, height: 0, borderRadius: "50%", background: `${project.color}28`, transform: "translate(-50%,-50%)", animation: "ripple 0.9s ease-out forwards", pointerEvents: "none" }} />
      ))}

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ fontSize: 7, letterSpacing: "0.2em", color: project.color, textTransform: "uppercase", padding: "2px 7px", border: `1px solid ${project.color}44`, borderRadius: 20 }}>
            {project.category}
          </div>
          <div style={{ fontSize: 7, color: badge.color, letterSpacing: "0.12em" }}>{badge.label}</div>
        </div>

        <h3 style={{ fontSize: 14, color: "#fff", marginBottom: 7, lineHeight: 1.25, letterSpacing: "-0.01em" }}>
          {project.title}
        </h3>

        <p style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", lineHeight: 1.75, marginBottom: 12, display: isSel ? "block" : "-webkit-box", WebkitLineClamp: isSel ? "unset" : 2, WebkitBoxOrient: "vertical", overflow: isSel ? "visible" : "hidden" }}>
          {project.description}
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {project.tech.map((t) => (
            <span key={t} style={{ fontSize: 7, color: "rgba(255,255,255,0.4)", padding: "2px 6px", background: "rgba(255,255,255,0.05)", borderRadius: 4, border: "1px solid rgba(255,255,255,0.08)" }}>{t}</span>
          ))}
        </div>

        {isSel && (
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", lineHeight: 1.65, borderLeft: `2px solid ${project.color}44`, paddingLeft: 10, marginBottom: 12 }}>
              {project.layers.logic}
            </div>
            {hasLink
              ? <a href={project.link} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{ fontSize: 8, color: project.color, textDecoration: "none", letterSpacing: "0.15em", textTransform: "uppercase", borderBottom: `1px solid ${project.color}66`, paddingBottom: 2 }}>View Project →</a>
              : <span style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", letterSpacing: "0.12em", textTransform: "uppercase" }}>{project.status === "IN_PROGRESS" ? "In Development" : "Coming Soon"}</span>
            }
          </div>
        )}
      </div>
    </div>
  );
}

// ── Skill matrix row ──────────────────────────────────────────────
function SkillGroup({ g }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
        <div style={{ fontSize: 7, letterSpacing: "0.2em", color: g.color, textTransform: "uppercase", fontFamily: "'Space Mono',monospace" }}>{g.domain}</div>
        <div style={{ flex: 1, height: 1, background: `${g.color}30` }} />
        <div style={{ fontSize: 6.5, color: g.color, padding: "2px 6px", border: `1px solid ${g.color}40`, borderRadius: 10, fontFamily: "'Space Mono',monospace", letterSpacing: "0.1em" }}>{g.tier}</div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
        {g.skills.map((s) => (
          <span key={s} style={{ fontFamily: "'Space Mono',monospace", fontSize: 7.5, padding: "3px 9px", background: `${g.color}12`, border: `1px solid ${g.color}35`, borderRadius: 4, color: "rgba(255,255,255,0.68)", whiteSpace: "nowrap" }}>{s}</span>
        ))}
      </div>
    </div>
  );
}

// ── FluidMotion scene root ────────────────────────────────────────
export default function FluidMotion() {
  const projects = useStore((s) => s.projects);
  const cols = 3, cardW = 276, gapX = 16, gapY = 14;
  const totalW = cols * cardW + (cols - 1) * gapX;

  return (
    <>
      <color attach="background" args={["#03090f"]} />
      <ambientLight intensity={0.4} color="#c8d8ff" />
      <WaveBackground />
      <fogExp2 attach="fog" color="#020c1a" density={0.018} />

      {/* Project grid */}
      <Html position={[0, 1.6, 0]} transform={false} style={{ width: totalW, pointerEvents: "all" }} distanceFactor={18}>
        <style>{`@keyframes ripple{0%{width:0;height:0;opacity:.6}100%{width:290px;height:290px;opacity:0}}`}</style>

        <div style={{ fontFamily: "'Space Mono',monospace", textAlign: "center", marginBottom: 22 }}>
          <div style={{ fontSize: 8, letterSpacing: "0.35em", color: "#00d4ff88", textTransform: "uppercase", marginBottom: 5 }}>Selected Work</div>
          <div style={{ fontSize: 20, color: "#fff", letterSpacing: "-0.02em" }}>{IDENTITY.name}</div>
          <div style={{ fontSize: 8, color: "rgba(255,255,255,0.28)", letterSpacing: "0.1em", marginTop: 5 }}>{IDENTITY.tagline}</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, ${cardW}px)`, gap: `${gapY}px ${gapX}px` }}>
          {projects.map((p) => <ProjectCard key={p.id} project={p} />)}
        </div>
      </Html>

      {/* Skill matrix */}
      <Html position={[0, -3.4, 0]} transform={false} style={{ width: totalW, pointerEvents: "none" }} distanceFactor={18}>
        <div style={{ background: "rgba(2,12,26,0.80)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)", border: "1px solid rgba(0,212,255,0.12)", borderRadius: 14, padding: "18px 22px", marginTop: 14 }}>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 7.5, letterSpacing: "0.3em", color: "#00d4ff88", textTransform: "uppercase", marginBottom: 14 }}>Skill Matrix</div>
          {SKILL_MATRIX.map((g) => <SkillGroup key={g.domain} g={g} />)}
          <div style={{ marginTop: 8, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.06)", fontFamily: "'Space Mono',monospace", fontSize: 7.5, color: "rgba(255,255,255,0.28)", letterSpacing: "0.1em" }}>
            ⚡ {IDENTITY.fitness.philosophy} · {IDENTITY.fitness.focus}
          </div>
        </div>
      </Html>
    </>
  );
}
