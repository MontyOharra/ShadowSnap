import LegoPiece from "./LegoPiece";
import { pieceDetails } from "../../utils/pieceDetails";
import { useMemo } from "react";

export function LegoBasePlate16x16(props) {
  const def = pieceDetails["base-plate-16x16"];
  return (
    <LegoPiece
      // eslint-disable-next-line react-hooks/exhaustive-deps
      geometry={useMemo(def.geometry, []) /* lazy create once */}
      topStudPositions={def.topStudPositions}
      {...props}
    />
  );
}
