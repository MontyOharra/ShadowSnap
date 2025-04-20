// src/components/LegoPiece.jsx
import React, { useMemo, forwardRef } from 'react'
import * as THREE from 'three'

const LegoPiece = forwardRef((
  {
    geometry,
    studSpacing = 0.8,
    studRadius = 0.2,
    studHeight = 0.1,
    isSelected = false,
    ...meshProps
  },
  ref
) => {
  // compute all the stud positions once per geometry/spacing
  const studPositions = useMemo(() => {
    if (!geometry) return []
    
    geometry.computeBoundingBox()
    const bb = geometry.boundingBox
    const min = bb.min, max = bb.max
    const y0 = min.y + studHeight / 2   // studs sit just above the bottom

    const positions = []
    for (let x = min.x + studRadius; x <= max.x - studRadius; x += studSpacing) {
      for (let z = min.z + studRadius; z <= max.z - studRadius; z += studSpacing) {
        positions.push(new THREE.Vector3(x, y0, z))
      }
    }
    return positions
  }, [geometry, studSpacing, studRadius, studHeight])

  // Create materials with useMemo to prevent unnecessary recreations
  const baseMaterial = useMemo(() => 
    new THREE.MeshStandardMaterial({ 
      color: isSelected ? '#ffff00' : 'white',
      emissive: isSelected ? '#333300' : '#000000'
    }), [isSelected])

  const studMaterial = useMemo(() => 
    new THREE.MeshStandardMaterial({ 
      color: isSelected ? '#ffff00' : 'lightgray',
      emissive: isSelected ? '#333300' : '#000000'
    }), [isSelected])

  return (
    <group ref={ref} {...meshProps}>
      {/* the main shape */}
      <mesh 
        geometry={geometry} 
        material={baseMaterial}
        castShadow
        receiveShadow
      />

      {/* one small cylinder per stud */}
      {studPositions.map((pos, i) => (
        <mesh
          key={i}
          position={pos.toArray()}
          rotation={[-Math.PI / 2, 0, 0]}
          material={studMaterial}
          castShadow
          receiveShadow
        >
          <cylinderGeometry args={[studRadius, studRadius, studHeight, 16]} />
        </mesh>
      ))}
    </group>
  )
})

// Add display name for better debugging
LegoPiece.displayName = 'LegoPiece'

export default LegoPiece
