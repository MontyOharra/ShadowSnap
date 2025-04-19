import React from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

// geometry helpers
import { ExtrudeGeometry }          from 'three/src/geometries/ExtrudeGeometry.js';
import { mergeGeometries }          from 'three/examples/jsm/utils/BufferGeometryUtils.js';

import LegoPiece from './components/LegoPiece';

export default function App() {
  const geometry = React.useMemo(() => {
    /* ---------- flat 2×1 plate ---------- */
    const twoByTwo = new THREE.BoxGeometry(2, 1, 2)
      .translate(1, .5, 1)       // lift to y‑range 0…0.2, front half
      .toNonIndexed();               // make non‑indexed so merge is painless

    const oneByTwo = new THREE.BoxGeometry(1, 2, 1)
      .translate(-.5, 0, 1.5)       // lift to y‑range 0…0.2, front half
      .toNonIndexed();               // make non‑indexed so merge is painless

    const tri = new THREE.Shape()
      .moveTo(0, 0, 0)
      .lineTo(-1, 0, 0)
      .lineTo(-1, 3, 0)
      .lineTo(0, 1, 0)
      .closePath();

      const cap = new THREE.ShapeGeometry(tri).toNonIndexed();

      // bottom cap: sits flush on the plate at y = 0
      const bottomCap = cap.clone()
        .translate(0, 0.0, 1);
  
      // top cap: one unit higher (matches prism height)
      const topCap = cap.clone()
        .translate(0, 0, 0);

    /* ---------- triangular prism 2×1 ---------- */
    const prismBounds = new ExtrudeGeometry(tri, {
      depth: 1,
      bevelEnabled: false
    })
    const prism = mergeGeometries([bottomCap, prismBounds, topCap], false);



    /* ---------- merge into one BufferGeometry ---------- */
    return mergeGeometries([twoByTwo, oneByTwo, prism], false);
  }, []);

  return (
    <Canvas camera={{ position: [5, 5, 5], fov: 60 }}>
      <axesHelper args={[2]} />
      <gridHelper args={[10, 10]} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 10, 5]} intensity={1} />

      <LegoPiece geometry={geometry} unitsPerStud={1} position={[0, 0, 0]} />

      <OrbitControls />
    </Canvas>
  );
}
