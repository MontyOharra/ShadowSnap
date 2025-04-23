import { useMemo } from "react";

import LegoPiece from "../game/LegoPiece";
import { getPieceFromType } from "../../utils/pieceDetails";

export function LegoSlant1(props) {
  const def = getPieceFromType("slant-1");
  return (
    <LegoPiece
      // eslint-disable-next-line react-hooks/exhaustive-deps
      geometry={useMemo(def.geometry, []) /* lazy create once */}
      topStudPositions={def.topStudPositions}
      {...props}
    />
  );
}
