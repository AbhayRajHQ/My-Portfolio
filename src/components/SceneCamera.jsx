
// @ts-nocheck
// ── FILE 5 / 10 : src/components/SceneCamera.jsx ─────────────────

import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { useMotionValue, useSpring, animate } from "framer-motion";
import * as THREE from "three";
import useStore from "../store/useThemeStore";

const SPRING = { stiffness: 55, damping: 16, restDelta: 0.0005 };

export default function SceneCamera() {
  const cameraRef       = useRef();
  const themeConfig     = useStore((s) => s.themeConfig);
  const setTransitioning = useStore((s) => s.setTransitioning);

  const mx   = useMotionValue(themeConfig.camera.position[0]);
  const my   = useMotionValue(themeConfig.camera.position[1]);
  const mz   = useMotionValue(themeConfig.camera.position[2]);
  const mFov = useMotionValue(themeConfig.camera.fov);

  const sx   = useSpring(mx,   SPRING);
  const sy   = useSpring(my,   SPRING);
  const sz   = useSpring(mz,   SPRING);
  const sFov = useSpring(mFov, SPRING);

  const targetVec = useRef(new THREE.Vector3(...themeConfig.camera.target));

  useEffect(() => {
    const [tx, ty, tz] = themeConfig.camera.position;
    targetVec.current.set(...themeConfig.camera.target);

    let done = 0;
    const onDone = () => { if (++done === 4) setTransitioning(false); };

    animate(mx,   tx,                      { ...SPRING, onComplete: onDone });
    animate(my,   ty,                      { ...SPRING, onComplete: onDone });
    animate(mz,   tz,                      { ...SPRING, onComplete: onDone });
    animate(mFov, themeConfig.camera.fov,  { ...SPRING, onComplete: onDone });
  }, [themeConfig]); // eslint-disable-line

  useFrame(() => {
    if (!cameraRef.current) return;
    cameraRef.current.position.set(sx.get(), sy.get(), sz.get());
    cameraRef.current.fov = sFov.get();
    cameraRef.current.updateProjectionMatrix();
    cameraRef.current.lookAt(targetVec.current);
  });

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      position={themeConfig.camera.position}
      fov={themeConfig.camera.fov}
      near={0.1}
      far={300}
    />
  );
}
