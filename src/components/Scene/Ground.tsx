
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';
import { BoundaryPoint } from '@/hooks/useDrawBoundary';
import groundImg from '@/assets/ground_color_2.jpg';


interface GroundProps {
  size?: number;
  resolution?: number;
  savedBoundaries?: BoundaryPoint[][];
}

export default function Ground({ 
  size = 600, // Increased from 400 to 600 to make the ground larger
  resolution = 128,
  savedBoundaries = [] 
}: GroundProps) {
  // Create a perfect square plane for the ground with equal width and height
  const groundGeometry = useMemo(() => new THREE.PlaneGeometry(size, size, resolution, resolution), [size, resolution]);
  
  // Use the new Imgur URL directly for the texture
  const textureUrl = groundImg;
  
  // Use useTexture hook without the callback function which was causing errors
  const texture = useTexture(textureUrl);
  
  // Set texture properties directly after loading
  useMemo(() => {
    if (texture) {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(3, 3); // Increased repeat from 4 to 6 to maintain texture density with larger ground
    }
  }, [texture]);
  
  // Remove all terrain undulations - the ground is now completely flat

  // Create boundary line geometries for each saved boundary
  const boundaryLines = useMemo(() => {
    return savedBoundaries.map((boundary, boundaryIndex) => {
      if (boundary.length < 3) return null;
      
      // Create points for the boundary with elevation
      const linePoints = boundary.map(([x, z]) => new THREE.Vector3(x, 0.1, z));
      
      // Add the first point again to close the loop
      linePoints.push(new THREE.Vector3(boundary[0][0], 0.1, boundary[0][1]));
      
      // Create a geometry for the line
      const geometry = new THREE.BufferGeometry().setFromPoints(linePoints);
      
      // Use different colors for different boundaries
      const colors = ["#00ff00", "#ff0000", "#0000ff", "#ffff00", "#ff00ff", "#00ffff"];
      const colorIndex = boundaryIndex % colors.length;
      const color = colors[colorIndex];
      
      return (
        <primitive 
          key={`boundary-${boundaryIndex}`} 
          object={new THREE.Line(
            geometry,
            new THREE.LineBasicMaterial({ color, linewidth: 2 })
          )} 
        />
      );
    }).filter(Boolean);
  }, [savedBoundaries]);

  return (
    <>
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]} 
        receiveShadow
        frustumCulled={false} // Prevent disappearing when zooming in close
      >
        <primitive object={groundGeometry} />
        <meshStandardMaterial 
          map={texture}
          roughness={0.95} 
          metalness={0.05}
          envMapIntensity={0.4}
        />
      </mesh>

      {/* Render all saved boundaries */}
      <group frustumCulled={false}>{boundaryLines}</group>
    </>
  );
}

// Update the utility function to always return 0 (flat ground)
export function getHeightAtPosition(x: number, z: number) {
  return 0; // Always return 0 for a completely flat terrain
}
