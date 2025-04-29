import * as THREE from "three";

import { BasePlateDetail, Position3 } from "@/types";


function generateBasePlateStuds(nx: number, nz: number): Position3[] {
  // helper to fill an array with [x,z] pairs
  const arr: Position3[] = [];
  for (let x = 0; x < nx; x++)
    for (let z = 0; z < nz; z++)
      arr.push([x - (nx - 1) / 2, 0.2, z - (nz - 1) / 2]);
  return arr;
}

export function getBasePlateFromId(pieceId: string): BasePlateDetail {
  // Obtains the BasePlateDetail definition of each base plate type given its id
  const pieceDetail = basePlateDetails.find(
    (piece: BasePlateDetail) => piece.pieceId === pieceId
  );
  if (!pieceDetail) {
    throw new Error(`Base plate id ${pieceId} not found`);
  }
  return pieceDetail;
}

export const basePlateDetails: BasePlateDetail[] = [
  {
    pieceId: "base-plate-16x16",
    name: "Baseplate 16x16",
    geometry: () => {
      return new THREE.BoxGeometry(16, 0.2, 16).translate(0, 0.1, 0);
    },
    topStudPositions: generateBasePlateStuds(16, 16),
    sizeX: 16,
    sizeZ: 16,
    defaultColor: "#808080", // Gray
  },

  {
    pieceId: "base-plate-8x3",
    name: "Baseplate 8x3",
    geometry: () => {
      return new THREE.BoxGeometry(8, 0.2, 3).translate(0, 0.1, 0);
    },
    topStudPositions: generateBasePlateStuds(8, 3),
    sizeX: 8,
    sizeZ: 3,
    defaultColor: "#808080", // Gray
  },
];