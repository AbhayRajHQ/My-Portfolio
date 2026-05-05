// @ts-nocheck
// FILE — src/components/UILayer.jsx  ── v4 FINAL
// ALL HTML lives here, rendered as a sibling of <Canvas>, never inside it.
// This eliminates every mobile scaling / visibility bug.

import { useState } from "react";
import useStore from "../store/useThemeStore";
import { IDENTITY, SOCIAL_ICONS, SKILL_MATRIX, STATUS_META } from "../config/identity";

import { THEMES, THEME_ORDER } from "../config/themes";

// ── Project stats (separate component so useStore hook is legal) ──
function ProjectStats({ isLight }) {
  const projects = useStore(s => s.projects);
  const stats = [
    { label: "Live",     color: STATUS_META.COMPLETED.color,   key: "COMPLETED" },
    { label: "Building", color: STATUS_META.IN_PROGRESS.color, key: "IN_PROGRESS" },
    { label: "Planned",  color: STATUS_META.FUTURE.color,      key: "FUTURE" },
  ];
  return (
    <div style={{ fontFamily: "'Space Mono',monospace", textAlign: "right" }}>
      <div style={{ fontSize: isMobile ? 8 : 7, letterSpacing: "0.2em", color: isLight ? "rgba(26,30,46,0.4)" : "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 6 }}>Projects</div>
      {stats.map(({ label, color, key }) => {
        const count = projects.filter(p => p.status === key).length;
        return (
          <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 7, marginBottom: 4 }}>
            <span style={{ fontSize: isMobile ? 9 : 8, color: isLight ? "rgba(26,30,46,0.5)" : "rgba(255,255,255,0.4)" }}>{label}</span>
            <span style={{ fontSize: isMobile ? 12 : 11, color, fontWeight: 700, minWidth: 14, textAlign: "right" }}>{count}</span>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: color, boxShadow: `0 0 6px ${color}99`, flexShrink: 0 }} />
          </div>
        );
      })}
    </div>
  );
}

const isMobile = window.innerWidth < 768;

// ─────────────────────────────────────────────────────────────────
// SHARED — Social icon button
// ─────────────────────────────────────────────────────────────────
function SocialBtn({ icon, isLight }) {
  const [hov, setHov] = useState(false);
  const fg = isLight ? "#1a1e2e" : "#ffffffcc";
  return (
    <a
      href={icon.url} target="_blank" rel="noopener noreferrer" title={icon.label}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: isMobile ? 36 : 30, height: isMobile ? 36 : 30, borderRadius: 8,
        border: `1px solid ${hov ? (isLight ? "#1a1e2e88" : "rgba(255,255,255,0.35)") : (isLight ? "rgba(30,35,60,0.18)" : "rgba(255,255,255,0.12)")}`,
        background: hov ? (isLight ? "rgba(26,30,46,0.08)" : "rgba(255,255,255,0.1)") : "transparent",
        cursor: "pointer", transition: "all 0.2s", textDecoration: "none",
      }}
    >
      <svg width={isMobile ? 14 : 12} height={isMobile ? 14 : 12} viewBox="0 0 24 24" fill={fg}>
        <path d={icon.d} />
      </svg>
    </a>
  );
}

