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
  
  const [timeOfDay, setTimeOfDay] = useState<number>(0.5);
  const [drawingMode, setDrawingMode] = useState<boolean>(false);
  const [boundaries, setBoundaries] = useState<BoundaryPoint[][]>([]);
  const [showStats, setShowStats] = useState<boolean>(true);
  
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

  const handleSelectInverter = useCallback((index: number) => {
    console.log(`Inverter onClick callback, index=${index}, current selectedIndex=${selectedInverterIndex}`);
    setSelectedInverterIndex(index);
  }, [selectedInverterIndex]);

  const handleInverterDragStart = useCallback((index: number) => {
    console.log(`Started dragging inverter ${index + 1}`);
    setIsDraggingInverter(true);
  }, []);

  const handleInverterDrag = useCallback((index: number, position: [number, number, number]) => {
    setInverters(prevInverters => 
      prevInverters.map(inverter => 
        inverter.index === index 
          ? { ...inverter, position }
          : inverter
      )
    );
  }, []);

  const handleInverterDragEnd = useCallback((index: number, position: [number, number, number]) => {
    console.log(`Finished dragging object`);
    setIsDraggingInverter(false);
    
    setInverters(prevInverters => 
      prevInverters.map(inverter => 
        inverter.index === index 
          ? { ...inverter, position }
          : inverter
      )
    );
    
    toast.success(`Inverter ${index + 1} repositioned`, {
      description: `New position: X: ${position[0].toFixed(1)}, Z: ${position[2].toFixed(1)}`
    });
  }, []);

  const handleSelectPanel = useCallback((id: number | null) => {
    selectPanel(id);
  }, [selectPanel]);

  const handleDeselectInverter = useCallback(() => {
    setSelectedInverterIndex(null);
  }, []);

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

  const handleSaveBoundary = useCallback(() => {
    toast.success('Boundary saved');
  }, []);

  const handleClearBoundary = useCallback(() => {
    toast.info('Boundary drawing cleared');
  }, []);

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

  const handleSaveLayout = useCallback(() => {
    const completeLayout = {
      panels: panelPositions,
      inverters: inverters.map(inv => inv.position),
      transformers: [[0, 0, 0] as [number, number, number]],
      cameras: [] as [number, number, number][],
      itHouse: [-40, 0, 10] as [number, number, number]
    };
    
    saveCurrentLayout(completeLayout);
  }, [panelPositions, inverters, saveCurrentLayout]);

  return (
    <div className="relative w-full h-screen">
      <Canvas shadows gl={{ antialias: true }} 
        camera={{ position: [0, 50, 100], fov: 75 }}
        style={{ 
          background: 'radial-gradient(#1e293b, #0f172a)',
          width: '100%', 
          height: '100vh' 
        }}
      >
        {showStats && <Stats />}
        
        <Camera 
          position={new THREE.Vector3(0, 50, 0)} 
          cameraIndex={0} 
        />
        
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
        
        <Terrain />
        <Ground />
        <TransformerStation 
          position={new THREE.Vector3(0, 0, 0)} 
          transformerIndex={0}
        />
        <ITHouse position={new THREE.Vector3(-40, 0, 10)} />
        <Road />
        <Vegetation />
        
        <SolarPanel 
          panelPositions={panelPositions}
          selectedPanelId={selectedPanelId}
          onSelectPanel={handleSelectPanel}
        />
        
        <InverterContainer 
          inverters={inverters}
          selectedInverterIndex={selectedInverterIndex}
          onSelectInverter={handleSelectInverter}
          onDragStart={handleInverterDragStart}
          onDrag={handleInverterDrag}
          onDragEnd={handleInverterDragEnd}
        />
        
        <BoundaryDrawing 
          enabled={drawingMode}
          onComplete={(points) => {
            setBoundaries(prev => [...prev, points]);
            toast.success(`New boundary with ${points.length} points created`);
          }}
        />
      </Canvas>
      
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
      
      {selectedInverterIndex !== null && (
        <InverterControls 
          selectedInverterIndex={selectedInverterIndex} 
          onDeselectInverter={handleDeselectInverter}
          onUpdateInverterPosition={handleUpdateInverterPosition}
        />
      )}
    </div>
  );
};

export default SceneContainer;
