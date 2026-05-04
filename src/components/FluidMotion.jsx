// @ts-nocheck
// FILE 7/10 — src/components/FluidMotion.jsx  ── v3 FINAL

import { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import useStore from "../store/useThemeStore";
import { IDENTITY, SKILL_MATRIX, STATUS_META } from "../config/identity";

const VW       = window.innerWidth;
const isMobile = VW < 700;

// ── GLSL Wave Background ──────────────────────────────────────────
const waveVert = /* glsl */`
  varying vec2 vUv; varying float vWave; uniform float uTime;
  void main() {
    vUv = uv; vec3 p = position;
    float w = sin(p.x*1.1+uTime*0.5)*0.15 + sin(p.y*1.6+uTime*0.35)*0.10 + sin((p.x+p.y)*0.8+uTime*0.25)*0.07;
    p.z += w; vWave = w;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.0);
  }
`;
const waveFrag = /* glsl */`
  varying vec2 vUv; varying float vWave; uniform float uTime;
  void main() {
    vec3 deep=vec3(0.01,0.04,0.14); vec3 mid=vec3(0.02,0.13,0.30); vec3 hi=vec3(0.0,0.48,0.76);
    float g=smoothstep(0.0,1.0,vUv.y+vWave*0.3);
    vec3 col=mix(deep,mix(mid,hi,g*0.55),g);
    vec2 gf=fract(vUv*22.0);
    float ln=max(1.0-smoothstep(0.0,0.045,gf.x),1.0-smoothstep(0.0,0.045,gf.y));
    col+=vec3(0.0,0.5,0.9)*ln*(0.07+vWave*0.1);
    float sp=pow(max(0.0,vWave*2.2),3.0)*0.35;
    col+=vec3(sp*0.3,sp*0.7,sp);
    gl_FragColor=vec4(col,1.0);
  }
`;

function WaveBackground() {
  const mat  = useRef();
  const u    = useMemo(() => ({ uTime: { value: 0 } }), []);
  useFrame(({ clock }) => { if (mat.current) mat.current.uniforms.uTime.value = clock.getElapsedTime(); });
  return (
    <mesh position={[0, 0, -9]} rotation={[-Math.PI * 0.1, 0, 0]}>
      <planeGeometry args={[90, 55, isMobile ? 40 : 100, isMobile ? 28 : 70]} />
      <shaderMaterial ref={mat} vertexShader={waveVert} fragmentShader={waveFrag} uniforms={u} side={THREE.DoubleSide} />
    </mesh>
  );
}

// ── Full-screen project modal ─────────────────────────────────────
function ProjectModal({ project, onClose }) {
  const badge   = STATUS_META[project.status];
  const hasLink = project.link && !["ADD_LINK_LATER","UNDER_DEVELOPMENT","PLANNING_PHASE"].includes(project.link);
  return (
    <div style={{ position:"fixed", inset:0, zIndex:200, display:"flex", alignItems:"flex-end", justifyContent:"center" }}>
      <div onClick={onClose} style={{ position:"absolute", inset:0, background:"rgba(0,0,20,0.7)", backdropFilter:"blur(6px)" }} />
      <div style={{
        position:"relative", width:"100%", maxWidth:540,
        maxHeight:"82vh", overflowY:"auto",
        background:"linear-gradient(160deg,#06061a 0%,#0a0a22 100%)",
        border:`1px solid ${project.color}55`,
        borderRadius:"22px 22px 0 0",
        padding:"24px 22px 36px",
        fontFamily:"'Space Mono',monospace", color:"#fff",
        boxShadow:`0 -10px 70px ${project.color}33`,
      }}>
        {/* Handle */}
        <div style={{ width:40, height:4, background:"rgba(255,255,255,0.18)", borderRadius:2, margin:"0 auto 22px" }} />

        {/* Top row */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
          <span style={{ fontSize:10, color:badge.color, letterSpacing:"0.18em", fontWeight:700 }}>{badge.label}</span>
          <button onClick={onClose} style={{ fontSize:20, color:"rgba(255,255,255,0.38)", background:"none", border:"none", cursor:"pointer", lineHeight:1 }}>✕</button>
        </div>

        <div style={{ fontSize:10, color:project.color, letterSpacing:"0.2em", textTransform:"uppercase", marginBottom:8 }}>{project.category}</div>
        <h2 style={{ fontSize:isMobile?22:26, fontWeight:700, marginBottom:14, lineHeight:1.2, letterSpacing:"-0.02em" }}>{project.title}</h2>
        <p style={{ fontSize:isMobile?13:14, color:"rgba(255,255,255,0.62)", lineHeight:1.82, marginBottom:18 }}>{project.description}</p>

        {/* Logic quote */}
        <div style={{ fontSize:isMobile?11:12, color:"rgba(255,255,255,0.38)", lineHeight:1.75, borderLeft:`3px solid ${project.color}55`, paddingLeft:14, marginBottom:22, fontStyle:"italic" }}>
          {project.layers.logic}
        </div>

        {/* Tech */}
        <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:28 }}>
          {project.tech.map(t=>(
            <span key={t} style={{ fontSize:isMobile?11:12, padding:"6px 14px", border:`1px solid ${project.color}55`, borderRadius:30, color:project.color, background:`${project.color}14` }}>{t}</span>
          ))}
        </div>

        {/* CTA */}
        {hasLink
          ? <a href={project.link} target="_blank" rel="noopener noreferrer" style={{ display:"block", textAlign:"center", fontSize:isMobile?13:14, color:"#000", fontWeight:700, background:project.color, borderRadius:14, padding:"16px 28px", textDecoration:"none", letterSpacing:"0.1em", textTransform:"uppercase", boxShadow:`0 4px 24px ${project.color}55` }}>View Live Project →</a>
          : <div style={{ textAlign:"center", fontSize:12, color:"rgba(255,255,255,0.28)", letterSpacing:"0.14em", textTransform:"uppercase", padding:"16px", border:"1px solid rgba(255,255,255,0.1)", borderRadius:14 }}>
              {project.status==="IN_PROGRESS"?"⟳ Under Development":"◌ Planned for Future"}
            </div>
        }
      </div>
    </div>
  );
}

