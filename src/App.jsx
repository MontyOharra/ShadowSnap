import React from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

// geometry helpers
import { ExtrudeGeometry } from "three/src/geometries/ExtrudeGeometry.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

import LegoPiece from "./components/LegoPiece";

export default function App() {
  const geometry = React.useMemo(() => {
    /* ---------- flat 2×1 plate ---------- */
    const twoByTwo = new THREE.BoxGeometry(2, 1, 2)
      .translate(1, 0.5, 1) // lift to y‑range 0…0.2, front half
      .toNonIndexed(); // make non‑indexed so merge is painless

    const oneByTwo = new THREE.BoxGeometry(1, 2, 1)
      .translate(-0.5, 0, 1.5) // lift to y‑range 0…0.2, front half
      .toNonIndexed(); // make non‑indexed so merge is painless


    /* ---------- merge into one BufferGeometry ---------- */
    const mergedGeometry = mergeGeometries(
      [twoByTwo, oneByTwo],
      false
    );
    return mergedGeometry;
  }, []);

  const basePlateGeometry = new THREE.BoxGeometry(20, .1, 20); 

  return (
    <Canvas camera={{ position: [5, 5, 5], fov: 60 }}>
      <axesHelper args={[2]} />
      <gridHelper args={[10, 10]} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 10, 5]} intensity={1} />

      <LegoPiece
        geometry={basePlateGeometry}
        unitsPerStud={1}
        position={[0, 0, 0]}
        materialProps={{ side: THREE.DoubleSide }}
      />

      <OrbitControls />
    </Canvas>
  );
}
