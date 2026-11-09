"use client";

import type { ThreeEvent } from "@react-three/fiber";
import { useMemo, useState } from "react";
import type { BuildingPlot } from "./city-layout";
import { SectorCrown } from "./sector-crowns";

interface ProceduralBuildingProps {
  plot: BuildingPlot;
  isSelected?: boolean;
  onSelect?: (holdingId: string) => void;
}

/**
 * Procedural 3D skyscraper component representing a portfolio holding.
 * Renders facade body, neon trims, sector rooftop crown, and interactive hover feedback.
 */
export function ProceduralBuilding({
  plot,
  isSelected = false,
  onSelect,
}: ProceduralBuildingProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Amplified emission on hover or active selection
  const effectiveIntensity = useMemo(() => {
    if (isSelected) return 3.5;
    if (isHovered) return 2.6;
    return plot.emissiveIntensity;
  }, [isSelected, isHovered, plot.emissiveIntensity]);

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setIsHovered(true);
    if (typeof document !== "undefined") {
      document.body.style.cursor = "pointer";
    }
  };

  const handlePointerOut = () => {
    setIsHovered(false);
    if (typeof document !== "undefined") {
      document.body.style.cursor = "auto";
    }
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect?.(plot.holdingId);
  };

  const halfHeight = plot.height / 2;

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: R3F 3D scene group
    <group
      position={plot.position}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {/* 1. Main Skyscraper Facade Body */}
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[plot.width, plot.height, plot.depth]} />
        <meshStandardMaterial
          color={isHovered ? "#131b2e" : "#090e1a"}
          roughness={0.7}
          metalness={0.6}
        />
      </mesh>

      {/* 2. Street Level Plinth Foundation */}
      <mesh position={[0, -halfHeight + 0.15, 0]}>
        <boxGeometry args={[plot.width + 0.3, 0.3, plot.depth + 0.3]} />
        <meshStandardMaterial color="#030712" roughness={0.9} metalness={0.2} />
      </mesh>

      {/* 3. Base Neon Ground Perimeter Glow */}
      <mesh position={[0, -halfHeight + 0.32, 0]}>
        <boxGeometry args={[plot.width + 0.15, 0.05, plot.depth + 0.15]} />
        <meshStandardMaterial
          color={plot.neonColor}
          emissive={plot.neonColor}
          emissiveIntensity={effectiveIntensity * 0.8}
          toneMapped={false}
        />
      </mesh>

      {/* 4. Mid-Tower Architectural Neon Band */}
      {plot.height > 10 && (
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[plot.width + 0.08, 0.12, plot.depth + 0.08]} />
          <meshStandardMaterial
            color={plot.neonColor}
            emissive={plot.neonColor}
            emissiveIntensity={effectiveIntensity * 0.9}
            toneMapped={false}
          />
        </mesh>
      )}

      {/* 5. Upper Skyscraper Neon Edge Collar */}
      <mesh position={[0, halfHeight - 0.1, 0]}>
        <boxGeometry args={[plot.width + 0.08, 0.2, plot.depth + 0.08]} />
        <meshStandardMaterial
          color={plot.neonColor}
          emissive={plot.neonColor}
          emissiveIntensity={effectiveIntensity * 1.3}
          toneMapped={false}
        />
      </mesh>

      {/* 6. High-Rise Window Grid Facet Light Bars */}
      <mesh position={[0, 0, plot.depth / 2 + 0.01]}>
        <planeGeometry args={[plot.width * 0.75, plot.height * 0.85]} />
        <meshStandardMaterial
          color="#1e293b"
          emissive={plot.neonColor}
          emissiveIntensity={effectiveIntensity * 0.2}
          roughness={0.3}
          metalness={0.8}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* 7. Sector Rooftop Crown mounted at top edge */}
      <group position={[0, halfHeight, 0]}>
        <SectorCrown
          sector={plot.sector}
          width={plot.width}
          depth={plot.depth}
          neonColor={plot.neonColor}
          emissiveIntensity={effectiveIntensity}
        />
      </group>
    </group>
  );
}
