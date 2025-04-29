import { useEffect, useState } from "react";
import { transformLevelData } from "@/utils/dataUtils";
import { getLegoPiece } from "./Lego";
import { useBasePlateStore } from "@/stores/useBasePlateStore";
import level1 from "@/data/levels/base/level_1.json"; // Default level

interface TargetBuildRendererProps {
  levelId?: string;
}

export default function TargetBuildRenderer({
  levelId = "level_1", // Default to level_1 if not provided
}: TargetBuildRendererProps) {
  const [pieces, setPieces] = useState<
    Array<{
      pieceId: string;
      color: string;
      position: [number, number, number];
      rotation: [number, number, number];
    }>
  >([]);
  const basePlateRotation = useBasePlateStore((s) => s.rotation);

  useEffect(() => {
    const loadLevelData = async () => {
      try {
        let data;

        // If we have a levelId, try to load it
        if (levelId && levelId !== "level_1") {
          // Extract the level number from the levelId (e.g., "level_2" -> "2")
          const levelNumber = levelId.split("_")[1];

          try {
            // Dynamic import (works with webpack/vite)
            const levelModule = await import(
              `@/data/levels/base/level_${levelNumber}.json`
            );
            data = transformLevelData(levelModule.default);
          } catch (importError) {
            console.error(
              `Could not load level ${levelId}, falling back to level_1`,
              importError
            );
            data = transformLevelData(level1);
          }
        } else {
          // Default to level_1
          data = transformLevelData(level1);
        }

        setPieces(data.pieces);
        console.log(`Target build loaded with ${data.pieces.length} pieces`);
      } catch (error) {
        console.error(`Error loading target build:`, error);
        setPieces([]);
      }
    };

    loadLevelData();
  }, [levelId]);

  return (
    <group rotation={basePlateRotation}>
      {pieces.map((p, i) =>
        getLegoPiece(p.pieceId, `target-${i}`, {
          position: p.position,
          rotation: p.rotation,
          color: p.color,
          invisible: true,
        })
      )}
    </group>
  );
}
