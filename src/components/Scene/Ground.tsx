
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';

interface GroundProps {
  size?: number;
  resolution?: number;
}

export default function Ground({ size = 400, resolution = 128 }: GroundProps) {
  // Create a more appropriately sized plane for the ground
  const groundGeometry = useMemo(() => new THREE.PlaneGeometry(size, size, resolution, resolution), [size, resolution]);
  
  // Use the new Imgur URL directly for the texture
  const textureUrl = 'https://i.imgur.com/A9UZ1Ol.jpeg';
  
  // Use useTexture hook without the callback function which was causing errors
  const texture = useTexture(textureUrl);
  
  // Set texture properties directly after loading
  useMemo(() => {
    if (texture) {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(4, 4);
    }
  }, [texture]);
  
  // Apply some gentle elevation to make the terrain more interesting
  useMemo(() => {
    if (groundGeometry) {
      const positions = groundGeometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        // Skip the center area where the solar panels are
        const x = positions[i];
        const z = positions[i + 2];
        const distanceFromCenter = Math.sqrt(x * x + z * z);
        
        if (distanceFromCenter > 100) {
          // Add some very subtle undulations to mimic the sandy terrain
          positions[i + 1] = 
            Math.sin(x * 0.01) * Math.cos(z * 0.01) * 2 + 
            Math.sin(x * 0.03 + 0.5) * Math.sin(z * 0.02 + 0.5) * 1;
        }
      }
      groundGeometry.computeVertexNormals();
    }
  }, [groundGeometry]);
  
  return (
    <mesh 
      rotation={[-Math.PI / 2, 0, 0]} 
      position={[0, 0, 0]} 
      receiveShadow
    >
      <primitive object={groundGeometry} />
      <meshStandardMaterial 
        map={texture}
        roughness={0.95} 
        metalness={0.05}
        envMapIntensity={0.4}
      />
    </mesh>
  );
}

// Utility function to get height at a position
export function getHeightAtPosition(x: number, z: number) {
  const distanceFromCenter = Math.sqrt(x * x + z * z);
  if (distanceFromCenter > 100) {
    return Math.sin(x * 0.01) * Math.cos(z * 0.01) * 2 + 
           Math.sin(x * 0.03 + 0.5) * Math.sin(z * 0.02 + 0.5) * 1;
  }
  return 0; // Flat in the solar panel area
}
