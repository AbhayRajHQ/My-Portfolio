// @ts-nocheck
// FILE 8/10 — src/components/Assembly.jsx  ── v3 FINAL

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import useStore from "../store/useThemeStore";
import { IDENTITY, STATUS_META } from "../config/identity";

const VW       = window.innerWidth;
const isMobile = VW < 768;

// Layer config — colours are dark enough to read on white background
const LAYERS = [
  { key:"code",   label:"01 · CODE",   color:"#0055aa", lightBg:"#e8f0ff", barColor:"#0055aa" },
  { key:"design", label:"02 · DESIGN", color:"#005522", lightBg:"#e6f5ec", barColor:"#007733" },
  { key:"logic",  label:"03 · LOGIC",  color:"#882200", lightBg:"#fff0ea", barColor:"#cc3300" },
  { key:"result", label:"04 · RESULT", color:"#550066", lightBg:"#f8eeff", barColor:"#8800aa" },
];

// ── Single layer row ──────────────────────────────────────────────
function LayerRow({ layer, content, isActive, onToggle }) {
  return (
    <div style={{ marginBottom:10 }}>
      {/* Row button */}
      <button
        onClick={onToggle}
        style={{
          width:"100%", display:"flex", alignItems:"center", gap:12,
          background: isActive ? layer.lightBg : "rgba(200,206,220,0.35)",
          border:`1.5px solid ${isActive ? layer.color : "rgba(100,110,140,0.25)"}`,
          borderRadius:10, padding: isMobile ? "13px 16px" : "11px 16px",
          cursor:"pointer", textAlign:"left",
          transition:"all 0.25s ease",
          boxShadow: isActive ? `0 2px 14px ${layer.color}22` : "none",
        }}
      >
        {/* Colour pip */}
        <div style={{ width:10, height:10, borderRadius:"50%", background:layer.barColor, flexShrink:0, boxShadow: isActive ? `0 0 8px ${layer.barColor}` : "none" }} />

        {/* Label */}
        <span style={{ fontFamily:"'Space Mono',monospace", fontSize:isMobile?13:11, color:isActive ? layer.color : "#3a4258", letterSpacing:"0.1em", fontWeight:700, flex:1 }}>
          {layer.label}
        </span>

        {/* Chevron */}
        <span style={{ fontSize:14, color:isActive ? layer.color : "#8890a8", transition:"transform 0.25s", transform: isActive ? "rotate(180deg)" : "none", display:"inline-block" }}>▾</span>
      </button>

      {/* Expanded annotation */}
      {isActive && (
        <div style={{
          background: layer.lightBg,
          borderLeft:`3px solid ${layer.barColor}`,
          borderRadius:"0 0 10px 10px",
          padding: isMobile ? "14px 16px 14px 18px" : "12px 16px 12px 18px",
          fontFamily:"'Space Mono',monospace",
          fontSize: isMobile ? 12 : 10,
          color: layer.color,
          lineHeight:1.78,
          letterSpacing:"0.03em",
          marginTop:-2,
        }}>
          {content}
        </div>
      )}
    </div>
  );
}

