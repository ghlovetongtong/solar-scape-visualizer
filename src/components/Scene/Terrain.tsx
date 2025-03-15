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
  // - Angle the north point 15 degrees to the right from its current position
  const currentAngleInRadians = 40 * Math.PI / 180; // Current 40 degrees angle (after previous 5-degree left tilt)
  const newAngleAdjustment = 15 * Math.PI / 180; // 15 degrees to the right (positive angle)
  const newAngleInRadians = currentAngleInRadians + newAngleAdjustment; // 55 degrees in radians
  
  const roadLength = 360; // Total length from north to south
  
  // Keep the same south point fixed from previous calculations
  const southX = -75 + Math.sin(45 * Math.PI / 180) * roadLength; // Using original 45 degrees to find the fixed south point
  const southZ = 180 - Math.cos(45 * Math.PI / 180) * roadLength;
  
  // Now calculate the new north point by going backwards from the fixed south point
  // Using the new angle (55 degrees)
  const newXOffset = Math.sin(newAngleInRadians) * roadLength;
  const newNorthX = southX - newXOffset; // Subtract because we're going backwards
  
  // Road path with the new north point (tilted 15 degrees to the right) and fixed south point
  const angledRoadPath: BoundaryPoint[] = [
    [newNorthX, 180],  // New north point (angled 15 degrees to the right)
    [southX, southZ]   // South point (kept fixed)
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
