import * as THREE from "three";

// A 3D position in world space
export type Position3 = [number, number, number];

// A direction
export type Direction = "left" | "right" | "up" | "down";

// A type of piece given its id
export type DefinedPieceType = "short-brick" | "medium-brick" | "tall-brick";

// A list of valid piece ids
export type DefinedPieceId =
  | "brick-1x1x0.5"
  | "brick-1x1x1"
  | "brick-1x1x2"
  | "brick-2x2x0.5"
  | "brick-2x2x1"
  | "brick-2x2x2"
  | "brick-2x3x0.5"
  | "brick-2x3x1"
  | "brick-2x3x2"
  | "brick-2x4x0.5"
  | "brick-2x4x1"
  | "brick-2x4x2"
  | "brick-1x2x0.5"
  | "brick-1x2x1"
  | "brick-1x2x2"
  | "brick-1x3x0.5"
  | "brick-1x3x1"
  | "brick-1x3x2"
  | "brick-1x4x0.5"
  | "brick-1x4x1"
  | "brick-1x4x2"
  | "brick-3x3x0.5"
  | "brick-3x3x1"
  | "brick-3x3x2";
export type DefinedBasePlateId = "base-plate-16x16" | "base-plate-8x3";

// A definition of a piece type given its id
export interface PieceDetail {
  pieceId: DefinedPieceId;
  type: DefinedPieceType;
  name: string;
  geometry: () => THREE.BufferGeometry;
  topStudPositions: Position3[];
  bottomStudPositions: Position3[];
  inventoryIcon: string;
  defaultColor: string;
}

// A definition of a base plate type given its id
export interface BasePlateDetail {
  pieceId: DefinedBasePlateId;
  name: string;
  geometry: () => THREE.BufferGeometry;
  topStudPositions: Position3[];
  sizeX: number;
  sizeZ: number;
  defaultColor: string;
}

// A piece that is currently in the world
export interface Piece {
  key: string;
  pieceId: string;
  pos: Position3;
  rot: Position3;
  color?: string;
}

// A base plate that is currently in the world
export interface BasePlate {
  key: string;
  pieceId: string;
  pos: Position3;
  rot: Position3;
  color?: string;
  sizeX: number;
  sizeZ: number;
}

// A piece that is currently being placed in the world
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
  color: string;
}

/** A stud or hole in world space */
export interface StudWorld {
  x: number;
  y: number;
  z: number;
  localY: number;
}
