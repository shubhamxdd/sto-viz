"use client";

import { useMemo } from "react";
import { useCanvasStore } from "../../stores/use-canvas-store";
import { usePortfolioStore } from "../../stores/use-portfolio-store";
import { calculateCityLayout } from "./city-layout";
import { ConstructionBeacon } from "./construction-beacon";
import { ProceduralBuilding } from "./procedural-building";

interface CityBuildingsProps {
  onSelectHolding?: (holdingId: string | null) => void;
}

/**
 * City layout coordinator mapping portfolio store holdings into procedural 3D buildings.
 * When the portfolio is empty, displays the holographic construction beacon.
 */
export function CityBuildings({ onSelectHolding }: CityBuildingsProps) {
  const holdings = usePortfolioStore((state) => state.holdings);
  const selectedHoldingId = useCanvasStore((state) => state.selectedHoldingId);
  const setSelectedHoldingId = useCanvasStore(
    (state) => state.setSelectedHoldingId,
  );

  const plots = useMemo(() => {
    return calculateCityLayout(holdings);
  }, [holdings]);

  const handleSelect = (holdingId: string) => {
    const nextId = selectedHoldingId === holdingId ? null : holdingId;
    const targetPlot = nextId
      ? plots.find((p) => p.holdingId === nextId)
      : null;
    setSelectedHoldingId(nextId, targetPlot ? targetPlot.position : null);
    onSelectHolding?.(nextId);
  };

  if (!holdings || holdings.length === 0) {
    return <ConstructionBeacon />;
  }

  return (
    <group position={[0, 0, 0]}>
      {plots.map((plot) => (
        <ProceduralBuilding
          key={plot.holdingId}
          plot={plot}
          isSelected={selectedHoldingId === plot.holdingId}
          onSelect={handleSelect}
        />
      ))}
    </group>
  );
}
