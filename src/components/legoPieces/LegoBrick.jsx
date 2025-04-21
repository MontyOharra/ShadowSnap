import { LegoPiece } from "./LegoPiece";
import { pieceDetails } from "../../utils/pieceDetails";
import { useMemo } from "react";

export function LegoBrick1x1x1(props) {
  const def = pieceDetails["brick-1x1x1"];
  return (
    <LegoPiece
      // eslint-disable-next-line react-hooks/exhaustive-deps
      geometry={useMemo(def.geometry, []) /* lazy create once */}
      topStudPositions={def.topStudPositions}
      {...props}
    />
  );
}

export function LegoBrick2x2x1(props) {
  const def = pieceDetails["brick-2x2x1"];
  return (
    <LegoPiece
      // eslint-disable-next-line react-hooks/exhaustive-deps
      geometry={useMemo(def.geometry, [])}
      topStudPositions={def.topStudPositions}
      {...props}
    />
  );
}

export function LegoBrick3x3xmed(props) {
  const def = pieceDetails["brick-3x3x.5"];
  return (
    <LegoPiece
      // eslint-disable-next-line react-hooks/exhaustive-deps
      geometry={useMemo(def.geometry, [])}
      topStudPositions={def.topStudPositions}
      {...props}
    />
  );
}
