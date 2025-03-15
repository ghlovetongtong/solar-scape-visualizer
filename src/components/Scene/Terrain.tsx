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

  // Create a road where:
  // - We keep the south point fixed
  // - Angle the north point 5 degrees to the left from its current position
  const currentAngleInRadians = 45 * Math.PI / 180; // Current 45 degrees angle
  const newAngleAdjustment = -5 * Math.PI / 180; // 5 degrees to the left (negative angle)
  const newAngleInRadians = currentAngleInRadians + newAngleAdjustment; // 40 degrees in radians
  
  const roadLength = 360; // Total length from north to south
  
  // Calculate the south point based on the old angle (45 degrees)
  // Starting from the fixed north point (-75, 180)
  const oldNorthX = -75;
  const northZ = 180;
  
  const oldXOffset = Math.sin(currentAngleInRadians) * roadLength;
  const zOffset = Math.cos(currentAngleInRadians) * roadLength;
  
  // South point (fixed)
  const southX = oldNorthX + oldXOffset;
  const southZ = northZ - zOffset;
  
  // Now calculate the new north point by going backwards from the fixed south point
  // Using the new angle (40 degrees)
  const newXOffset = Math.sin(newAngleInRadians) * roadLength;
  const newNorthX = southX - newXOffset; // Subtract because we're going backwards
  
  // Road path with the new north point (tilted 5 degrees left) and fixed south point
  const angledRoadPath: BoundaryPoint[] = [
    [newNorthX, northZ],  // New north point (angled 5 degrees to the left)
    [southX, southZ]      // South point (kept fixed)
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
