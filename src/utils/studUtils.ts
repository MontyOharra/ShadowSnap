import * as THREE from "three";
import { getPieceFromId } from "../data/pieceDetails";
import { getBasePlateFromId } from "../data/basePlateDetails";
import { Piece, StudWorld, Position3, StagedPiece, BasePlate } from "@/types";
import { PieceDetail } from "@/types";

const quaternion = new THREE.Quaternion();

const GRID = 0.5;

/**
 * Snaps a value to the nearest grid point
 */
function getSnappedValue(n: number): number {
  return Math.round(n / GRID) * GRID;
}

/**
 * Creates a key for the stud position map
 */
function keyXZ(x: number, z: number): string {
  return `${getSnappedValue(x)}|${getSnappedValue(z)}`;
}

/**
 * Creates a map of stud positions to their highest Y values
 */
function createStudHeightMap(
  pieces: (Piece | BasePlate)[]
): Record<string, number> {
  const map: Record<string, number> = {};
  pieces.forEach((p) =>
    getPieceStudCoords(p, "top").forEach((s) => {
      const k = keyXZ(s.x, s.z);
      map[k] = map[k] === undefined ? s.y : Math.max(map[k], s.y);
    })
  );
  return map;
}

/**
 * Finds the center bottom stud of a piece
 */
function findCenterBottomStud(def: PieceDetail): Position3 | null {
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

  return centerBottomStudPosition;
}

/**
 * Snaps a coordinate to the grid based on baseplate size
 */
function snapToGrid(coord: number, size: number): number {
  if (size % 2 === 1) {
    // Odd size: snap to whole numbers
    return Math.round(coord);
  } else {
    // Even size: snap to .5 intervals only
    return Math.floor(coord) + 0.5;
  }
}

/**
 * Calculates the rotated corners of a piece
 */
function getRotatedCorners(
  pieceSize: THREE.Vector3,
  rotation: number,
  position: [number, number, number]
): [number, number][] {
  const halfSizeX = pieceSize.x / 2;
  const halfSizeZ = pieceSize.z / 2;

  return [
    [-halfSizeX, -halfSizeZ],
    [halfSizeX, -halfSizeZ],
    [halfSizeX, halfSizeZ],
    [-halfSizeX, halfSizeZ],
  ].map(([x, z]) => {
    const rotated = new THREE.Vector3(x, 0, z).applyQuaternion(
      new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rotation, 0))
    );
    return [rotated.x + position[0], rotated.z + position[2]];
  });
}

/**
 * Checks if a piece is within baseplate bounds
 */
function isWithinBounds(
  corners: [number, number][],
  basePlateSizeX: number,
  basePlateSizeZ: number
): boolean {
  const halfBaseX = basePlateSizeX / 2;
  const halfBaseZ = basePlateSizeZ / 2;
  return !corners.some(
    ([x, z]) => Math.abs(x) > halfBaseX || Math.abs(z) > halfBaseZ
  );
}

/**
 * Gets the highest Y position for a piece's studs
 */
function getHighestStudY(
  piece: StagedPiece,
  studMap: Record<string, number>,
  position: [number, number, number]
): { maxY: number; valid: boolean } {
  let maxY = -Infinity;
  let valid = false;

  getPieceStudCoords({ ...piece, pos: position }, "bottom").forEach((s) => {
    const k = keyXZ(s.x, s.z);
    if (studMap[k] !== undefined) {
      valid = true;
      maxY = Math.max(maxY, studMap[k]);
    }
  });

  return { maxY, valid };
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
      .set(xPos, yPos, zPos)
      .applyQuaternion(studRotationQuat)
      .add(new THREE.Vector3(...piece.pos));

    return {
      x: getSnappedValue(studPosition.x),
      y: studPosition.y,
      z: getSnappedValue(studPosition.z),
      localY: yPos,
    };
  });
}

export function isStudUnderPieces(piece: Piece, allPieces: Piece[]): boolean {
  const bottomStuds: Position3[] = [];
  [...allPieces].forEach((p) =>
    getPieceStudCoords(p, "bottom").forEach((s) => {
      bottomStuds.push([s.x, s.y, s.z]);
    })
  );
  const topStuds = getPieceStudCoords(piece, "top");

  return bottomStuds.some((s) =>
    topStuds.some((t) => t.x === s[0] && t.y === s[1] && t.z === s[2])
  );
}

// ------------------------------------------------------------------
// Given placed pieces + a candidate, return { x, y, z, valid }
// ------------------------------------------------------------------
export function snapAndValidate(
  allPieces: Piece[],
  stagedPiece: StagedPiece,
  basePlatePiece: BasePlate
): { position: Position3; valid: boolean } {
  // 1. Build stud height map
  const studMap = createStudHeightMap([basePlatePiece, ...allPieces]);

  // 2. Get the piece definition
  const def = getPieceFromId(stagedPiece.pieceId);
  if (!def) {
    console.error("Unknown piece type:", stagedPiece.pieceId);
    return { position: stagedPiece.pos, valid: false };
  }

  // 3. Find center bottom stud
  const centerBottomStud = findCenterBottomStud(def);
  if (!centerBottomStud) {
    console.error("No bottom studs found for piece:", stagedPiece.pieceId);
    return { position: stagedPiece.pos, valid: false };
  }

  // 4. Calculate world position of center bottom stud
  const studWorldPos = new THREE.Vector3(...centerBottomStud)
    .applyQuaternion(
      new THREE.Quaternion().setFromEuler(
        new THREE.Euler(0, stagedPiece.rot[1], 0)
      )
    )
    .add(new THREE.Vector3(...stagedPiece.pos));

  // 5. Snap to grid
  const snappedX = snapToGrid(studWorldPos.x, basePlatePiece.sizeX);
  const snappedZ = snapToGrid(studWorldPos.z, basePlatePiece.sizeZ);

  // 6. Calculate final position
  const centerToStudOffset = new THREE.Vector3(
    ...centerBottomStud
  ).applyQuaternion(
    new THREE.Quaternion().setFromEuler(
      new THREE.Euler(0, stagedPiece.rot[1], 0)
    )
  );

  const finalX = snappedX - centerToStudOffset.x;
  const finalZ = snappedZ - centerToStudOffset.z;

  // 7. Check bounds
  const pieceGeometry = def.geometry();
  pieceGeometry.computeBoundingBox();
  const pieceSize = new THREE.Vector3();
  pieceGeometry.boundingBox!.getSize(pieceSize);

  const corners = getRotatedCorners(pieceSize, stagedPiece.rot[1], [
    finalX,
    0,
    finalZ,
  ]);
  if (!isWithinBounds(corners, basePlatePiece.sizeX, basePlatePiece.sizeZ)) {
    return {
      position: [finalX, stagedPiece.pos[1], finalZ] as Position3,
      valid: false,
    };
  }

  // 8. Find highest Y position
  const { maxY, valid } = getHighestStudY(stagedPiece, studMap, [
    finalX,
    0,
    finalZ,
  ]);

  return {
    position: [finalX, valid ? maxY : stagedPiece.pos[1], finalZ] as Position3,
    valid,
  };
}
