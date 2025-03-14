
import React, { useState, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stats } from '@react-three/drei';
import { toast } from 'sonner';
import * as THREE from 'three';

import Camera from './Camera';
import Controls from './Controls';
import Ground from './Ground';
import SkyBox from './SkyBox';
import Terrain from './Terrain';
import TransformerStation from './TransformerStation';
import Road from './Road';
import InverterControls from './InverterControls';
import BoundaryDrawing from './BoundaryDrawing';
import Vegetation from './Vegetation';
import ITHouse from './ITHouse';
import SolarPanel from './SolarPanel';
import InverterContainer from './InverterContainer';
import { usePanelPositions } from '@/hooks/usePanelPositions';
import { BoundaryPoint } from '@/hooks/useDrawBoundary';

// Add initial inverters
const initialInverters = [
  {
    position: [50, 1, 30] as [number, number, number],
    index: 0,
    power: 60,
    efficiency: 98.6,
    mpptChannels: 6,
    status: 'online' as const,
    temperature: 42.3,
    dailyEnergy: 385.2,
    totalEnergy: 1750.8,
    serialNumber: 'INV-100001',
    manufacturer: 'SolarTech',
    model: 'ST-60K'
  },
  {
    position: [80, 1, 30] as [number, number, number],
    index: 1,
    power: 75,
    efficiency: 99.0,
    mpptChannels: 8,
    status: 'online' as const,
    temperature: 40.5,
    dailyEnergy: 425.7,
    totalEnergy: 2150.3,
    serialNumber: 'INV-100002',
    manufacturer: 'SolarTech',
    model: 'ST-75K'
  }
];

