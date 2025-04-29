import { useEffect, useState } from "react";
import { transformLevelData } from "@/utils/dataUtils";
import { getLegoPiece } from "./Lego";
import level1 from "@/data/levels/base/level_1.json"; // Replace with dynamic import if needed
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
    if (levelData) {
      // If levelData is provided directly, use that
      const data = transformLevelData(levelData);
      setPieces(data.pieces);
    } else if (levelId) {
      // Otherwise use levelId to load from the base levels
      // TODO: Replace with dynamic import based on levelId
      const data = transformLevelData(level1);
      setPieces(data.pieces);
    }
  }, [levelId, levelData]);

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
