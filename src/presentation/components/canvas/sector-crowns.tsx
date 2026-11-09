"use client";

import type { Sector } from "@/domain/entities/security";

interface SectorCrownProps {
  sector: Sector;
  width: number;
  depth: number;
  neonColor: string;
  emissiveIntensity?: number;
}

/**
 * Procedural rooftop crowns tailored to Indian equity sectors.
 * Mounted at the top surface of each building (y = height / 2).
 */
export function SectorCrown({
  sector,
  width,
  depth,
  neonColor,
  emissiveIntensity = 1.5,
}: SectorCrownProps) {
  const crownScale = Math.min(width, depth);

  switch (sector) {
    case "IT and Technology": {
      // Communication spire antenna with glowing beacon tip and radar ring
      const spireHeight = crownScale * 1.4;
      return (
        <group position={[0, 0, 0]}>
          {/* Base mounting pedestal */}
          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[crownScale * 0.7, 0.2, crownScale * 0.7]} />
            <meshStandardMaterial
              color="#0f172a"
              roughness={0.4}
              metalness={0.8}
            />
          </mesh>

          {/* Torus communication ring */}
          <mesh
            position={[0, spireHeight * 0.45, 0]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <torusGeometry args={[crownScale * 0.35, 0.04, 8, 24]} />
            <meshStandardMaterial
              color={neonColor}
              emissive={neonColor}
              emissiveIntensity={emissiveIntensity}
              toneMapped={false}
            />
          </mesh>

          {/* Main transmission spire */}
          <mesh position={[0, spireHeight / 2, 0]}>
            <cylinderGeometry args={[0.03, 0.08, spireHeight, 8]} />
            <meshStandardMaterial
              color="#334155"
              roughness={0.2}
              metalness={0.9}
            />
          </mesh>

          {/* High-intensity summit signal beacon */}
          <mesh position={[0, spireHeight + 0.08, 0]}>
            <sphereGeometry args={[0.12, 12, 12]} />
            <meshStandardMaterial
              color={neonColor}
              emissive={neonColor}
              emissiveIntensity={emissiveIntensity * 2.0}
              toneMapped={false}
            />
          </mesh>
        </group>
      );
    }

    case "Banks and Financial Services": {
      // Stepped ziggurat art-deco pyramid with solid structural tiers
      const tier1Height = 0.5;
      const tier2Height = 0.4;
      const tier3Height = 0.3;
      return (
        <group position={[0, 0, 0]}>
          {/* Tier 1 */}
          <mesh position={[0, tier1Height / 2, 0]}>
            <boxGeometry
              args={[crownScale * 0.8, tier1Height, crownScale * 0.8]}
            />
            <meshStandardMaterial
              color="#0f172a"
              roughness={0.3}
              metalness={0.7}
            />
          </mesh>

          {/* Tier 1 neon collar */}
          <mesh position={[0, tier1Height, 0]}>
            <boxGeometry args={[crownScale * 0.82, 0.06, crownScale * 0.82]} />
            <meshStandardMaterial
              color={neonColor}
              emissive={neonColor}
              emissiveIntensity={emissiveIntensity}
              toneMapped={false}
            />
          </mesh>

          {/* Tier 2 */}
          <mesh position={[0, tier1Height + tier2Height / 2, 0]}>
            <boxGeometry
              args={[crownScale * 0.55, tier2Height, crownScale * 0.55]}
            />
            <meshStandardMaterial
              color="#1e293b"
              roughness={0.3}
              metalness={0.7}
            />
          </mesh>

          {/* Tier 3 Pyramid pinnacle */}
          <mesh position={[0, tier1Height + tier2Height + tier3Height / 2, 0]}>
            <coneGeometry args={[crownScale * 0.35, tier3Height * 1.5, 4]} />
            <meshStandardMaterial
              color={neonColor}
              emissive={neonColor}
              emissiveIntensity={emissiveIntensity * 1.5}
              toneMapped={false}
            />
          </mesh>
        </group>
      );
    }

    case "Oil, Gas and Energy": {
      // Industrial refinery cooling towers with piping manifolds
      const towerRadius = crownScale * 0.18;
      const towerHeight = crownScale * 0.7;
      const offset = crownScale * 0.22;
      return (
        <group position={[0, 0, 0]}>
          {/* Industrial base deck */}
          <mesh position={[0, 0.08, 0]}>
            <boxGeometry args={[crownScale * 0.85, 0.16, crownScale * 0.85]} />
            <meshStandardMaterial
              color="#181e2b"
              roughness={0.6}
              metalness={0.5}
            />
          </mesh>

          {/* Cooling Tower Left */}
          <mesh position={[-offset, towerHeight / 2 + 0.16, 0]}>
            <cylinderGeometry
              args={[towerRadius * 0.8, towerRadius, towerHeight, 16]}
            />
            <meshStandardMaterial
              color="#334155"
              roughness={0.5}
              metalness={0.6}
            />
          </mesh>
          <mesh position={[-offset, towerHeight + 0.17, 0]}>
            <cylinderGeometry
              args={[towerRadius * 0.85, towerRadius * 0.85, 0.06, 16]}
            />
            <meshStandardMaterial
              color={neonColor}
              emissive={neonColor}
              emissiveIntensity={emissiveIntensity * 1.6}
              toneMapped={false}
            />
          </mesh>

          {/* Cooling Tower Right */}
          <mesh position={[offset, towerHeight / 2 + 0.16, 0]}>
            <cylinderGeometry
              args={[towerRadius * 0.8, towerRadius, towerHeight, 16]}
            />
            <meshStandardMaterial
              color="#334155"
              roughness={0.5}
              metalness={0.6}
            />
          </mesh>
          <mesh position={[offset, towerHeight + 0.17, 0]}>
            <cylinderGeometry
              args={[towerRadius * 0.85, towerRadius * 0.85, 0.06, 16]}
            />
            <meshStandardMaterial
              color={neonColor}
              emissive={neonColor}
              emissiveIntensity={emissiveIntensity * 1.6}
              toneMapped={false}
            />
          </mesh>

          {/* Horizontal pipe connecting manifolds */}
          <mesh
            position={[0, towerHeight * 0.5 + 0.16, 0]}
            rotation={[0, 0, Math.PI / 2]}
          >
            <cylinderGeometry args={[0.05, 0.05, offset * 2, 8]} />
            <meshStandardMaterial
              color="#475569"
              roughness={0.3}
              metalness={0.8}
            />
          </mesh>
        </group>
      );
    }

    case "Pharma and Healthcare": {
      // Hemispherical biological research dome and elevated helipad
      const domeRadius = crownScale * 0.32;
      return (
        <group position={[0, 0, 0]}>
          {/* Base terrace */}
          <mesh position={[0, 0.08, 0]}>
            <cylinderGeometry
              args={[crownScale * 0.45, crownScale * 0.45, 0.16, 24]}
            />
            <meshStandardMaterial
              color="#0f172a"
              roughness={0.4}
              metalness={0.6}
            />
          </mesh>

          {/* Glowing bio-dome */}
          <mesh position={[0, domeRadius * 0.5 + 0.16, 0]}>
            <sphereGeometry
              args={[domeRadius, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]}
            />
            <meshStandardMaterial
              color="#0ea5e9"
              emissive={neonColor}
              emissiveIntensity={emissiveIntensity * 0.9}
              roughness={0.1}
              metalness={0.9}
              transparent
              opacity={0.85}
            />
          </mesh>

          {/* Illuminated perimeter ring */}
          <mesh position={[0, 0.18, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[domeRadius * 1.05, 0.03, 8, 32]} />
            <meshStandardMaterial
              color={neonColor}
              emissive={neonColor}
              emissiveIntensity={emissiveIntensity * 1.8}
              toneMapped={false}
            />
          </mesh>
        </group>
      );
    }

    case "FMCG and Consumer Goods": {
      // Commercial rooftop terrace with glowing cyber advertisement billboard
      const boardWidth = crownScale * 0.75;
      const boardHeight = crownScale * 0.4;
      return (
        <group position={[0, 0, 0]}>
          {/* Rooftop garden terrace slab */}
          <mesh position={[0, 0.08, 0]}>
            <boxGeometry args={[crownScale * 0.8, 0.16, crownScale * 0.8]} />
            <meshStandardMaterial
              color="#064e3b"
              roughness={0.8}
              metalness={0.1}
            />
          </mesh>

          {/* Billboard frame struts */}
          <mesh position={[-boardWidth * 0.4, boardHeight * 0.4, 0]}>
            <cylinderGeometry args={[0.03, 0.03, boardHeight * 0.8, 8]} />
            <meshStandardMaterial
              color="#64748b"
              roughness={0.3}
              metalness={0.8}
            />
          </mesh>
          <mesh position={[boardWidth * 0.4, boardHeight * 0.4, 0]}>
            <cylinderGeometry args={[0.03, 0.03, boardHeight * 0.8, 8]} />
            <meshStandardMaterial
              color="#64748b"
              roughness={0.3}
              metalness={0.8}
            />
          </mesh>

          {/* Emissive cyber commercial billboard slab */}
          <mesh position={[0, boardHeight * 0.7, 0]}>
            <boxGeometry args={[boardWidth, boardHeight, 0.08]} />
            <meshStandardMaterial
              color={neonColor}
              emissive={neonColor}
              emissiveIntensity={emissiveIntensity * 1.7}
              toneMapped={false}
            />
          </mesh>
        </group>
      );
    }

    case "Automobiles and Manufacturing": {
      // Sawtooth industrial factory skylights with structural truss frame
      const roofSpan = crownScale * 0.75;
      const roofDepth = crownScale * 0.6;
      return (
        <group position={[0, 0, 0]}>
          {/* Base structural plinth */}
          <mesh position={[0, 0.08, 0]}>
            <boxGeometry args={[crownScale * 0.8, 0.16, crownScale * 0.8]} />
            <meshStandardMaterial
              color="#1e293b"
              roughness={0.5}
              metalness={0.6}
            />
          </mesh>

          {/* Sawtooth roof prisms */}
          <mesh
            position={[-roofSpan * 0.22, 0.35, 0]}
            rotation={[0, 0, Math.PI / 4]}
          >
            <boxGeometry args={[roofSpan * 0.3, roofSpan * 0.3, roofDepth]} />
            <meshStandardMaterial
              color="#334155"
              roughness={0.4}
              metalness={0.7}
            />
          </mesh>
          <mesh
            position={[roofSpan * 0.22, 0.35, 0]}
            rotation={[0, 0, Math.PI / 4]}
          >
            <boxGeometry args={[roofSpan * 0.3, roofSpan * 0.3, roofDepth]} />
            <meshStandardMaterial
              color="#334155"
              roughness={0.4}
              metalness={0.7}
            />
          </mesh>

          {/* Neon warning ridge lines */}
          <mesh position={[0, 0.58, 0]}>
            <boxGeometry args={[roofSpan * 0.85, 0.04, 0.04]} />
            <meshStandardMaterial
              color={neonColor}
              emissive={neonColor}
              emissiveIntensity={emissiveIntensity * 1.5}
              toneMapped={false}
            />
          </mesh>
        </group>
      );
    }

    case "Metals and Mining": {
      // Brutalist heavy monolith with industrial gantry beam
      const slabWidth = crownScale * 0.8;
      const slabHeight = crownScale * 0.35;
      return (
        <group position={[0, 0, 0]}>
          {/* Heavy monolithic brutalist slab */}
          <mesh position={[0, slabHeight / 2, 0]}>
            <boxGeometry args={[slabWidth, slabHeight, slabWidth]} />
            <meshStandardMaterial
              color="#111827"
              roughness={0.8}
              metalness={0.3}
            />
          </mesh>

          {/* Angled crane gantry boom */}
          <mesh position={[0, slabHeight + 0.3, 0]} rotation={[0.2, 0.4, 0.3]}>
            <boxGeometry args={[slabWidth * 0.9, 0.08, 0.08]} />
            <meshStandardMaterial
              color={neonColor}
              emissive={neonColor}
              emissiveIntensity={emissiveIntensity * 1.6}
              toneMapped={false}
            />
          </mesh>
        </group>
      );
    }

    default: {
      return null;
    }
  }
}
