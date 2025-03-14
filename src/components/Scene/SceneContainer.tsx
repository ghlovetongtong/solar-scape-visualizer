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
import Road from './Road';

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
  const orbitControlsRef = useRef<any>(null);
  
  const {
    panelPositions,
    selectedPanelId,
    updatePanelPosition,
    updatePanelRotation,
    selectPanel,
    resetPanelPositions,
    isInitialized,
    addNewPanelsInBoundary,
    clearAllPanels,
    saveCurrentLayout
  } = usePanelPositions({ initialCount: 0, boundaries: [] });
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setSceneReady(true);
      console.log("Scene forced ready after timeout");
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (orbitControlsRef.current) {
      orbitControlsRef.current.enabled = !drawingMode;
    }
  }, [drawingMode]);

  const calculatePanelCenter = useCallback((): [number, number, number] => {
    if (!panelPositions || panelPositions.length === 0) {
      return [0, 0, 0];
    }
    
    let sumX = 0, sumY = 0, sumZ = 0;
    
    for (const panel of panelPositions) {
      sumX += panel.position[0];
      sumY += panel.position[1];
      sumZ += panel.position[2];
    }
    
    const centerX = sumX / panelPositions.length;
    const centerY = sumY / panelPositions.length;
    const centerZ = sumZ / panelPositions.length;
    
    return [centerX, centerY, centerZ] as [number, number, number];
  }, [panelPositions]);
  
  const panelCenter = calculatePanelCenter();

  const calculateSecondaryPositions = useCallback(() => {
    const hasPanels = isInitialized && panelPositions.length > 0;

    const defaultPositions = {
      inverters: [[0, 0, 0], [30, 0, 0], [60, 0, 0], [90, 0, 0], [120, 0, 0], [150, 0, 0], [180, 0, 0]],
      transformers: [[0, 0, 0], [30, 0, 0]],
      itHouse: [0, 0, 0],
      cameras: [
        [0, 8, 0], [30, 8, 0], [60, 8, 0], [90, 8, 0], [120, 8, 0], [150, 8, 0],
        [180, 8, 0], [210, 8, 0], [240, 8, 0], [270, 8, 0], [300, 8, 0], [330, 8, 0]
      ]
    };

    if (!hasPanels) {
      return defaultPositions;
    }

    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    panelPositions.forEach(panel => {
      minX = Math.min(minX, panel.position[0]);
      maxX = Math.max(maxX, panel.position[0]);
      minZ = Math.min(minZ, panel.position[2]);
      maxZ = Math.max(maxZ, panel.position[2]);
    });

    const padding = 20;
    minX -= padding;
    maxX += padding;
    minZ -= padding;
    maxZ += padding;

    const centerX = (minX + maxX) / 2;
    const centerZ = (minZ + maxZ) / 2;
    const width = maxX - minX;
    const depth = maxZ - minZ;

    // Find rows of panels by grouping them by Z coordinate
    // First identify unique row locations with some tolerance
    const rowTolerance = 2; // Small tolerance for Z coordinate to consider panels in the same row
    const rows = [];
    const processedZCoordinates = new Set();

    // Find all distinct rows
    for (const panel of panelPositions) {
      const z = Math.round(panel.position[2] / rowTolerance) * rowTolerance;
      if (!processedZCoordinates.has(z)) {
        processedZCoordinates.add(z);
        const rowPanels = panelPositions.filter(p => 
          Math.abs(Math.round(p.position[2] / rowTolerance) * rowTolerance - z) < rowTolerance
        );
        
        if (rowPanels.length > 0) {
          // Find min and max X for this row
          let rowMinX = Infinity, rowMaxX = -Infinity;
          for (const p of rowPanels) {
            rowMinX = Math.min(rowMinX, p.position[0]);
            rowMaxX = Math.max(rowMaxX, p.position[0]);
          }
          
          rows.push({
            z,
            minX: rowMinX,
            maxX: rowMaxX,
            panelCount: rowPanels.length
          });
        }
      }
    }

    // Sort rows by Z coordinate
    rows.sort((a, b) => a.z - b.z);

    // Generate inverter positions in gaps between rows
    const inverterPositions = [];
    
    // If we have at least 2 rows, place inverters between them
    if (rows.length >= 2) {
      // For each pair of adjacent rows, find a gap and place an inverter
      for (let i = 0; i < rows.length - 1; i++) {
        const gapZ = (rows[i].z + rows[i+1].z) / 2;
        
        // Place inverters at different X positions along the row gap
        const rowWidth = Math.max(rows[i].maxX, rows[i+1].maxX) - Math.min(rows[i].minX, rows[i+1].minX);
        const interval = Math.max(rowWidth / 4, 20); // Place one inverter every 20-30 units or 1/4 of row width
        
        const startX = Math.min(rows[i].minX, rows[i+1].minX) + interval/2;
        const maxInverters = Math.min(3, Math.floor(rowWidth / interval)); // Maximum 3 inverters per gap
        
        for (let j = 0; j < maxInverters; j++) {
          // Check if this position would overlap with a panel
          const posX = startX + j * interval;
          const overlapTolerance = 3; // Minimum distance to any panel
          
          // Check for overlap with any panel
          let overlapsPanel = false;
          for (const panel of panelPositions) {
            const dx = Math.abs(panel.position[0] - posX);
            const dz = Math.abs(panel.position[2] - gapZ);
            if (dx < overlapTolerance && dz < overlapTolerance) {
              overlapsPanel = true;
              break;
            }
          }
          
          if (!overlapsPanel) {
            inverterPositions.push([posX, 0, gapZ]);
            if (inverterPositions.length >= 7) break; // We only need 7 inverters total
          }
        }
        
        if (inverterPositions.length >= 7) break;
      }
    }
    
    // If we couldn't place enough inverters in gaps, add more at the edges of rows
    if (inverterPositions.length < 7 && rows.length > 0) {
      // Place inverters at the beginning and end of major rows
      const majorRows = [...rows].sort((a, b) => b.panelCount - a.panelCount).slice(0, 3);
      
      for (const row of majorRows) {
        // Try left side of row
        inverterPositions.push([row.minX - 5, 0, row.z]);
        if (inverterPositions.length >= 7) break;
        
        // Try right side of row
        inverterPositions.push([row.maxX + 5, 0, row.z]);
        if (inverterPositions.length >= 7) break;
      }
    }
    
    // If we still don't have enough, fill in with default positions
    if (inverterPositions.length < 7) {
      // Add inverters in a grid pattern across the entire panel array
      const gridSizeX = 3;
      const gridSizeZ = 3;
      
      for (let i = 0; i < gridSizeX && inverterPositions.length < 7; i++) {
        for (let j = 0; j < gridSizeZ && inverterPositions.length < 7; j++) {
          const posX = minX + (width / (gridSizeX + 1)) * (i + 1);
          const posZ = minZ + (depth / (gridSizeZ + 1)) * (j + 1);
          
          // Check for overlap with any panel
          let overlapsPanel = false;
          for (const panel of panelPositions) {
            const dx = Math.abs(panel.position[0] - posX);
            const dz = Math.abs(panel.position[2] - posZ);
            if (dx < 3 && dz < 3) {
              overlapsPanel = true;
              break;
            }
          }
          
          if (!overlapsPanel) {
            inverterPositions.push([posX, 0, posZ]);
          }
        }
      }
    }
    
    // Ensure we have at least 7 inverters total (pad with positions around the perimeter if needed)
    while (inverterPositions.length < 7) {
      const index = inverterPositions.length;
      const perimeter = [
        [minX - 10, 0, centerZ + (index * 10)],
        [maxX + 10, 0, centerZ + (index * 10)],
        [centerX + (index * 10), 0, minZ - 10],
        [centerX + (index * 10), 0, maxZ + 10]
      ];
      inverterPositions.push(perimeter[index % 4]);
    }

    const transformerPositions = [
      [maxX + 20, 0, centerZ - depth * 0.25],
      [maxX + 20, 0, centerZ + depth * 0.25]
    ];

    const itHousePosition = [minX - 20, 0, centerZ];

    const cameraPositions = [
      [minX, 8, minZ], [maxX, 8, minZ], [minX, 8, maxZ], [maxX, 8, maxZ],
      [centerX - width * 0.3, 8, minZ], [centerX + width * 0.3, 8, minZ],
      [centerX - width * 0.3, 8, maxZ], [centerX + width * 0.3, 8, maxZ],
      [minX, 8, centerZ - depth * 0.3], [minX, 8, centerZ + depth * 0.3],
      [maxX, 8, centerZ - depth * 0.3], [maxX, 8, centerZ + depth * 0.3]
    ];

    return {
      inverters: inverterPositions,
      transformers: transformerPositions,
      itHouse: itHousePosition,
      cameras: cameraPositions
    };
  }, [isInitialized, panelPositions]);

  const positions = calculateSecondaryPositions();
  const inverterPositions = positions.inverters;
  const transformerPositions = positions.transformers;
  const itHousePosition = positions.itHouse;
  const cameraPositions = positions.cameras;

  const handleCanvasCreated = () => {
    console.log("Canvas created successfully");
    setSceneReady(true);
  };

  const handleCanvasError = (error: any) => {
    console.error("Canvas error:", error);
    toast.error(`3D rendering error: ${error.message || 'Unknown error'}`);
  };

  const handleBoundaryComplete = useCallback((points: BoundaryPoint[]) => {
    console.log("Boundary completed with", points.length, "points");
    setCurrentBoundary(points);
    toast.success(`Boundary captured with ${points.length} points`);
  }, []);

  const handleSaveBoundary = useCallback(() => {
    if (currentBoundary.length > 2) {
      setSavedBoundaries(prev => [...prev, currentBoundary]);
      toast.success('Boundary saved successfully');
      
      try {
        const allBoundaries = [...savedBoundaries, currentBoundary];
        localStorage.setItem('solar-station-boundaries', JSON.stringify(allBoundaries));
      } catch (error) {
        console.error("Error saving boundary to localStorage:", error);
        toast.error('Failed to save boundary data');
      }
      
      setCurrentBoundary([]);
    } else {
      toast.error('Draw a boundary first (at least 3 points needed)');
    }
  }, [currentBoundary, savedBoundaries]);

  const handleClearBoundary = useCallback(() => {
    setCurrentBoundary([]);
    toast.info('Current boundary cleared');
  }, []);

  const handleClearAllBoundaries = useCallback(() => {
    setSavedBoundaries([]);
    setCurrentBoundary([]);
    toast.info('All boundaries cleared');
    
    try {
      localStorage.removeItem('solar-station-boundaries');
    } catch (error) {
      console.error("Error removing boundaries from localStorage:", error);
    }
  }, []);

  const handleClearAllPanels = useCallback(() => {
    if (clearAllPanels) {
      clearAllPanels();
      toast.success('All solar panels cleared');
    }
  }, [clearAllPanels]);

  const handleGenerateNewPanelsInBoundary = useCallback(() => {
    const allBoundaries = [...savedBoundaries];
    
    if (allBoundaries.length === 0) {
      toast.error('No saved boundaries available. Draw and save a boundary first.');
      return;
    }
    
    let totalPanelsAdded = 0;
    
    for (const boundary of allBoundaries) {
      if (boundary.length < 3) continue;
      
      const panelsAdded = addNewPanelsInBoundary(boundary);
      totalPanelsAdded += panelsAdded;
    }
    
    if (totalPanelsAdded > 0) {
      toast.success(`Generated ${totalPanelsAdded} new solar panels within boundaries`);
    } else {
      toast.info('No new panels could be added. The boundaries may already be filled or too small.');
    }
  }, [savedBoundaries, addNewPanelsInBoundary]);

  const handleSaveLayout = useCallback(() => {
    if (saveCurrentLayout) {
      saveCurrentLayout();
    }
  }, [saveCurrentLayout]);

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
        camera={{ 
          position: [100, 80, 100],
          fov: 45,
          near: 1,
          far: 1000
        }}
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
            ref={orbitControlsRef}
            enableDamping 
            dampingFactor={0.05} 
            maxDistance={800}
            minDistance={10}
            maxPolarAngle={Math.PI / 2 - 0.1}
            minPolarAngle={0.1}
            target={new THREE.Vector3(...panelCenter)}
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
        onClearAllBoundaries={handleClearAllBoundaries}
        onClearAllPanels={handleClearAllPanels}
        onGenerateNewPanelsInBoundary={handleGenerateNewPanelsInBoundary}
        onSaveLayout={handleSaveLayout}
      />
      
      <Loader />
    </div>
  );
}
