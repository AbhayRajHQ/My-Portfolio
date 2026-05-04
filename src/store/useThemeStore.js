
// @ts-nocheck
// ── FILE 4 / 10 : src/store/useThemeStore.js ─────────────────────

import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { THEMES } from "../config/themes";
import { PROJECTS } from "../config/projects";

const useStore = create(
  subscribeWithSelector((set, get) => ({
    currentTheme:    "GRAVITY",
    themeConfig:     THEMES["GRAVITY"],
    isTransitioning: false,
    selectedProject: null,
    projects:        PROJECTS,

    setTheme: (id) => {
      if (!THEMES[id] || id === get().currentTheme) return;
      set({
        currentTheme:    id,
        themeConfig:     THEMES[id],
        isTransitioning: true,
        selectedProject: null,
      });
    },

    setSelectedProject:  (p) => set({ selectedProject: p }),
    clearSelectedProject: () => set({ selectedProject: null }),
    setTransitioning:    (v) => set({ isTransitioning: v }),
  }))
);

export default useStore;
