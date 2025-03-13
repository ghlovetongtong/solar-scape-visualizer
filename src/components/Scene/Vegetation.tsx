
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { getHeightAtPosition } from './Ground';

interface VegetationProps {
  count?: number;
  minRadius?: number;
  maxRadius?: number;
}

export default function Vegetation({ 
  count = 800, 
  minRadius = 220, 
  maxRadius = 400 
}: VegetationProps) {
  const instancedGrass = useRef<THREE.InstancedMesh>(null);
  
  // Generate positions for grass tufts
  const grassPositions = useMemo(() => {
    const positions = [];
    for (let i = 0; i < count; i++) {
      // Position grass mainly in the outer areas and along borders
      let x, z;
      
      // Distribute vegetation along edges of the solar panel area
      const angle = Math.random() * Math.PI * 2;
      const radius = minRadius + Math.random() * (maxRadius - minRadius);
      
      x = Math.cos(angle) * radius;
      z = Math.sin(angle) * radius;
      
      // Add some irregularity by introducing patches/clusters
      x += (Math.random() - 0.5) * 30;
      z += (Math.random() - 0.5) * 30;
      
      // If we randomly generated a position inside the solar panel area, skip it
      const distanceFromCenter = Math.sqrt(x * x + z * z);
      if (distanceFromCenter < 200) {
        i--; // Try again
        continue;
      }
      
      const y = getHeightAtPosition(x, z);
      positions.push([x, y, z]);
    }
    return positions;
  }, [count, minRadius, maxRadius]);
  
  // Update instanced grass mesh matrices
  useMemo(() => {
    if (instancedGrass.current) {
      const dummy = new THREE.Object3D();
      
      grassPositions.forEach((position, i) => {
        dummy.position.set(position[0], position[1], position[2]);
        
        // Random scale for each grass tuft - make them all smaller than default to match reference
        const scale = 0.4 + Math.random() * 0.6;
        dummy.scale.set(scale, scale + Math.random() * 0.5, scale);
        
        // Random rotation
        dummy.rotation.y = Math.random() * Math.PI * 2;
        
        dummy.updateMatrix();
        instancedGrass.current.setMatrixAt(i, dummy.matrix);
      });
      
      instancedGrass.current.instanceMatrix.needsUpdate = true;
    }
  }, [grassPositions]);
  
  return (
    <instancedMesh
      ref={instancedGrass}
      args={[undefined, undefined, count]}
      castShadow
      receiveShadow
    >
      <coneGeometry args={[1, 3, 8]} />
      <meshStandardMaterial 
        color="#718355" 
        roughness={0.8}
        flatShading={true}
      />
    </instancedMesh>
  );
}
