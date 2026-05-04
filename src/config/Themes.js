// @ts-nocheck
export const THEMES = {
  GRAVITY: {
    id: "GRAVITY", label: "Gravity Well", sublabel: "Discovery Mode",
    description: "Cursor-pulled physics void", icon: "⦿",
    camera: { position: [0, 0, 18], target: [0, 0, 0], fov: 65 },
    accent: "#ff6b35", bg: "#050510",
  },
  FLUID: {
    id: "FLUID", label: "Fluid Motion", sublabel: "The Order State",
    description: "Glassmorphic grid with wave distortion", icon: "◈",
    camera: { position: [0, 0, 22], target: [0, 0, 0], fov: 55 },
    accent: "#00d4ff", bg: "#03090f",
  },
  ASSEMBLY: {
    id: "ASSEMBLY", label: "Deconstruct", sublabel: "The Logic State",
    description: "Exploded view of every project", icon: "⊞",
    camera: { position: [0, 0, 20], target: [0, 0, 0], fov: 60 },
    accent: "#1a1a2e", bg: "#eef0f4",
  },
};

export const THEME_ORDER = ["GRAVITY", "FLUID", "ASSEMBLY"];
