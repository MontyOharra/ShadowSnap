// src/components/LegoPiece.jsx
import React, { useMemo, useEffect, JSX } from "react";

import * as THREE from "three";
import { ThreeElements } from "@react-three/fiber";

import { Position3 } from "@/types/common";
import { getLegoPieceGeomWithStuds, getLegoPieceGhostMaterial, getLegoPiecePlacedMaterial } from "@/utils/legoUtils";

type R3FMeshProps = ThreeElements['mesh']


type LegoProps = Omit<R3FMeshProps, "geometry" | "material"> &{
  // inherit all mesh props
  geometry: THREE.BufferGeometry; // …then add/override ours
  topStudPositions?: [number, number, number][];
  staged?: boolean;
  isValidPosition?: boolean;
  color?: string;
  solidMaterialProps?: THREE.MeshPhysicalMaterialParameters;
};
export default function Lego({
  baseGeometry,
  topStudPositions = [],
  staged = false,
  isValidPosition = true,
  color = "#ffffff",
  ...meshProps
}: LegoProps) {

  // Use memo call to prevent unessecarry re-renders
  const fullGeometry: THREE.BufferGeometry = useMemo(() => {
    return getLegoPieceGeomWithStuds(baseGeometry, topStudPositions);
  }, [baseGeometry, topStudPositions]);
  const edgeGeometry = useMemo(
    () => new THREE.EdgesGeometry(baseGeometry, 0.1),
    [baseGeometry]
  );

  const solidMaterial = useMemo(
    () => getLegoPiecePlacedMaterial(color), [color]
  );
  const validGhostMaterial = useMemo(
    () => getLegoPieceGhostMaterial("#0080ff"), []
  );
  const invalidGhostMaterial = useMemo(
    () => getLegoPieceGhostMaterial("#ff4040"), []
  );

  // Clear pre-rendered materials and geometries on component unmount
  // or on re-render
  useEffect(
    () => () => {
      solidMaterial.dispose();
      validGhostMaterial.dispose();
      invalidGhostMaterial.dispose();
      fullGeometry.dispose();
      edgeGeometry.dispose();
    },
    [
      solidMaterial,
      validGhostMaterial,
      invalidGhostMaterial,
      fullGeometry,
      edgeGeometry,
    ]
  );

  let material = solidMaterial;
  if (staged && isValidPosition) material = validGhostMaterial;
  if (staged && !isValidPosition) material = invalidGhostMaterial;

  return (
    <group {...meshProps}>
      <mesh
        castShadow={!staged}
        geometry={fullGeometry}
        material={material}
      />
      {staged && (
        <lineSegments geometry={edgeGeometry}>
          <lineBasicMaterial color="black" linewidth={1} />
        </lineSegments>
      )}
    </group>
  );
}
