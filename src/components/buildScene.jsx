// buildScene.jsx  – R3F‑friendly version
import { useThree } from '@react-three/fiber';
import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';

// Wall component for better perspective
const Wall = ({ position, rotation, size = [32, 16, 0.5], color = '#e0e0e0' }) => {
  return (
    <mesh position={position} rotation={rotation} receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

// Baseplate component
const Baseplate = ({ studs = 32, studSize = 1 }) => {
  const plateThickness = 0.1 * studSize;
  const studRadius = 0.4 * studSize;
  const studHeight = 0.2 * studSize;
  const half = (studs * studSize) / 2;
  const instancedMeshRef = useRef();

  // Create plate geometry
  const plateGeometry = useMemo(() => new THREE.BoxGeometry(
    studs * studSize,
    plateThickness,
    studs * studSize
  ), [studs, studSize]);

  // Create stud geometry
  const studGeometry = useMemo(() => new THREE.CylinderGeometry(
    studRadius,
    studRadius,
    studHeight,
    20
  ), [studRadius, studHeight]);

  // Create stud material
  const studMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#26b34a' }), []);

  // Create and set up the instanced mesh
  const instancedMesh = useMemo(() => {
    const mesh = new THREE.InstancedMesh(studGeometry, studMaterial, studs * studs);
    const dummy = new THREE.Object3D();
    let index = 0;
    
    for (let x = 0; x < studs; x++) {
      for (let z = 0; z < studs; z++) {
        dummy.position.set(
          x * studSize - half + studSize / 2,
          studHeight / 2,
          z * studSize - half + studSize / 2
        );
        dummy.updateMatrix();
        mesh.setMatrixAt(index++, dummy.matrix);
      }
    }
    
    mesh.instanceMatrix.needsUpdate = true;
    return mesh;
  }, [studs, studSize, half, studHeight, studGeometry, studMaterial]);

  return (
    <group>
      {/* Base plate */}
      <mesh
        geometry={plateGeometry}
        position={[0, -plateThickness / 2, 0]}
        receiveShadow
      >
        <meshStandardMaterial color="#199848" />
      </mesh>

      {/* Studs using InstancedMesh */}
      <primitive
        object={instancedMesh}
        castShadow
      />
    </group>
  );
};

export default function BuildScene() {
  // Create refs for lights to adjust them if needed
  const mainLightRef = useRef();
  const fillLightRef = useRef();

  return (
    <>
      {/* Baseplate */}
      <Baseplate />

      {/* Walls for perspective and shadow receiving */}
      <Wall 
        position={[0, 8, -16.25]} 
        rotation={[0, 0, 0]} 
        color="#e8e8e8"
      />
      <Wall 
        position={[-16.25, 8, 0]} 
        rotation={[0, Math.PI / 2, 0]} 
        color="#d0d0d0"
      />

      {/* Main directional light for sharp shadows */}
      <directionalLight
        ref={mainLightRef}
        position={[15, 8, 15]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />

      {/* Fill light for softer overall illumination */}
      <directionalLight
        ref={fillLightRef}
        position={[-5, 8, -10]}
        intensity={0.3}
        castShadow
      />

      {/* Ambient light for general illumination */}
      <ambientLight intensity={0.2} />
    </>
  );
}
