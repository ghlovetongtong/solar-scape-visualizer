
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

// 存储默认面板布局的本地存储键
const DEFAULT_LAYOUT_KEY = 'solar-station-default-panel-layout';
const CURRENT_LAYOUT_KEY = 'solar-station-panel-layout';

// 硬编码的默认面板布局数据
// 这里将您当前的布局作为硬编码的初始化数据
const DEFAULT_PANEL_LAYOUT: InstanceData[] = [
  // 这里示例数据，您需要替换为您的实际面板数据
  // 示例格式: { id: 0, position: [x, y, z], rotation: [x, y, z], scale: [1, 1, 1] }
  { id: 0, position: [5, 1.0, 5], rotation: [-Math.PI / 8, 0, 0], scale: [1, 1, 1] },
  { id: 1, position: [8, 1.0, 5], rotation: [-Math.PI / 8, 0, 0], scale: [1, 1, 1] },
  { id: 2, position: [11, 1.0, 5], rotation: [-Math.PI / 8, 0, 0], scale: [1, 1, 1] },
  { id: 3, position: [14, 1.0, 5], rotation: [-Math.PI / 8, 0, 0], scale: [1, 1, 1] },
  { id: 4, position: [5, 1.0, 9], rotation: [-Math.PI / 8, 0, 0], scale: [1, 1, 1] },
  { id: 5, position: [8, 1.0, 9], rotation: [-Math.PI / 8, 0, 0], scale: [1, 1, 1] },
  { id: 6, position: [11, 1.0, 9], rotation: [-Math.PI / 8, 0, 0], scale: [1, 1, 1] },
  { id: 7, position: [14, 1.0, 9], rotation: [-Math.PI / 8, 0, 0], scale: [1, 1, 1] },
  // 您可以添加更多面板...
];

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

  // 初始化面板位置 - 使用硬编码的默认布局数据
  useEffect(() => {
    console.log(`Initializing panels with hardcoded default layout`);
    
    try {
      // 首先尝试加载用户保存的面板布局
      const savedLayout = localStorage.getItem(CURRENT_LAYOUT_KEY);
      
      if (savedLayout) {
        try {
          const parsedLayout = JSON.parse(savedLayout) as InstanceData[];
          
          // Validate parsed data structure to ensure it's compatible
          const isValidData = Array.isArray(parsedLayout) && 
            parsedLayout.every(item => 
              typeof item === 'object' && 
              'id' in item && 
              'position' in item && 
              'rotation' in item && 
              'scale' in item
            );
            
          if (isValidData) {
            setPanelPositions(parsedLayout);
            setInitialPositions(parsedLayout);
            
            console.log(`Loaded ${parsedLayout.length} panels from saved layout`);
            toast.success(`Loaded ${parsedLayout.length} panels from saved layout`);
          } else {
            console.warn("Invalid panel layout data structure, using hardcoded default layout");
            setPanelPositions(DEFAULT_PANEL_LAYOUT);
            setInitialPositions(DEFAULT_PANEL_LAYOUT);
            toast.success(`Loaded ${DEFAULT_PANEL_LAYOUT.length} panels from default layout`);
          }
        } catch (parseError) {
          console.error("Error parsing layout:", parseError);
          setPanelPositions(DEFAULT_PANEL_LAYOUT);
          setInitialPositions(DEFAULT_PANEL_LAYOUT);
          toast.success(`Loaded ${DEFAULT_PANEL_LAYOUT.length} panels from default layout`);
        }
      } else {
        // 没有保存的布局时，使用硬编码的默认布局
        console.log("No saved layout found, using hardcoded default layout");
        setPanelPositions(DEFAULT_PANEL_LAYOUT);
        setInitialPositions(DEFAULT_PANEL_LAYOUT);
        toast.success(`Loaded ${DEFAULT_PANEL_LAYOUT.length} panels from default layout`);
      }
      setIsInitialized(true);
    } catch (error) {
      console.error("Error initializing panel positions:", error);
      // 出错时也使用硬编码的默认布局
      setPanelPositions(DEFAULT_PANEL_LAYOUT);
      setInitialPositions(DEFAULT_PANEL_LAYOUT);
      setIsInitialized(true);
      toast.success(`Loaded ${DEFAULT_PANEL_LAYOUT.length} panels from default layout`);
    }
  }, []);

  // Function to save the current panel layout
  const saveCurrentLayout = useCallback(() => {
    try {
      localStorage.setItem(CURRENT_LAYOUT_KEY, JSON.stringify(panelPositions));
      toast.success(`Saved ${panelPositions.length} panels to layout`);
      setInitialPositions(panelPositions);
      console.log(`Saved ${panelPositions.length} panels to layout`);
    } catch (error) {
      console.error("Error saving panel layout:", error);
      toast.error("Failed to save panel layout");
    }
  }, [panelPositions]);

  // 保存当前面板布局为默认布局 - 此功能仍保留但会保存到本地存储
  const saveAsDefaultLayout = useCallback(() => {
    try {
      localStorage.setItem(DEFAULT_LAYOUT_KEY, JSON.stringify(panelPositions));
      toast.success(`Saved ${panelPositions.length} panels as default layout`);
      console.log(`Saved ${panelPositions.length} panels as default layout`);
    } catch (error) {
      console.error("Error saving default panel layout:", error);
      toast.error("Failed to save default panel layout");
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
      // No spacing between panels in a row, increased spacing between rows
      const spacingX = 3; // No extra spacing between panels in a row (exactly panel width)
      const spacingZ = 4; // Slightly smaller spacing between rows (reduced from 5 to 4)
      
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
    // Also clear localStorage to prevent future issues
    localStorage.removeItem(CURRENT_LAYOUT_KEY);
    toast.success("All panels cleared and saved data removed");
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
    saveCurrentLayout,
    saveAsDefaultLayout
  };
}
