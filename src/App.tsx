// @ts-nocheck
// ── FILE 10 / 10 : src/App.tsx ───────────────────────────────────
// This is the ONLY file that replaces your existing App.tsx.
// All other files go in new folders you create.

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import SceneCamera    from "./components/SceneCamera";
import GravityWell    from "./components/GravityWell";
import FluidMotion    from "./components/FluidMotion";
import Assembly       from "./components/Assembly";
import ThemeSwitcher  from "./components/ThemeSwitcher";
import useStore       from "./store/useThemeStore";

function Experience() {
  const currentTheme = useStore((s) => s.currentTheme);
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
  const themeConfig  = useStore((s) => s.themeConfig);
  const currentTheme = useStore((s) => s.currentTheme);
  const isLight      = currentTheme === "ASSEMBLY";

  return (
    <div style={{
      width: "100vw", height: "100vh",
      background: isLight ? "#eef0f4" : "#050510",
      transition: "background 0.8s ease",
      overflow: "hidden",
    }}>
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
        style={{ position: "absolute", inset: 0 }}
      >
        <Experience />
      </Canvas>
      <ThemeSwitcher />
    </div>
  );
}

