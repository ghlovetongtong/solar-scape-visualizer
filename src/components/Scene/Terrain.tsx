
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

  // Create a road path where:
  // - North point stays fixed at [-150, 180]
  // - South point is angled 40 degrees to the right
  const angleInRadians = 40 * Math.PI / 180; // 40 degrees in radians (changed from 30)
  const roadLength = 360; // Total length from north to south
  
  // Fixed northern point
  const northX = -150;
  const northZ = 180;
  
  // Calculate offset for the 40-degree angle (moving east/right)
  const xOffset = Math.sin(angleInRadians) * roadLength;
  const zOffset = Math.cos(angleInRadians) * roadLength;
  
  // Calculate southern point with 40-degree angle to the right
  const southX = northX + xOffset; // Add because we're going right/east
  const southZ = northZ - zOffset; // Subtract because we're going south
  
  const angledRoadPath: BoundaryPoint[] = [
    [northX, northZ],    // North point (fixed)
    [southX, southZ]     // South point (angled 40 degrees to the right)
  ];

  return (
    <group>
      <Ground size={400} savedBoundaries={savedBoundaries} />
      <Vegetation />
      
      {/* Add the angled road */}
      <Road 
        boundary={angledRoadPath} 
        width={15} 
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
