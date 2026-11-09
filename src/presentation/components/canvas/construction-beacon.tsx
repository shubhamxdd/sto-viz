"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group, Mesh } from "three";

/**
 * Holographic construction foundation beacon rendered when the portfolio has zero holdings.
 * Features rotating holographic rings, glowing foundation perimeter, and a central cyber marker.
 */
export function ConstructionBeacon() {
  const outerRingRef = useRef<Mesh>(null);
  const innerRingRef = useRef<Mesh>(null);
  const beaconGroupRef = useRef<Group>(null);

  useFrame((state, delta) => {
    const elapsed = state.clock.getElapsedTime();

    if (outerRingRef.current) {
      outerRingRef.current.rotation.z += delta * 0.4;
    }

    if (innerRingRef.current) {
      innerRingRef.current.rotation.z -= delta * 0.6;
    }

    if (beaconGroupRef.current) {
      beaconGroupRef.current.position.y = 1.0 + Math.sin(elapsed * 2.0) * 0.25;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Holographic foundation square perimeter wireframe */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 12]} />
        <meshBasicMaterial
          color="#22d3ee"
          wireframe
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* 2. Outer holographic rotating cyber ring */}
      <mesh
        ref={outerRingRef}
        position={[0, 0.1, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[4.5, 4.8, 32]} />
        <meshBasicMaterial
          color="#22d3ee"
          wireframe
          transparent
          opacity={0.5}
        />
      </mesh>

      {/* 3. Inner counter-rotating ring */}
      <mesh
        ref={innerRingRef}
        position={[0, 0.12, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[2.8, 3.0, 24]} />
        <meshBasicMaterial
          color="#38bdf8"
          wireframe
          transparent
          opacity={0.65}
        />
      </mesh>

      {/* 4. Floating central cyber foundation beacon */}
      <group ref={beaconGroupRef} position={[0, 1.0, 0]}>
        {/* Floating holographic prism */}
        <mesh position={[0, 0, 0]} rotation={[0, Math.PI / 4, 0]}>
          <octahedronGeometry args={[0.9]} />
          <meshStandardMaterial
            color="#22d3ee"
            emissive="#22d3ee"
            emissiveIntensity={2.5}
            roughness={0.2}
            metalness={0.8}
            wireframe
            toneMapped={false}
          />
        </mesh>

        {/* Vertical beacon column light beam */}
        <mesh position={[0, 2.5, 0]}>
          <cylinderGeometry args={[0.04, 0.08, 5.0, 8]} />
          <meshBasicMaterial color="#22d3ee" transparent opacity={0.4} />
        </mesh>
      </group>
    </group>
  );
}
