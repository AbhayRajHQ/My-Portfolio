
// @ts-nocheck
// ── FILE 9 / 10 : src/components/ThemeSwitcher.jsx ───────────────

import { useState } from "react";
import useStore from "../store/useThemeStore";
import { THEMES, THEME_ORDER } from "../config/themes";
import { IDENTITY, SOCIAL_ICONS, STATUS_META } from "../config/identity";

// ── Social icon button ────────────────────────────────────────────
function SocialBtn({ icon, isLight }) {
  const [hov, setHov] = useState(false);
  return (
    <a
      href={icon.url} target="_blank" rel="noopener noreferrer" title={icon.label}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: 28, height: 28, borderRadius: 6, textDecoration: "none",
        border: `1px solid ${hov ? "rgba(255,255,255,0.3)" : isLight ? "rgba(30,30,60,0.12)" : "rgba(255,255,255,0.1)"}`,
        background: hov ? "rgba(255,255,255,0.1)" : isLight ? "rgba(238,240,244,0.7)" : "rgba(255,255,255,0.05)",
        cursor: "pointer", transition: "all 0.2s",
      }}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill={isLight ? "#1a1a2e" : "#ffffffcc"}>
        <path d={icon.d} />
      </svg>
    </a>
  );
}

// ── Main ThemeSwitcher overlay ────────────────────────────────────
export default function ThemeSwitcher() {
  const currentTheme    = useStore((s) => s.currentTheme);
  const isTransitioning = useStore((s) => s.isTransitioning);
  const themeConfig     = useStore((s) => s.themeConfig);
  const setTheme        = useStore((s) => s.setTheme);
  const projects        = useStore((s) => s.projects);
  const [open, setOpen] = useState(false);

  const isLight = currentTheme === "ASSEMBLY";
  const fg      = isLight ? "#1a1a2e"                  : "#ffffff";
  const panelBg = isLight ? "rgba(238,240,244,0.92)"   : "rgba(5,5,16,0.86)";
  const border  = isLight ? "rgba(30,30,60,0.12)"      : "rgba(255,255,255,0.1)";

  const liveCount   = projects.filter((p) => p.status === "COMPLETED").length;
  const wipCount    = projects.filter((p) => p.status === "IN_PROGRESS").length;
  const futureCount = projects.filter((p) => p.status === "FUTURE").length;

  return (
    <>
      {/* Global styles — injected once */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { overflow: hidden; background: #050510; }
        canvas { display: block; touch-action: none; }
        @keyframes fadeUp      { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse-ring  { 0%{transform:scale(.92);opacity:.8} 70%{transform:scale(1.12);opacity:0} 100%{transform:scale(.92);opacity:0} }
        .ts-btn { transition: all .28s cubic-bezier(.23,1,.32,1); }
        .ts-btn:hover { opacity:1!important; transform:translateX(3px)!important; }
      `}</style>

      {/* ── Top-left: Identity card ──────────────────────────────── */}
      <div style={{ position: "fixed", top: 24, left: 28, fontFamily: "'Space Mono',monospace", zIndex: 20, animation: "fadeUp .6s ease both" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.28em", color: themeConfig.accent, textTransform: "uppercase", marginBottom: 3, transition: "color .5s" }}>
          @{IDENTITY.handle}
        </div>
        <div style={{ fontSize: 21, color: fg, letterSpacing: "-0.025em", lineHeight: 1, fontWeight: 700, transition: "color .5s" }}>
          {IDENTITY.name}
        </div>
        <div style={{ fontSize: 8, color: isLight ? "rgba(26,26,46,0.42)" : "rgba(255,255,255,0.32)", letterSpacing: "0.05em", marginTop: 5, maxWidth: 230, lineHeight: 1.6, transition: "color .5s" }}>
          {IDENTITY.tagline}
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
          {SOCIAL_ICONS.map((ic) => <SocialBtn key={ic.label} icon={ic} isLight={isLight} />)}
        </div>
      </div>

      {/* ── Top-centre: Active state label ───────────────────────── */}
      <div style={{ position: "fixed", top: 22, left: "50%", transform: "translateX(-50%)", fontFamily: "'Space Mono',monospace", textAlign: "center", zIndex: 20, pointerEvents: "none", opacity: isTransitioning ? 0.3 : 1, transition: "opacity .4s" }}>
        <div style={{ fontSize: 8, letterSpacing: "0.25em", color: themeConfig.accent, textTransform: "uppercase", marginBottom: 3, transition: "color .5s" }}>
          {themeConfig.sublabel}
        </div>
        <div style={{ fontSize: 10, color: fg, letterSpacing: "0.08em", opacity: 0.55, transition: "color .5s" }}>
          {themeConfig.description}
        </div>
      </div>

      {/* ── Top-right: Project stats ──────────────────────────────── */}
      <div style={{ position: "fixed", top: 24, right: 28, fontFamily: "'Space Mono',monospace", textAlign: "right", zIndex: 20, pointerEvents: "none", animation: "fadeUp .6s ease .1s both" }}>
        <div style={{ fontSize: 8, letterSpacing: "0.2em", color: isLight ? "rgba(26,26,46,0.38)" : "rgba(255,255,255,0.28)", textTransform: "uppercase", marginBottom: 6, transition: "color .5s" }}>
          Projects
        </div>
        {[
          { label: "Live",     count: liveCount,   color: STATUS_META.COMPLETED.color },
          { label: "Building", count: wipCount,     color: STATUS_META.IN_PROGRESS.color },
          { label: "Planned",  count: futureCount,  color: STATUS_META.FUTURE.color },
        ].map(({ label, count, color }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 7, marginBottom: 4 }}>
            <span style={{ fontSize: 9, color: isLight ? "rgba(26,26,46,0.48)" : "rgba(255,255,255,0.38)", letterSpacing: "0.1em", transition: "color .5s" }}>{label}</span>
            <span style={{ fontSize: 11, color, fontWeight: 700, minWidth: 14, textAlign: "right" }}>{count}</span>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: color, boxShadow: `0 0 6px ${color}88`, flexShrink: 0 }} />
          </div>
        ))}
      </div>

      {/* ── Bottom-right: Physics Toggle ──────────────────────────── */}
      <div style={{ position: "fixed", bottom: 28, right: 28, zIndex: 20, fontFamily: "'Space Mono',monospace", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>

        {/* Expanded menu */}
        {open && (
          <div style={{ background: panelBg, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: `1px solid ${border}`, borderRadius: 14, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 6, boxShadow: "0 8px 40px rgba(0,0,0,0.3)", minWidth: 220, animation: "fadeUp .25s ease both" }}>
            <div style={{ fontSize: 8, letterSpacing: "0.25em", color: themeConfig.accent, textTransform: "uppercase", marginBottom: 4, paddingBottom: 8, borderBottom: `1px solid ${border}` }}>
              Physics Toggle
            </div>
            {THEME_ORDER.map((id) => {
              const cfg    = THEMES[id];
              const active = id === currentTheme;
              return (
                <button key={id} className="ts-btn"
                  onClick={() => { setTheme(id); setOpen(false); }}
                  disabled={isTransitioning}
                  style={{ display: "flex", alignItems: "center", gap: 10, background: active ? `${cfg.accent}18` : "transparent", border: `1px solid ${active ? cfg.accent + "66" : "transparent"}`, borderRadius: 8, padding: "8px 12px", cursor: isTransitioning ? "wait" : "pointer", opacity: active ? 1 : 0.55, textAlign: "left" }}
                >
                  <span style={{ fontSize: 14, minWidth: 18 }}>{cfg.icon}</span>
                  <span style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, color: active ? cfg.accent : fg, letterSpacing: "0.08em", fontWeight: 700 }}>{cfg.label}</div>
                    <div style={{ fontSize: 7.5, color: active ? cfg.accent + "aa" : isLight ? "#666" : "rgba(255,255,255,0.35)", letterSpacing: "0.06em", marginTop: 1 }}>{cfg.sublabel}</div>
                  </span>
                  {active && <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.accent, boxShadow: `0 0 8px ${cfg.accent}`, flexShrink: 0 }} />}
                </button>
              );
            })}
          </div>
        )}

        {/* Toggle pill button */}
        <button
          onClick={() => setOpen((o) => !o)}
          style={{ display: "flex", alignItems: "center", gap: 10, background: panelBg, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: `1px solid ${open ? themeConfig.accent + "88" : border}`, borderRadius: 40, padding: "10px 18px 10px 14px", cursor: "pointer", boxShadow: open ? `0 0 20px ${themeConfig.accent}33` : "0 2px 16px rgba(0,0,0,0.2)", fontFamily: "'Space Mono',monospace", transition: "all .3s ease" }}
        >
          <div style={{ position: "relative", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {isTransitioning && (
              <div style={{ position: "absolute", inset: -3, borderRadius: "50%", border: `2px solid ${themeConfig.accent}`, animation: "pulse-ring 1.2s ease-out infinite" }} />
            )}
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: themeConfig.accent, boxShadow: `0 0 10px ${themeConfig.accent}` }} />
          </div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 9, color: themeConfig.accent, letterSpacing: "0.18em", textTransform: "uppercase" }}>
              {isTransitioning ? "morphing…" : "Physics"}
            </div>
            <div style={{ fontSize: 11, color: fg, letterSpacing: "0.04em", fontWeight: 700, transition: "color .5s" }}>
              {themeConfig.label}
            </div>
          </div>
          <span style={{ fontSize: 10, color: isLight ? "#666" : "rgba(255,255,255,0.3)", marginLeft: 2, transition: "transform .3s", transform: open ? "rotate(180deg)" : "none" }}>▲</span>
        </button>
      </div>

      {/* ── Bottom-left: Contextual hint ─────────────────────────── */}
      <div style={{ position: "fixed", bottom: 28, left: 28, zIndex: 20, fontFamily: "'Space Mono',monospace", fontSize: 8, letterSpacing: "0.14em", lineHeight: 1.9, color: isLight ? "rgba(26,26,46,0.28)" : "rgba(255,255,255,0.2)", pointerEvents: "none", transition: "color .5s" }}>
        {currentTheme === "GRAVITY"  && <>· cursor attracts orbs · click to inspect<br />· orb size = project importance</>}
        {currentTheme === "FLUID"    && <>· hover cards for ripple glow · click to expand<br />· skill matrix below the grid</>}
        {currentTheme === "ASSEMBLY" && <>· click any layer slab to annotate · ← → navigate<br />· layers = code · design · logic · result</>}
      </div>
    </>
  );
}
