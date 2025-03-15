
import React, { useCallback, useState } from 'react';
import Ground from './Ground';
import Vegetation from './Vegetation';
import BoundaryDrawing from './BoundaryDrawing';
import Road from './Road';
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
  // State to store the road boundary
  const [roadBoundary, setRoadBoundary] = useState<BoundaryPoint[]>([]);
  
  // Create a safe callback wrapper that won't cause "lov" errors
  const handleBoundaryComplete = useCallback((points: BoundaryPoint[]) => {
    if (onBoundaryComplete && points.length > 2) {
      // Ensure we're dealing with a valid boundary before calling the callback
      try {
        // If we don't have a road yet, use the first boundary as a road
        if (roadBoundary.length === 0) {
          setRoadBoundary(points);
          console.log('Road boundary set with', points.length, 'points');
        }
        onBoundaryComplete(points);
      } catch (error) {
        console.error("Error in boundary completion callback:", error);
      }
    }
  }, [onBoundaryComplete, roadBoundary]);

  // Create a predefined road path that avoids equipment areas
  const predefinedRoadPath: BoundaryPoint[] = [
    [-150, -150],
    [-100, -120],
    [-50, -100],
    [0, -80],
    [50, -70],
    [100, -80],
    [150, -100],
    [170, -50],
    [180, 0],
    [170, 50],
    [150, 100],
    [100, 130],
    [50, 140],
    [0, 140],
    [-50, 130],
    [-100, 110],
    [-150, 100],
    [-170, 50],
    [-180, 0],
    [-170, -50],
    [-150, -100],
    [-150, -150]
  ];

  return (
    <group>
      <Ground size={400} savedBoundaries={savedBoundaries} />
      <Vegetation />
      
      {/* Add the predefined road */}
      <Road 
        boundary={predefinedRoadPath} 
        width={12} 
        color="#403E43" 
        elevation={0.05} 
      />
      
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
