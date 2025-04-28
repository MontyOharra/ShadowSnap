import * as THREE from "three";
import { getPieceFromId } from "./pieceDetails";
import { Piece, StudWorld, Position3, StagedPiece } from "@/types";

const quaternion = new THREE.Quaternion();

const GRID = 0.5;

function getSnappedValue(n: number): number {
  return Math.round(n / GRID) * GRID
}

function keyXZ(
  x: number,
  z: number
): string {
  return `${getSnappedValue(x)}|${getSnappedValue(z)}`;
}

// ------------------------------------------------------------------
// Convert local stud / hollow coords to world‑space
// ------------------------------------------------------------------
export function getPieceStudCoords(
  piece: Piece,
  studType: "top" | "bottom"
): StudWorld[] {
  const def = getPieceFromId(piece.pieceId);
  if (!def) {
    console.error("Unknown piece type:", piece.pieceId);
    return [];
  }

  let targetStuds: Position3[];
  if (studType === "top") {
    targetStuds = def.topStudPositions;
  } else if (studType === "bottom") {
    targetStuds = def.bottomStudPositions;
  } else {
    console.error("Unknown stud type:", studType);
    return [];
  }

  // Quaternion for yaw rotation
  quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), piece.rot[1]);

  const studRotationQuat = new THREE.Quaternion();
  const studPosition = new THREE.Vector3();
  return targetStuds.map(([xPos, yPos, zPos]) => {
    studPosition
      .set(xPos, yPos, zPos) // Stud positions are already centered
      .applyQuaternion(studRotationQuat) // Rotate the stud based on quaternion calculation
      .add(new THREE.Vector3(...piece.pos)); // Translate the stud to the correct position

    // snap X & Z to exact ½‑stud grid so keys always match
    return {
      x: getSnappedValue(studPosition.x),
      y: getSnappedValue(studPosition.y),
      z: getSnappedValue(studPosition.z),
      localY: yPos,
    };
  });
}

// ------------------------------------------------------------------
// Given placed pieces + a candidate, return { y, valid }
// ------------------------------------------------------------------
export function snapAndValidate(
  allPieces: Piece[],
  stagedPiece: StagedPiece
): { x: number; y: number; z: number; valid: boolean } {
  // 1. build map: (x|z) -> highest top‑stud Y
  const map: Record<string, number> = {};

  allPieces.forEach((p) =>
    getPieceStudCoords(p, "top").forEach((s) => {
      const k = keyXZ(s.x, s.z);
      map[k] = map[k] === undefined ? s.y : Math.max(map[k], s.y);
    })
  );

  // 2. check candidate's bottom holes
  let valid = false;
  let targetY = -Infinity;

  getPieceStudCoords(stagedPiece, "bottom").forEach((s) => {
    const k = keyXZ(s.x, s.z);
    if (map[k] !== undefined) {
      valid = true;
      // place brick so this hole's world‑Y == stud's world‑Y
      const desiredPieceY = map[k] - s.localY;
      targetY = Math.max(targetY, desiredPieceY);
    }
  });

  return { x: stagedPiece.pos[0], y: valid ? targetY : stagedPiece.pos[1], z: stagedPiece.pos[2], valid };
}

// ------------------------------------------------------------------
// Try placing a new piece of a given type at XZ + rotation
// Returns the placed piece with correct Y, or null if invalid
// ------------------------------------------------------------------
export function attemptPlace(
  pieces: Piece[],
  pieceId: string,
  gridPosXZ: [number, number],
  rotY: number
): Piece | null {
  const candidate: StagedPiece = {
    pieceId,
    key: "temp", // temporary key
    pos: [gridPosXZ[0], 0, gridPosXZ[1]],
    rot: [0, rotY, 0],
  };

  const { y, valid } = snapAndValidate(pieces, candidate);
  if (!valid) return null;

  return {
    ...candidate,
    pos: [gridPosXZ[0], y, gridPosXZ[1]],
  };
}
