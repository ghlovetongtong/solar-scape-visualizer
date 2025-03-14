
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';
import { BoundaryPoint } from '@/hooks/useDrawBoundary';

interface GroundProps {
  size?: number;
  resolution?: number;
  savedBoundaries?: BoundaryPoint[][];
}

export default function Ground({ 
  size = 400, 
  resolution = 128,
  savedBoundaries = [] 
}: GroundProps) {
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

  // Create geometries for saved boundaries
  const boundaryGeometries = useMemo(() => {
    return savedBoundaries.map((boundaryPoints) => {
      if (boundaryPoints.length < 2) return null;
      
      const geometry = new THREE.BufferGeometry();
      
      // Create vertices with a slight y-offset
      const vertices = boundaryPoints.flatMap(([x, z]) => [x, 0.1, z]);
      
      // Add the first point again to close the loop
      if (boundaryPoints.length > 2) {
        vertices.push(boundaryPoints[0][0], 0.1, boundaryPoints[0][1]);
      }
      
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      return geometry;
    }).filter(Boolean);
  }, [savedBoundaries]);
  
  return (
    <>
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

      {/* Render saved boundaries */}
      {boundaryGeometries.map((geometry, index) => (
        geometry && (
          <line key={`boundary-${index}`}>
            <primitive object={geometry} />
            <lineBasicMaterial
              color="#00ff00"
              linewidth={2}
              opacity={1}
              transparent={true}
            />
          </line>
        )
      ))}
    </>
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
