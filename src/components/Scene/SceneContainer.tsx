
import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stats, OrbitControls, Sky, Environment, useProgress } from '@react-three/drei';
import * as THREE from 'three';

import Terrain from './Terrain';
import SolarPanels from './SolarPanel';
import Inverter from './Inverter';
import Camera from './Camera';
import ITHouse from './ITHouse';
import TransformerStation from './TransformerStation';
import Controls from './Controls';
import { usePanelPositions } from '@/hooks/usePanelPositions';

function Loader() {
  const { progress } = useProgress();
  return (
    <div className="loading-overlay" style={{ opacity: progress < 100 ? 1 : 0, pointerEvents: progress < 100 ? 'all' : 'none' }}>
      <div className="loading-spinner"></div>
      <div className="text-lg font-medium mt-4">Loading solar station... {progress.toFixed(1)}%</div>
    </div>
  );
}

export default function SceneContainer() {
  const [showStats, setShowStats] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState(0.5); // 0-1, 0.5 is noon
  const {
    panelPositions,
    selectedPanelId,
    updatePanelPosition,
    updatePanelRotation,
    selectPanel,
    resetPanelPositions
  } = usePanelPositions(6000);

  // Define positions for inverters, cameras, IT house, and transformer stations
  const inverterPositions = [
    [-50, 0, -50],
    [50, 0, -50],
    [150, 0, -50],
    [-50, 0, 50],
    [50, 0, 50],
    [150, 0, 50],
    [0, 0, 150]
  ];

  const cameraPositions = [
    [-70, 10, -70],
    [70, 10, -70],
    [170, 10, -70],
    [-70, 10, 70],
    [70, 10, 70],
    [170, 10, 70],
    [-70, 10, 170],
    [70, 10, 170],
    [170, 10, 170],
    [0, 10, -100],
    [0, 10, 100],
    [100, 10, 0]
  ];

  const transformerPositions = [
    [-100, 0, 0],
    [200, 0, 100]
  ];

  const itHousePosition = [200, 0, 0];

  return (
    <div className="h-full w-full">
      <Suspense fallback={<Loader />}>
        <Canvas
          shadows
          camera={{ position: [50, 50, 250], fov: 50 }}
          gl={{ antialias: true }}
        >
          <color attach="background" args={['#d6e4ff']} />
          
          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <directionalLight 
            position={[Math.sin(timeOfDay * Math.PI) * 100, 100, Math.cos(timeOfDay * Math.PI) * 100]} 
            intensity={1.5} 
            castShadow 
            shadow-mapSize-width={2048} 
            shadow-mapSize-height={2048}
            shadow-camera-left={-200}
            shadow-camera-right={200}
            shadow-camera-top={200}
            shadow-camera-bottom={-200}
            shadow-camera-near={0.1}
            shadow-camera-far={500}
          />
          
          {/* Environment */}
          <Sky 
            distance={450000} 
            sunPosition={[Math.sin(timeOfDay * Math.PI) * 100, Math.sin(timeOfDay * Math.PI - Math.PI/2) * 50 + 50, Math.cos(timeOfDay * Math.PI) * 100]} 
            inclination={0.5} 
            azimuth={0.25} 
          />
          <Environment preset="sunset" background={false} />
          
          {/* Solar farm components */}
          <Terrain />
          
          <SolarPanels 
            panelPositions={panelPositions} 
            selectedPanelId={selectedPanelId}
            onSelectPanel={selectPanel}
          />
          
          {inverterPositions.map((position, index) => (
            <Inverter 
              key={`inverter-${index}`}
              position={new THREE.Vector3(...position)}
              inverterIndex={index}
            />
          ))}
          
          {cameraPositions.map((position, index) => (
            <Camera 
              key={`camera-${index}`}
              position={new THREE.Vector3(...position)}
              cameraIndex={index}
            />
          ))}
          
          {transformerPositions.map((position, index) => (
            <TransformerStation 
              key={`transformer-${index}`}
              position={new THREE.Vector3(...position)}
              transformerIndex={index}
            />
          ))}
          
          <ITHouse position={new THREE.Vector3(...itHousePosition)} />
          
          {/* Controls */}
          <OrbitControls 
            enableDamping 
            dampingFactor={0.05} 
            maxDistance={500}
            minDistance={10}
            maxPolarAngle={Math.PI / 2 - 0.1}
          />
          
          {showStats && <Stats />}
        </Canvas>
      </Suspense>
      
      <Controls 
        showStats={showStats}
        setShowStats={setShowStats}
        timeOfDay={timeOfDay}
        setTimeOfDay={setTimeOfDay}
        onResetPanels={resetPanelPositions}
        selectedPanelId={selectedPanelId}
        onUpdatePanelPosition={updatePanelPosition}
        onUpdatePanelRotation={updatePanelRotation}
      />
      
      <Loader />
    </div>
  );
}
