// buildScene.jsx  – R3F‑friendly version
import React, { useRef, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import LegoPiece from './LegoPiece';
import * as THREE from 'three';

// Wall component for better perspective
const Wall = ({ position, rotation, size = [32, 16, 0.5], color = '#f8f8f8' }) => {
  return (
    <mesh position={position} rotation={rotation} receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

// Baseplate component
const Baseplate = ({ studs = 32, studSize = 1 }) => {
  const plateThickness = 0.15 * studSize;
  const studRadius = 0.4 * studSize;
  const studHeight = 0.2 * studSize;
  const half = (studs * studSize) / 2;
  const instancedMeshRef = useRef();

  // Create plate geometry
  const plateGeometry = new THREE.BoxGeometry(
    studs * studSize,
    plateThickness,
    studs * studSize
  );

  // Create stud geometry
  const studGeometry = new THREE.CylinderGeometry(
    studRadius,
    studRadius,
    studHeight,
    20
  );

  // Create stud material
  const studMaterial = new THREE.MeshStandardMaterial({ color: '#26b34a' });

  // Create and set up the instanced mesh
  const instancedMesh = new THREE.InstancedMesh(studGeometry, studMaterial, studs * studs);
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
      instancedMesh.setMatrixAt(index++, dummy.matrix);
    }
  }
  
  instancedMesh.instanceMatrix.needsUpdate = true;

  return (
    <group>
      {/* Base plate */}
      <mesh
        geometry={plateGeometry}
        position={[0, -plateThickness / 2, 0]}
        receiveShadow
        castShadow
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

const BuildScene = ({ pieces = [], onPieceClick = () => {} }) => {
  const { scene } = useThree();
  const wallsRef = useRef();
  const directionalLightRef = useRef();
  const lightTargetRef = useRef();

  useEffect(() => {
    // Create light target
    const target = new THREE.Object3D();
    target.position.set(25,0,25); // Point light towards the right wall
    scene.add(target);
    lightTargetRef.current = target;

    // Create walls
    const wallGeometry = new THREE.BoxGeometry(32, 16, 0.5);
    const wallMaterial = new THREE.MeshStandardMaterial({ 
      color: '#f8f8f8',
      transparent: false,
      opacity: 0.8
    });

    // Create walls group
    const walls = new THREE.Group();
    wallsRef.current = walls;

    // Create two walls
    const wallPositions = [
      [-16.25, 8, 0],    // back wall
      [0, 8, -16.25]     // front wall
    ];

    const wallRotations = [
      [0, Math.PI / 2, 0],  // back wall
      [0, 0, 0]             // front wall
    ];

    wallPositions.forEach((pos, i) => {
      const wall = new THREE.Mesh(wallGeometry, wallMaterial);
      wall.position.set(...pos);
      wall.rotation.set(...wallRotations[i]);
      wall.receiveShadow = true;
      wall.castShadow = true;
      walls.add(wall);
    });

    scene.add(walls);

    return () => {
      scene.remove(walls);
      scene.remove(target); // Clean up target
      wallGeometry.dispose();
      wallMaterial.dispose();
    };
  }, [scene]);

  return (
    <>
      {/* Main directional light */}
      <directionalLight
        ref={directionalLightRef}
        position={[20, 5, 10]}  // Positioned to create dramatic shadows from the back-left
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
        shadow-camera-far={50}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
      />

      {/* Ambient light for overall scene illumination */}
      <ambientLight intensity={0.15} />

      {/* Baseplate */}
      <Baseplate />

      {/* LEGO pieces */}
      {pieces.map((piece, index) => (
        <LegoPiece
          key={index}
          geometry={piece.geometry}
          position={piece.position}
          rotation={piece.rotation}
          isSelected={piece.isSelected}
          onClick={() => onPieceClick(index)}
        />
      ))}

      {/* Helper to visualize shadow camera */}
      {directionalLightRef.current && (
        <directionalLightHelper args={[directionalLightRef.current, 5]} />
      )}
    </>
  );
};

export default BuildScene;
