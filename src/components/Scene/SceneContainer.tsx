import React, { useRef, useState, useEffect, Suspense, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stats, OrbitControls, useProgress } from '@react-three/drei';
import * as THREE from 'three';
import { toast } from 'sonner';
import { BoundaryPoint } from '@/hooks/useDrawBoundary';

import Terrain from './Terrain';
import SolarPanels from './SolarPanel';
import Inverter from './Inverter';
import Camera from './Camera';
import ITHouse from './ITHouse';
import TransformerStation from './TransformerStation';
import Controls from './Controls';
import SkyBox from './SkyBox';
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
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function CustomEnvironment({ timeOfDay = 0.5 }) {
  const sunPosition: [number, number, number] = [
    Math.sin(timeOfDay * Math.PI) * 100,
    Math.sin(timeOfDay * Math.PI - Math.PI/2) * 50 + 50,
    Math.cos(timeOfDay * Math.PI) * 100
  ];
  
  const lightIntensity = Math.sin(timeOfDay * Math.PI) * 0.8 + 0.7;
  const ambientIntensity = Math.sin(timeOfDay * Math.PI) * 0.3 + 0.4;
  
  const sunriseColor = new THREE.Color(0xffb347);
  const noonColor = new THREE.Color(0xffffff);
  const sunsetColor = new THREE.Color(0xff7e5f);
  
  let sunColor;
  if (timeOfDay < 0.25) {
    sunColor = sunriseColor.clone().lerp(noonColor, timeOfDay * 4);
  } else if (timeOfDay < 0.75) {
    const normalizedTime = (timeOfDay - 0.25) * 2;
    sunColor = noonColor.clone();
  } else {
    sunColor = noonColor.clone().lerp(sunsetColor, (timeOfDay - 0.75) * 4);
  }

  const directionalLightRef = useRef<THREE.DirectionalLight>(null);
  
  useEffect(() => {
    if (directionalLightRef.current) {
      if (directionalLightRef.current.shadow.camera.visible) {
        directionalLightRef.current.shadow.camera.updateProjectionMatrix();
      }
    }
  }, [timeOfDay]);

  return (
    <>
      <ambientLight intensity={ambientIntensity} />
      <hemisphereLight intensity={0.4 * lightIntensity} color="#b1e1ff" groundColor="#385a7c" />
      
      <directionalLight 
        ref={directionalLightRef}
        position={sunPosition}
        intensity={1.8 * lightIntensity} 
        castShadow 
        shadow-mapSize={[4096, 4096]}
        shadow-camera-left={-2500}
        shadow-camera-right={2500}
        shadow-camera-top={2500}
        shadow-camera-bottom={-2500}
        shadow-camera-near={0.1}
        shadow-camera-far={4000}
        shadow-bias={-0.0001}
        color={sunColor}
      />
    </>
  );
}

