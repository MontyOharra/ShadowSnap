// buildScene.jsx  – R3F‑friendly version
import { useThree } from '@react-three/fiber';
import React, { useEffect } from 'react';
import * as THREE from 'three';

// load the baseplate
function addBaseplate(scene, { studs = 64, studSize = 1 } = {}) {
    const plateThickness = 0.1 * studSize;
    const studRadius     = 0.4 * studSize;
    const studHeight     = 0.2 * studSize;
    const half           = (studs * studSize) / 2;
  
    /* ------------ green plate slab ------------ */
    const plateGeo = new THREE.BoxGeometry(
      studs * studSize,
      plateThickness,
      studs * studSize
    );
    const plateMat = new THREE.MeshStandardMaterial({ color: '#199848' });
    const plate    = new THREE.Mesh(plateGeo, plateMat);
    plate.position.y = -plateThickness / 2;      // keep studs at y=0
    plate.receiveShadow = true;
    scene.add(plate);
  
    /* ------------ studs (InstancedMesh) ------------ */
    const studGeo = new THREE.CylinderGeometry(
      studRadius,
      studRadius,
      studHeight,
      20
    );
    const studMat = new THREE.MeshStandardMaterial({ color: '#26b34a' });
    const inst    = new THREE.InstancedMesh(studGeo, studMat, studs * studs);
    inst.castShadow = true;
  
    const dummy   = new THREE.Object3D();
    let index = 0;
    for (let x = 0; x < studs; x++) {
      for (let z = 0; z < studs; z++) {
        dummy.position.set(
          x * studSize - half + studSize / 2,
          studHeight / 2,
          z * studSize - half + studSize / 2
        );
        dummy.updateMatrix();
        inst.setMatrixAt(index++, dummy.matrix);
      }
    }
    scene.add(inst);
  
    /* return a cleanup function if you ever want to remove the plate */
    return () => {
      scene.remove(plate, inst);
      plateGeo.dispose(); plateMat.dispose();
      studGeo.dispose();  studMat.dispose();
    };
  }
  

export default function BuildScene() {
  const { scene } = useThree();

  useEffect(() => {
    // ----- create anything you like -----
    const cubeGeo = new THREE.BoxGeometry(2, 2, 2);
    const cubeMat = new THREE.MeshStandardMaterial({ color: '#cc3333' });
    const cube    = new THREE.Mesh(cubeGeo, cubeMat);
    cube.position.set(0, 1, 0);
    cube.castShadow = cube.receiveShadow = true;
    const cleanupPlate = addBaseplate(scene);  // add the basplate to the scene

    // add to the shared scene managed by R3F
    //scene.add(cube);

    // clean‑up when component unmounts
    return () => scene.remove(cube);
  }, [scene]);

  // Nothing to render directly—objects are already in the Three scene
  return null;
}
