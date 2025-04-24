import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

import { PieceDetail, Position3 } from "@/types";

function generateBasePlateStuds(nx: number, nz: number): Position3[] {
  // helper to fill an array with [x,z] pairs
  const arr: Position3[] = [];
  for (let x = 0; x < nx; x++)
    for (let z = 0; z < nz; z++)
      arr.push([x - (nx - 1) / 2, 0.2, z - (nz - 1) / 2]);
  return arr;
}

export function getPieceFromId(pieceId: string): PieceDetail {
  const pieceDetail = pieceDetails.find((piece) => piece.pieceId === pieceId);
  if (!pieceDetail) {
    throw new Error(`Piece id ${pieceId} not found`);
  }
  return pieceDetail;
}

export const pieceDetails: PieceDetail[] = [
  /* ------------------------------------------------------------------ */
  /* Bricks                                                             */
  /* ------------------------------------------------------------------ */
  {
    pieceId: "brick-1x1x1",
    type: "brick",
    name: "1x1x1",
    geometry: () => {
      return new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0);
    },
    topStudPositions: [[0, 1, 0]],
    bottomStudPositions: [[0, 0, 0]],
    inventoryIcon: "🧱",
    defaultColor: "#FF0000", // Red
  },

  {
    pieceId: "brick-2x2x1",
    type: "brick",
    name: "2x2x1",
    geometry: () => {
      return new THREE.BoxGeometry(2, 1, 2).translate(0, 0.5, 0);
    },
    topStudPositions: [
      [-0.5, 1, -0.5],
      [0.5, 1, -0.5],
      [-0.5, 1, 0.5],
      [0.5, 1, 0.5],
    ],
    bottomStudPositions: [
      [-0.5, 0, -0.5],
      [0.5, 0, -0.5],
      [-0.5, 0, 0.5],
      [0.5, 0, 0.5],
    ],
    inventoryIcon: "2x2",
    defaultColor: "#00FF00", // Green
  },

  {
    pieceId: "brick-3x3x.5",
    type: "brick",
    name: "3x3x.5",
    geometry: () => {
      return new THREE.BoxGeometry(3, 0.5, 3).translate(0, 0.25, 0);
    },
    topStudPositions: [
      [-1, 0, -1],
      [0, 0.5, -1],
      [1, 0.5, -1],
      [-1, 0.5, 0],
      [0, 0.5, 0],
      [1, 0.5, 0],
      [-1, 0.5, 1],
      [0, 0.5, 1],
      [1, 0.5, 1],
    ],
    bottomStudPositions: [
      [-1, 0, -1],
      [0, 0, -1],
      [1, 0, -1],
      [-1, 0, 0],
      [0, 0, 0],
      [1, 0, 0],
      [-1, 0, 1],
      [0, 0, 1],
      [1, 0, 1],
    ],
    inventoryIcon: "3x3",
    defaultColor: "#0000FF", // Blue
  },

  {
    pieceId: "base-plate-16x16",
    type: "plate",
    name: "Baseplate",
    geometry: () => {
      return new THREE.BoxGeometry(16, 0.2, 16).translate(0, 0.1, 0);
    },
    topStudPositions: generateBasePlateStuds(16, 16),
    bottomStudPositions: [],
    inventoryIcon: "Baseplate",
    defaultColor: "#808080", // Gray
  },

  {
    pieceId: "slant-1",
    type: "slant",
    name: "Slant 1",
    geometry: () => {
      const boxGeom = new THREE.BoxGeometry(1, 1, 1).translate(0.5, 0.5, 0.5).toNonIndexed();
      const triangleFace = new THREE.Shape()
        .moveTo(0, 0)
        .lineTo(1, 0)
        .lineTo(0, 1)
        .lineTo(0, 0)
        .closePath();
      
      const triangleFaceGeom = new THREE.ShapeGeometry(triangleFace).toNonIndexed();
      const triangularPrism = new THREE.ExtrudeGeometry(triangleFace, {
        depth: 1, // extrude one stud in Z
        bevelEnabled: false,
        steps: 1,

      }).toNonIndexed();
      const bottomCap = triangleFaceGeom.clone().translate(0, 0, 1);
      const topCap = triangleFaceGeom.clone().translate(0, 0, 0);
      // Create the geometry
      
      const triangularPrismGeom = mergeGeometries([triangularPrism, bottomCap, topCap], false).translate(1,0, 0);
      const mergedGeometry = mergeGeometries([boxGeom, triangularPrismGeom], false).translate(-1, 0, -.5);
      return mergedGeometry;
    },
    topStudPositions: [[-0.5, 1, 0]],
    bottomStudPositions: [
      [-0.5, 0, 0],
      [0.5, 0, 0],
    ],
    inventoryIcon: "slant-piece",
    defaultColor: "#FFA500", // Orange
  },

  // …add more pieces below …
];
