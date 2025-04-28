import * as THREE from "three";
import { getPieceFromId } from "../data/pieceDetails";
import { getBasePlateFromId } from "../data/basePlateDetails";
import { Piece, StudWorld, Position3, StagedPiece, BasePlate } from "@/types";
import { PieceDetail } from "@/types";

const quaternion = new THREE.Quaternion();

const GRID = 0.5;

function getSnappedValue(n: number): number {
  return Math.round(n / GRID) * GRID;
}

function keyXZ(x: number, z: number): string {
  return `${getSnappedValue(x)}|${getSnappedValue(z)}`;
}

// ------------------------------------------------------------------
// Convert local stud / hollow coords to world‑space
// ------------------------------------------------------------------
export function getPieceStudCoords(
  piece: Piece | BasePlate,
  studType: "top" | "bottom"
): StudWorld[] {
  let def;
  if ("sizeX" in piece) {
    // It's a BasePlate
    def = getBasePlateFromId(piece.pieceId);
  } else {
    // It's a regular Piece
    def = getPieceFromId(piece.pieceId);
  }

  if (!def) {
    console.error("Unknown piece type:", piece.pieceId);
    return [];
  }

  let targetStuds: Position3[];
  if (studType === "top") {
    targetStuds = def.topStudPositions;
  } else if (studType === "bottom") {
    if ("sizeX" in piece) {
      console.error("Base plate has no bottom studs");
      return [];
    }
    targetStuds = (def as PieceDetail).bottomStudPositions || [];
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
      y: studPosition.y,
      z: getSnappedValue(studPosition.z),
      localY: yPos,
    };
  });
}

export function isStudUnderPieces(
  piece: Piece,
  allPieces: Piece[],
): boolean {
  const bottomStuds: Position3[] = [];
  [...allPieces].forEach((p) =>
    getPieceStudCoords(p, "bottom").forEach((s) => {
      bottomStuds.push([s.x, s.y, s.z]);
    })
  );
  const topStuds = getPieceStudCoords(piece, "top");

  return bottomStuds.some((s) => topStuds.some((t) => t.x === s[0] && t.y === s[1] && t.z === s[2]));
}

// ------------------------------------------------------------------
// Given placed pieces + a candidate, return { x, y, z, valid }
// ------------------------------------------------------------------
export function snapAndValidate(
  allPieces: Piece[],
  stagedPiece: StagedPiece,
  basePlatePiece: BasePlate
): { position: Position3; valid: boolean } {
  // 1. build map: (x|z) -> highest top‑stud Y
  const map: Record<string, number> = {};

  // Include baseplate piece in the map calculation
  [basePlatePiece, ...allPieces].forEach((p) =>
    getPieceStudCoords(p, "top").forEach((s) => {
      const k = keyXZ(s.x, s.z);
      map[k] = map[k] === undefined ? s.y : Math.max(map[k], s.y);
    })
  );

  // 2. Get the piece definition to access stud positions
  const def = getPieceFromId(stagedPiece.pieceId);
  if (!def) {
    console.error("Unknown piece type:", stagedPiece.pieceId);
    return { position: stagedPiece.pos, valid: false };
  }

  // Find the bottom stud closest to center
  const bottomStuds = def.bottomStudPositions;
  let centerBottomStudPosition: Position3 | null = null;
  let minDistance = Infinity;
  let maxXZSum = -Infinity;

  bottomStuds.forEach(([x, y, z]) => {
    const distance = Math.sqrt(x ** 2 + z ** 2);
    const xzSum = x + z;

    if (
      distance < minDistance ||
      (distance === minDistance && xzSum > maxXZSum)
    ) {
      minDistance = distance;
      maxXZSum = xzSum;
      centerBottomStudPosition = [x, y, z];
    }
  });

  if (!centerBottomStudPosition) {
    console.error("No bottom studs found for piece:", stagedPiece.pieceId);
    return { position: stagedPiece.pos, valid: false };
  }

  // Calculate world position of the center bottom stud
  const studWorldPos = new THREE.Vector3(
    centerBottomStudPosition[0],
    centerBottomStudPosition[1],
    centerBottomStudPosition[2]
  )
    .applyQuaternion(
      new THREE.Quaternion().setFromEuler(
        new THREE.Euler(0, stagedPiece.rot[1], 0)
      )
    )
    .add(new THREE.Vector3(...stagedPiece.pos));

  // Helper function to snap a coordinate based on baseplate size
  const snapToGrid = (coord: number, size: number): number => {
    if (size % 2 === 1) {
      // Odd size: snap to whole numbers
      return Math.round(coord);
    } else {
      // Even size: snap to .5 intervals only
      return Math.floor(coord) + 0.5;
    }
  };

  // Snap the stud position to the grid
  const snappedX = snapToGrid(studWorldPos.x, basePlatePiece.sizeX);
  const snappedZ = snapToGrid(studWorldPos.z, basePlatePiece.sizeZ);

  // Calculate the offset from piece center to the stud in world space
  const centerToStudOffset = new THREE.Vector3(
    centerBottomStudPosition[0],
    centerBottomStudPosition[1],
    centerBottomStudPosition[2]
  ).applyQuaternion(
    new THREE.Quaternion().setFromEuler(
      new THREE.Euler(0, stagedPiece.rot[1], 0)
    )
  );

  // Calculate final piece position by subtracting the offset
  const finalX = snappedX - centerToStudOffset.x;
  const finalZ = snappedZ - centerToStudOffset.z;

  // Check if the piece is within baseplate bounds
  const pieceGeometry = def.geometry();
  pieceGeometry.computeBoundingBox();
  const pieceBoundingBox = pieceGeometry.boundingBox!;
  const pieceSize = new THREE.Vector3();
  pieceBoundingBox.getSize(pieceSize);

  // Calculate the piece's bounds in world space, considering rotation
  const halfSizeX = pieceSize.x / 2;
  const halfSizeZ = pieceSize.z / 2;

  // Calculate the rotated corners of the piece
  const corners = [
    [-halfSizeX, -halfSizeZ],
    [halfSizeX, -halfSizeZ],
    [halfSizeX, halfSizeZ],
    [-halfSizeX, halfSizeZ],
  ].map(([x, z]) => {
    const rotated = new THREE.Vector3(x, 0, z).applyQuaternion(
      new THREE.Quaternion().setFromEuler(
        new THREE.Euler(0, stagedPiece.rot[1], 0)
      )
    );
    return [rotated.x + finalX, rotated.z + finalZ];
  });

  // Check if any corner is outside the baseplate bounds
  const isOutOfBounds = corners.some(([x, z]) => {
    const halfBaseX = basePlatePiece.sizeX / 2;
    const halfBaseZ = basePlatePiece.sizeZ / 2;
    return Math.abs(x) > halfBaseX || Math.abs(z) > halfBaseZ;
  });

  if (isOutOfBounds) {
    return {
      position: [finalX, stagedPiece.pos[1], finalZ] as Position3,
      valid: false,
    };
  }

  // 5. Find the highest Y position for all studs at this XZ
  let maxY = -Infinity;
  let valid = false;

  getPieceStudCoords(
    { ...stagedPiece, pos: [finalX, 0, finalZ] },
    "bottom"
  ).forEach((s) => {
    const k = keyXZ(s.x, s.z);
    if (map[k] !== undefined) {
      valid = true;
      maxY = Math.max(maxY, map[k]);
    }
  });

  return {
    position: [finalX, valid ? maxY : stagedPiece.pos[1], finalZ] as Position3,
    valid,
  };
}
