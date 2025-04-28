// src/components/LegoPiece.jsx
import React, { useMemo, useEffect } from "react";

import * as THREE from "three";
import { ThreeElements } from "@react-three/fiber";

import {
  getLegoPieceGeomWithStuds,
  getLegoPieceGhostMaterial,
  getLegoPiecePlacedMaterial,
} from "@/utils/legoUtils";
import { getPieceFromId } from "@/utils/pieceDetails";

type LegoProps = {
  baseGeometry: THREE.BufferGeometry;
  topStudPositions?: [number, number, number][];
  bottomStudPositions?: [number, number, number][];
  staged?: boolean;
  isValidPosition?: boolean;
  color?: string;
  solidMaterialProps?: THREE.MeshPhysicalMaterialParameters;
} & Omit<ThreeElements["group"], "children">;

export default function Lego({
  baseGeometry,
  topStudPositions = [],
  bottomStudPositions = [],
  staged = false,
  isValidPosition = true,
  color = "#ffffff",
  ...groupProps
}: LegoProps) {
  // Use memo call to prevent unessecarry re-renders
  const fullGeometry: THREE.BufferGeometry = useMemo(() => {
    return getLegoPieceGeomWithStuds(
      baseGeometry,
      topStudPositions,
      bottomStudPositions
    );
  }, [baseGeometry, topStudPositions, bottomStudPositions]);
  const edgeGeometry = useMemo(
    () => new THREE.EdgesGeometry(baseGeometry, 0.1),
    [baseGeometry]
  );

  const solidMaterial = useMemo(
    () => getLegoPiecePlacedMaterial(color),
    [color]
  );
  const validGhostMaterial = useMemo(
    () => getLegoPieceGhostMaterial("#0080ff"),
    []
  );
  const invalidGhostMaterial = useMemo(
    () => getLegoPieceGhostMaterial("#ff4040"),
    []
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
    <group {...groupProps}>
      <mesh castShadow={!staged} geometry={fullGeometry} material={material} />
      {staged && (
        <lineSegments geometry={edgeGeometry}>
          <lineBasicMaterial color="black" linewidth={1} />
        </lineSegments>
      )}
    </group>
  );
}

export function getLegoPiece(
  id: string,
  key: string,
  props: Omit<
    LegoProps,
    "baseGeometry" | "topStudPositions" | "bottomStudPositions"
  >
) {
  const def = getPieceFromId(id);
  return (
    <Lego
      key={key}
      baseGeometry={def.geometry()}
      topStudPositions={def.topStudPositions}
      bottomStudPositions={def.bottomStudPositions}
      {...props}
    />
  );
}