// ── Project card (summary only — tap opens modal) ─────────────────
function ProjectCard({ project }) {
  const setSelected = useStore((s) => s.setSelectedProject);
  const sel         = useStore((s) => s.selectedProject);
  const [hov, setHov] = useState(false);
  const isSel = sel?.id === project.id;
  const badge = STATUS_META[project.status];

  return (
    <>
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        onClick={() => setSelected(isSel ? null : project)}
        style={{
          borderRadius:16,
          padding:"20px 20px",
          cursor:"pointer",
          background: hov
            ? `linear-gradient(140deg,${project.color}28 0%,rgba(0,200,255,0.1) 100%)`
            : "rgba(255,255,255,0.06)",
          backdropFilter:"blur(22px)",
          WebkitBackdropFilter:"blur(22px)",
          border:`1px solid ${hov ? project.color+"77" : "rgba(255,255,255,0.1)"}`,
          boxShadow: hov ? `0 6px 28px ${project.color}22` : "0 2px 12px rgba(0,0,0,0.35)",
          transition:"all 0.3s cubic-bezier(0.23,1,0.32,1)",
          transform: hov ? "translateY(-3px)" : "translateY(0)",
          fontFamily:"'Space Mono',monospace",
          position:"relative",
          overflow:"hidden",
        }}
      >
        {/* Colour accent top bar */}
        <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:`linear-gradient(90deg, ${project.color}, ${project.color}44)`, borderRadius:"16px 16px 0 0" }} />

        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10, marginTop:4 }}>
          <div style={{ fontSize:8, color:project.color, letterSpacing:"0.16em", textTransform:"uppercase", padding:"3px 9px", border:`1px solid ${project.color}44`, borderRadius:20 }}>
            {project.category}
          </div>
          <div style={{ fontSize:8, color:badge.color, letterSpacing:"0.1em", fontWeight:700, flexShrink:0, marginLeft:6 }}>{badge.label}</div>
        </div>

        {/* Title */}
        <h3 style={{ fontSize:isMobile?16:15, color:"#ffffff", marginBottom:8, lineHeight:1.3, letterSpacing:"-0.01em", fontWeight:700 }}>
          {project.title}
        </h3>

        {/* Description — 2 lines */}
        <p style={{ fontSize:isMobile?12:10, color:"rgba(255,255,255,0.58)", lineHeight:1.78, marginBottom:14, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
          {project.description}
        </p>

        {/* Tech pills */}
        <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:16 }}>
          {project.tech.slice(0, isMobile ? 3 : 5).map(t=>(
            <span key={t} style={{ fontSize:isMobile?9:8, color:"rgba(255,255,255,0.48)", padding:"3px 8px", background:"rgba(255,255,255,0.06)", borderRadius:5, border:"1px solid rgba(255,255,255,0.1)" }}>{t}</span>
          ))}
          {project.tech.length > (isMobile?3:5) && (
            <span style={{ fontSize:isMobile?9:8, color:"rgba(255,255,255,0.3)", padding:"3px 8px" }}>+{project.tech.length-(isMobile?3:5)}</span>
          )}
        </div>

        {/* CTA button — always visible */}
        <div style={{
          display:"inline-flex", alignItems:"center", gap:8,
          fontSize:isMobile?12:10, color:project.color,
          letterSpacing:"0.12em", textTransform:"uppercase",
          padding:"8px 16px",
          border:`1px solid ${project.color}66`,
          borderRadius:30,
          background:`${project.color}14`,
          fontWeight:700,
          transition:"all 0.25s",
          boxShadow: hov ? `0 0 16px ${project.color}44` : "none",
        }}>
          View Details
          <span style={{ fontSize:14 }}>→</span>
        </div>
      </div>

      {/* Modal */}
      {isSel && (
        <ProjectModal project={project} onClose={() => setSelected(null)} />
      )}
    </>
  );
}

