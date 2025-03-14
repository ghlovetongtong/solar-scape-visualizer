
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
  
  // Using proper type annotation for Three.js Object3D
  const lineRef = useRef<THREE.Object3D>();

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

  // Create the buffer geometry once when points change
  const geometry = useMemo(() => {
    if (linePoints.length < 2) return null;
    
    const positions = new Float32Array(linePoints.flatMap(v => [v.x, v.y, v.z]));
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, [linePoints]);

  if (!geometry || linePoints.length < 2) return null;

  return (
    <group>
      <primitive object={new THREE.Line(
        geometry,
        new THREE.LineBasicMaterial({ color, linewidth: lineWidth })
      )} ref={lineRef} />
    </group>
  );
}
