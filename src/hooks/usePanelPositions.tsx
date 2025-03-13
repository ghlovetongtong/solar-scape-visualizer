import { useState, useCallback, useEffect } from 'react';
import { type InstanceData } from '@/lib/instancedMesh';
import { getHeightAtPosition } from '@/components/Scene/Ground';
import { generatePanelsWithinBoundary } from '@/lib/boundaryShape';

// Define group size and spacing constants
const PANELS_PER_GROUP = 16; // 4x4 grid per group
const PANEL_SPACING = 2.8; // Spacing between panels within a group
const GROUP_SPACING = 12; // Spacing between groups

export function usePanelPositions(initialCount: number = 100) {
  const [panelPositions, setPanelPositions] = useState<InstanceData[]>([]);
  const [selectedPanelId, setSelectedPanelId] = useState<number | null>(null);
  const [initialPositions, setInitialPositions] = useState<InstanceData[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize panel positions within the boundary
  useEffect(() => {
    console.log(`Initializing ${initialCount} panels within boundary`);
    try {
      const instances: InstanceData[] = [];
      
      // Generate positions within our custom boundary
      const positions = generatePanelsWithinBoundary(initialCount, GROUP_SPACING / 2);
      
      // Create panel instances at each position
      positions.forEach((position, index) => {
        const [x, z] = position;
        
        // Get ground height at this position
        const groundHeight = getHeightAtPosition(x, z);
        
        instances.push({
          id: index,
          position: [
            x, 
            1.0 + groundHeight,
            z
          ],
          rotation: [
            -Math.PI / 6, // -30 degrees in radians around X axis
            (Math.random() - 0.5) * 0.1, // Slight random variation in Y
            0
          ],
          scale: [1, 1, 1]
        });
      });
      
      setPanelPositions(instances);
      setInitialPositions(instances);
      setIsInitialized(true);
      console.log("Panel positions initialized successfully within custom boundary");
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