// ─────────────────────────────────────────────────────────────────
// SHARED — Top HUD bar (name + social, always in top-left)
// ─────────────────────────────────────────────────────────────────
function TopBar({ isLight, accent }) {
  const fg      = isLight ? "#1a1e2e" : "#ffffff";
  const fgSub   = isLight ? "rgba(26,30,46,0.45)" : "rgba(255,255,255,0.38)";

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0,
      zIndex: 50,
      padding: isMobile ? "14px 16px 12px" : "18px 24px 14px",
      display: "flex", justifyContent: "space-between", alignItems: "flex-start",
      background: isLight
        ? "linear-gradient(to bottom, rgba(237,240,245,0.95) 70%, transparent)"
        : "linear-gradient(to bottom, rgba(4,4,15,0.88) 70%, transparent)",
      backdropFilter: "blur(8px)",
      WebkitBackdropFilter: "blur(8px)",
    }}>
      {/* Identity */}
      <div style={{ fontFamily: "'Space Mono',monospace" }}>
        <div style={{ fontSize: isMobile ? 9 : 8, letterSpacing: "0.3em", color: accent, textTransform: "uppercase", marginBottom: 2 }}>
          @{IDENTITY.handle}
        </div>
        <div style={{ fontSize: isMobile ? 20 : 22, color: fg, letterSpacing: "-0.025em", lineHeight: 1, fontWeight: 700 }}>
          {IDENTITY.name}
        </div>
        {!isMobile && (
          <div style={{ fontSize: 8, color: fgSub, letterSpacing: "0.06em", marginTop: 4, maxWidth: 240, lineHeight: 1.5 }}>
            {IDENTITY.tagline}
          </div>
        )}
        {/* Social icons */}
        <div style={{ display: "flex", gap: 6, marginTop: isMobile ? 8 : 10 }}>
          {SOCIAL_ICONS.map(ic => <SocialBtn key={ic.label} icon={ic} isLight={isLight} />)}
        </div>
      </div>

      {/* Project stats — right side */}
      <ProjectStats isLight={isLight} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// SHARED — Physics toggle (bottom-right)