// ── Project detail sheet ──────────────────────────────────────────
function ProjectSheet({ project, onClose, onPrev, onNext, idx, total }) {
  const [activeLayer, setActiveLayer] = useState(null);
  const badge   = STATUS_META[project.status];
  const hasLink = project.link && !["ADD_LINK_LATER","UNDER_DEVELOPMENT","PLANNING_PHASE"].includes(project.link);

  return (
    <div style={{
      background:"#f4f6fa",
      borderRadius:20,
      overflow:"hidden",
      boxShadow:"0 8px 60px rgba(0,0,0,0.18)",
      border:"1px solid rgba(100,110,140,0.2)",
      fontFamily:"'Space Mono',monospace",
      maxWidth:560,
      margin:"0 auto",
      width:"100%",
    }}>
      {/* Colour header strip */}
      <div style={{ background:`linear-gradient(120deg, ${project.color} 0%, ${project.color}bb 100%)`, padding: isMobile?"20px 20px 18px":"22px 24px 20px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
          <span style={{ fontSize:9, color:"rgba(255,255,255,0.8)", letterSpacing:"0.22em", textTransform:"uppercase", background:"rgba(0,0,0,0.25)", padding:"3px 10px", borderRadius:20 }}>
            {badge.label.replace(/[●◑○] /,"")}
          </span>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <span style={{ fontSize:10, color:"rgba(255,255,255,0.7)", letterSpacing:"0.1em" }}>
              {String(idx+1).padStart(2,"0")} / {String(total).padStart(2,"0")}
            </span>
          </div>
        </div>
        <h2 style={{ fontSize:isMobile?22:24, color:"#fff", fontWeight:700, lineHeight:1.2, marginBottom:6, letterSpacing:"-0.02em" }}>
          {project.title}
        </h2>
        <div style={{ fontSize:10, color:"rgba(255,255,255,0.75)", letterSpacing:"0.18em", textTransform:"uppercase" }}>
          {project.category}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: isMobile?"18px 18px 24px":"20px 24px 28px", overflowY:"auto", maxHeight: isMobile?"62vh":"68vh" }}>

        {/* Description */}
        <p style={{ fontSize:isMobile?13:12, color:"#3a4258", lineHeight:1.82, marginBottom:20 }}>
          {project.description}
        </p>

        {/* Tech */}
        <div style={{ display:"flex", flexWrap:"wrap", gap:7, marginBottom:22 }}>
          {project.tech.map(t=>(
            <span key={t} style={{ fontSize:isMobile?11:10, padding:"5px 12px", border:`1.5px solid ${project.color}55`, borderRadius:30, color:project.color, background:`${project.color}12`, fontWeight:700 }}>{t}</span>
          ))}
        </div>

        {/* Layers heading */}
        <div style={{ fontSize:9, letterSpacing:"0.28em", color:"#6870888", textTransform:"uppercase", marginBottom:12, color:"#7880a0" }}>
          Tap a layer to inspect
        </div>

        {/* Four layers */}
        {LAYERS.map(ld=>(
          <LayerRow
            key={ld.key}
            layer={ld}
            content={project.layers[ld.key]}
            isActive={activeLayer===ld.key}
            onToggle={()=>setActiveLayer(activeLayer===ld.key ? null : ld.key)}
          />
        ))}

        {/* CTA */}
        <div style={{ marginTop:22 }}>
          {hasLink
            ? <a href={project.link} target="_blank" rel="noopener noreferrer" style={{ display:"block", textAlign:"center", fontSize:isMobile?14:13, color:"#fff", fontWeight:700, background:project.color, borderRadius:14, padding:"16px 28px", textDecoration:"none", letterSpacing:"0.1em", textTransform:"uppercase", boxShadow:`0 4px 22px ${project.color}44` }}>
                View Live Project →
              </a>
            : <div style={{ textAlign:"center", fontSize:12, color:"#8890a8", letterSpacing:"0.14em", textTransform:"uppercase", padding:"16px", border:"1.5px solid rgba(100,110,140,0.25)", borderRadius:14 }}>
                {project.status==="IN_PROGRESS"?"⟳ Under Development":"◌ Planned for Future"}
              </div>
          }
        </div>
      </div>
    </div>
  );
}

