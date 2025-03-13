
import { useState, useCallback, useEffect } from 'react';
import { type InstanceData } from '@/lib/instancedMesh';

export function usePanelPositions(initialCount: number = 6000) {
  const [panelPositions, setPanelPositions] = useState<InstanceData[]>([]);
  const [selectedPanelId, setSelectedPanelId] = useState<number | null>(null);
  const [initialPositions, setInitialPositions] = useState<InstanceData[]>([]);

  // Initialize panel positions in a grid layout
  useEffect(() => {
    const spacing = 5;
    const rowSize = Math.ceil(Math.sqrt(initialCount));
    
    const instances: InstanceData[] = [];
    for (let i = 0; i < initialCount; i++) {
      const row = Math.floor(i / rowSize);
      const col = i % rowSize;
      
      // Add some variation to make it look more natural
      const xOffset = (Math.random() - 0.5) * 0.5;
      const zOffset = (Math.random() - 0.5) * 0.5;
      const yRotation = (Math.random() - 0.5) * 0.1;
      
      instances.push({
        id: i,
        position: [
          col * spacing + xOffset, 
          0.5, 
          row * spacing + zOffset
        ],
        rotation: [
          -Math.PI / 8, // Tilt panels slightly toward the sun
          yRotation,
          0
        ],
        scale: [1, 1, 1]
      });
    }
    
    setPanelPositions(instances);
    setInitialPositions(instances);
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
    resetPanelPositions
  };
}
