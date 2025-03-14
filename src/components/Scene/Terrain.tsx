
import React, { useCallback } from 'react';
import Ground from './Ground';
import Vegetation from './Vegetation';
import BoundaryDrawing from './BoundaryDrawing';
import { BoundaryPoint } from '@/hooks/useDrawBoundary';

interface TerrainProps {
  drawingEnabled?: boolean;
  onBoundaryComplete?: (points: BoundaryPoint[]) => void;
  savedBoundaries?: BoundaryPoint[][];
}

export default function Terrain({ 
  drawingEnabled = false, 
  onBoundaryComplete,
  savedBoundaries = []
}: TerrainProps) {
  // Create a safe callback wrapper that won't cause "lov" errors
  const handleBoundaryComplete = useCallback((points: BoundaryPoint[]) => {
    if (onBoundaryComplete && points.length > 2) {
      // Ensure we're dealing with a valid boundary before calling the callback
      try {
        onBoundaryComplete(points);
      } catch (error) {
        console.error("Error in boundary completion callback:", error);
      }
    }
  }, [onBoundaryComplete]);

  return (
    <group>
      <Ground size={400} savedBoundaries={savedBoundaries} />
      <Vegetation />
      {drawingEnabled && (
        <BoundaryDrawing 
          enabled={drawingEnabled} 
          onComplete={handleBoundaryComplete} 
          color="#00ff00"
          lineWidth={3}
        />
      )}
    </group>
  );
}
