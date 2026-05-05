// @ts-nocheck
// FILE 7/10 — src/components/FluidMotion.jsx  ── v4 FINAL
// Only 3D wave background — all cards live in UILayer outside Canvas

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const isMobile = window.innerWidth < 768;

const waveVert = /* glsl */`
  varying vec2 vUv; varying float vWave; uniform float uTime;
  void main() {
    vUv = uv; vec3 p = position;
    float w = sin(p.x*1.1+uTime*0.5)*0.16
            + sin(p.y*1.6+uTime*0.35)*0.11
            + sin((p.x+p.y)*0.8+uTime*0.25)*0.07;
    p.z += w; vWave = w;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.0);
  }
`;

const waveFrag = /* glsl */`
  varying vec2 vUv; varying float vWave;
  void main() {
    vec3 deep=vec3(0.01,0.04,0.14);
    vec3 mid =vec3(0.02,0.13,0.30);
    vec3 hi  =vec3(0.0, 0.48,0.76);
    float g  = smoothstep(0.0,1.0,vUv.y+vWave*0.3);
    vec3 col = mix(deep,mix(mid,hi,g*0.55),g);
    vec2 gf  = fract(vUv*22.0);
    float ln = max(1.0-smoothstep(0.0,0.045,gf.x),1.0-smoothstep(0.0,0.045,gf.y));
    col += vec3(0.0,0.5,0.9)*ln*(0.07+vWave*0.1);
    float sp = pow(max(0.0,vWave*2.2),3.0)*0.35;
    col += vec3(sp*0.3,sp*0.7,sp);
    gl_FragColor = vec4(col,1.0);
  }
`;

export default function FluidMotion() {
  const mat  = useRef();
  const u    = useMemo(() => ({ uTime: { value: 0 } }), []);
  useFrame(({ clock }) => {
    if (mat.current) mat.current.uniforms.uTime.value = clock.getElapsedTime();
  });

  return (
    <>
      <color attach="background" args={["#030810"]} />
      <ambientLight intensity={0.4} color="#c0d0ff" />
      <fogExp2 attach="fog" color="#020b18" density={0.014} />
      <mesh position={[0, 0, -9]} rotation={[-Math.PI * 0.1, 0, 0]}>
        <planeGeometry args={[90, 55, isMobile ? 40 : 100, isMobile ? 28 : 70]} />
        <shaderMaterial
          ref={mat}
          vertexShader={waveVert}
          fragmentShader={waveFrag}
          uniforms={u}
          side={THREE.DoubleSide}
        />
      </mesh>
    </>
  );
}
