// utils/stud-utils.ts
import * as THREE from "three";
import { getPieceFromType } from "./pieceDetails";

/** A 3D coordinate tuple */
export type Position3 = [number, number, number];

/** A placed piece in the world */
export interface PlacedPiece {
  id: number;
  type: string;
  pos: Position3;
  rot: Position3;
}

/** A stud or hole in world space */
export interface StudWorld {
  x: number;
  y: number;
  z: number;
  localY: number;
}

// ------------------------------------------------------------------
// Scratch objects for repeated use
// ------------------------------------------------------------------
const v = new THREE.Vector3();
const quat = new THREE.Quaternion();

// ½‑stud grid snapping – every stud centre lies on …‑1.5,‑1,‑0.5,0…
const GRID = 0.5;
const snap = (n: number): number => Math.round(n / GRID) * GRID;
const keyXZ = (x: number, z: number): string => `${Math.round(x / GRID)}|${Math.round(z / GRID)}`;

// ------------------------------------------------------------------
// Convert local stud / hollow coords to world‑space
// ------------------------------------------------------------------
export function worldStuds(
  piece: PlacedPiece,
  kind: "top" | "bottom"
): StudWorld[] {
  const def = getPieceFromType(piece.type);
  if (!def) {
    console.error("Unknown piece type:", piece.type);
    return [];
  }

  const list = kind === "top" ? def.topStudPositions : def.bottomStudPositions;

  // build quaternion for yaw rotation
  quat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), piece.rot[1]);

  return list.map(([lx, ly, lz]) => {
    v
      .set(lx + 0.5, ly, lz + 0.5) // centre of stud / hole
      .applyQuaternion(quat)        // rotate
      .add(new THREE.Vector3(...piece.pos)); // translate

    // snap X & Z to exact ½‑stud grid so keys always match
    return { x: snap(v.x), y: v.y, z: snap(v.z), localY: ly };
  });
}

// ------------------------------------------------------------------
// Given placed pieces + a candidate, return { y, valid }
// ------------------------------------------------------------------
export function snapAndValidate(
  all: PlacedPiece[],
  candidate: PlacedPiece
): { y: number; valid: boolean } {
  // 1. build map: (x|z) -> highest top‑stud Y
  const map: Record<string, number> = {};

  all.forEach((p) =>
    worldStuds(p, "top").forEach((s) => {
      const k = keyXZ(s.x, s.z);
      map[k] = map[k] === undefined ? s.y : Math.max(map[k], s.y);
    })
  );

  // 2. check candidate’s bottom holes
  let valid = false;
  let targetY = -Infinity;

  worldStuds(candidate, "bottom").forEach((s) => {
    const k = keyXZ(s.x, s.z);
    if (map[k] !== undefined) {
      valid = true;
      // place brick so this hole’s world‑Y == stud’s world‑Y
      const desiredPieceY = map[k] - s.localY;
      targetY = Math.max(targetY, desiredPieceY);
    }
  });

  return { y: valid ? targetY : candidate.pos[1], valid };
}

// ------------------------------------------------------------------
// Try placing a new piece of a given type at XZ + rotation
// Returns the placed piece with correct Y, or null if invalid
// ------------------------------------------------------------------
export function attemptPlace(
  pieces: PlacedPiece[],
  type: string,
  gridPosXZ: [number, number],
  rotY: number
): PlacedPiece | null {
  const candidate: PlacedPiece = {
    id: 9999, // temporary ID
    type,
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