export default function SceneContainer() {
  const [showStats, setShowStats] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState(0.5);
  const [sceneReady, setSceneReady] = useState(false);
  const [drawingMode, setDrawingMode] = useState(false);
  const [currentBoundary, setCurrentBoundary] = useState<BoundaryPoint[]>([]);
  const [savedBoundaries, setSavedBoundaries] = useState<BoundaryPoint[][]>([]);
  
  const {
    panelPositions,
    selectedPanelId,
    updatePanelPosition,
    updatePanelRotation,
    selectPanel,
    resetPanelPositions,
    isInitialized
  } = usePanelPositions(2000);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setSceneReady(true);
      console.log("Scene forced ready after timeout");
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);

  const inverterPositions = isInitialized && panelPositions.length > 0 ? [
    [-20, 0, -20],   // Top-left quadrant
    [20, 0, -20],    // Top-right quadrant
    [-20, 0, 20],    // Bottom-left quadrant
    [20, 0, 20],     // Bottom-right quadrant
    [0, 0, 0],       // Center
    [-40, 0, 0],     // Left middle
    [40, 0, 0]       // Right middle
  ] : [
    [0, 0, 0],       // Default position if panels not initialized
    [30, 0, 0],
    [60, 0, 0],
    [90, 0, 0],
    [120, 0, 0],
    [150, 0, 0],
    [180, 0, 0]
  ];

  const transformerPositions = isInitialized && panelPositions.length > 0 ? [
    [90, 0, -50],    // Positioned within terrain bounds
    [90, 0, 50]      // Positioned within terrain bounds
  ] : [
    [0, 0, 0],
    [30, 0, 0]
  ];

  const itHousePosition = isInitialized && panelPositions.length > 0 ? 
    [-90, 0, 0]     // Positioned opposite to transformers (which are at x=90) and outside panel area
    : [0, 0, 0];    // Default position if panels not initialized

  const cameraPositions = isInitialized && panelPositions.length > 0 ? [
    [-80, 8, -80],   // Far corners
    [80, 8, -80],
    [-80, 8, 80],
    [80, 8, 80],
    [-60, 8, 0],     // Middle of each side
    [60, 8, 0],
    [0, 8, -60],
    [0, 8, 60],
    [-40, 8, -40],   // Inner corners
    [40, 8, -40],
    [-40, 8, 40],
    [40, 8, 40]
  ] : [
    [0, 8, 0],       // Default positions if panels not initialized
    [30, 8, 0],
    [60, 8, 0],
    [90, 8, 0],
    [120, 8, 0],
    [150, 8, 0],
    [180, 8, 0],
    [210, 8, 0],
    [240, 8, 0],
    [270, 8, 0],
    [300, 8, 0],
    [330, 8, 0]
  ];

  const handleCanvasCreated = () => {
    console.log("Canvas created successfully");
    setSceneReady(true);
  };

  const handleCanvasError = (error: any) => {
    console.error("Canvas error:", error);
    toast.error(`3D rendering error: ${error.message || 'Unknown error'}`);
  };

  const handleBoundaryComplete = useCallback((points: BoundaryPoint[]) => {
    setCurrentBoundary(points);
    toast.success(`Boundary captured with ${points.length} points`);
  }, []);

  const handleSaveBoundary = useCallback(() => {
    if (currentBoundary.length > 2) {
      setSavedBoundaries(prev => [...prev, currentBoundary]);
      toast.success('Boundary saved successfully');
      
      const savedData = JSON.stringify([...savedBoundaries, currentBoundary]);
      localStorage.setItem('solar-station-boundaries', savedData);
      
      setCurrentBoundary([]);
    } else {
      toast.error('Draw a boundary first (at least 3 points needed)');
    }
  }, [currentBoundary, savedBoundaries]);

  const handleClearBoundary = useCallback(() => {
    setCurrentBoundary([]);
    toast.info('Current boundary cleared');
  }, []);

  useEffect(() => {
    const savedData = localStorage.getItem('solar-station-boundaries');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData) as BoundaryPoint[][];
        setSavedBoundaries(parsedData);
        toast.success(`Loaded ${parsedData.length} saved boundaries`);
      } catch (error) {
        console.error('Error loading saved boundaries:', error);
      }
    }
  }, []);

  return (
    <div className="h-full w-full relative">
      <Canvas
        shadows
        camera={{ position: [140, 50, 240], fov: 45 }}
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
        <CustomEnvironment timeOfDay={timeOfDay} />
        
        <SkyBox timeOfDay={timeOfDay} />
        
        <Suspense fallback={null}>
          <Terrain 
            drawingEnabled={drawingMode}
            onBoundaryComplete={handleBoundaryComplete}
            savedBoundaries={[...savedBoundaries, ...(currentBoundary.length > 2 ? [currentBoundary] : [])]}
          />
          
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
          
          <OrbitControls 
            enableDamping 
            dampingFactor={0.05} 
            maxDistance={800}
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
        drawingMode={drawingMode}
        setDrawingMode={setDrawingMode}
        onSaveBoundary={handleSaveBoundary}
        onClearBoundary={handleClearBoundary}
      />
      
      <Loader />
    </div>
  );
}