// ── Assembly root — pure HTML layout on top of minimal 3D env ─────
export default function Assembly() {
  const projects = useStore((s) => s.projects);
  const [idx, setIdx] = useState(0);
  const project = projects[idx];

  const prev = () => setIdx(i => Math.max(0, i-1));
  const next = () => setIdx(i => Math.min(projects.length-1, i+1));

  return (
    <>
      {/* Minimal lab-white 3D environment */}
      <color attach="background" args={["#edf0f5"]} />
      <ambientLight intensity={2.5} color="#ffffff" />
      <directionalLight position={[4, 8, 4]}   intensity={0.8} color="#e8eaf6" />
      <directionalLight position={[-4, -4, -4]} intensity={0.4} color="#d0d4e8" />

      {/* Grid floor */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, -5, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial color="#dde0e8" transparent opacity={0.5} />
      </mesh>

      {/* Subtle grid lines */}
      {Array.from({length:11}).map((_,i)=>(
        <mesh key={`h${i}`} position={[0, -4.99, (i-5)*4]} rotation={[-Math.PI/2,0,0]}>
          <planeGeometry args={[80, 0.01]} />
          <meshBasicMaterial color="#c8ccd8" />
        </mesh>
      ))}
      {Array.from({length:11}).map((_,i)=>(
        <mesh key={`v${i}`} position={[(i-5)*4, -4.99, 0]} rotation={[-Math.PI/2,0,0]}>
          <planeGeometry args={[0.01, 80]} />
          <meshBasicMaterial color="#c8ccd8" />
        </mesh>
      ))}

      {/* Full HTML UI overlay */}
      <Html transform={false} style={{ pointerEvents:"none" }}>
        <div style={{
          position:"fixed", inset:0,
          display:"flex", flexDirection:"column",
          pointerEvents:"all",
          fontFamily:"'Space Mono',monospace",
          overflowY:"auto",
        }}>
          <style>{`
            ::-webkit-scrollbar{width:4px}
            ::-webkit-scrollbar-thumb{background:rgba(80,90,140,0.3);border-radius:2px}
          `}</style>

          <div style={{ padding: isMobile?"80px 14px 100px":"80px 24px 100px", maxWidth:600, margin:"0 auto", width:"100%" }}>

            {/* Page header */}
            <div style={{ marginBottom:isMobile?20:24 }}>
              <div style={{ fontSize:9, letterSpacing:"0.3em", color:"#7880a0", textTransform:"uppercase", marginBottom:6 }}>Deconstruct · Exploded View</div>
              <div style={{ fontSize:isMobile?20:24, color:"#1a1e2e", fontWeight:700, letterSpacing:"-0.02em", lineHeight:1.2 }}>
                {IDENTITY.name}
              </div>
              <div style={{ fontSize:isMobile?10:9, color:"#8890a8", letterSpacing:"0.08em", marginTop:6 }}>
                {isMobile ? "Tap layers to inspect · swipe below to navigate" : "Click layers to annotate · use arrows to navigate"}
              </div>
            </div>

            {/* Project sheet */}
            <ProjectSheet
              project={project}
              idx={idx}
              total={projects.length}
              onClose={() => {}}
              onPrev={prev}
              onNext={next}
            />

            {/* Navigation */}
            <div style={{
              display:"flex", justifyContent:"center",
              alignItems:"center", gap:isMobile?14:12,
              marginTop:isMobile?20:18,
            }}>
              <button
                onClick={prev} disabled={idx===0}
                style={{ fontFamily:"'Space Mono',monospace", background:"#fff", border:"1.5px solid #c8cdd8", borderRadius:10, padding: isMobile?"10px 20px":"8px 16px", cursor:idx===0?"not-allowed":"pointer", color:idx===0?"#c0c8d8":"#1a1e2e", fontSize:isMobile?16:13, boxShadow:"0 2px 8px rgba(0,0,0,0.08)", transition:"all 0.2s", opacity:idx===0?0.4:1 }}
              >← Prev</button>

              {/* Dot indicators */}
              <div style={{ display:"flex", gap:isMobile?10:8, alignItems:"center" }}>
                {projects.map((p,i)=>(
                  <button key={p.id} onClick={()=>setIdx(i)} style={{ width:i===idx?(isMobile?28:22):isMobile?11:8, height:isMobile?11:8, borderRadius:6, border:"none", background:i===idx?p.color:"#b0b8cc", cursor:"pointer", transition:"all 0.3s", padding:0, boxShadow:i===idx?`0 0 10px ${p.color}aa`:"none" }} />
                ))}
              </div>

              <button
                onClick={next} disabled={idx===projects.length-1}
                style={{ fontFamily:"'Space Mono',monospace", background:"#fff", border:"1.5px solid #c8cdd8", borderRadius:10, padding: isMobile?"10px 20px":"8px 16px", cursor:idx===projects.length-1?"not-allowed":"pointer", color:idx===projects.length-1?"#c0c8d8":"#1a1e2e", fontSize:isMobile?16:13, boxShadow:"0 2px 8px rgba(0,0,0,0.08)", transition:"all 0.2s", opacity:idx===projects.length-1?0.4:1 }}
              >Next →</button>
            </div>

          </div>
        </div>
      </Html>
    </>
  );
}
