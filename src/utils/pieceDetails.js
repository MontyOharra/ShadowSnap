import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

function studsGrid(nx, nz) {
  // helper to fill an array with [x,z] pairs
  const arr = [];
  for (let x = 0; x < nx; x++) for (let z = 0; z < nz; z++) arr.push([x, 0, z]);
  return arr;
}

export const pieceDetails = {
  /* ------------------------------------------------------------------ */
  /* Bricks                                                             */
  /* ------------------------------------------------------------------ */
  "brick-1x1x1": {
    geometry() {
      return new THREE.BoxGeometry(1, 1, 1).translate(0.5, 0.5, 0.5);
    },
    height: 1,
    unitsPerStud: 1,
    topStudPositions: [[0, 1, 0]],
    bottomStudPositions: [[0, 0, 0]],
  },

  "brick-2x2x1": {
    geometry() {
      return new THREE.BoxGeometry(2, 1, 2).translate(1, 0.5, 1);
    },
    height: 1,
    unitsPerStud: 1,
    topStudPositions: [
      [0, 1, 0],
      [1, 1, 0],
      [0, 1, 1],
      [1, 1, 1],
    ],
    bottomStudPositions: [
      [0, 0, 0],
      [1, 0, 0],
      [0, 0, 1],
      [1, 0, 1],
    ],
  },

  "brick-3x3x.5": {
    geometry() {
      return new THREE.BoxGeometry(3, 0.5, 3).translate(1.5, 0.25, 1.5);
    },
    height: 0.5,
    unitsPerStud: 1,
    topStudPositions: [
      [0, 0.5, 0],
      [1, 0.5, 0],
      [2, 0.5, 0],
      [0, 0.5, 1],
      [1, 0.5, 1],
      [2, 0.5, 1],
      [0, 0.5, 2],
      [1, 0.5, 2],
      [2, 0.5, 2],
    ],
    bottomStudPositions: [
      [0, 0, 0],
      [1, 0, 0],
      [2, 0, 0],
      [0, 0, 1],
      [1, 0, 1],
      [2, 0, 1],
      [0, 0, 2],
      [1, 0, 2],
      [2, 0, 2],
    ],
  },

  "base-plate-16x16": {
    geometry() {
      // thin plate: 0.2‑unit thick, origin at its lower‑left corner
      return new THREE.BoxGeometry(16, 0.2, 16).translate(8, -0.1, 8);
    },
    height: 0.2, // so snapping rests bricks flush on top
    unitsPerStud: 1,
    topStudPositions: studsGrid(16, 16), // every stud position on the plate
    bottomStudPositions: [], // baseplates have no bottom hollows
  },

  "slant-1": {
    geometry() {
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
      const mergedGeometry = mergeGeometries([boxGeom, triangularPrismGeom], false);
      return mergedGeometry;
    },

    height: 1,
    unitsPerStud: 1,
    topStudPositions: [[0, 1, 0]],
    bottomStudPositions: [[0, 0, 0], [1, 0, 0]],
  },

  // …add more pieces below …
};
