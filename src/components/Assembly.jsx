// @ts-nocheck
// FILE 8/10 — src/components/Assembly.jsx  ── v4 FINAL
// Only 3D environment — all project UI lives in UILayer outside Canvas

export default function Assembly() {
  return (
    <>
      <color attach="background" args={["#edf0f5"]} />
      <ambientLight intensity={2.8} color="#ffffff" />
      <directionalLight position={[4, 8, 4]}    intensity={0.9} color="#e8eaf6" />
      <directionalLight position={[-4, -4, -4]} intensity={0.5} color="#d0d4e8" />

      {/* Floor plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5.5, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshBasicMaterial color="#dde2ec" />
      </mesh>

      {/* Grid lines X */}
      {Array.from({ length: 21 }).map((_, i) => (
        <mesh key={`x${i}`} position={[0, -5.48, (i - 10) * 3]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[120, 0.015]} />
          <meshBasicMaterial color="#c4c9d8" transparent opacity={0.7} />
        </mesh>
      ))}
      {/* Grid lines Z */}
      {Array.from({ length: 21 }).map((_, i) => (
        <mesh key={`z${i}`} position={[(i - 10) * 3, -5.48, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.015, 120]} />
          <meshBasicMaterial color="#c4c9d8" transparent opacity={0.7} />
        </mesh>
      ))}
    </>
  );
}
