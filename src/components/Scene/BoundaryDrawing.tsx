
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useDrawBoundary, type BoundaryPoint } from '@/hooks/useDrawBoundary';

interface BoundaryDrawingProps {
  enabled: boolean;
  onComplete?: (points: BoundaryPoint[]) => void;
  color?: string;
  lineWidth?: number;
}

export default function BoundaryDrawing({ 
  enabled, 
  onComplete, 
  color = '#00ff00', 
  lineWidth = 2 
}: BoundaryDrawingProps) {
  const { points, isDrawing } = useDrawBoundary({ 
    enabled, 
    onComplete 
  });
  
  // Create a ref for the line to avoid recreating it
  const lineRef = useRef<THREE.Line>(null);

  // Create points for the line with a slight y-offset to position above the ground
  const linePoints = useMemo(() => {
    if (points.length < 2) return [];
    
    // Create line points with a slight y-offset
    const vertices = points.map(([x, z]) => new THREE.Vector3(x, 0.05, z));
    
    // Add the first point again to close the loop if we're not drawing
    if (!isDrawing && points.length > 2) {
      vertices.push(new THREE.Vector3(points[0][0], 0.05, points[0][1]));
    }
    
    return vertices;
  }, [points, isDrawing]);

  // Update the line geometry when points change
  useMemo(() => {
    if (lineRef.current && linePoints.length >= 2) {
      const positions = new Float32Array(linePoints.flatMap(v => [v.x, v.y, v.z]));
      
      if (lineRef.current.geometry) {
        // Update the existing geometry
        lineRef.current.geometry.setAttribute(
          'position', 
          new THREE.BufferAttribute(positions, 3)
        );
        lineRef.current.geometry.attributes.position.needsUpdate = true;
      }
    }
  }, [linePoints]);

  if (linePoints.length < 2) return null;

  return (
    <group>
      <line ref={lineRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={linePoints.length}
            array={new Float32Array(linePoints.flatMap(v => [v.x, v.y, v.z]))}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={color} linewidth={lineWidth} />
      </line>
    </group>
  );
}
