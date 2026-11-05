"use client";

import { Grid } from "@react-three/drei";

interface CityGroundGridProps {
  receiveShadow?: boolean;
}

export function CityGroundGrid({ receiveShadow = false }: CityGroundGridProps) {
  return (
    <group position={[0, 0, 0]}>
      {/* Dark reflective floor plane receiving shadows */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.02, 0]}
        receiveShadow={receiveShadow}
      >
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial color="#030712" roughness={0.7} metalness={0.3} />
      </mesh>

      {/* Cyberpunk glowing coordinate grid with distance fade */}
      <Grid
        position={[0, 0, 0]}
        args={[100, 100]}
        cellSize={1}
        cellThickness={0.7}
        cellColor="#0f172a"
        sectionSize={5}
        sectionThickness={1.4}
        sectionColor="#0284c7"
        fadeDistance={45}
        fadeStrength={1.5}
        followCamera={false}
      />
    </group>
  );
}
