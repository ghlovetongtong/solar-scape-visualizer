import { useState, useCallback, useEffect } from 'react';
import { type InstanceData } from '@/lib/instancedMesh';
import { getHeightAtPosition } from '@/components/Scene/Ground';
import * as THREE from 'three';
import { BoundaryPoint } from '@/hooks/useDrawBoundary';

// Define group size and spacing constants
const PANELS_PER_GROUP = 16; // 4x4 grid per group
const PANEL_SPACING = 2.8; // Reduced spacing between panels within a group
const GROUP_SPACING = 12; // Reduced spacing between groups

// Utility function to check if a point is inside a polygon
function isPointInPolygon(point: [number, number], polygon: BoundaryPoint[]): boolean {
  if (polygon.length < 3) return false;
  
  const x = point[0];
  const y = point[1]; // Using z as y in 2D context
  
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];
    
    const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  
  return inside;
}

export interface UsePanelPositionsProps {
  initialCount?: number;
  boundaries?: BoundaryPoint[][];
}

export function usePanelPositions({ initialCount = 100, boundaries = [] }: UsePanelPositionsProps = {}) {
  const [panelPositions, setPanelPositions] = useState<InstanceData[]>([]);
  const [selectedPanelId, setSelectedPanelId] = useState<number | null>(null);
  const [initialPositions, setInitialPositions] = useState<InstanceData[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize panel positions in groups or within boundaries
  useEffect(() => {
    console.log(`Initializing panels with boundaries:`, boundaries);
    try {
      const instances: InstanceData[] = [];
      
      // If we have boundaries, place panels within them
      if (boundaries.length > 0) {
        let panelId = 0;
        
        // Process each boundary as a separate area for panels
        boundaries.forEach((boundary) => {
          if (boundary.length < 3) return; // Skip invalid boundaries
          
          // Find the bounding box of the boundary
          let minX = Number.POSITIVE_INFINITY;
          let maxX = Number.NEGATIVE_INFINITY;
          let minZ = Number.POSITIVE_INFINITY;
          let maxZ = Number.NEGATIVE_INFINITY;
          
          boundary.forEach(([x, z]) => {
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minZ = Math.min(minZ, z);
            maxZ = Math.max(maxZ, z);
          });
          
          // Calculate grid dimensions based on boundary size
          const boundaryWidth = maxX - minX;
          const boundaryDepth = maxZ - minZ;
          
          // Determine spacing based on boundary size
          const spacing = Math.min(PANEL_SPACING * 1.5, boundaryWidth / 8, boundaryDepth / 8);
          
          // Calculate grid size
          const gridSizeX = Math.floor(boundaryWidth / spacing);
          const gridSizeZ = Math.floor(boundaryDepth / spacing);
          
          // Create panels within the grid, but only if they're inside the boundary
          for (let i = 0; i < gridSizeX; i++) {
            for (let j = 0; j < gridSizeZ; j++) {
              const x = minX + (i + 0.5) * spacing;
              const z = minZ + (j + 0.5) * spacing;
              
              // Check if this position is inside the boundary
              if (isPointInPolygon([x, z], boundary)) {
                // Get ground height at this position
                const groundHeight = getHeightAtPosition(x, z);
                
                // Create the panel with a slight randomization to rotation
                const rotationY = (Math.random() - 0.5) * 0.2;
                
                instances.push({
                  id: panelId++,
                  position: [x, 1.0 + groundHeight, z],
                  rotation: [-Math.PI / 8, rotationY, 0],
                  scale: [1, 1, 1]
                });
              }
            }
          }
        });
        
        // If we didn't place any panels (boundaries might be too small), place a minimum number
        if (instances.length === 0) {
          console.log("Boundaries too small, placing default panels");
          // Place default panels as a fallback
          createDefaultPanels(instances, initialCount);
        }
      } else {
        // No boundaries, place panels in the default pattern
        createDefaultPanels(instances, initialCount);
      }
      
      console.log(`Placed ${instances.length} panels`);
      setPanelPositions(instances);
      setInitialPositions(instances);
      setIsInitialized(true);
    } catch (error) {
      console.error("Error initializing panel positions:", error);
    }
  }, [initialCount, boundaries]);

  // Helper function to create default panels in groups
  const createDefaultPanels = (instances: InstanceData[], count: number) => {
    // Calculate number of groups needed
    const groupsNeeded = Math.ceil(count / PANELS_PER_GROUP);
    
    // Calculate the grid dimensions for groups
    const groupGridSize = Math.ceil(Math.sqrt(groupsNeeded));
    
    // Calculate offset to center the entire grid
    const totalGridWidth = (groupGridSize - 1) * GROUP_SPACING;
    const centerOffsetX = totalGridWidth / 2;
    const centerOffsetZ = totalGridWidth / 2;
    
    // Generate panels in groups
    for (let g = 0; g < groupsNeeded; g++) {
      // Calculate group position in the larger grid
      const groupRow = Math.floor(g / groupGridSize);
      const groupCol = g % groupGridSize;
      
      // Center the entire grid by subtracting the offset
      const groupCenterX = groupCol * GROUP_SPACING - centerOffsetX;
      const groupCenterZ = groupRow * GROUP_SPACING - centerOffsetZ;
      
      // Calculate how many panels to create in this group
      const panelsInThisGroup = Math.min(
        PANELS_PER_GROUP, 
        count - g * PANELS_PER_GROUP
      );
      
      if (panelsInThisGroup <= 0) break;
      
      // Create panels in a smaller grid within the group
      const panelsPerRow = 4; // 4x4 grid within each group
      
      for (let p = 0; p < panelsInThisGroup; p++) {
        const panelRow = Math.floor(p / panelsPerRow);
        const panelCol = p % panelsPerRow;
        
        // Calculate panel position within the group
        const x = groupCenterX + (panelCol - 1.5) * PANEL_SPACING;
        const z = groupCenterZ + (panelRow - 1.5) * PANEL_SPACING;
        
        // Get ground height at this position
        const groundHeight = getHeightAtPosition(x, z);
        
        // Calculate global panel ID
        const panelId = g * PANELS_PER_GROUP + p;
        
        // Create panel instance with consistent rotation within group
        // All panels in a group have same rotation for a uniform appearance
        const groupRotationY = (Math.random() - 0.5) * 0.1; // Slight variation between groups
        
        instances.push({
          id: panelId,
          position: [
            x, 
            1.0 + groundHeight,
            z
          ],
          rotation: [
            -Math.PI / 8, // Fixed tilt for all panels in group
            groupRotationY,
            0
          ],
          scale: [1, 1, 1]
        });
      }
    }
  };

  // Function to add new panels within a specific boundary
  const addNewPanelsInBoundary = useCallback((boundary: BoundaryPoint[]) => {
    if (boundary.length < 3) {
      console.warn("Cannot add panels - boundary has less than 3 points");
      return 0;
    }

    try {
      // Find the bounding box of the boundary
      let minX = Number.POSITIVE_INFINITY;
      let maxX = Number.NEGATIVE_INFINITY;
      let minZ = Number.POSITIVE_INFINITY;
      let maxZ = Number.NEGATIVE_INFINITY;
      
      boundary.forEach(([x, z]) => {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minZ = Math.min(minZ, z);
        maxZ = Math.max(maxZ, z);
      });
      
      // Calculate grid dimensions based on boundary size
      const boundaryWidth = maxX - minX;
      const boundaryDepth = maxZ - minZ;
      
      // Determine spacing based on boundary size
      const spacing = Math.min(PANEL_SPACING * 1.5, boundaryWidth / 10, boundaryDepth / 10);
      
      // Calculate grid size
      const gridSizeX = Math.floor(boundaryWidth / spacing);
      const gridSizeZ = Math.floor(boundaryDepth / spacing);
      
      const newPanels: InstanceData[] = [];
      const nextPanelId = panelPositions.length > 0 
        ? Math.max(...panelPositions.map(panel => panel.id)) + 1 
        : 0;
      
      let panelCount = 0;
      
      // Create panels within the grid, but only if they're inside the boundary
      for (let i = 0; i < gridSizeX; i++) {
        for (let j = 0; j < gridSizeZ; j++) {
          const x = minX + (i + 0.5) * spacing;
          const z = minZ + (j + 0.5) * spacing;
          
          // Check if this position is inside the boundary
          if (isPointInPolygon([x, z], boundary)) {
            // Check if there's already a panel at this position (within a small tolerance)
            const tolerance = spacing / 2;
            const existingPanel = panelPositions.find(panel => {
              const dx = panel.position[0] - x;
              const dz = panel.position[2] - z;
              return Math.sqrt(dx * dx + dz * dz) < tolerance;
            });
            
            // Only place a new panel if there isn't already one here
            if (!existingPanel) {
              // Get ground height at this position
              const groundHeight = getHeightAtPosition(x, z);
              
              // Create the panel with a slight randomization to rotation
              const rotationY = (Math.random() - 0.5) * 0.2;
              
              newPanels.push({
                id: nextPanelId + panelCount,
                position: [x, 1.0 + groundHeight, z],
                rotation: [-Math.PI / 8, rotationY, 0],
                scale: [1, 1, 1]
              });
              
              panelCount++;
            }
          }
        }
      }
      
      console.log(`Generated ${newPanels.length} new panels in boundary`);
      
      // Add the new panels to the existing ones
      setPanelPositions(prev => [...prev, ...newPanels]);
      
      return newPanels.length;
    } catch (error) {
      console.error("Error adding new panels in boundary:", error);
      return 0;
    }
  }, [panelPositions]);

  // Function to clear all panels
  const clearAllPanels = useCallback(() => {
    setPanelPositions([]);
    setSelectedPanelId(null);
  }, []);

  // Function to update a single panel's position
  const updatePanelPosition = useCallback((id: number, position: [number, number, number]) => {
    setPanelPositions(prev => 
      prev.map(panel => 
        panel.id === id 
          ? { ...panel, position } 
          : panel
      )
    );
  }, []);

  // Function to update a single panel's rotation
  const updatePanelRotation = useCallback((id: number, rotation: [number, number, number]) => {
    setPanelPositions(prev => 
      prev.map(panel => 
        panel.id === id 
          ? { ...panel, rotation } 
          : panel
      )
    );
  }, []);

  // Function to select a panel
  const selectPanel = useCallback((id: number | null) => {
    setSelectedPanelId(id);
  }, []);

  // Function to reset all panels to initial positions
  const resetPanelPositions = useCallback(() => {
    setPanelPositions(initialPositions);
  }, [initialPositions]);

  return {
    panelPositions,
    selectedPanelId,
    updatePanelPosition,
    updatePanelRotation,
    selectPanel,
    resetPanelPositions,
    isInitialized,
    addNewPanelsInBoundary,
    clearAllPanels
  };
}
