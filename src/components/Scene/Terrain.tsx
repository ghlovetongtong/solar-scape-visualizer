
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';
import { updateInstancedMesh } from '@/lib/instancedMesh';

export default function Terrain() {
  // Create a larger plane for the ground
  const groundGeometry = useMemo(() => new THREE.PlaneGeometry(1000, 1000, 128, 128), []);
  
  // Load the environment texture from the uploaded image
  const textures = useTexture({
    map: '/lovable-uploads/615df015-84a0-4607-8c56-6239fffdcfcf.png',
  });
  
  // Apply some gentle elevation to make the terrain more interesting
  useMemo(() => {
    if (groundGeometry) {
      const positions = groundGeometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        // Skip the center area where the solar panels are
        const x = positions[i];
        const z = positions[i + 2];
        const distanceFromCenter = Math.sqrt(x * x + z * z);
        
        if (distanceFromCenter > 200) {
          // Add some very subtle undulations to mimic the sandy terrain
          positions[i + 1] = 
            Math.sin(x * 0.01) * Math.cos(z * 0.01) * 2 + 
            Math.sin(x * 0.03 + 0.5) * Math.sin(z * 0.02 + 0.5) * 1;
        }
      }
      groundGeometry.computeVertexNormals();
    }
  }, [groundGeometry]);
  
  // Function to get height at a specific position based on our terrain logic
  const getHeightAtPosition = (x: number, z: number) => {
    const distanceFromCenter = Math.sqrt(x * x + z * z);
    if (distanceFromCenter > 200) {
      return Math.sin(x * 0.01) * Math.cos(z * 0.01) * 2 + 
             Math.sin(x * 0.03 + 0.5) * Math.sin(z * 0.02 + 0.5) * 1;
    }
    return 0; // Flat in the solar panel area
  };

  // Create sparse vegetation like in the reference image (only at the edges)
  const instancedGrass = useRef<THREE.InstancedMesh>(null);
  const grassCount = 800;
  const grassPositions = useMemo(() => {
    const positions = [];
    for (let i = 0; i < grassCount; i++) {
      // Position grass mainly in the outer areas and along borders
      let x, z;
      
      // Distribute vegetation along edges of the solar panel area
      const angle = Math.random() * Math.PI * 2;
      const minRadius = 220; // Slightly outside the 200 panel area
      const maxRadius = 400; // Don't go too far out
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
  }, []);
  
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
    <group>
      {/* Ground plane with the texture from the uploaded image */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]} 
        receiveShadow
      >
        <primitive object={groundGeometry} />
        <meshStandardMaterial 
          map={textures.map}
          roughness={0.95} 
          metalness={0.05}
          envMapIntensity={0.4}
        />
      </mesh>
      
      {/* Sparse vegetation - simple grass tufts */}
      <instancedMesh
        ref={instancedGrass}
        args={[undefined, undefined, grassCount]}
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
    </group>
  );
}
