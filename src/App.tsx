// @ts-nocheck
// FILE 10/10 — src/App.tsx  ── v4 FINAL
// Canvas and UILayer are SIBLINGS — UILayer is never inside Canvas.
// This is why Html positioning worked inconsistently before.

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import SceneCamera   from "./components/SceneCamera";
import GravityWell   from "./components/GravityWell";
import FluidMotion   from "./components/FluidMotion";
import Assembly      from "./components/Assembly";
import UILayer       from "./components/UILayer";
import useStore      from "./store/useThemeStore";

function Experience() {
  const currentTheme = useStore(s => s.currentTheme);
  return (
    <>
      <SceneCamera />
      <Suspense fallback={null}>
        {currentTheme === "GRAVITY"  && <GravityWell />}
        {currentTheme === "FLUID"    && <FluidMotion />}
        {currentTheme === "ASSEMBLY" && <Assembly />}
      </Suspense>
    </>
  );
}

export default function App() {
  const themeConfig  = useStore(s => s.themeConfig);
  const currentTheme = useStore(s => s.currentTheme);
  const isLight      = currentTheme === "ASSEMBLY";

  return (
    // Wrapper — fills viewport
    <div style={{
      width: "100vw", height: "100vh",
      background: isLight ? "#edf0f5" : "#04040f",
      transition: "background 0.8s ease",
      overflow: "hidden",
      position: "relative",
    }}>
      {/* 3D Canvas — background layer */}
      <Canvas
        shadows
        dpr={[1, 2]}
        frameloop="always"
        camera={{
          position: themeConfig.camera.position,
          fov:      themeConfig.camera.fov,
          near:     0.1,
          far:      300,
        }}
        gl={{ antialias: true, powerPreference: "high-performance", alpha: false }}
        style={{ position: "absolute", inset: 0, zIndex: 0 }}
      >
        <Experience />
      </Canvas>

      {/* HTML UI layer — completely outside Canvas, always on top */}
      <UILayer />
    </div>
  );
}
