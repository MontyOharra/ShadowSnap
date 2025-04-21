import { LegoPiece } from "./LegoPiece";
import { pieceDetails } from "../../utils/pieceDetails";
import { useMemo } from "react";

export function LegoSlant1(props) {
  const def = pieceDetails["slant-1"];
  return (
    <LegoPiece
      // eslint-disable-next-line react-hooks/exhaustive-deps
      geometry={useMemo(def.geometry, []) /* lazy create once */}
      topStudPositions={def.topStudPositions}
      {...props}
    />
  );
}
