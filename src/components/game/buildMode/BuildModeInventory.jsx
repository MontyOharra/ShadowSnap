import React from "react";
import { pieceDetails } from "../../../utils/pieceDetails";
import { useGame } from "../../../stores/useGame";

export default function BuildModeInventory() {
  const changeNewPieceType = useGame((s) => s.changeNewPieceType);
  const newStagedPieceType = useGame((s) => s.newStagedPieceType); 

  return (
    <div
      style={{
        position: "absolute",
        right: "20px",
        top: "20px",
        bottom: "20px",
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
      {Object.values(pieceDetails).map(((piece, i) => {
        console.log(piece.type);
        var borderStyle;
        if (piece.type == newStagedPieceType) {
            borderStyle = "2px solid #0080ff";
        } else {
            borderStyle = "0px transparent";
        }
        return (
            <button
                key={i}
                onClick={() => {changeNewPieceType(piece.type);}}
                style={{
                    height: "40px",
                    fontSize: "14px",
                    cursor: "pointer",
                    border: borderStyle
                }}
            >{piece.inventoryIcon}</button>
        );
      })}
    </div>
  );
}
