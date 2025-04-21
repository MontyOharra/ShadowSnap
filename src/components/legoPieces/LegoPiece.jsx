// src/components/LegoPiece.jsx
import React, { useMemo, useEffect } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

const unitsPerStud = 1; // global grid size
const studRadius = 0.28;
const studHeight = 0.175;

export default function LegoPiece({
  geometry,
  topStudPositions = [],
  staged = false,
  isValidPosition = true,
  color = "#ffffff",
  solidMaterialProps = { side: THREE.DoubleSide },
  ...meshProps
}) {

  const pieceWithStudsGeometry = useMemo(() => {
    const geom = geometry.clone().toNonIndexed();
    const studGeoms = [];
    topStudPositions.forEach((pos) => {
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

    return mergeGeometries([geom, ...studGeoms], false);
  }, [geometry, topStudPositions]);
    

  // Material for a piece that is set down
  const solidMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color,
        roughness: 0.6,
        metalness: 0.0,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        envMapIntensity: 1.5,
        ...solidMaterialProps,
      }),
    [color, solidMaterialProps]
  );
  const validGhostMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#0080ff",
        transparent: true,
        opacity: 0.25,
        depthWrite: false,
        roughness: 0.1,
        metalness: 0.0,
      }),
    []
  );
  const invalidGhostMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#ff4040",
        transparent: true,
        opacity: 0.25,
        depthWrite: false,
        roughness: 0.1,
        metalness: 0.0,
      }),
    []
  );

  const edgeGeom = useMemo(
    () => new THREE.EdgesGeometry(geometry, .1),
    [geometry]
  );

  useEffect(
    () => () => {
      solidMaterial.dispose();
      validGhostMaterial.dispose();
      invalidGhostMaterial.dispose();
      edgeGeom.dispose();
      pieceWithStudsGeometry.dispose();
    },
    [solidMaterial, validGhostMaterial, invalidGhostMaterial, edgeGeom, pieceWithStudsGeometry]
  );

  var material = solidMaterial;
  if (staged && isValidPosition) material = validGhostMaterial;
  if (staged && !isValidPosition) material = invalidGhostMaterial;

  return (
    <group {...meshProps}>
      <mesh
        castShadow={!staged}
        geometry={pieceWithStudsGeometry}
        material={material}
      />
      {staged && (
        <lineSegments geometry={edgeGeom}>
          <lineBasicMaterial color="black" linewidth={1} />
        </lineSegments>
      )}
    </group>
  );
}
