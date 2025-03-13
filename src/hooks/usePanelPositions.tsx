
import { useState, useCallback, useEffect } from 'react';
import { type InstanceData } from '@/lib/instancedMesh';
import { getHeightAtPosition } from '@/components/Scene/Ground';

// Define group size and spacing constants
const PANELS_PER_GROUP = 16; // 4x4 grid per group
const PANEL_SPACING = 3.1; // Reduced spacing between panels within a group
const GROUP_SPACING = 15; // Larger spacing between groups

export function usePanelPositions(initialCount: number = 100) {
  const [panelPositions, setPanelPositions] = useState<InstanceData[]>([]);
  const [selectedPanelId, setSelectedPanelId] = useState<number | null>(null);
  const [initialPositions, setInitialPositions] = useState<InstanceData[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize panel positions in groups
  useEffect(() => {
    console.log(`Initializing ${initialCount} panels`);
    try {
      const instances: InstanceData[] = [];
      
      // Calculate number of groups needed
      const groupsNeeded = Math.ceil(initialCount / PANELS_PER_GROUP);
      
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
          initialCount - g * PANELS_PER_GROUP
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
      
      setPanelPositions(instances);
      setInitialPositions(instances);
      setIsInitialized(true);
      console.log("Panel positions initialized successfully in groups");
    } catch (error) {
      console.error("Error initializing panel positions:", error);
    }
  }, [initialCount]);

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
    isInitialized
  };
}
