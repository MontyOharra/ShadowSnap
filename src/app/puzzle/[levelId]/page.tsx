// src/app/puzzle/[levelId]/page.tsx
"use client"; // ← must be the very first line

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation"; // <-- App-router hooks
import * as THREE from "three";

export default function PuzzleLevel() {
  /***** 1. ROUTING *****/
  const params = useParams<{ levelId: string }>(); // { levelId: 'level1', … }
  const levelId = params.levelId; // "level1", "level2", …

  // Only needed if you later want router.push(), router.back(), etc.
  const router = useRouter();

  /***** 2. THREE.JS STATE *****/
  const [scene, setScene] = useState<THREE.Scene | null>(null);
  const [objects, setObjs] = useState<THREE.Object3D[]>([]);

  useEffect(() => {
    if (!scene) {
      const s = new THREE.Scene();
      setScene(s);

      // sample cube
      const cube = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshBasicMaterial({ color: 0x00ff00 })
      );
      s.add(cube);
      setObjs([cube]);
    }

    // optional cleanup
    return () => {
      /* dispose GL resources here if you create them */
    };
  }, [scene]);

  /***** 3. RENDER *****/
  return (
    <div>
      <h1>Playing puzzle {levelId}</h1>
      {/* Your <Canvas …> or <ThreeScene …> component goes here */}
    </div>
  );
}
