import React from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

import BuildMode from "./components/game/BuildMode";
import { KeyboardControls } from '@react-three/drei';

export default function App() {
  return (
    <KeyboardControls
      map={[
        { name: 'left',   keys: ['ArrowLeft', 'a'] },
        { name: 'right',  keys: ['ArrowRight','d'] },
        { name: 'up',     keys: ['ArrowUp',  'w'] },
        { name: 'down',   keys: ['ArrowDown','s'] },
        { name: 'toggle1', keys: ['1'] },
        { name: 'toggle2', keys: ['2'] },
        { name: 'toggle3', keys: ['3']},
        { name: 'add' , keys: ['p'] },
        { name: 'place' , keys: ['Enter'] },
        { name: 'esc' , keys: ['Escape'] },
        { name: 'rotateBaseplate', keys: ['r'] },
      ]}
    >
      <Canvas shadows camera={{ position: [8, 8, 8], fov: 50 }}>
        <BuildMode />
        <axesHelper args={[2]} />
        <gridHelper args={[10, 10]} />
        <ambientLight intensity={0.3} />
        <OrbitControls />
      </Canvas>
    </KeyboardControls>
  );
}
