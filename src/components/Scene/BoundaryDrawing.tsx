
import React, { useMemo } from 'react';
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

  // Create a geometry for the line from the points
  const lineGeometry = useMemo(() => {
    if (points.length < 2) return null;
    
    const geometry = new THREE.BufferGeometry();
    
    // Create vertices with a slight y-offset to position above the ground
    const vertices = points.flatMap(([x, z]) => [x, 0.05, z]);
    
    // Add the first point again to close the loop if we're not drawing
    if (!isDrawing && points.length > 2) {
      vertices.push(points[0][0], 0.05, points[0][1]);
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    return geometry;
  }, [points, isDrawing]);

  // Create a material for the line
  const lineMaterial = useMemo(() => {
    return new THREE.LineBasicMaterial({ 
      color: new THREE.Color(color),
      linewidth: lineWidth,
      opacity: 1,
      transparent: true,
    });
  }, [color, lineWidth]);

  if (!lineGeometry) return null;

  return (
    <line geometry={lineGeometry} material={lineMaterial} />
  );
}
