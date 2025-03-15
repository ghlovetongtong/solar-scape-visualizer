
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

  // Create an angled road path 
  // - South point stays at [-150, -180]
  // - North point is angled 30 degrees to the left
  const angleInRadians = 30 * Math.PI / 180; // 30 degrees in radians
  const roadLength = 360; // Total length from south to north
  
  // Calculate the northern point with the 30-degree angle to the left
  // Starting from the southern point at [-150, -180]
  const southX = -150;
  const southZ = -180;
  
  // Calculate offset for the 30-degree angle (moving west/left)
  const xOffset = Math.sin(angleInRadians) * roadLength;
  const zOffset = Math.cos(angleInRadians) * roadLength;
  
  const northX = southX - xOffset; // Subtract because we're going left/west
  const northZ = southZ + zOffset; // Add because we're going north
  
  const angledRoadPath: BoundaryPoint[] = [
    [northX, northZ],  // North point (angled 30 degrees to the left)
    [southX, southZ]   // South point (fixed)
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
