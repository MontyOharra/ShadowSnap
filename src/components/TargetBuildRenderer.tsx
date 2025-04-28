import { useEffect, useState } from "react";
import { transformLevelData } from "@/utils/dataUtils";
import { getLegoPiece } from "./Lego";
import level1 from "@/data/levels/base/level_1.json"; // Replace with dynamic import if needed
import { useBasePlateStore } from "@/stores/useBasePlateStore";

export default function TargetBuildRenderer({ levelId }: { levelId: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pieces, setPieces] = useState<any[]>([]);
  const basePlateRotation = useBasePlateStore((s) => s.rotation);

  useEffect(() => {
    // TODO: Replace with dynamic import based on levelId
    const data = transformLevelData(level1);
    setPieces(data.pieces);

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
