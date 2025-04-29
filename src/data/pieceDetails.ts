import * as THREE from "three";
import { PieceDetail } from "@/types";

export function getPieceFromId(pieceId: string): PieceDetail {
  const pieceDetail = pieceDetails.find((piece) => piece.pieceId === pieceId);
  if (!pieceDetail) {
    throw new Error(`Piece id ${pieceId} not found`);
  }
  return pieceDetail;
}

// Helper function to generate stud positions for rectangular bricks
function generateStudPositions(
  width: number,
  height: number,
  depth: number
): Array<[number, number, number]> {
  const positions: Array<[number, number, number]> = [];
  const halfWidth = width / 2;
  const halfDepth = depth / 2;

  for (let x = 0; x < width; x++) {
    for (let z = 0; z < depth; z++) {
      positions.push([x - halfWidth + 0.5, height, z - halfDepth + 0.5]);
    }
  }

  return positions;
}

// Helper function to generate bottom stud positions for rectangular bricks
function generateBottomStudPositions(
  width: number,
  depth: number
): Array<[number, number, number]> {
  const positions: Array<[number, number, number]> = [];
  const halfWidth = width / 2;
  const halfDepth = depth / 2;

  for (let x = 0; x < width; x++) {
    for (let z = 0; z < depth; z++) {
      positions.push([x - halfWidth + 0.5, 0, z - halfDepth + 0.5]);
    }
  }

  return positions;
}