// ── Skill row ─────────────────────────────────────────────────────
function SkillGroup({ g }) {
  return (
    <div style={{ marginBottom:18 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10, flexWrap:"wrap" }}>
        <span style={{ fontSize:isMobile?11:9, color:g.color, letterSpacing:"0.18em", textTransform:"uppercase", fontFamily:"'Space Mono',monospace", fontWeight:700 }}>{g.domain}</span>
        <div style={{ flex:1, minWidth:16, height:1, background:`${g.color}35` }} />
        <span style={{ fontSize:isMobile?9:8, color:g.color, padding:"3px 10px", border:`1px solid ${g.color}44`, borderRadius:20, fontFamily:"'Space Mono',monospace", letterSpacing:"0.1em", whiteSpace:"nowrap" }}>{g.tier}</span>
      </div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
        {g.skills.map(s=>(
          <span key={s} style={{ fontFamily:"'Space Mono',monospace", fontSize:isMobile?11:9, padding:"5px 12px", background:`${g.color}14`, border:`1px solid ${g.color}38`, borderRadius:6, color:"rgba(255,255,255,0.78)", whiteSpace:"nowrap" }}>{s}</span>
        ))}
      </div>
    </div>
  );
}

// ── FluidMotion root ──────────────────────────────────────────────
export default function FluidMotion() {
  const projects = useStore((s) => s.projects);

  return (
    <>
      <color attach="background" args={["#030810"]} />
      <ambientLight intensity={0.45} color="#c0d0ff" />
      <WaveBackground />
      <fogExp2 attach="fog" color="#020b18" density={0.016} />

      {/* Single Html overlay that owns the full page layout */}
      <Html transform={false} style={{ pointerEvents:"none" }}>
        <div style={{
          position:"fixed",
          inset:0,
          display:"flex",
          flexDirection:"column",
          overflowY:"auto",
          pointerEvents:"all",
          fontFamily:"'Space Mono',monospace",
        }}>
          <style>{`
            @keyframes ripple{0%{width:0;height:0;opacity:.55}100%{width:300px;height:300px;opacity:0}}
            ::-webkit-scrollbar{width:4px}
            ::-webkit-scrollbar-thumb{background:rgba(0,180,255,0.35);border-radius:2px}
          `}</style>

          {/* ── Page content ──────────────────────────────────────── */}
          <div style={{ padding: isMobile ? "80px 16px 100px" : "80px 32px 120px", maxWidth:960, margin:"0 auto", width:"100%" }}>

            {/* Header */}
            <div style={{ textAlign:"center", marginBottom:isMobile?28:36 }}>
              <div style={{ fontSize:isMobile?10:9, letterSpacing:"0.35em", color:"#00d4ff88", textTransform:"uppercase", marginBottom:8 }}>Selected Work</div>
              <div style={{ fontSize:isMobile?28:32, color:"#fff", letterSpacing:"-0.025em", fontWeight:700, lineHeight:1 }}>{IDENTITY.name}</div>
              <div style={{ fontSize:isMobile?11:10, color:"rgba(255,255,255,0.36)", letterSpacing:"0.08em", marginTop:10, lineHeight:1.6 }}>{IDENTITY.tagline}</div>
            </div>

            {/* Cards grid */}
            <div style={{
              display:"grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(280px, 1fr))",
              gap: isMobile ? 14 : 18,
              marginBottom: isMobile ? 28 : 36,
            }}>
              {projects.map(p => <ProjectCard key={p.id} project={p} />)}
            </div>

            {/* Skill matrix */}
            <div style={{
              background:"rgba(2,10,22,0.85)",
              backdropFilter:"blur(20px)",
              WebkitBackdropFilter:"blur(20px)",
              border:"1px solid rgba(0,212,255,0.18)",
              borderRadius:18,
              padding: isMobile ? "20px 18px" : "26px 28px",
            }}>
              <div style={{ fontSize:isMobile?10:9, letterSpacing:"0.3em", color:"#00d4ff77", textTransform:"uppercase", marginBottom:isMobile?18:20, fontWeight:700 }}>Skill Matrix</div>
              {SKILL_MATRIX.map(g => <SkillGroup key={g.domain} g={g} />)}
              <div style={{ marginTop:14, paddingTop:14, borderTop:"1px solid rgba(255,255,255,0.07)", fontSize:isMobile?10:9, color:"rgba(255,255,255,0.3)", letterSpacing:"0.1em" }}>
                ⚡ {IDENTITY.fitness.philosophy} · {IDENTITY.fitness.focus}
              </div>
            </div>

          </div>
        </div>
      </Html>
    </>
  );
}