const SceneContainer: React.FC = () => {
  const [inverters, setInverters] = useState(initialInverters);
  const [selectedInverterIndex, setSelectedInverterIndex] = useState<number | null>(null);
  const [isDraggingInverter, setIsDraggingInverter] = useState<boolean>(false);
  
  // Add time of day state
  const [timeOfDay, setTimeOfDay] = useState<number>(0.5); // noon by default
  
  // Add boundary drawing state
  const [drawingMode, setDrawingMode] = useState<boolean>(false);
  const [boundaries, setBoundaries] = useState<BoundaryPoint[][]>([]);
  
  // Add stats toggle
  const [showStats, setShowStats] = useState<boolean>(true);
  
  // Use panel positions hook
  const {
    panelPositions,
    selectedPanelId,
    selectPanel,
    updatePanelPosition,
    updatePanelRotation,
    resetPanelPositions,
    clearAllPanels,
    addNewPanelsInBoundary,
    saveCurrentLayout
  } = usePanelPositions();

  // Handle inverter selection
  const handleSelectInverter = useCallback((index: number) => {
    console.log(`Inverter onClick callback, index=${index}, current selectedIndex=${selectedInverterIndex}`);
    setSelectedInverterIndex(index);
  }, [selectedInverterIndex]);

  // Handle inverter drag start
  const handleInverterDragStart = useCallback((index: number) => {
    console.log(`Started dragging inverter ${index + 1}`);
    setIsDraggingInverter(true);
  }, []);

  // Handle inverter drag
  const handleInverterDrag = useCallback((index: number, position: [number, number, number]) => {
    setInverters(prevInverters => 
      prevInverters.map(inverter => 
        inverter.index === index 
          ? { ...inverter, position }
          : inverter
      )
    );
  }, []);

  // Handle inverter drag end
  const handleInverterDragEnd = useCallback((index: number, position: [number, number, number]) => {
    console.log(`Finished dragging object`);
    setIsDraggingInverter(false);
    
    // Update the inverter position
    setInverters(prevInverters => 
      prevInverters.map(inverter => 
        inverter.index === index 
          ? { ...inverter, position }
          : inverter
      )
    );
    
    // Show a toast notification
    toast.success(`Inverter ${index + 1} repositioned`, {
      description: `New position: X: ${position[0].toFixed(1)}, Z: ${position[2].toFixed(1)}`
    });
  }, []);
  
  // Handle panel selection
  const handleSelectPanel = useCallback((id: number | null) => {
    selectPanel(id);
  }, [selectPanel]);
  
  // Handle deselect inverter
  const handleDeselectInverter = useCallback(() => {
    setSelectedInverterIndex(null);
  }, []);
  
  // Handle update inverter position
  const handleUpdateInverterPosition = useCallback((index: number, positionDelta: [number, number, number]) => {
    setInverters(prevInverters => 
      prevInverters.map(inverter => 
        inverter.index === index 
          ? { 
              ...inverter, 
              position: [
                inverter.position[0] + positionDelta[0],
                inverter.position[1] + positionDelta[1],
                inverter.position[2] + positionDelta[2]
              ] as [number, number, number]
            }
          : inverter
      )
    );
  }, []);
  
  // Handle save boundary
  const handleSaveBoundary = useCallback(() => {
    // This would be implemented to save the current boundary
    toast.success('Boundary saved');
  }, []);
  
  // Handle clear boundary
  const handleClearBoundary = useCallback(() => {
    // This would be implemented to clear the current boundary drawing
    toast.info('Boundary drawing cleared');
  }, []);
  
  // Handle generate panels in boundary
  const handleGenerateNewPanelsInBoundary = useCallback(() => {
    if (boundaries.length === 0) {
      toast.error('No boundaries defined');
      return;
    }
    
    let totalPanels = 0;
    
    boundaries.forEach(boundary => {
      const count = addNewPanelsInBoundary(boundary);
      totalPanels += count;
    });
    
    toast.success(`Generated ${totalPanels} new solar panels`);
  }, [boundaries, addNewPanelsInBoundary]);
  
  // Handle save layout
  const handleSaveLayout = useCallback(() => {
    const completeLayout = {
      panels: panelPositions,
      inverters: inverters.map(inv => inv.position),
      transformers: [[0, 0, 0]], // Default position
      cameras: [], // No cameras yet
      itHouse: [-40, 0, 10] as [number, number, number]
    };
    
    saveCurrentLayout(completeLayout);
  }, [panelPositions, inverters, saveCurrentLayout]);

  return (
    <Canvas shadows gl={{ antialias: true }} 
      camera={{ position: [0, 50, 100], fov: 75 }}
      style={{ 
        background: 'radial-gradient(#1e293b, #0f172a)',
        width: '100%', 
        height: '100vh' 
      }}
    >
      {showStats && <Stats />}
      
      {/* Camera and Controls need props */}
      <Camera 
        position={new THREE.Vector3(0, 50, 0)} 
        cameraIndex={0} 
      />
      <Controls 
        showStats={showStats}
        setShowStats={setShowStats}
        timeOfDay={timeOfDay}
        setTimeOfDay={setTimeOfDay}
        onResetPanels={resetPanelPositions}
        selectedPanelId={selectedPanelId}
        selectedInverterIndex={selectedInverterIndex}
        onDeselectInverter={handleDeselectInverter}
        onUpdatePanelPosition={updatePanelPosition}
        onUpdatePanelRotation={updatePanelRotation}
        onUpdateInverterPosition={handleUpdateInverterPosition}
        drawingMode={drawingMode}
        setDrawingMode={setDrawingMode}
        onSaveBoundary={handleSaveBoundary}
        onClearBoundary={handleClearBoundary}
        onClearAllBoundaries={() => setBoundaries([])}
        onClearAllPanels={clearAllPanels}
        onGenerateNewPanelsInBoundary={handleGenerateNewPanelsInBoundary}
        onSaveLayout={handleSaveLayout}
      />
      
      {/* Environment */}
      <SkyBox timeOfDay={timeOfDay} />
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[100, 100, 50]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
      />
      
      {/* Ground, terrain and structures */}
      <Terrain />
      <Ground />
      <TransformerStation position={new THREE.Vector3(0, 0, 0)} />
      <ITHouse position={new THREE.Vector3(-40, 0, 10)} />
      <Road />
      <Vegetation />
      
      {/* Solar panels with required props */}
      <SolarPanel 
        panelPositions={panelPositions}
        selectedPanelId={selectedPanelId}
        onSelectPanel={handleSelectPanel}
      />
      
      {/* Inverters */}
      <InverterContainer 
        inverters={inverters}
        selectedInverterIndex={selectedInverterIndex}
        onSelectInverter={handleSelectInverter}
        onDragStart={handleInverterDragStart}
        onDrag={handleInverterDrag}
        onDragEnd={handleInverterDragEnd}
      />
      
      {/* UI Components */}
      <InverterControls 
        selectedInverterIndex={selectedInverterIndex !== null ? selectedInverterIndex : 0} 
        onDeselectInverter={handleDeselectInverter}
        onUpdateInverterPosition={handleUpdateInverterPosition}
      />
      <BoundaryDrawing 
        enabled={drawingMode}
        onComplete={(points) => {
          setBoundaries(prev => [...prev, points]);
          toast.success(`New boundary with ${points.length} points created`);
        }}
      />
    </Canvas>
  );
};

export default SceneContainer;