/*
  This const contains the definition of each piece type given its id
  It stores the geometry, top and bottom stud positions, inventory icon, and default color
  The geometry is a function that returns a THREE.Geometry object
  The top and bottom stud positions are arrays of [x, y, z] positions
  The inventory icon is a string that will be displayed in the inventory
  The default color is a string that will be displayed in the inventory

  More pieces can be added by adding a new object to the array with the desired properties
*/
export const pieceDetails: PieceDetail[] = [
  /* ------------------------------------------------------------------ */
  /* Short Bricks (0.5 height)                                          */
  /* ------------------------------------------------------------------ */
  {
    pieceId: "brick-1x1x0.5",
    type: "short-brick",
    name: "1×1×0.5",
    geometry: () => {
      try {
        const geometry = new THREE.BoxGeometry(1, 0.5, 1);
        geometry.translate(0, 0.25, 0);
        return geometry;
      } catch (error) {
        console.error("Error creating geometry for brick-1x1x0.5:", error);
        return new THREE.BoxGeometry(1, 1, 1); // Fallback
      }
    },
    topStudPositions: [[0, 0.5, 0]],
    bottomStudPositions: [[0, 0, 0]],
    inventoryIcon: "1×1",
    defaultColor: "#FF5252", // Light red
  },
  {
    pieceId: "brick-2x2x0.5",
    type: "short-brick",
    name: "2×2×0.5",
    geometry: () => {
      try {
        const geometry = new THREE.BoxGeometry(2, 0.5, 2);
        geometry.translate(0, 0.25, 0);
        return geometry;
      } catch (error) {
        console.error("Error creating geometry for brick-2x2x0.5:", error);
        return new THREE.BoxGeometry(2, 1, 2); // Fallback
      }
    },
    topStudPositions: generateStudPositions(2, 0.5, 2),
    bottomStudPositions: generateBottomStudPositions(2, 2),
    inventoryIcon: "2×2",
    defaultColor: "#8BC34A", // Light green
  },
  {
    pieceId: "brick-2x4x0.5",
    type: "short-brick",
    name: "2×4×0.5",
    geometry: () => {
      try {
        const geometry = new THREE.BoxGeometry(2, 0.5, 4);
        geometry.translate(0, 0.25, 0);
        return geometry;
      } catch (error) {
        console.error("Error creating geometry for brick-2x4x0.5:", error);
        return new THREE.BoxGeometry(2, 1, 4); // Fallback
      }
    },
    topStudPositions: generateStudPositions(2, 0.5, 4),
    bottomStudPositions: generateBottomStudPositions(2, 4),
    inventoryIcon: "2×4",
    defaultColor: "#009688", // Teal
  },

  /* ------------------------------------------------------------------ */
  /* Medium Bricks (1.0 height)                                         */
  /* ------------------------------------------------------------------ */
  {
    pieceId: "brick-1x1x1",
    type: "medium-brick",
    name: "1×1×1",
    geometry: () => {
      try {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        geometry.translate(0, 0.5, 0);
        return geometry;
      } catch (error) {
        console.error("Error creating geometry for brick-1x1x1:", error);
        return new THREE.BoxGeometry(1, 1, 1);
      }
    },
    topStudPositions: [[0, 1, 0]],
    bottomStudPositions: [[0, 0, 0]],
    inventoryIcon: "1×1",
    defaultColor: "#3F51B5", // Indigo
  },
  {
    pieceId: "brick-2x2x1",
    type: "medium-brick",
    name: "2×2×1",
    geometry: () => {
      try {
        const geometry = new THREE.BoxGeometry(2, 1, 2);
        geometry.translate(0, 0.5, 0);
        return geometry;
      } catch (error) {
        console.error("Error creating geometry for brick-2x2x1:", error);
        return new THREE.BoxGeometry(2, 1, 2);
      }
    },
    topStudPositions: generateStudPositions(2, 1, 2),
    bottomStudPositions: generateBottomStudPositions(2, 2),
    inventoryIcon: "2×2",
    defaultColor: "#673AB7", // Deep purple
  },
  {
    pieceId: "brick-2x4x1",
    type: "medium-brick",
    name: "2×4×1",
    geometry: () => {
      try {
        const geometry = new THREE.BoxGeometry(2, 1, 4);
        geometry.translate(0, 0.5, 0);
        return geometry;
      } catch (error) {
        console.error("Error creating geometry for brick-2x4x1:", error);
        return new THREE.BoxGeometry(2, 1, 4);
      }
    },
    topStudPositions: generateStudPositions(2, 1, 4),
    bottomStudPositions: generateBottomStudPositions(2, 4),
    inventoryIcon: "2×4",
    defaultColor: "#E91E63", // Pink
  },

  /* ------------------------------------------------------------------ */
  /* Tall Bricks (2.0 height)                                           */
  /* ------------------------------------------------------------------ */
  {
    pieceId: "brick-1x1x2",
    type: "tall-brick",
    name: "1×1×2",
    geometry: () => {
      try {
        const geometry = new THREE.BoxGeometry(1, 2, 1);
        geometry.translate(0, 1, 0);
        return geometry;
      } catch (error) {
        console.error("Error creating geometry for brick-1x1x2:", error);
        return new THREE.BoxGeometry(1, 1, 1);
      }
    },
    topStudPositions: [[0, 2, 0]],
    bottomStudPositions: [[0, 0, 0]],
    inventoryIcon: "1×1",
    defaultColor: "#795548", // Brown
  },
  {
    pieceId: "brick-2x2x2",
    type: "tall-brick",
    name: "2×2×2",
    geometry: () => {
      try {
        const geometry = new THREE.BoxGeometry(2, 2, 2);
        geometry.translate(0, 1, 0);
        return geometry;
      } catch (error) {
        console.error("Error creating geometry for brick-2x2x2:", error);
        return new THREE.BoxGeometry(2, 1, 2);
      }
    },
    topStudPositions: generateStudPositions(2, 2, 2),
    bottomStudPositions: generateBottomStudPositions(2, 2),
    inventoryIcon: "2×2",
    defaultColor: "#FF9800", // Orange
  },
  {
    pieceId: "brick-2x4x2",
    type: "tall-brick",
    name: "2×4×2",
    geometry: () => {
      try {
        const geometry = new THREE.BoxGeometry(2, 2, 4);
        geometry.translate(0, 1, 0);
        return geometry;
      } catch (error) {
        console.error("Error creating geometry for brick-2x4x2:", error);
        return new THREE.BoxGeometry(2, 1, 4);
      }
    },
    topStudPositions: generateStudPositions(2, 2, 4),
    bottomStudPositions: generateBottomStudPositions(2, 4),
    inventoryIcon: "2×4",
    defaultColor: "#FFEB3B", // Yellow
  },
];
