
import React, { useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stats } from '@react-three/drei';
import { toast } from 'sonner';

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

  return (
    <Canvas shadows gl={{ antialias: true }} 
      camera={{ position: [0, 50, 100], fov: 75 }}
      style={{ 
        background: 'radial-gradient(#1e293b, #0f172a)',
        width: '100%', 
        height: '100vh' 
      }}
    >
      <Stats />
      <Camera />
      <Controls isDragging={isDraggingInverter} />
      
      {/* Environment */}
      <SkyBox />
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
      <TransformerStation position={[0, 0, 0]} />
      <ITHouse position={[-40, 0, 10]} />
      <Road />
      <Vegetation />
      
      {/* Solar panels */}
      <SolarPanel />
      
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
        inverters={inverters} 
        setInverters={setInverters}
        selectedInverterIndex={selectedInverterIndex} 
      />
      <BoundaryDrawing />
    </Canvas>
  );
};

export default SceneContainer;
