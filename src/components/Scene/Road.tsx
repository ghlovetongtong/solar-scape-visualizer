
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { BoundaryPoint } from '@/hooks/useDrawBoundary';

interface RoadProps {
  boundary?: BoundaryPoint[];
  width?: number;
  color?: string;
  elevation?: number;
  position?: [number, number, number]; // Added position prop
}

export default function Road({ 
  boundary = [], 
  width = 10, 
  color = '#2a2a2a',
  elevation = 0.1,
  position = [0, 0, 0] // Default position
}: RoadProps) {
  // Only render if we have at least 3 points to form a valid path
  const roadMesh = useMemo(() => {
    if (boundary.length < 3) return null;

    // Create a path from the boundary points
    const path = new THREE.CatmullRomCurve3(
      boundary.map(([x, z]) => new THREE.Vector3(x, elevation, z))
    );
    
    // Close the loop by connecting back to the start
    path.closed = true;

    // Create the road geometry - increase segments for smoother appearance
    const tubeGeometry = new THREE.TubeGeometry(
      path,
      boundary.length * 8, // Further increased segments for smoother curve
      width / 2, // radius - half the desired road width
      18, // Increased radial segments for smoother tube
      true // closed path
    );

    // Create road material with better visibility
    const roadMaterial = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.7,
      metalness: 0.2,
      side: THREE.DoubleSide,
    });

    return (
      <group>
        <mesh 
          geometry={tubeGeometry} 
          material={roadMaterial} 
          receiveShadow 
          position={[0, 0, 0]}
        />
      </group>
    );
  }, [boundary, width, color, elevation]);

  if (!roadMesh) return null;

  return (
    <group position={position}>
      {roadMesh}
    </group>
  );
}
