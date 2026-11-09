"use client";

import { useMemo, useState } from "react";
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
  const [selectedHoldingId, setSelectedHoldingId] = useState<string | null>(
    null,
  );

  const plots = useMemo(() => {
    return calculateCityLayout(holdings);
  }, [holdings]);

  const handleSelect = (holdingId: string) => {
    const nextId = selectedHoldingId === holdingId ? null : holdingId;
    setSelectedHoldingId(nextId);
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
