import * as THREE from "three";

export type Position3 = [number, number, number];
export type Direction = "left" | "right" | "up" | "down";
export type DefinedPieceType = "brick" | "base-plate" | "slant";
export type DefinedPieceId =
  | "brick-1x1x1"
  | "brick-2x2x1"
  | "brick-3x3x.5"
  | "base-plate-16x16"
  | "slant-1";

export interface PieceDetail {
  // Unique identifier used in the background
  pieceId: DefinedPieceId;
  // Type of piece
  type: DefinedPieceType;
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
  // Default color for the piece
  defaultColor: string;
}

/** A placed piece in the world */
export interface Piece {
  key: string;
  pieceId: string;
  pos: Position3;
  rot: Position3;
  color?: string;
}

export interface StagedPiece {
  key: string;
  pieceId: string;
  pos: Position3;
  rot: Position3;
  isNew?: boolean;
  isValidPosition?: boolean;
  oldPos?: Position3;
  oldRot?: Position3;
  oldColor?: string;
}

/** A stud or hole in world space */
export interface StudWorld {
  x: number;
  y: number;
  z: number;
  localY: number;
}
