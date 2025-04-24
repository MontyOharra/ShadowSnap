"use client";

import { PieceDetail } from "@/types";
import PiecePreview from "./PiecePreview";

type PieceSnapshotProps = {
  piece: PieceDetail;
  isSelected?: boolean;
};

export default function PieceSnapshot({
  piece,
}: PieceSnapshotProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        backgroundColor: "white",
        overflow: "hidden",
        fontFamily: "var(--font-geist-sans)",
        transition: "all 0.2s ease",
        position: "relative",
      }}
    >
      {/* Piece preview */}
      <div
        style={{
          width: "100%",
          aspectRatio: "1",
          position: "relative",
          overflow: "hidden",
          borderRadius: "12px",
        }}
      >
        <PiecePreview pieceId={piece.pieceId} color={piece.defaultColor} />
      </div>

      {/* Piece name display */}
      <div
        style={{
          width: "100%",
          padding: "8px",
          backgroundColor: "white",
          textAlign: "center",
          fontSize: "14px",
          fontWeight: "500",
          fontFamily: "inherit",
        }}
      >
        {piece.name}
      </div>
    </div>
  );
}
