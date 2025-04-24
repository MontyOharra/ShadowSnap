import * as THREE from "three";

export type Position3 = [number, number, number];

export interface PieceDetail {
  // Unique identifier used in the background
  type: string;
  // Display name
  name: string;
  // Factory function that returns the piece's geometry
  geometry: () => THREE.BufferGeometry;
  // Stud locations on top of the brick
  topStudPositions: Position3[];
  // Stud locations on bottom of the brick
  bottomStudPositions: Position3[];
  // Icon used in inventory UI
  inventoryIcon: string;
}

/** A placed piece in the world */
export interface PlacedPiece {
  id: number;
  type: string;
  pos: Position3;
  rot: Position3;
  isBasePlate?: boolean;
}

/** A stud or hole in world space */
export interface StudWorld {
  x: number;
  y: number;
  z: number;
  localY: number;
}
