
import React from 'react';
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
  return (
    <group>
      <Ground size={400} savedBoundaries={savedBoundaries} />
      <Vegetation />
      {drawingEnabled && (
        <BoundaryDrawing 
          enabled={drawingEnabled} 
          onComplete={onBoundaryComplete} 
        />
      )}
    </group>
  );
}
