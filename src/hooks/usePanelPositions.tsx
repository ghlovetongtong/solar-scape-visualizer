
import { useState, useCallback, useEffect } from 'react';
import { type InstanceData } from '@/lib/instancedMesh';
import { getHeightAtPosition } from '@/components/Scene/Ground';

export function usePanelPositions(initialCount: number = 100) {
  const [panelPositions, setPanelPositions] = useState<InstanceData[]>([]);
  const [selectedPanelId, setSelectedPanelId] = useState<number | null>(null);
  const [initialPositions, setInitialPositions] = useState<InstanceData[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize panel positions in a grid layout
  useEffect(() => {
    console.log(`Initializing ${initialCount} panels`);
    try {
      const spacing = 5;
      const rowSize = Math.ceil(Math.sqrt(initialCount));
      
      const instances: InstanceData[] = [];
      
      // Create a more efficient loop for a large number of panels
      let currentId = 0;
      
      // Calculate the grid size needed to fit all panels
      const gridSize = Math.ceil(Math.sqrt(initialCount));
      const halfGrid = Math.floor(gridSize / 2);
      
      // Generate in batches to not block the main thread
      const generateBatch = (startIndex: number, batchSize: number) => {
        const endIndex = Math.min(startIndex + batchSize, initialCount);
        const batchInstances: InstanceData[] = [];
        
        for (let i = startIndex; i < endIndex; i++) {
          const row = Math.floor(i / gridSize) - halfGrid;
          const col = (i % gridSize) - halfGrid;
          
          // Add some variation to make it look more natural
          const xOffset = (Math.random() - 0.5) * 0.5;
          const zOffset = (Math.random() - 0.5) * 0.5;
          const yRotation = (Math.random() - 0.5) * 0.1;
          
          // Calculate position and consider ground height
          const x = col * spacing + xOffset;
          const z = row * spacing + zOffset;
          const groundHeight = getHeightAtPosition(x, z);
          
          batchInstances.push({
            id: i,
            position: [
              x, 
              1.0 + groundHeight, // Increased y value to make room for tracking brackets
              z
            ],
            rotation: [
              -Math.PI / 8 + (Math.random() - 0.5) * 0.05, // Slight random variation in tilt
              yRotation,
              0
            ],
            scale: [1, 1, 1]
          });
        }
        
        return batchInstances;
      };
      
      // Generate all panels in a single batch for now
      // For even more panels, we could split this into multiple batches
      const allPanels = generateBatch(0, initialCount);
      
      setPanelPositions(allPanels);
      setInitialPositions(allPanels);
      setIsInitialized(true);
      console.log("Panel positions initialized successfully");
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
