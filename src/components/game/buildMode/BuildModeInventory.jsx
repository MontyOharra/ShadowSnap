import React from "react";
import { pieceDetails } from "../../../utils/pieceDetails";
import { useGame } from "../../../stores/useGame";

export default function BuildModeInventory() {
  const stageNewPiece = useGame((s) => s.stageNewPiece);
  const unstagePiece = useGame((s) => s.unstagePiece);

  return (
    <div
      style={{
        position: "absolute",
        right: 0,
        top: 0,
        bottom: 0,
        width: "200px",
        overflowY: "auto",
        background: "rgba(255,255,255,0.85)",
        padding: "10px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        zIndex: 10,
      }}
    >
      {Object.keys(pieceDetails).map((type, idx) => (
        <button
          key={type}
          onClick={() => {unstagePiece(); stageNewPiece(type, [0, 0]);}}
          style={{
            height: "40px",
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          {idx + 1}. {type}
        </button>
      ))}
    </div>
  );
}
