
import React, { useCallback, useState, useMemo } from 'react';
import Ground from './Ground';
import Vegetation from './Vegetation';
import BoundaryDrawing from './BoundaryDrawing';
import Road from './Road';
import { BoundaryPoint } from '@/hooks/useDrawBoundary';

interface TerrainProps {
  drawingEnabled?: boolean;
  onBoundaryComplete?: (points: BoundaryPoint[]) => void;
  savedBoundaries?: BoundaryPoint[][];
  groundSize?: number;
}

export default function Terrain({ 
  drawingEnabled = false, 
  onBoundaryComplete,
  savedBoundaries = [],
  groundSize = 400
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
  // - Shift the entire road to the left by 30 units (changed from right shift)
  // - Set road length to 470 (changed from 450)
  const leftShift = -30; // Amount to shift the road to the left (changed from rightShift of 40)
  
  const currentAngleInRadians = 40 * Math.PI / 180; // Current 40 degrees angle (after previous 5-degree left tilt)
  const newAngleAdjustment = 15 * Math.PI / 180; // 15 degrees to the right (positive angle)
  const newAngleInRadians = currentAngleInRadians + newAngleAdjustment; // 55 degrees in radians
  
  const roadLength = 470; // Changed from 450 to 470 as requested
  
  // Calculate the fixed south point, but shifted to the left
  const southX = (-75 + Math.sin(45 * Math.PI / 180) * roadLength) + leftShift; // Add leftShift to move it left
  const southZ = 180 - Math.cos(45 * Math.PI / 180) * roadLength;
  
  // Now calculate the new north point by going backwards from the fixed south point
  // Using the new angle (55 degrees)
  const newXOffset = Math.sin(newAngleInRadians) * roadLength;
  const newNorthX = southX - newXOffset + leftShift; // Add leftShift again to ensure consistent shift
  
  // Road path with the new north point (angled 15 degrees to the right) and fixed south point, both shifted left
  const angledRoadPath: BoundaryPoint[] = [
    [newNorthX, 180],  // New north point (angled 15 degrees to the right and shifted left)
    [southX, southZ]   // South point (shifted left)
  ];

  // Create expanded road boundary to ensure vegetation doesn't grow on or too close to the road
  const expandedRoadBoundary = useMemo(() => {
    if (angledRoadPath.length < 2) return [];
    
    const roadWidth = 20; // Slightly wider than actual road width to create buffer
    const [start, end] = angledRoadPath;
    
    // Calculate direction vector
    const dirX = end[0] - start[0];
    const dirZ = end[1] - start[1];
    const length = Math.sqrt(dirX * dirX + dirZ * dirZ);
    
    // Normalize direction vector
    const normalizedDirX = dirX / length;
    const normalizedDirZ = dirZ / length;
    
    // Calculate perpendicular vector (rotate 90 degrees)
    const perpX = -normalizedDirZ;
    const perpZ = normalizedDirX;
    
    // Create polygon points around the road
    const halfWidth = roadWidth / 2;
    const boundary: BoundaryPoint[] = [
      [start[0] + perpX * halfWidth, start[1] + perpZ * halfWidth],
      [end[0] + perpX * halfWidth, end[1] + perpZ * halfWidth],
      [end[0] - perpX * halfWidth, end[1] - perpZ * halfWidth],
      [start[0] - perpX * halfWidth, start[1] - perpZ * halfWidth],
    ];
    
    return boundary;
  }, [angledRoadPath]);

  // Combine road boundary with user-defined boundaries
  const allBoundaries = useMemo(() => {
    return expandedRoadBoundary.length > 0 
      ? [...savedBoundaries, expandedRoadBoundary] 
      : savedBoundaries;
  }, [savedBoundaries, expandedRoadBoundary]);

  return (
    <group>
      <Ground size={groundSize} savedBoundaries={allBoundaries} />
      <Vegetation 
        count={500} // Reduced from 1000 to 500 (half the original amount)
        minRadius={120} 
        maxRadius={180}
        savedBoundaries={allBoundaries} 
      />
      
      {/* Add the angled road */}
      <Road 
        boundary={angledRoadPath} 
        width={15} 
        color="#403E43" 
        elevation={0.05}
        groundSize={groundSize}
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
