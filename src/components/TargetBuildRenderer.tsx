import { useEffect, useState } from "react";
import { transformLevelData } from "@/utils/dataUtils";
import { getLegoPiece } from "./Lego";
import { useBasePlateStore } from "@/stores/useBasePlateStore";

interface LevelData {
  id: string;
  name: string;
  pieces: Array<{
    pieceId: string;
    color: string;
    position: [number, number, number];
    rotation: [number, number, number];
  }>;
  createdBy?: string;
}

interface TargetBuildRendererProps {
  levelId?: string;
  levelData?: LevelData;
}

export default function TargetBuildRenderer({
  levelId,
  levelData,
}: TargetBuildRendererProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pieces, setPieces] = useState<any[]>([]);
  const basePlateRotation = useBasePlateStore((s) => s.rotation);

  useEffect(() => {
    try {
      // Extract the level number from the levelId (e.g., "level_2" -> "2")
      const levelNumber = levelId.split('_')[1];
      // Dynamically import the level data based on level number
      const levelData = require(`@/data/levels/base/level_${levelNumber}.json`);
      const data = transformLevelData(levelData);
      setPieces(data.pieces);
      console.log(`Target build loading level ${levelNumber} with ${data.pieces.length} pieces`);
    } catch (error) {
      console.error(`Error loading target build for level ${levelId}:`, error);
    }
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
