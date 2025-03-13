import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stats, OrbitControls, Sky, useProgress } from '@react-three/drei';
import * as THREE from 'three';
import { toast } from 'sonner';

import Terrain from './Terrain';
import SolarPanels from './SolarPanel';
import Inverter from './Inverter';
import Camera from './Camera';
import ITHouse from './ITHouse';
import TransformerStation from './TransformerStation';
import Controls from './Controls';
import { usePanelPositions } from '@/hooks/usePanelPositions';

function Loader() {
  const { progress, errors, active, item } = useProgress();
  
  useEffect(() => {
    if (errors.length > 0) {
      console.error('Loading errors:', errors);
      toast.error(`Error loading 3D assets: ${errors[0]}`);
    }
    
    if (active) {
      console.log(`Loading: ${item} - ${progress.toFixed(1)}%`);
    }
  }, [progress, errors, active, item]);
  
  return (
    <div className="loading-overlay" 
      style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        background: 'rgba(255,255,255,0.9)', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        zIndex: 1000,
        opacity: active ? 1 : 0, 
        pointerEvents: active ? 'all' : 'none',
        transition: 'opacity 0.5s ease'
      }}
    >
      <div className="loading-spinner" style={{
        width: '40px',
        height: '40px',
        border: '4px solid rgba(0,0,0,0.1)',
        borderTopColor: '#0ea5e9',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}></div>
      <div className="text-lg font-medium mt-4">
        {errors.length > 0 
          ? `Error loading: ${errors[0]}` 
          : `Loading solar station... ${progress.toFixed(1)}%`}
      </div>
      {errors.length > 0 && (
        <button 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      )}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// Custom environment that doesn't rely on external HDR files
function CustomEnvironment() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <hemisphereLight intensity={0.3} color="#b1e1ff" groundColor="#000000" />
    </>
  );
}

export default function SceneContainer() {
  const [showStats, setShowStats] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState(0.5); // 0-1, 0.5 is noon
  const [sceneReady, setSceneReady] = useState(false);
  const {
    panelPositions,
    selectedPanelId,
    updatePanelPosition,
    updatePanelRotation,
    selectPanel,
    resetPanelPositions
  } = usePanelPositions(60); // Reduced panel count for initial loading test
  
  useEffect(() => {
    // Force scene to be considered ready after a timeout
    // This helps if the progress event isn't firing correctly
    const timer = setTimeout(() => {
      setSceneReady(true);
      console.log("Scene forced ready after timeout");
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);

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

  const handleCanvasCreated = () => {
    console.log("Canvas created successfully");
    setSceneReady(true);
  };

  const handleCanvasError = (error: any) => {
    console.error("Canvas error:", error);
    toast.error(`3D rendering error: ${error.message || 'Unknown error'}`);
  };

  return (
    <div className="h-full w-full relative">
      <Canvas
        shadows
        camera={{ position: [50, 50, 250], fov: 50 }}
        gl={{ 
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true
        }}
        onCreated={handleCanvasCreated}
        onError={handleCanvasError}
      >
        <color attach="background" args={['#d6e4ff']} />
        
        {/* Custom lighting instead of Environment component */}
        <CustomEnvironment />
        
        {/* Directional light (sun) */}
        <directionalLight 
          position={[Math.sin(timeOfDay * Math.PI) * 100, 100, Math.cos(timeOfDay * Math.PI) * 100]} 
          intensity={1.5} 
          castShadow 
          shadow-mapSize-width={1024} 
          shadow-mapSize-height={1024}
          shadow-camera-left={-200}
          shadow-camera-right={200}
          shadow-camera-top={200}
          shadow-camera-bottom={-200}
          shadow-camera-near={0.1}
          shadow-camera-far={500}
        />
        
        {/* Sky */}
        <Sky 
          distance={450000} 
          sunPosition={[Math.sin(timeOfDay * Math.PI) * 100, Math.sin(timeOfDay * Math.PI - Math.PI/2) * 50 + 50, Math.cos(timeOfDay * Math.PI) * 100]} 
          inclination={0.5} 
          azimuth={0.25} 
        />
        
        {/* Solar farm components */}
        <Suspense fallback={null}>
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
        </Suspense>
      </Canvas>
      
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
