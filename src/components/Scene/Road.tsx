
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

    // Create a flat road instead of a tube
    const startPoint = new THREE.Vector3(boundary[0][0], elevation, boundary[0][1]);
    const endPoint = new THREE.Vector3(boundary[1][0], elevation, boundary[1][1]);
    
    // Calculate road direction vector
    const direction = new THREE.Vector3().subVectors(endPoint, startPoint).normalize();
    
    // Calculate perpendicular vector for road width
    const perpendicular = new THREE.Vector3(-direction.z, 0, direction.x).normalize();
    
    // Calculate road length
    const roadLength = startPoint.distanceTo(endPoint);
    
    // Create road geometry as a flat plane
    const roadGeometry = new THREE.PlaneGeometry(width, roadLength);
    
    // Rotate and position the road to align with the path
    const angle = Math.atan2(direction.x, direction.z);
    
    // Create road material
    const roadMaterial = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.7,
      metalness: 0.2,
      side: THREE.DoubleSide,
    });
    
    // Calculate road center position
    const centerPos = new THREE.Vector3(
      (startPoint.x + endPoint.x) / 2,
      elevation,
      (startPoint.z + endPoint.z) / 2
    );
    
    // Create center line (dashed)
    const centerLineGeometry = new THREE.PlaneGeometry(0.3, roadLength - 1);
    const centerLineMaterial = new THREE.MeshStandardMaterial({
      color: '#FFFFFF',
      roughness: 0.3,
      metalness: 0.1,
      side: THREE.DoubleSide,
    });
    
    // Create edge lines
    const edgeLineGeometry = new THREE.PlaneGeometry(0.3, roadLength);
    const edgeLineMaterial = new THREE.MeshStandardMaterial({
      color: '#FFFFFF',
      roughness: 0.3,
      metalness: 0.1,
      side: THREE.DoubleSide,
    });
    
    // Calculate positions for the edge lines
    const halfWidth = width / 2 - 0.3;
    
    return (
      <group position={centerPos} rotation={[0, -angle, 0]}>
        <mesh 
          geometry={roadGeometry} 
          material={roadMaterial} 
          receiveShadow 
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          geometry={centerLineGeometry}
          material={centerLineMaterial}
          receiveShadow
          position={[0, 0.01, 0]} // Slightly above the road
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          geometry={edgeLineGeometry}
          material={edgeLineMaterial}
          receiveShadow
          position={[-halfWidth, 0.01, 0]} // Left edge line
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          geometry={edgeLineGeometry}
          material={edgeLineMaterial}
          receiveShadow
          position={[halfWidth, 0.01, 0]} // Right edge line
          rotation={[-Math.PI / 2, 0, 0]}
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
