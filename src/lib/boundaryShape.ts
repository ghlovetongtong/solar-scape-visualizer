
import * as THREE from 'three';

// Define the boundary points based on the provided image
// These coordinates represent the green boundary lines from the image
export const solarFarmBoundaryPoints: [number, number][] = [
  [-90, -150],  // Bottom left corner
  [-90, -30],   // Left side, moving up
  [-40, 60],    // Top left corner
  [120, 80],    // Top right corner
  [170, 30],    // Right side, moving down
  [170, -80],   // Right side, continuing down
  [130, -130],  // Bottom right corner
  [10, -160],   // Bottom side
  [-90, -150]   // Back to start to close the shape
];

// Convert the 2D points to a THREE.Shape for visualization
export function createBoundaryShape(): THREE.Shape {
  const shape = new THREE.Shape();
  
  // Start from the first point
  shape.moveTo(solarFarmBoundaryPoints[0][0], solarFarmBoundaryPoints[0][1]);
  
  // Draw lines to all other points
  for (let i = 1; i < solarFarmBoundaryPoints.length; i++) {
    shape.lineTo(solarFarmBoundaryPoints[i][0], solarFarmBoundaryPoints[i][1]);
  }
  
  return shape;
}

// Check if a point is inside the boundary
export function isPointInBoundary(x: number, z: number): boolean {
  // Create a simple polygon from our boundary points
  const polygon = solarFarmBoundaryPoints.map(point => ({ x: point[0], y: point[1] }));
  
  // Ray casting algorithm to determine if point is in polygon
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;
    
    const intersect = ((yi > z) !== (yj > z)) &&
        (x < (xj - xi) * (z - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  
  return inside;
}

// Generate panel positions that fit within the boundary
export function generatePanelsWithinBoundary(
  count: number,
  spacing: number = 5,
  boundaryMargin: number = 10
): [number, number][] {
  const positions: [number, number][] = [];
  
  // Find the boundary limits
  let minX = Infinity, maxX = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;
  
  solarFarmBoundaryPoints.forEach(point => {
    minX = Math.min(minX, point[0]);
    maxX = Math.max(maxX, point[0]);
    minZ = Math.min(minZ, point[1]);
    maxZ = Math.max(maxZ, point[1]);
  });
  
  // Add margin to avoid placing panels too close to the boundary
  minX += boundaryMargin;
  maxX -= boundaryMargin;
  minZ += boundaryMargin;
  maxZ -= boundaryMargin;
  
  // Calculate how many panels we can fit in each dimension
  const xRange = maxX - minX;
  const zRange = maxZ - minZ;
  
  // Estimate the number of rows and columns to fill the area
  const aspectRatio = xRange / zRange;
  const numCols = Math.ceil(Math.sqrt(count * aspectRatio));
  const numRows = Math.ceil(count / numCols);
  
  // Calculate actual spacing to distribute panels evenly
  const xSpacing = xRange / (numCols - 1 || 1);
  const zSpacing = zRange / (numRows - 1 || 1);
  
  // Place panels in a grid, but only if they're within the boundary
  let positionCount = 0;
  
  // Use a more sophisticated approach to ensure we get enough panels
  // Start from the center and spiral outward
  const centerX = (minX + maxX) / 2;
  const centerZ = (minZ + maxZ) / 2;
  
  // Try to place panels in a spiral pattern starting from the center
  const tryToAddPanel = (x: number, z: number) => {
    if (positionCount >= count) return;
    if (isPointInBoundary(x, z)) {
      positions.push([x, z]);
      positionCount++;
    }
  };
  
  // Add center position first
  tryToAddPanel(centerX, centerZ);
  
  // Spiral outward
  let ring = 1;
  while (positionCount < count) {
    // Try current ring
    for (let x = -ring; x <= ring; x++) {
      for (let z = -ring; z <= ring; z++) {
        // Only try the perimeter of the current ring
        if (Math.abs(x) === ring || Math.abs(z) === ring) {
          const posX = centerX + x * spacing;
          const posZ = centerZ + z * spacing;
          
          // Check if position is within our overall boundary limits
          if (posX >= minX && posX <= maxX && posZ >= minZ && posZ <= maxZ) {
            tryToAddPanel(posX, posZ);
          }
        }
      }
    }
    
    // If we still don't have enough panels, try a larger ring
    ring++;
    
    // Safety check to prevent infinite loop
    if (ring > 1000) {
      console.warn('Could not place all requested panels within boundary');
      break;
    }
  }
  
  return positions;
}