// ─────────────────────────────────────────────────────────────────
function PhysicsToggle({ isLight, accent, themeConfig }) {
  const setTheme        = useStore(s => s.setTheme);
  const currentTheme    = useStore(s => s.currentTheme);
  const isTransitioning = useStore(s => s.isTransitioning);
  const [open, setOpen] = useState(false);

  const fg      = isLight ? "#1a1e2e" : "#ffffff";
  const panelBg = isLight ? "rgba(237,240,245,0.95)" : "rgba(5,5,18,0.92)";
  const border  = isLight ? "rgba(30,35,60,0.14)"    : "rgba(255,255,255,0.12)";

  return (
    <div style={{
      position: "fixed", bottom: isMobile ? 20 : 28, right: isMobile ? 12 : 24,
      zIndex: 50, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8,
      fontFamily: "'Space Mono',monospace",
    }}>
      {/* Expanded menu */}
      {open && (
        <div style={{
          background: panelBg, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          border: `1px solid ${border}`, borderRadius: 14,
          padding: "14px 16px", display: "flex", flexDirection: "column", gap: 6,
          boxShadow: "0 8px 40px rgba(0,0,0,0.28)", minWidth: 220,
        }}>
          <div style={{ fontSize: 8, letterSpacing: "0.25em", color: accent, textTransform: "uppercase", marginBottom: 4, paddingBottom: 8, borderBottom: `1px solid ${border}` }}>
            Physics Toggle
          </div>
          {THEME_ORDER.map(id => {
            const cfg    = THEMES[id];
            const active = id === currentTheme;
            return (
              <button key={id}
                onClick={() => { setTheme(id); setOpen(false); }}
                disabled={isTransitioning}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  background: active ? `${cfg.accent}1a` : "transparent",
                  border: `1px solid ${active ? cfg.accent + "66" : "transparent"}`,
                  borderRadius: 8, padding: "10px 12px", cursor: "pointer",
                  opacity: active ? 1 : 0.55, textAlign: "left", fontFamily: "inherit",
                  transition: "all 0.25s",
                }}
              >
                <span style={{ fontSize: 16, minWidth: 22 }}>{cfg.icon}</span>
                <span style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: active ? cfg.accent : fg, fontWeight: 700, letterSpacing: "0.06em" }}>{cfg.label}</div>
                  <div style={{ fontSize: 8, color: active ? cfg.accent + "aa" : (isLight ? "#666" : "rgba(255,255,255,0.35)"), letterSpacing: "0.05em", marginTop: 2 }}>{cfg.sublabel}</div>
                </span>
                {active && <div style={{ width: 7, height: 7, borderRadius: "50%", background: cfg.accent, boxShadow: `0 0 8px ${cfg.accent}` }} />}
              </button>
            );
          })}
        </div>
      )}

      {/* Toggle pill */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: "flex", alignItems: "center", gap: 10,
          background: panelBg, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          border: `1px solid ${open ? accent + "88" : border}`,
          borderRadius: 40, padding: isMobile ? "10px 18px 10px 14px" : "10px 18px 10px 14px",
          cursor: "pointer", fontFamily: "inherit",
          boxShadow: open ? `0 0 22px ${accent}33` : "0 2px 16px rgba(0,0,0,0.2)",
          transition: "all 0.3s",
        }}
      >
        <div style={{ position: "relative", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {isTransitioning && (
            <div style={{ position: "absolute", inset: -3, borderRadius: "50%", border: `2px solid ${accent}`, animation: "pulseRing 1.2s ease-out infinite" }} />
          )}
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: accent, boxShadow: `0 0 10px ${accent}` }} />
        </div>
        <div>
          <div style={{ fontSize: 8, color: accent, letterSpacing: "0.18em", textTransform: "uppercase" }}>
            {isTransitioning ? "morphing…" : "Physics"}
          </div>
          <div style={{ fontSize: isMobile ? 12 : 11, color: fg, fontWeight: 700, letterSpacing: "0.04em" }}>
            {themeConfig.label}
          </div>
        </div>
        <span style={{ fontSize: 10, color: isLight ? "#666" : "rgba(255,255,255,0.3)", marginLeft: 2, display: "inline-block", transition: "transform 0.3s", transform: open ? "rotate(180deg)" : "none" }}>▲</span>
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// GRAVITY WELL — bottom-sheet detail panel
// ─────────────────────────────────────────────────────────────────
function GravityDetailSheet() {
  const project   = useStore(s => s.selectedProject);
  const setSelect = useStore(s => s.setSelectedProject);
  if (!project) return null;

  const badge   = STATUS_META[project.status];
  const hasLink = project.link && !["ADD_LINK_LATER","UNDER_DEVELOPMENT","PLANNING_PHASE"].includes(project.link);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 80,
      display: "flex", alignItems: "flex-end", justifyContent: "center",
    }}>
      {/* Backdrop */}
      <div
        onClick={() => setSelect(null)}
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,20,0.65)", backdropFilter: "blur(5px)" }}
      />
      {/* Sheet */}
      <div style={{
        position: "relative", zIndex: 1,
        width: "100%", maxWidth: 540,
        maxHeight: "75vh", overflowY: "auto",
        background: "linear-gradient(160deg,#07071e 0%,#0c0c28 100%)",
        border: `1px solid ${project.color}55`,
        borderRadius: "22px 22px 0 0",
        padding: isMobile ? "8px 20px 36px" : "8px 28px 40px",
        fontFamily: "'Space Mono',monospace", color: "#fff",
        boxShadow: `0 -12px 70px ${project.color}33`,
      }}>
        {/* Handle */}
        <div style={{ width: 40, height: 4, background: "rgba(255,255,255,0.18)", borderRadius: 2, margin: "12px auto 20px" }} />

        {/* Status + close */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <span style={{ fontSize: 10, color: badge.color, letterSpacing: "0.2em", fontWeight: 700 }}>{badge.label}</span>
          <button onClick={() => setSelect(null)} style={{ fontSize: 22, color: "rgba(255,255,255,0.4)", background: "none", border: "none", cursor: "pointer", lineHeight: 1, padding: "2px 8px" }}>✕</button>
        </div>

        {/* Category */}
        <div style={{ fontSize: 10, color: project.color, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 10 }}>
          {project.category}
        </div>

        {/* Title */}
        <h2 style={{ fontSize: isMobile ? 24 : 28, fontWeight: 700, marginBottom: 16, lineHeight: 1.2, letterSpacing: "-0.02em" }}>
          {project.title}
        </h2>

        {/* Description */}
        <p style={{ fontSize: isMobile ? 13 : 14, color: "rgba(255,255,255,0.62)", lineHeight: 1.85, marginBottom: 20 }}>
          {project.description}
        </p>

        {/* Logic quote */}
        <div style={{ fontSize: isMobile ? 11 : 12, color: "rgba(255,255,255,0.38)", lineHeight: 1.78, borderLeft: `3px solid ${project.color}55`, paddingLeft: 14, marginBottom: 22 }}>
          {project.layers.logic}
        </div>

        {/* Tech pills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 28 }}>
          {project.tech.map(t => (
            <span key={t} style={{ fontSize: isMobile ? 12 : 12, padding: "7px 16px", border: `1px solid ${project.color}55`, borderRadius: 30, color: project.color, background: `${project.color}14` }}>{t}</span>
          ))}
        </div>

        {/* CTA */}
        {hasLink
          ? <a href={project.link} target="_blank" rel="noopener noreferrer" style={{ display: "block", textAlign: "center", fontSize: isMobile ? 14 : 14, color: "#000", fontWeight: 700, background: project.color, borderRadius: 14, padding: "17px 28px", textDecoration: "none", letterSpacing: "0.1em", textTransform: "uppercase", boxShadow: `0 4px 24px ${project.color}55` }}>
              View Live Project →
            </a>
          : <div style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.3)", letterSpacing: "0.14em", textTransform: "uppercase", padding: "17px", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14 }}>
              {project.status === "IN_PROGRESS" ? "⟳ Under Development" : "◌ Planned for Future"}
            </div>
        }
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// FLUID MOTION — full scrollable project grid
// ─────────────────────────────────────────────────────────────────
function FluidProjectModal({ project, onClose }) {
  const badge   = STATUS_META[project.status];
  const hasLink = project.link && !["ADD_LINK_LATER","UNDER_DEVELOPMENT","PLANNING_PHASE"].includes(project.link);
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 90, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,20,0.72)", backdropFilter: "blur(6px)" }} />
      <div style={{
        position: "relative", zIndex: 1,
        width: "100%", maxWidth: 540,
        maxHeight: "80vh", overflowY: "auto",
        background: "linear-gradient(160deg,#06061a 0%,#0a0a24 100%)",
        border: `1px solid ${project.color}55`,
        borderRadius: "22px 22px 0 0",
        padding: isMobile ? "8px 20px 36px" : "8px 28px 40px",
        fontFamily: "'Space Mono',monospace", color: "#fff",
        boxShadow: `0 -12px 70px ${project.color}33`,
      }}>
        <div style={{ width: 40, height: 4, background: "rgba(255,255,255,0.18)", borderRadius: 2, margin: "12px auto 20px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <span style={{ fontSize: 10, color: badge.color, fontWeight: 700, letterSpacing: "0.2em" }}>{badge.label}</span>
          <button onClick={onClose} style={{ fontSize: 22, color: "rgba(255,255,255,0.38)", background: "none", border: "none", cursor: "pointer", lineHeight: 1 }}>✕</button>
        </div>
        <div style={{ fontSize: 10, color: project.color, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 10 }}>{project.category}</div>
        <h2 style={{ fontSize: isMobile ? 23 : 27, fontWeight: 700, marginBottom: 16, lineHeight: 1.2, letterSpacing: "-0.02em" }}>{project.title}</h2>
        <p style={{ fontSize: isMobile ? 13 : 14, color: "rgba(255,255,255,0.62)", lineHeight: 1.85, marginBottom: 20 }}>{project.description}</p>
        <div style={{ fontSize: isMobile ? 11 : 12, color: "rgba(255,255,255,0.38)", lineHeight: 1.78, borderLeft: `3px solid ${project.color}55`, paddingLeft: 14, marginBottom: 22 }}>{project.layers.logic}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 28 }}>
          {project.tech.map(t => <span key={t} style={{ fontSize: 12, padding: "7px 16px", border: `1px solid ${project.color}55`, borderRadius: 30, color: project.color, background: `${project.color}14` }}>{t}</span>)}
        </div>
        {hasLink
          ? <a href={project.link} target="_blank" rel="noopener noreferrer" style={{ display: "block", textAlign: "center", fontSize: 14, color: "#000", fontWeight: 700, background: project.color, borderRadius: 14, padding: "17px 28px", textDecoration: "none", letterSpacing: "0.1em", textTransform: "uppercase", boxShadow: `0 4px 24px ${project.color}55` }}>View Live Project →</a>
          : <div style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.3)", letterSpacing: "0.14em", textTransform: "uppercase", padding: "17px", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14 }}>
              {project.status === "IN_PROGRESS" ? "⟳ Under Development" : "◌ Planned for Future"}
            </div>
        }
      </div>
    </div>
  );
}

