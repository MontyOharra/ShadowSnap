import { useMemo } from "react";

import LegoPiece from "../game/LegoPiece";
import { getPieceFromType } from "../../utils/pieceDetails";

export function LegoBasePlate16x16(props) {
  const def = getPieceFromType("base-plate-16x16");
  return (
    <LegoPiece
      // eslint-disable-next-line react-hooks/exhaustive-deps
      geometry={useMemo(def.geometry, []) /* lazy create once */}
      topStudPositions={def.topStudPositions}
      {...props}
    />
  );
}
