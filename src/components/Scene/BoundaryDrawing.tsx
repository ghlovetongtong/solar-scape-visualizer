
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useDrawBoundary, type BoundaryPoint } from '@/hooks/useDrawBoundary';
import { Line } from '@react-three/drei';

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

  if (linePoints.length < 2) return null;

  return (
    <Line
      points={linePoints}
      color={color}
      lineWidth={lineWidth}
    />
  );
}
