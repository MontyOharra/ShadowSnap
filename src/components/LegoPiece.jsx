// src/components/LegoPiece.jsx
import React, { useMemo } from 'react'
import { mergeGeometries }          from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import * as THREE from 'three'
import { CSG } from 'three-csg-ts';

export default function LegoPiece({
  geometry,
  studSpacing = 0.8,
  unitsPerStud = 1,
  studRadius  = 0.25,
  studHeight  = 0.1,
  ...meshProps
}) {
  // 1) Guard against missing geometry
  if (!geometry) {
    console.warn('LegoPiece: no geometry prop passed');
    return null;
  }

  // 2) Compute stud positions once
  const topStudPositions = useMemo(() => {
    // 1) get your geometry’s local bounds
    geometry.computeBoundingBox()
    const { min, max } = geometry.boundingBox

    // 2) grid sizing & raycaster setup
    const cellSize  = unitsPerStud
    const halfCell  = cellSize / 2
    const nx        = Math.floor((max.x - min.x) / cellSize)
    const nz        = Math.floor((max.z - min.z) / cellSize)
    const yRayStart = max.y + 1            // start ray well above
    const down      = new THREE.Vector3(0, -1, 0)
    const raycaster = new THREE.Raycaster()

    // 3) we need a mesh to raycast against (not in the scene!)
    const tempMesh = new THREE.Mesh(
      geometry,
      new THREE.MeshBasicMaterial()       // material doesn’t matter
    )

    const positions = []
    const TOL       = 1e-4

    // 4) for each grid cell, shoot a ray straight down…
    for (let ix = 0; ix < nx; ix++) {
      for (let iz = 0; iz < nz; iz++) {
        // compute the cell’s center in X,Z
        const x = min.x + ix * cellSize + halfCell
        const z = min.z + iz * cellSize + halfCell
        const origin = new THREE.Vector3(x, yRayStart, z)

        raycaster.set(origin, down)
        const hits = raycaster.intersectObject(tempMesh, false)

        // 5) if we hit anything, look at the face normal
        if (hits.length > 0) {
          const { face, point } = hits[0]
          // only horizontal faces: normal.y ≈ 1
          if (face.normal.y > 1 - TOL) {
            // plant the stud just above the surface
            positions.push(
              new THREE.Vector3(
                point.x,
                point.y + studHeight / 2,
                point.z
              )
            )
          }
        }
      }
    }

    console.log('LegoPiece:', positions.length, 'studs generated')
    return positions
  }, [geometry, unitsPerStud, studHeight])

  const bottomStudPositions = useMemo(() => {
    // 1) get your geometry’s local bounds
    geometry.computeBoundingBox()
    const { min, max } = geometry.boundingBox

    // 2) grid sizing & raycaster setup
    const cellSize  = unitsPerStud
    const halfCell  = cellSize / 2
    const nx        = Math.floor((max.x - min.x) / cellSize)
    const nz        = Math.floor((max.z - min.z) / cellSize)
    const yRayStart = min.y - 1            // start ray well above
    const up      = new THREE.Vector3(0, 1, 0)
    const raycaster = new THREE.Raycaster()

    // 3) we need a mesh to raycast against (not in the scene!)
    const tempMesh = new THREE.Mesh(
      geometry,
      new THREE.MeshBasicMaterial()       // material doesn’t matter
    )

    const positions = []
    const TOL       = 1e-4

    // 4) for each grid cell, shoot a ray straight down…
    for (let ix = 0; ix < nx; ix++) {
      for (let iz = 0; iz < nz; iz++) {
        // compute the cell’s center in X,Z
        const x = min.x + ix * cellSize + halfCell
        const z = min.z + iz * cellSize + halfCell
        const origin = new THREE.Vector3(x, yRayStart, z)

        raycaster.set(origin, up)
        const hits = raycaster.intersectObject(tempMesh, false)

        // 5) if we hit anything, look at the face normal
        if (hits.length > 0) {
          const { face, point } = hits[0]
          // only horizontal faces: normal.y ≈ 1
          if (face.normal.y < TOL - 1) {
            // plant the stud just above the surface
            positions.push(
              new THREE.Vector3(
                point.x,
                point.y + studHeight / 2,
                point.z
              )
            )
          }
        }
      }
    }

    console.log('LegoPiece:', positions.length, 'studs generated')
    return positions
  }, [geometry, unitsPerStud, studHeight])

  const hollowGeometry = useMemo(() => {
    if (!geometry) return null;
    if (!bottomStudPositions.length) {console.log("balls"); return geometry;}   // nothing to cut 
  
    /* a) build one union‑of‑cutter cylinders */
    const indentDepth = studHeight * 1.5;               // a bit deeper than stud
    const cutters = bottomStudPositions.map(pos => {
      // openEnded=true → only side walls, no caps (faster Boolean)
      const g = new THREE.CylinderGeometry(
        studRadius * 0.92,            // shave 8 % → avoids coplanar faces
        studRadius * 0.92,
        indentDepth,
        16,
        1,
        true
      ).toNonIndexed();
  
      // place it so its *bottom* is flush with the brick’s bottom face
      g.translate(pos.x, pos.y + indentDepth / 2, pos.z);
      return g;
    });
  
    const cutterGeom = mergeGeometries(cutters, false);
  
    /* b) Boolean difference: brick – cutters */
    const brickMesh  = new THREE.Mesh(geometry.clone().toNonIndexed());
    const cutterMesh = new THREE.Mesh(cutterGeom);
  
    return CSG.subtract(brickMesh, cutterMesh).geometry;
  }, [geometry, bottomStudPositions, studRadius, studHeight]);

  // 3) Return a <group> with your base mesh + studs
  return (
    <group {...meshProps}>
    {/* hollowed‑out brick */}
    {hollowGeometry && (
      <mesh geometry={hollowGeometry}>
        <meshStandardMaterial color="white" />
      </mesh>
    )}

    {/* top studs (as before) */}
    {topStudPositions.map((pos, i) => (
      <mesh key={`top${i}`} position={pos.toArray()}>
        <cylinderGeometry args={[studRadius, studRadius, studHeight, 16]} />
        <meshStandardMaterial color="lightgray" />
      </mesh>
    ))}

    {/* bottom tubes — just for visuals, optional */}
    {bottomStudPositions.map((pos, i) => (
      <mesh key={`bot${i}`} position={[pos.x, pos.y + studHeight / 2, pos.z]}>
        <cylinderGeometry
          /* slightly smaller radius; openEnded so you see a hole */
          args={[studRadius * 0.9, studRadius * 0.9, studHeight, 16, 1, true]}
        />
        <meshStandardMaterial color="#888" side={THREE.DoubleSide} />
      </mesh>
    ))}
  </group>
  )
}
