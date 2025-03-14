
import { useState, useCallback, useEffect } from 'react';
import { type InstanceData } from '@/lib/instancedMesh';
import { getHeightAtPosition } from '@/components/Scene/Ground';
import * as THREE from 'three';
import { BoundaryPoint } from '@/hooks/useDrawBoundary';
import { toast } from 'sonner';

// Define group size and spacing constants
const PANELS_PER_GROUP = 16; // 4x4 grid per group
const PANEL_SPACING = 0; // Removed spacing between panels within a group
const GROUP_SPACING = 0; // Removed spacing between groups

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

export function usePanelPositions({ initialCount = 0, boundaries = [] }: UsePanelPositionsProps = {}) {
  const [panelPositions, setPanelPositions] = useState<InstanceData[]>([]);
  const [selectedPanelId, setSelectedPanelId] = useState<number | null>(null);
  const [initialPositions, setInitialPositions] = useState<InstanceData[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize panel positions - now starts with empty array by default
  useEffect(() => {
    console.log(`Initializing panels with empty layout`);
    
    // Try to load saved panel layout from localStorage
    try {
      const savedLayout = localStorage.getItem('solar-station-panel-layout');
      if (savedLayout) {
        const parsedLayout = JSON.parse(savedLayout) as InstanceData[];
        setPanelPositions(parsedLayout);
        setInitialPositions(parsedLayout);
        console.log(`Loaded ${parsedLayout.length} panels from saved layout`);
        toast.success(`Loaded ${parsedLayout.length} panels from saved layout`);
      } else {
        // Start with empty array if no saved layout
        setPanelPositions([]);
        setInitialPositions([]);
      }
      setIsInitialized(true);
    } catch (error) {
      console.error("Error initializing panel positions:", error);
      // Fallback to empty array
      setPanelPositions([]);
      setInitialPositions([]);
      setIsInitialized(true);
    }
  }, []);

  // Function to save the current panel layout
  const saveCurrentLayout = useCallback(() => {
    try {
      localStorage.setItem('solar-station-panel-layout', JSON.stringify(panelPositions));
      toast.success(`Saved ${panelPositions.length} panels to layout`);
      setInitialPositions(panelPositions);
      console.log(`Saved ${panelPositions.length} panels to layout`);
    } catch (error) {
      console.error("Error saving panel layout:", error);
      toast.error("Failed to save panel layout");
    }
  }, [panelPositions]);

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
      
      // Panel size is exactly 3 units wide and 2 units deep
      // Adding row spacing for better arrangement
      const spacingX = 3.5; // Slight spacing between panels in a row
      const spacingZ = 3; // Increased spacing between rows
      
      // Calculate grid size
      const gridSizeX = Math.floor(boundaryWidth / spacingX);
      const gridSizeZ = Math.floor(boundaryDepth / spacingZ);
      
      // Center the panels within the boundary
      const startOffsetX = minX + (boundaryWidth - (gridSizeX * spacingX)) / 2;
      const startOffsetZ = minZ + (boundaryDepth - (gridSizeZ * spacingZ)) / 2;
      
      const newPanels: InstanceData[] = [];
      const nextPanelId = panelPositions.length > 0 
        ? Math.max(...panelPositions.map(panel => panel.id)) + 1 
        : 0;
      
      let panelCount = 0;
      
      // Create panels within the grid, but only if they're inside the boundary
      for (let i = 0; i < gridSizeX; i++) {
        for (let j = 0; j < gridSizeZ; j++) {
          const x = startOffsetX + (i * spacingX) + (spacingX / 2);
          const z = startOffsetZ + (j * spacingZ) + (spacingZ / 2);
          
          // Check if this position is inside the boundary
          if (isPointInPolygon([x, z], boundary)) {
            // Check if there's already a panel at this position (with minimal tolerance)
            const tolerance = 0.1; // Very small tolerance since we want tight packing
            const existingPanel = panelPositions.find(panel => {
              const dx = panel.position[0] - x;
              const dz = panel.position[2] - z;
              return Math.sqrt(dx * dx + dz * dz) < tolerance;
            });
            
            // Only place a new panel if there isn't already one here
            if (!existingPanel) {
              // Ground height is now always 0 (flat ground)
              
              newPanels.push({
                id: nextPanelId + panelCount,
                position: [x, 1.0, z], // Height is fixed at 1.0 since ground is flat
                rotation: [-Math.PI / 8, 0, 0], // Fixed rotation without random variation
                scale: [1, 1, 1] // Ensure uniform scale for all panels
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
          ? { 
              ...panel, 
              position: [
                panel.position[0] + position[0], 
                panel.position[1] + position[1], 
                panel.position[2] + position[2]
              ] 
            } 
          : panel
      )
    );
  }, []);

  // Function to update a single panel's rotation
  const updatePanelRotation = useCallback((id: number, rotation: [number, number, number]) => {
    setPanelPositions(prev => 
      prev.map(panel => 
        panel.id === id 
          ? { 
              ...panel, 
              rotation: [
                panel.rotation[0] + rotation[0], 
                panel.rotation[1] + rotation[1], 
                panel.rotation[2] + rotation[2]
              ] 
            } 
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
    clearAllPanels,
    saveCurrentLayout
  };
}
