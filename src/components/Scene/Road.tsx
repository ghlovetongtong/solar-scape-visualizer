
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { BoundaryPoint } from '@/hooks/useDrawBoundary';

interface RoadProps {
  boundary?: BoundaryPoint[];
  width?: number;
  color?: string;
  elevation?: number;
  center?: [number, number, number];
  visible?: boolean;
}

export default function Road({ 
  boundary = [], 
  width = 10, 
  color = '#2a2a2a',
  elevation = 0.1,
  center = [0, 0, 0],
  visible = false
}: RoadProps) {
  // Only render if visible flag is true and we have at least 3 points to form a valid path or if center is provided
  const roadMesh = useMemo(() => {
    if (!visible) return null;
    
    // Create a circular road around the center if no boundary is provided
    if (boundary.length < 3 && center) {
      // Create a circular path around the center
      const segments = 36;
      const radius = 40;
      const circlePoints: BoundaryPoint[] = [];
      
      for (let i = 0; i < segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const x = center[0] + Math.cos(angle) * radius;
        const z = center[2] + Math.sin(angle) * radius;
        circlePoints.push([x, z]);
      }
      
      // Create a path from the circular points
      const path = new THREE.CatmullRomCurve3(
        circlePoints.map(([x, z]) => new THREE.Vector3(x, elevation, z))
      );
      
      // Close the loop
      path.closed = true;

      // Create the road geometry
      const tubeGeometry = new THREE.TubeGeometry(
        path,
        segments * 2,
        width / 2,
        18,
        true
      );

      // Create road material
      const roadMaterial = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.7,
        metalness: 0.2,
        side: THREE.DoubleSide,
      });

      return (
        <mesh 
          geometry={tubeGeometry} 
          material={roadMaterial} 
          receiveShadow 
          userData={{ type: 'road', interactable: false }}
          raycast={() => null} // Disable raycasting for this mesh
        />
      );
    }
    
    // Use the provided boundary points if available
    if (boundary.length >= 3) {
      // Create a path from the boundary points
      const path = new THREE.CatmullRomCurve3(
        boundary.map(([x, z]) => new THREE.Vector3(x, elevation, z))
      );
      
      // Close the loop by connecting back to the start
      path.closed = true;

      // Create the road geometry
      const tubeGeometry = new THREE.TubeGeometry(
        path,
        boundary.length * 8,
        width / 2,
        18,
        true
      );

      // Create road material
      const roadMaterial = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.7,
        metalness: 0.2,
        side: THREE.DoubleSide,
      });

      return (
        <mesh 
          geometry={tubeGeometry} 
          material={roadMaterial} 
          receiveShadow 
          userData={{ type: 'road', interactable: false }}
          raycast={() => null} // Disable raycasting for this mesh
        />
      );
    }
    
    return null;
  }, [boundary, width, color, elevation, center, visible]);

  if (!roadMesh) return null;

  return roadMesh;
}
