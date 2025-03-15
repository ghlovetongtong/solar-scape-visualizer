
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { BoundaryPoint } from '@/hooks/useDrawBoundary';

interface RoadProps {
  boundary?: BoundaryPoint[];
  width?: number;
  color?: string;
  elevation?: number;
  groundSize?: number; // Added parameter to know ground boundaries
}

export default function Road({ 
  boundary = [], 
  width = 10, 
  color = '#2a2a2a',
  elevation = 0.1,
  groundSize = 400 // Default matches Ground component's default size
}: RoadProps) {
  // Only render if we have at least 2 points to form a valid path
  const roadMesh = useMemo(() => {
    if (boundary.length < 2) return null;

    const points = [];
    const roadSegments = [];
    
    // Calculate ground boundaries (assuming centered at origin)
    const halfGroundSize = groundSize / 2;
    const minBoundary = -halfGroundSize;
    const maxBoundary = halfGroundSize;
    
    // Process each segment of the road
    for (let i = 0; i < boundary.length - 1; i++) {
      let startPoint = new THREE.Vector3(boundary[i][0], elevation, boundary[i][1]);
      let endPoint = new THREE.Vector3(boundary[i+1][0], elevation, boundary[i+1][1]);
      
      // Skip segments completely outside ground boundaries
      if ((startPoint.x < minBoundary && endPoint.x < minBoundary) ||
          (startPoint.x > maxBoundary && endPoint.x > maxBoundary) ||
          (startPoint.z < minBoundary && endPoint.z < minBoundary) ||
          (startPoint.z > maxBoundary && endPoint.z > maxBoundary)) {
        continue;
      }
      
      // Clip line segments to ground boundaries
      // This is a simplified approach - we trim the road at ground boundaries
      const originalStartPoint = startPoint.clone();
      const originalEndPoint = endPoint.clone();
      
      // Clamp points to ground boundaries
      startPoint.x = Math.max(minBoundary, Math.min(maxBoundary, startPoint.x));
      startPoint.z = Math.max(minBoundary, Math.min(maxBoundary, startPoint.z));
      endPoint.x = Math.max(minBoundary, Math.min(maxBoundary, endPoint.x));
      endPoint.z = Math.max(minBoundary, Math.min(maxBoundary, endPoint.z));
      
      // Skip if points are identical after clamping (would create zero-length road)
      if (startPoint.distanceTo(endPoint) < 0.1) continue;
      
      // Calculate road direction vector
      const direction = new THREE.Vector3().subVectors(endPoint, startPoint).normalize();
      
      // Calculate road length
      const roadLength = startPoint.distanceTo(endPoint);
      
      // Calculate road center position
      const centerPos = new THREE.Vector3(
        (startPoint.x + endPoint.x) / 2,
        elevation,
        (startPoint.z + endPoint.z) / 2
      );
      
      roadSegments.push({
        centerPos,
        angle: Math.atan2(direction.x, direction.z),
        roadLength,
        startPoint,
        endPoint
      });
    }
    
    return (
      <>
        {roadSegments.map((segment, index) => (
          <group key={index} position={segment.centerPos} rotation={[0, -segment.angle, 0]}>
            {/* Main road surface - added depthWrite: false to prevent Z-fighting */}
            <mesh 
              geometry={new THREE.PlaneGeometry(width, segment.roadLength)} 
              material={new THREE.MeshStandardMaterial({
                color: color,
                roughness: 0.7,
                metalness: 0.2,
                side: THREE.DoubleSide,
                depthWrite: false,  // Prevent z-fighting
                polygonOffset: true,
                polygonOffsetFactor: -1,
                polygonOffsetUnits: -1
              })}
              receiveShadow 
              rotation={[-Math.PI / 2, 0, 0]}
              renderOrder={1}  // Ensure the road renders above the ground
            />
            
            {/* Center line (dashed) - slightly higher to prevent z-fighting */}
            <mesh
              geometry={new THREE.PlaneGeometry(0.3, segment.roadLength - 1)}
              material={new THREE.MeshStandardMaterial({
                color: '#FFFFFF',
                roughness: 0.3,
                metalness: 0.1,
                side: THREE.DoubleSide,
                depthWrite: false,
                polygonOffset: true,
                polygonOffsetFactor: -2,
                polygonOffsetUnits: -2
              })}
              receiveShadow
              position={[0, 0.02, 0]} // Increased height to 0.02 (from 0.01)
              rotation={[-Math.PI / 2, 0, 0]}
              renderOrder={2}  // Ensure the center line renders above the road
            />
            
            {/* Edge lines - also slightly higher */}
            <mesh
              geometry={new THREE.PlaneGeometry(0.3, segment.roadLength)}
              material={new THREE.MeshStandardMaterial({
                color: '#FFFFFF',
                roughness: 0.3,
                metalness: 0.1,
                side: THREE.DoubleSide,
                depthWrite: false,
                polygonOffset: true,
                polygonOffsetFactor: -2,
                polygonOffsetUnits: -2
              })}
              receiveShadow
              position={[-(width / 2 - 0.3), 0.02, 0]} // Increased height to 0.02 (from 0.01)
              rotation={[-Math.PI / 2, 0, 0]}
              renderOrder={2}  // Ensure edge lines render above the road
            />
            <mesh
              geometry={new THREE.PlaneGeometry(0.3, segment.roadLength)}
              material={new THREE.MeshStandardMaterial({
                color: '#FFFFFF',
                roughness: 0.3,
                metalness: 0.1,
                side: THREE.DoubleSide,
                depthWrite: false,
                polygonOffset: true,
                polygonOffsetFactor: -2,
                polygonOffsetUnits: -2
              })}
              receiveShadow
              position={[(width / 2 - 0.3), 0.02, 0]} // Increased height to 0.02 (from 0.01)
              rotation={[-Math.PI / 2, 0, 0]}
              renderOrder={2}  // Ensure edge lines render above the road
            />
          </group>
        ))}
      </>
    );
  }, [boundary, width, color, elevation, groundSize]);

  if (!roadMesh) return null;

  return (
    <group position={[0, 0, 0]}>
      {roadMesh}
    </group>
  );
}
