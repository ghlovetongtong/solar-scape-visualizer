
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { BoundaryPoint } from '@/hooks/useDrawBoundary';

interface RoadProps {
  boundary?: BoundaryPoint[];
  width?: number;
  color?: string;
  elevation?: number;
}

export default function Road({ 
  boundary = [], 
  width = 8, 
  color = '#333333',
  elevation = 0.05
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

    // Create the road geometry
    const tubeGeometry = new THREE.TubeGeometry(
      path,
      boundary.length * 2, // segments - more segments = smoother curve
      width / 2, // radius - half the desired road width
      12, // radial segments - more = smoother tube
      true // closed path
    );

    // Create road material with some texture
    const roadMaterial = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.8,
      metalness: 0.2,
      side: THREE.DoubleSide,
    });

    return (
      <mesh geometry={tubeGeometry} material={roadMaterial} receiveShadow>
        <meshStandardMaterial attach="material" color={color} roughness={0.8} metalness={0.2} />
      </mesh>
    );
  }, [boundary, width, color, elevation]);

  if (!roadMesh) return null;

  return (
    <group position={[0, 0, 0]}>
      {roadMesh}
    </group>
  );
}
