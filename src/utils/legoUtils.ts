import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

import { BasePlateDetail, PieceDetail, Position3 } from "@/types";
import { pieceDetails } from "../data/pieceDetails";
import { basePlateDetails } from "../data/basePlateDetails";
import { usePlayer } from "@/stores/usePlayer";

export const unitsPerStud = 1; // global grid size
export const studRadius = 0.28;
export const studHeight = 0.175;

export function getLegoPieceGeomWithStuds(
  baseGeometry: THREE.BufferGeometry,
  topStudPositions: Position3[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  const player = usePlayer.getState();

  let studQuality = 12;
  if (player.settings.quality === "low") {
    studQuality = 4;
  } else if (player.settings.quality === "normal") {
    studQuality = 12;
  } else if (player.settings.quality === "high") {
    studQuality = 24;
  } else if (player.settings.quality === "ultra") {
    studQuality = 48;
  }

  topStudPositions.forEach((pos: Position3) => {
    studGeoms.push(
      new THREE.CylinderGeometry(
        studRadius,
        studRadius,
        studHeight,
        studQuality
      )
        .toNonIndexed()
        .translate(
          pos[0] * unitsPerStud,
          pos[1] + studHeight / 2,
          pos[2] * unitsPerStud
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

export function getLegoPieceInvisibleMaterial(): THREE.MeshPhysicalMaterial {
  /*
      Define the material for a piece that is invisible (target building piece)
  */
  return new THREE.MeshPhysicalMaterial({
    color: "#000000",
    transparent: true,
    opacity: 0.0,
  });
}

export function getPieceFromId(pieceId: string): PieceDetail {
  /*
      Get the definition of a piece given its id

      pieceId: the id of the piece
  */
  const pieceDetail = pieceDetails.find((piece) => piece.pieceId === pieceId);
  if (!pieceDetail) {
    throw new Error(`Piece id ${pieceId} not found`);
  }
  return pieceDetail;
}

export function getBasePlateFromId(pieceId: string): BasePlateDetail {
  /*
      Get the definition of a base plate given its id

      pieceId: the id of the base plate
  */
  const pieceDetail = basePlateDetails.find(
    (piece) => piece.pieceId === pieceId
  );
  if (!pieceDetail) {
    throw new Error(`Piece id ${pieceId} not found`);
  }
  return pieceDetail;
}
