import * as THREE from "three";

export type Position3 = [number, number, number];
export type Direction = "left" | "right" | "up" | "down";
export type DefinedPieceType = "short-brick" | "medium-brick" | "tall-brick";
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

export interface BasePlateDetail {
  pieceId: DefinedBasePlateId;
  name: string;
  geometry: () => THREE.BufferGeometry;
  topStudPositions: Position3[];
  sizeX: number;
  sizeZ: number;
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

export interface BasePlate {
  key: string;
  pieceId: string;
  pos: Position3;
  rot: Position3;
  color?: string;
  sizeX: number;
  sizeZ: number;
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
  color: string;
}

/** A stud or hole in world space */
export interface StudWorld {
  x: number;
  y: number;
  z: number;
  localY: number;
}