function FluidCard({ project }) {
  const setSelected = useStore(s => s.setSelectedProject);
  const selected    = useStore(s => s.selectedProject);
  const [hov, setHov] = useState(false);
  const isSel = selected?.id === project.id;
  const badge = STATUS_META[project.status];
  return (
    <>
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        onClick={() => setSelected(isSel ? null : project)}
        style={{
          borderRadius: 16, padding: "20px", cursor: "pointer",
          background: hov ? `linear-gradient(140deg,${project.color}28 0%,rgba(0,200,255,0.1) 100%)` : "rgba(255,255,255,0.07)",
          backdropFilter: "blur(22px)", WebkitBackdropFilter: "blur(22px)",
          border: `1px solid ${hov ? project.color + "77" : "rgba(255,255,255,0.12)"}`,
          boxShadow: hov ? `0 6px 28px ${project.color}22` : "0 2px 12px rgba(0,0,0,0.35)",
          transition: "all 0.3s cubic-bezier(0.23,1,0.32,1)",
          transform: hov ? "translateY(-3px)" : "translateY(0)",
          fontFamily: "'Space Mono',monospace",
          position: "relative", overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${project.color},${project.color}44)`, borderRadius: "16px 16px 0 0" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, marginTop: 4 }}>
          <div style={{ fontSize: 8, color: project.color, letterSpacing: "0.16em", textTransform: "uppercase", padding: "3px 9px", border: `1px solid ${project.color}44`, borderRadius: 20 }}>{project.category}</div>
          <div style={{ fontSize: 8, color: badge.color, letterSpacing: "0.1em", fontWeight: 700 }}>{badge.label}</div>
        </div>
        <h3 style={{ fontSize: isMobile ? 17 : 15, color: "#fff", marginBottom: 8, lineHeight: 1.3, fontWeight: 700 }}>{project.title}</h3>
        <p style={{ fontSize: isMobile ? 12 : 10, color: "rgba(255,255,255,0.58)", lineHeight: 1.78, marginBottom: 14, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{project.description}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 16 }}>
          {project.tech.slice(0, 3).map(t => <span key={t} style={{ fontSize: isMobile ? 10 : 8, color: "rgba(255,255,255,0.48)", padding: "3px 8px", background: "rgba(255,255,255,0.06)", borderRadius: 5, border: "1px solid rgba(255,255,255,0.1)" }}>{t}</span>)}
          {project.tech.length > 3 && <span style={{ fontSize: isMobile ? 10 : 8, color: "rgba(255,255,255,0.3)", padding: "3px 6px" }}>+{project.tech.length - 3}</span>}
        </div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: isMobile ? 12 : 10, color: project.color, letterSpacing: "0.12em", textTransform: "uppercase", padding: "9px 18px", border: `1px solid ${project.color}66`, borderRadius: 30, background: `${project.color}14`, fontWeight: 700, boxShadow: hov ? `0 0 16px ${project.color}44` : "none", transition: "box-shadow 0.25s" }}>
          View Details <span style={{ fontSize: 15 }}>→</span>
        </div>
      </div>
      {isSel && <FluidProjectModal project={project} onClose={() => setSelected(null)} />}
    </>
  );
}

function FluidUI() {
  const projects = useStore(s => s.projects);
  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      overflowY: "auto",
      paddingTop: isMobile ? 160 : 150,
      paddingBottom: isMobile ? 100 : 120,
      paddingLeft: isMobile ? 14 : 28,
      paddingRight: isMobile ? 14 : 28,
      fontFamily: "'Space Mono',monospace",
      pointerEvents: "all",
    }}>
      <style>{`@keyframes ripple{0%{width:0;height:0;opacity:.55}100%{width:300px;height:300px;opacity:0}}`}</style>

      {/* Section header */}
      <div style={{ textAlign: "center", marginBottom: isMobile ? 24 : 32 }}>
        <div style={{ fontSize: isMobile ? 10 : 9, letterSpacing: "0.35em", color: "#00d4ff88", textTransform: "uppercase", marginBottom: 8 }}>Selected Work</div>
        <div style={{ fontSize: isMobile ? 13 : 12, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", lineHeight: 1.6 }}>{IDENTITY.tagline}</div>
      </div>

      {/* Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(280px, 1fr))",
        gap: isMobile ? 14 : 18,
        maxWidth: 960, margin: "0 auto",
        marginBottom: isMobile ? 28 : 36,
      }}>
        {projects.map(p => <FluidCard key={p.id} project={p} />)}
      </div>

      {/* Skill matrix */}
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <div style={{ background: "rgba(2,10,22,0.88)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(0,212,255,0.18)", borderRadius: 18, padding: isMobile ? "20px 18px" : "26px 28px" }}>
          <div style={{ fontSize: isMobile ? 10 : 9, letterSpacing: "0.3em", color: "#00d4ff77", textTransform: "uppercase", marginBottom: isMobile ? 18 : 20, fontWeight: 700 }}>Skill Matrix</div>
          {SKILL_MATRIX.map(g => (
            <div key={g.domain} style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
                <span style={{ fontSize: isMobile ? 11 : 9, color: g.color, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 700 }}>{g.domain}</span>
                <div style={{ flex: 1, minWidth: 16, height: 1, background: `${g.color}35` }} />
                <span style={{ fontSize: isMobile ? 9 : 8, color: g.color, padding: "3px 10px", border: `1px solid ${g.color}44`, borderRadius: 20, whiteSpace: "nowrap" }}>{g.tier}</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {g.skills.map(s => <span key={s} style={{ fontSize: isMobile ? 11 : 9, padding: "5px 12px", background: `${g.color}14`, border: `1px solid ${g.color}38`, borderRadius: 6, color: "rgba(255,255,255,0.78)", whiteSpace: "nowrap" }}>{s}</span>)}
              </div>
            </div>
          ))}
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.07)", fontSize: isMobile ? 10 : 9, color: "rgba(255,255,255,0.32)", letterSpacing: "0.1em" }}>
            ⚡ {IDENTITY.fitness.philosophy} · {IDENTITY.fitness.focus}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// ASSEMBLY — full HTML project explorer
// ─────────────────────────────────────────────────────────────────
const LAYERS_CFG = [
  { key: "code",   label: "01 · CODE",   color: "#0055aa", bg: "#e8f0ff" },
  { key: "design", label: "02 · DESIGN", color: "#005522", bg: "#e6f5ec" },
  { key: "logic",  label: "03 · LOGIC",  color: "#882200", bg: "#fff0ea" },
  { key: "result", label: "04 · RESULT", color: "#550066", bg: "#f8eeff" },
];

function AssemblyUI() {
  const projects = useStore(s => s.projects);
  const [idx, setIdx] = useState(0);
  const [activeLayer, setActiveLayer] = useState(null);
  const project = projects[idx];
  const badge   = STATUS_META[project.status];
  const hasLink = project.link && !["ADD_LINK_LATER","UNDER_DEVELOPMENT","PLANNING_PHASE"].includes(project.link);

  const goTo = (i) => { setIdx(i); setActiveLayer(null); };

  return (
    <div style={{
      position: "fixed", inset: 0,
      overflowY: "auto",
      paddingTop: isMobile ? 155 : 145,
      paddingBottom: 100,
      paddingLeft: isMobile ? 14 : 24,
      paddingRight: isMobile ? 14 : 24,
      fontFamily: "'Space Mono',monospace",
      pointerEvents: "all",
    }}>
      <style>{`
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:rgba(80,90,140,0.3);border-radius:2px}
        @keyframes slideIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      <div style={{ maxWidth: 600, margin: "0 auto" }}>

        {/* Section label */}
        <div style={{ fontSize: 8, letterSpacing: "0.3em", color: "#7880a0", textTransform: "uppercase", marginBottom: isMobile ? 16 : 18 }}>
          Deconstruct · Exploded View
        </div>

        {/* Project card */}
        <div style={{ background: "#f4f6fa", borderRadius: 20, overflow: "hidden", boxShadow: "0 8px 50px rgba(0,0,0,0.15)", border: "1px solid rgba(100,110,140,0.2)", animation: "slideIn 0.3s ease" }} key={idx}>
          {/* Coloured header */}
          <div style={{ background: `linear-gradient(120deg,${project.color} 0%,${project.color}cc 100%)`, padding: isMobile ? "22px 20px 20px" : "24px 26px 22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.82)", letterSpacing: "0.22em", textTransform: "uppercase", background: "rgba(0,0,0,0.22)", padding: "3px 12px", borderRadius: 20 }}>
                {badge.label.replace(/[●◑○] /, "")}
              </span>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", letterSpacing: "0.1em" }}>
                {String(idx+1).padStart(2,"0")} / {String(projects.length).padStart(2,"0")}
              </span>
            </div>
            <h2 style={{ fontSize: isMobile ? 23 : 26, color: "#fff", fontWeight: 700, lineHeight: 1.2, marginBottom: 8, letterSpacing: "-0.02em" }}>{project.title}</h2>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.72)", letterSpacing: "0.18em", textTransform: "uppercase" }}>{project.category}</div>
          </div>

          {/* Body */}
          <div style={{ padding: isMobile ? "20px 20px 26px" : "22px 26px 28px" }}>
            <p style={{ fontSize: isMobile ? 13 : 12, color: "#3a4258", lineHeight: 1.85, marginBottom: 20 }}>{project.description}</p>

            {/* Tech */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 22 }}>
              {project.tech.map(t => <span key={t} style={{ fontSize: isMobile ? 11 : 10, padding: "5px 13px", border: `1.5px solid ${project.color}55`, borderRadius: 30, color: project.color, background: `${project.color}12`, fontWeight: 700 }}>{t}</span>)}
            </div>

            {/* Layer accordion */}
            <div style={{ fontSize: 8, letterSpacing: "0.26em", color: "#7880a0", textTransform: "uppercase", marginBottom: 12 }}>Tap a layer to inspect</div>
            {LAYERS_CFG.map(ld => (
              <div key={ld.key} style={{ marginBottom: 8 }}>
                <button
                  onClick={() => setActiveLayer(activeLayer === ld.key ? null : ld.key)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 12,
                    background: activeLayer === ld.key ? ld.bg : "rgba(200,206,220,0.35)",
                    border: `1.5px solid ${activeLayer === ld.key ? ld.color : "rgba(100,110,140,0.22)"}`,
                    borderRadius: activeLayer === ld.key ? "10px 10px 0 0" : 10,
                    padding: isMobile ? "14px 16px" : "12px 16px",
                    cursor: "pointer", textAlign: "left", fontFamily: "inherit",
                    transition: "all 0.22s", boxShadow: activeLayer === ld.key ? `0 2px 14px ${ld.color}22` : "none",
                  }}
                >
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: ld.color, flexShrink: 0, boxShadow: activeLayer === ld.key ? `0 0 8px ${ld.color}` : "none" }} />
                  <span style={{ fontFamily: "'Space Mono',monospace", fontSize: isMobile ? 13 : 11, color: activeLayer === ld.key ? ld.color : "#3a4258", letterSpacing: "0.1em", fontWeight: 700, flex: 1 }}>{ld.label}</span>
                  <span style={{ fontSize: 14, color: activeLayer === ld.key ? ld.color : "#8890a8", display: "inline-block", transition: "transform 0.22s", transform: activeLayer === ld.key ? "rotate(180deg)" : "none" }}>▾</span>
                </button>
                {activeLayer === ld.key && (
                  <div style={{ background: ld.bg, borderLeft: `3px solid ${ld.color}`, borderRight: `1.5px solid ${ld.color}`, borderBottom: `1.5px solid ${ld.color}`, borderRadius: "0 0 10px 10px", padding: isMobile ? "14px 16px 14px 18px" : "12px 16px 12px 18px", fontFamily: "'Space Mono',monospace", fontSize: isMobile ? 12 : 10, color: ld.color, lineHeight: 1.82, letterSpacing: "0.03em" }}>
                    {project.layers[ld.key]}
                  </div>
                )}
              </div>
            ))}

            {/* CTA */}
            <div style={{ marginTop: 22 }}>
              {hasLink
                ? <a href={project.link} target="_blank" rel="noopener noreferrer" style={{ display: "block", textAlign: "center", fontSize: isMobile ? 14 : 13, color: "#fff", fontWeight: 700, background: project.color, borderRadius: 14, padding: "17px 28px", textDecoration: "none", letterSpacing: "0.1em", textTransform: "uppercase", boxShadow: `0 4px 22px ${project.color}44` }}>View Live Project →</a>
                : <div style={{ textAlign: "center", fontSize: 12, color: "#8890a8", letterSpacing: "0.14em", textTransform: "uppercase", padding: "17px", border: "1.5px solid rgba(100,110,140,0.25)", borderRadius: 14 }}>
                    {project.status === "IN_PROGRESS" ? "⟳ Under Development" : "◌ Planned for Future"}
                  </div>
              }
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: isMobile ? 14 : 12, marginTop: isMobile ? 20 : 18 }}>
          <button
            onClick={() => goTo(Math.max(0, idx-1))} disabled={idx===0}
            style={{ background: "#fff", border: "1.5px solid #c8cdd8", borderRadius: 10, padding: isMobile ? "11px 22px" : "9px 18px", cursor: idx===0?"not-allowed":"pointer", color: idx===0?"#c0c8d8":"#1a1e2e", fontSize: isMobile?16:13, fontFamily: "inherit", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", opacity: idx===0?0.4:1, transition: "all 0.2s" }}
          >← Prev</button>

          <div style={{ display: "flex", gap: isMobile ? 10 : 8, alignItems: "center" }}>
            {projects.map((p,i) => (
              <button key={p.id} onClick={() => goTo(i)} style={{ width: i===idx?(isMobile?28:22):isMobile?11:8, height: isMobile?11:8, borderRadius: 6, border: "none", background: i===idx?p.color:"#b0b8cc", cursor: "pointer", padding: 0, transition: "all 0.3s", boxShadow: i===idx?`0 0 10px ${p.color}aa`:"none" }} />
            ))}
          </div>

          <button
            onClick={() => goTo(Math.min(projects.length-1, idx+1))} disabled={idx===projects.length-1}
            style={{ background: "#fff", border: "1.5px solid #c8cdd8", borderRadius: 10, padding: isMobile ? "11px 22px" : "9px 18px", cursor: idx===projects.length-1?"not-allowed":"pointer", color: idx===projects.length-1?"#c0c8d8":"#1a1e2e", fontSize: isMobile?16:13, fontFamily: "inherit", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", opacity: idx===projects.length-1?0.4:1, transition: "all 0.2s" }}
          >Next →</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// ROOT UILayer — renders on top of Canvas, never inside it
// ─────────────────────────────────────────────────────────────────
export default function UILayer() {
  const currentTheme    = useStore(s => s.currentTheme);
  const themeConfig     = useStore(s => s.themeConfig);
  const selectedProject = useStore(s => s.selectedProject);
  const isLight         = currentTheme === "ASSEMBLY";
  const accent          = themeConfig.accent;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 40, pointerEvents: "none", fontFamily: "'Space Mono',monospace" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { overflow: hidden; }
        canvas { display: block; touch-action: none; }
        @keyframes pulseRing { 0%{transform:scale(.9);opacity:.8} 70%{transform:scale(1.15);opacity:0} 100%{transform:scale(.9);opacity:0} }
      `}</style>

      {/* Always-visible top bar */}
      <div style={{ pointerEvents: "all" }}>
        <TopBar isLight={isLight} accent={accent} />
      </div>

      {/* Theme-specific content area */}
      <div style={{ pointerEvents: "all" }}>
        {currentTheme === "FLUID"    && <FluidUI />}
        {currentTheme === "ASSEMBLY" && <AssemblyUI />}
        {currentTheme === "GRAVITY"  && <GravityDetailSheet />}
      </div>

      {/* Physics toggle — always visible */}
      <div style={{ pointerEvents: "all" }}>
        <PhysicsToggle isLight={isLight} accent={accent} themeConfig={themeConfig} />
      </div>

      {/* Bottom hint */}
      <div style={{
        position: "fixed", bottom: isMobile ? 20 : 26, left: isMobile ? 14 : 26,
        zIndex: 50, pointerEvents: "none",
        fontSize: 8, letterSpacing: "0.14em", lineHeight: 1.9,
        color: isLight ? "rgba(26,30,46,0.28)" : "rgba(255,255,255,0.22)",
      }}>
        {currentTheme === "GRAVITY"  && <>{isMobile?"tap":"click"} orbs to inspect · size = importance</>}
        {currentTheme === "FLUID"    && <>scroll to browse · {isMobile?"tap":"click"} card for details</>}
        {currentTheme === "ASSEMBLY" && <>{isMobile?"tap":"click"} layer to annotate · prev / next</>}
      </div>
    </div>
  );
}
