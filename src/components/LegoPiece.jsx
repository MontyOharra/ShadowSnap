// src/components/LegoPiece.jsx
import React, { useMemo } from "react";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import * as THREE from "three";
import { CSG } from "three-csg-ts";
import { PI } from "three/tsl";

export default function LegoPiece({
  geometry,
  unitsPerStud = 1,
  studRadius = 0.28,
  studHeight = 0.175,
  materialProps = {},
  ...meshProps
}) {
  const { position, setPosition } = React.useState(new THREE.Vector3(null, null, null));


  const { topStudPositions, bottomStudPositions, hollowGeometry } =
    useMemo(() => {
      if (!geometry) {
        return {
          topStudPositions: [],
          bottomStudPositions: [],
          hollowGeometry: null,
        };
      }

      geometry.computeBoundingBox();
      const { min, max } = geometry.boundingBox;

      // Calculate top stud positions
      const topStudPositions = [];
      const cellSize = unitsPerStud;
      const halfCell = cellSize / 2;
      const nx = Math.floor((max.x - min.x) / cellSize);
      const nz = Math.floor((max.z - min.z) / cellSize);
      const yRayStart = max.y + 1; // start ray well above
      const down = new THREE.Vector3(0, -1, 0);
      const raycaster = new THREE.Raycaster();

      // 3) we need a mesh to raycast against (not in the scene!)
      const tempMesh = new THREE.Mesh(
        geometry,
        new THREE.MeshBasicMaterial() // material doesn't matter
      );

      const TOL = 1e-4;

      // 4) for each grid cell, shoot a ray straight down…
      for (let ix = 0; ix < nx; ix++) {
        for (let iz = 0; iz < nz; iz++) {
          // compute the cell's center in X,Z
          const x = min.x + ix * cellSize + halfCell;
          const z = min.z + iz * cellSize + halfCell;
          const origin = new THREE.Vector3(x, yRayStart, z);

          raycaster.set(origin, down);
          const hits = raycaster.intersectObject(tempMesh, false);

          // 5) if we hit anything, look at the face normal
          if (hits.length > 0) {
            const { face, point } = hits[0];
            // only horizontal faces: normal.y ≈ 1
            if (face.normal.y > 1 - TOL) {
              // plant the stud just above the surface
              topStudPositions.push(
                new THREE.Vector3(point.x, point.y + studHeight / 2, point.z)
              );
            }
          }
        }
      }

      // Calculate bottom stud positions
      const bottomStudPositions = [];
      const yRayStartBottom = min.y - 1; // start ray well above
      const up = new THREE.Vector3(0, 1, 0);

      // 4) for each grid cell, shoot a ray straight down…
      for (let ix = 0; ix < nx; ix++) {
        for (let iz = 0; iz < nz; iz++) {
          // compute the cell's center in X,Z
          const x = min.x + ix * cellSize + halfCell;
          const z = min.z + iz * cellSize + halfCell;
          const origin = new THREE.Vector3(x, yRayStartBottom, z);

          raycaster.set(origin, up);
          const hits = raycaster.intersectObject(tempMesh, false);

          // 5) if we hit anything, look at the face normal
          if (hits.length > 0) {
            const { face, point } = hits[0];
            // only horizontal faces: normal.y ≈ 1
            if (face.normal.y < TOL - 1) {
              // plant the stud just above the surface
              bottomStudPositions.push(
                new THREE.Vector3(point.x, point.y, point.z)
              );
            }
          }
        }
      }

      // Calculate hollow geometry
      let hollow = geometry;
      if (bottomStudPositions.length > 0) {
        const indentDepth = studHeight; // a bit deeper than stud
        const cutters = bottomStudPositions.map((pos) => {
          // openEnded=true → only side walls, no caps (faster Boolean)
          const g = new THREE.CylinderGeometry(
            studRadius * 0.92, // shave 8 % → avoids coplanar faces
            studRadius * 0.92,
            indentDepth,
            16,
            1,
            false
          ).toNonIndexed();
          // place it so its *top* is flush with the brick's bottom face
          g.translate(pos.x, pos.y + studHeight / 2, pos.z);
          return g;
        });

        const cutterGeom = mergeGeometries(cutters, false);

        /* b) Boolean difference: brick – cutters */
        const brickMesh = new THREE.Mesh(geometry.clone().toNonIndexed());
        const cutterMesh = new THREE.Mesh(cutterGeom);

        hollow = CSG.subtract(brickMesh, cutterMesh).geometry;
      }

      return {
        topStudPositions: topStudPositions,
        bottomStudPositions: bottomStudPositions,
        hollowGeometry: hollow,
      };
    }, [geometry, unitsPerStud, studHeight, studRadius]);

  if (!geometry) {
    console.warn("LegoPiece: no geometry prop passed");
    return null;
  }

  return (
    <group {...meshProps}>
      {hollowGeometry && (
        <mesh geometry={hollowGeometry}>
          <meshStandardMaterial color="white" {...materialProps} />
        </mesh>
      )}

      {/* top studs (as before) */}
      {topStudPositions.map((pos, i) => (
        <mesh key={`top${i}`} position={pos.toArray()}>
          <cylinderGeometry args={[studRadius, studRadius, studHeight, 16]} />
          <meshStandardMaterial color="lightgray" side={THREE.DoubleSide} />
        </mesh>
      ))}

      {/* bottom tubes — just for visuals, optional */}
      {bottomStudPositions.map((pos, i) => (
        /* group so we can have several meshes that share the same transform */
        <group
          key={`bot${i}`}
          /* ‑‑ this puts the GROUP’S origin at the tube’s centre ‑‑ */
          position={[pos.x, pos.y + studHeight / 2, pos.z]}
        >
          {/* 1) the hollow tube (side wall only) */}
          <mesh>
            <cylinderGeometry
              args={[
                studRadius * 0.9,
                studRadius * 0.9,
                studHeight,
                16,
                1,
                true,
              ]}
            />
            <meshStandardMaterial color="#888" side={THREE.DoubleSide} />
          </mesh>

          {/* 2) the *single* circular face that closes the tube at the top */}
          <mesh
            /* circle lies in the XY‑plane, so rotate it into XZ */
            rotation={[-Math.PI / 2, 0, 0]}
            /* place it at the top of the tube: +h/2 in local Y */
            position={[0, studHeight / 2, 0]}
          >
            <circleGeometry args={[studRadius, 16]} />
            <meshStandardMaterial color="#888" side={THREE.BackSide} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
