
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
  width = 10, 
  color = '#2a2a2a',
  elevation = 0.1
}: RoadProps) {
  // Only render if we have at least 2 points to form a valid path
  const roadMesh = useMemo(() => {
    if (boundary.length < 2) return null;

    // Create a path from the boundary points
    const path = new THREE.CatmullRomCurve3(
      boundary.map(([x, z]) => new THREE.Vector3(x, elevation, z))
    );
    
    // Create the road geometry
    const tubeGeometry = new THREE.TubeGeometry(
      path,
      boundary.length * 8, // segments for smoother curve
      width / 2, // radius - half the desired road width
      18, // radial segments for smoother tube
      false // not closed for straight road
    );

    // Create road material
    const roadMaterial = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.7,
      metalness: 0.2,
      side: THREE.DoubleSide,
    });

    // Create the center line (dashed)
    const centerLineGeometry = new THREE.TubeGeometry(
      path,
      boundary.length * 8,
      0.15, // very thin line
      6,
      false
    );
    
    const centerLineMaterial = new THREE.MeshStandardMaterial({
      color: '#FFFFFF',
      roughness: 0.3,
      metalness: 0.1,
      side: THREE.DoubleSide,
    });
    
    // Create edge lines (solid)
    const edgeLineWidth = width / 2 - 0.3; // Slightly inside the road edge
    
    // Left edge line
    const leftEdgePath = new THREE.CatmullRomCurve3(
      boundary.map(([x, z]) => new THREE.Vector3(x - edgeLineWidth, elevation + 0.05, z))
    );
    
    const leftEdgeGeometry = new THREE.TubeGeometry(
      leftEdgePath,
      boundary.length * 8,
      0.15, // thin line
      6,
      false
    );
    
    // Right edge line
    const rightEdgePath = new THREE.CatmullRomCurve3(
      boundary.map(([x, z]) => new THREE.Vector3(x + edgeLineWidth, elevation + 0.05, z))
    );
    
    const rightEdgeGeometry = new THREE.TubeGeometry(
      rightEdgePath,
      boundary.length * 8,
      0.15, // thin line
      6,
      false
    );
    
    const edgeLineMaterial = new THREE.MeshStandardMaterial({
      color: '#FFFFFF',
      roughness: 0.3,
      metalness: 0.1,
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
        <mesh
          geometry={centerLineGeometry}
          material={centerLineMaterial}
          receiveShadow
          position={[0, 0.05, 0]} // Slightly above the road
        />
        <mesh
          geometry={leftEdgeGeometry}
          material={edgeLineMaterial}
          receiveShadow
        />
        <mesh
          geometry={rightEdgeGeometry}
          material={edgeLineMaterial}
          receiveShadow
        />
      </group>
    );
  }, [boundary, width, color, elevation]);

  if (!roadMesh) return null;

  return (
    <group position={[0, 0, 0]}>
      {roadMesh}
    </group>
  );
}
