// src/components/LegoPiece.jsx
import React, { useMemo, useEffect } from "react";
import * as THREE from "three";

const unitsPerStud = 1; // global grid size
const studRadius = 0.28;
const studHeight = 0.175;

/**
 * LegoPiece
 * @param geometry    THREE.BufferGeometry
 * @param topOffsets  [[x,z], …]  stud positions in grid coords
 * @param selected    bool
 * @param color       plastic colour
 * ...meshProps       position, rotation, onClick, etc.
 */
export default function LegoPiece({
  geometry,
  topStudPositions = [],
  selected = false,
  color = "#ffffff",
  materialProps = { side: THREE.DoubleSide },
  ...meshProps
}) {
  /* -------------------------------------------------------------- */
  /* Pre‑compute world‑space stud meshes (relative to the brick)     */
  /* -------------------------------------------------------------- */
  const studMeshes = useMemo(() => {
    return topStudPositions.map(([sx, sy, sz], i) => (
      <mesh
        key={i}
        position={[
          sx * unitsPerStud + unitsPerStud / 2,
          sy + studHeight / 2,
          sz * unitsPerStud + unitsPerStud / 2,
        ]}
        castShadow
      >
        <cylinderGeometry args={[studRadius, studRadius, studHeight, 16]} />
        <meshStandardMaterial
          color={selected ? color : color}
          transparent={selected}
          opacity={selected ? 0.25 : 1}
          depthWrite={!selected}
          roughness={0.1}
          metalness={0.0}
        />
      </mesh>
    ));
  }, [topStudPositions, selected, color]);

  /* -------------------------------------------------------------- */
  /* Materials & edge overlay (same as before)                      */
  /* -------------------------------------------------------------- */
  const solidMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color,
        roughness: 0.1,
        metalness: 0.0,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        envMapIntensity: 1.5,
        ...materialProps,
      }),
    [color, materialProps]
  );

  const ghostMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color,
        transparent: true,
        opacity: 0.25,
        depthWrite: false,
        roughness: 0.1,
        metalness: 0.0,
      }),
    [color]
  );

  const edgeGeom = useMemo(
    () => new THREE.EdgesGeometry(geometry, 1e-3),
    [geometry]
  );

  useEffect(
    () => () => {
      solidMat.dispose();
      ghostMat.dispose();
      edgeGeom.dispose();
    },
    [solidMat, ghostMat, edgeGeom]
  );

  /* -------------------------------------------------------------- */
  return (
    <group {...meshProps}>
      <mesh castShadow geometry={geometry} material={selected ? ghostMat : solidMat} />
      {selected && (
        <lineSegments geometry={edgeGeom}>
          <lineBasicMaterial color="black" linewidth={1} />
        </lineSegments>
      )}
      {studMeshes}
    </group>
  );
}
