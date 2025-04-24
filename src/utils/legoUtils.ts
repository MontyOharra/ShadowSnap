import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

import { Position3 } from "@/types";

export const unitsPerStud = 1; // global grid size
export const studRadius = 0.28;
export const studHeight = 0.175;

export function getLegoPieceGeomWithStuds(
  baseGeometry: THREE.BufferGeometry,
  topStudPositions: Position3[],
  bottomStudPositions: Position3[] = []
): THREE.BufferGeometry {
  /* 
    Calculate the geometry of the entire piece including the studs
    by combining the base level geometry of the 

    baseGeometry: the geometry of the base level of the piece
    topStudPositions: the positions of the studs on the top of the piece
    bottomStudPositions: the positions of the studs on the bottom of the piece
      */
  const geom: THREE.BufferGeometry = baseGeometry.clone().toNonIndexed();
  const studGeoms: THREE.BufferGeometry[] = [];
  topStudPositions.forEach((pos: Position3) => {
    studGeoms.push(
      new THREE.CylinderGeometry(studRadius, studRadius, studHeight, 16)
        .toNonIndexed()
        .translate(
          pos[0] * unitsPerStud + unitsPerStud / 2,
          pos[1] + studHeight / 2,
          pos[2] * unitsPerStud + unitsPerStud / 2
        )
    );
  });

  // TODO:
  // add bottom stud functionality

  return mergeGeometries([geom, ...studGeoms], false);
}

export function getLegoPiecePlacedMaterial(
  color: string
): THREE.MeshPhysicalMaterial {
  /*
      Define the material for a piece that is set down

      color: the color of the piece
      solidMaterialProps: any additional properties to pass to the material
  */
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.6,
    metalness: 0.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    envMapIntensity: 1.5,
    side: THREE.DoubleSide,
  });
}

export function getLegoPieceGhostMaterial(
  color: string
): THREE.MeshPhysicalMaterial {
  /*
      Define the material for a piece that is staged

      color: the color of the piece
      ghostMaterialProps: any additional properties to pass to the material
  */
  return new THREE.MeshPhysicalMaterial({
    color,
    transparent: true,
    opacity: 0.25,
    depthWrite: false,
    roughness: 0.1,
    metalness: 0.0,
    side: THREE.DoubleSide,
  });
}
