
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';

export default function Terrain() {
  // Create a larger plane for the ground
  const groundGeometry = useMemo(() => new THREE.PlaneGeometry(1000, 1000, 128, 128), []);
  
  // Apply some elevation to make the terrain more interesting
  useMemo(() => {
    if (groundGeometry) {
      const positions = groundGeometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        // Skip the center area where the solar panels are
        const x = positions[i];
        const z = positions[i + 2];
        const distanceFromCenter = Math.sqrt(x * x + z * z);
        
        if (distanceFromCenter > 200) {
          // Add some gentle hills outside the solar farm area
          positions[i + 1] = Math.sin(x * 0.02) * Math.cos(z * 0.02) * 5;
        }
      }
      groundGeometry.computeVertexNormals();
    }
  }, [groundGeometry]);
  
  return (
    <group>
      {/* Ground plane */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]} 
        receiveShadow
      >
        <primitive object={groundGeometry} />
        <meshStandardMaterial 
          color="#c8c8c9" 
          roughness={1} 
          metalness={0}
        />
      </mesh>
      
      {/* Road */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0.05, 0]} 
        receiveShadow
      >
        <planeGeometry args={[15, 400]} />
        <meshStandardMaterial 
          color="#555555" 
          roughness={0.9} 
          metalness={0.1}
        />
      </mesh>
      
      {/* Road markings */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0.1, 0]} 
        receiveShadow
      >
        <planeGeometry args={[0.5, 400]} />
        <meshStandardMaterial 
          color="#ffffff" 
          roughness={0.5}
        />
      </mesh>
      
      {/* Terrain decoration - rocks */}
      <group position={[100, 0, -100]}>
        <mesh castShadow receiveShadow position={[0, 1, 0]}>
          <dodecahedronGeometry args={[3, 0]} />
          <meshStandardMaterial color="#888888" roughness={0.9} />
        </mesh>
        <mesh castShadow receiveShadow position={[4, 0.6, 3]}>
          <dodecahedronGeometry args={[2, 0]} />
          <meshStandardMaterial color="#888888" roughness={0.9} />
        </mesh>
        <mesh castShadow receiveShadow position={[-3, 0.4, -2]}>
          <dodecahedronGeometry args={[1.5, 0]} />
          <meshStandardMaterial color="#888888" roughness={0.9} />
        </mesh>
      </group>
      
      <group position={[-150, 0, 150]}>
        <mesh castShadow receiveShadow position={[0, 0.8, 0]}>
          <dodecahedronGeometry args={[2.5, 0]} />
          <meshStandardMaterial color="#888888" roughness={0.9} />
        </mesh>
        <mesh castShadow receiveShadow position={[3, 0.5, 2]}>
          <dodecahedronGeometry args={[1.7, 0]} />
          <meshStandardMaterial color="#888888" roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
}
