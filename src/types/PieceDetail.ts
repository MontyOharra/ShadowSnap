import * as THREE from 'three';
import { Position3 } from './common';

export interface PieceDetail {
  /** Unique identifier, e.g. "brick-1x1x1" */
  type: string;
  /** Display name, e.g. "1x1x1" */
  name: string;
  /** Factory function that returns the piece’s geometry */
  geometry: () => THREE.BufferGeometry;
  /** Stud locations on top of the brick */
  topStudPositions: Position3[];
  /** Stud locations on bottom of the brick */
  bottomStudPositions: Position3[];
  /** Icon used in inventory UI */
  inventoryIcon: string;
}