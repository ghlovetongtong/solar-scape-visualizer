import React, { useRef, useState, useEffect, Suspense, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stats, OrbitControls, useProgress } from '@react-three/drei';
import * as THREE from 'three';
import { toast } from 'sonner';
import { BoundaryPoint } from '@/hooks/useDrawBoundary';
import { ThreeEvent } from '@react-three/fiber/dist/declarations/src/core/events';

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
  
  const [selectedComponentType, setSelectedComponentType] = useState<'panel' | 'inverter' | 'transformer' | 'camera' | null>(null);
  const [selectedInverterId, setSelectedInverterId] = useState<number | null>(null);
  const [selectedTransformerId, setSelectedTransformerId] = useState<number | null>(null);
  const [selectedCameraId, setSelectedCameraId] = useState<number | null>(null);
  
  const [inverterPositionsState, setInverterPositionsState] = useState<Array<[number, number, number]>>([]);
  const [transformerPositionsState, setTransformerPositionsState] = useState<Array<[number, number, number]>>([]);
  const [cameraPositionsState, setCameraPositionsState] = useState<Array<[number, number, number]>>([]);
  
  const [inverterRotations, setInverterRotations] = useState<Array<[number, number, number]>>([]);
  const [transformerRotations, setTransformerRotations] = useState<Array<[number, number, number]>>([]);
  const [cameraRotations, setCameraRotations] = useState<Array<[number, number, number]>>([]);
  
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
      inverters: [[0, 0, 0], [30, 0, 0], [60, 0, 0], [90, 0, 0], [120, 0, 0], [150, 0, 0], [180, 0, 0]] as [number, number, number][],
      transformers: [[0, 0, 0], [30, 0, 0]] as [number, number, number][],
      itHouse: [0, 0, 0] as [number, number, number],
      cameras: [
        [0, 8, 0], [30, 8, 0], [60, 8, 0], [90, 8, 0], [120, 8, 0], [150, 8, 0],
        [180, 8, 0], [210, 8, 0], [240, 8, 0], [270, 8, 0], [300, 8, 0], [330, 8, 0]
      ] as [number, number, number][]
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
    const boundaryMinX = minX - padding;
    const boundaryMaxX = maxX + padding;
    const boundaryMinZ = minZ - padding;
    const boundaryMaxZ = maxZ + padding;

    const centerX = (minX + maxX) / 2;
    const centerZ = (minZ + maxZ) / 2;
    const width = maxX - minX;
    const depth = maxZ - minZ;

    const rowTolerance = 1.0;
    const rows = [];
    const processedZCoordinates = new Set();

    for (const panel of panelPositions) {
      const z = Math.round(panel.position[2] / rowTolerance) * rowTolerance;
      if (!processedZCoordinates.has(z)) {
        processedZCoordinates.add(z);
        const rowPanels = panelPositions.filter(p => 
          Math.abs(Math.round(p.position[2] / rowTolerance) * rowTolerance - z) < rowTolerance
        );
        
        if (rowPanels.length > 0) {
          const rowMinX = Math.min(...rowPanels.map(p => p.position[0]));
          const rowMaxX = Math.max(...rowPanels.map(p => p.position[0]));
          
          rows.push({
            z,
            minX: rowMinX,
            maxX: rowMaxX,
            panelCount: rowPanels.length,
            width: rowMaxX - rowMinX
          });
        }
      }
    }

    rows.sort((a, b) => a.z - b.z);
    
    const inverterPositions: [number, number, number][] = [];
    
    const significantRows = rows.filter(row => row.panelCount >= 3 && row.width > 5);
    significantRows.sort((a, b) => b.panelCount - a.panelCount);
    
    if (significantRows.length >= 2) {
      const gaps = [];
      for (let i = 0; i < significantRows.length - 1; i++) {
        const currentRow = significantRows[i];
        const nextRow = significantRows[i + 1];
        const gapSize = Math.abs(currentRow.z - nextRow.z);
        
        if (gapSize > 3 && gapSize < 20) {
          gaps.push({
            zPosition: (currentRow.z + nextRow.z) / 2,
            size: gapSize,
            width: Math.min(currentRow.width, nextRow.width),
            minX: Math.max(currentRow.minX, nextRow.minX), 
            maxX: Math.min(currentRow.maxX, nextRow.maxX),
            rowIndex: i
          });
        }
      }
      
      gaps.sort((a, b) => b.size - a.size);
      
      if (gaps.length > 0) {
        for (let i = 0; i < Math.min(7, gaps.length); i++) {
          const gap = gaps[i % gaps.length];
          
          const maxInvertersPerGap = Math.min(3, Math.floor(gap.width / 5));
          
          for (let j = 0; j < maxInvertersPerGap; j++) {
            if (inverterPositions.length >= 7) break;
            
            const xPos = gap.minX + (j + 1) * (gap.width / (maxInvertersPerGap + 1));
            
            let tooCloseToPanel = false;
            const minDistanceToPanel = 1.5;
            
            for (const panel of panelPositions) {
              const dx = Math.abs(panel.position[0] - xPos);
              const dz = Math.abs(panel.position[2] - gap.zPosition);
              if (dx < minDistanceToPanel && dz < minDistanceToPanel) {
                tooCloseToPanel = true;
                break;
              }
            }
            
            if (!tooCloseToPanel) {
              inverterPositions.push([xPos, 0, gap.zPosition]);
            }
          }
        }
      }
    }
    
    if (significantRows.length > 0 && inverterPositions.length < 7) {
      const mainRows = significantRows.slice(0, Math.min(4, significantRows.length));
      
      for (let r = 0; r < mainRows.length; r++) {
        const row = mainRows[r];
        const rowCenter = row.z;
        
        const segmentCount = Math.min(4, Math.ceil(row.width / 15));
        const segmentWidth = row.width / segmentCount;
        
        for (let i = 0; i < segmentCount; i++) {
          if (inverterPositions.length >= 7) break;
          
          const xPos = row.minX + (i + 0.5) * segmentWidth;
          const zOffset = (r % 2 === 0) ? 2.5 : -2.5;
          const zPos = rowCenter + zOffset;
          
          let overlapsPanel = false;
          for (const panel of panelPositions) {
            const dx = Math.abs(panel.position[0] - xPos);
            const dz = Math.abs(panel.position[2] - zPos);
            if (dx < 1.5 && dz < 1.5) {
              overlapsPanel = true;
              break;
            }
          }
          
          if (!overlapsPanel) {
            inverterPositions.push([xPos, 0, zPos]);
          }
        }
      }
    }
    
    if (inverterPositions.length < 7) {
      const perimeterPositions: [number, number, number][] = [
        [minX + width * 0.25, 0, minZ - 5],
        [minX + width * 0.75, 0, minZ - 5],
        [maxX + 5, 0, minZ + depth * 0.25],
        [maxX + 5, 0, minZ + depth * 0.75],
        [minX + width * 0.25, 0, maxZ + 5],
        [minX + width * 0.75, 0, maxZ + 5],
        [minX - 5, 0, minZ + depth * 0.5]
      ];
      
      for (let i = 0; i < perimeterPositions.length && inverterPositions.length < 7; i++) {
        inverterPositions.push(perimeterPositions[i]);
      }
    }

    const transformerPositions: [number, number, number][] = [
      [maxX + 20, 0, centerZ - depth * 0.25],
      [maxX + 20, 0, centerZ + depth * 0.25]
    ];

    const itHousePosition: [number, number, number] = [minX - 20, 0, centerZ];

    const cameraPositions: [number, number, number][] = [
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

  useEffect(() => {
    if (positions) {
      if (inverterRotations.length === 0 && positions.inverters.length > 0) {
        setInverterRotations(positions.inverters.map(() => [0, 0, 0] as [number, number, number]));
      }
      
      if (transformerRotations.length === 0 && positions.transformers.length > 0) {
        setTransformerRotations(positions.transformers.map(() => [0, 0, 0] as [number, number, number]));
      }
      
      if (cameraRotations.length === 0 && positions.cameras.length > 0) {
        setCameraRotations(positions.cameras.map(() => [0, 0, 0] as [number, number, number]));
      }
      
      if (inverterPositionsState.length === 0) {
        setInverterPositionsState([...positions.inverters]);
      }
      
      if (transformerPositionsState.length === 0) {
        setTransformerPositionsState([...positions.transformers]);
      }
      
      if (cameraPositionsState.length === 0) {
        setCameraPositionsState([...positions.cameras]);
      }
    }
  }, [positions, inverterRotations.length, transformerRotations.length, cameraRotations.length, 
      inverterPositionsState.length, transformerPositionsState.length, cameraPositionsState.length]);

  const handleSelectInverter = useCallback((index: number) => {
    console.log("Selecting inverter:", index);
    if (index === selectedInverterId && selectedComponentType === 'inverter') {
      setSelectedInverterId(null);
      setSelectedComponentType(null);
    } else {
      setSelectedInverterId(index);
      setSelectedComponentType('inverter');
      setSelectedTransformerId(null);
      setSelectedCameraId(null);
      if (selectPanel) {
        selectPanel(null);
      }
    }
  }, [selectedInverterId, selectedComponentType, selectPanel]);

  const handleSelectTransformer = (index: number | null) => {
    if (index === selectedTransformerId && selectedComponentType === 'transformer') {
      setSelectedTransformerId(null);
      setSelectedComponentType(null);
    } else {
      setSelectedTransformerId(index);
      setSelectedComponentType('transformer');
      setSelectedInverterId(null);
      setSelectedCameraId(null);
      selectPanel(null);
    }
  };
  
  const handleSelectCamera = (index: number | null) => {
    if (index === selectedCameraId && selectedComponentType === 'camera') {
      setSelectedCameraId(null);
      setSelectedComponentType(null);
    } else {
      setSelectedCameraId(index);
      setSelectedComponentType('camera');
      setSelectedInverterId(null);
      setSelectedTransformerId(null);
      selectPanel(null);
    }
  };
  
  useEffect(() => {
    if (selectedPanelId !== null) {
      setSelectedComponentType('panel');
      setSelectedInverterId(null);
      setSelectedTransformerId(null);
      setSelectedCameraId(null);
    } else if (selectedComponentType === 'panel') {
      setSelectedComponentType(null);
    }
  }, [selectedPanelId, selectedComponentType]);

  const updateInverterPosition = (id: number, position: [number, number, number]) => {
    setInverterPositionsState(prev => 
      prev.map((pos, index) => 
        index === id 
          ? [
              pos[0] + position[0], 
              pos[1] + position[1], 
              pos[2] + position[2]
            ] as [number, number, number]
          : pos
      )
    );
  };
  
  const updateInverterRotation = (id: number, rotation: [number, number, number]) => {
    setInverterRotations(prev => 
      prev.map((rot, index) => 
        index === id 
          ? [
              rot[0] + rotation[0], 
              rot[1] + rotation[1], 
              rot[2] + rotation[2]
            ] as [number, number, number]
          : rot
      )
    );
  };
  
  const updateTransformerPosition = (id: number, position: [number, number, number]) => {
    setTransformerPositionsState(prev => 
      prev.map((pos, index) => 
        index === id 
          ? [
              pos[0] + position[0], 
              pos[1] + position[1], 
              pos[2] + position[2]
            ] as [number, number, number]
          : pos
      )
    );
  };
  
  const updateTransformerRotation = (id: number, rotation: [number, number, number]) => {
    setTransformerRotations(prev => 
      prev.map((rot, index) => 
        index === id 
          ? [
              rot[0] + rotation[0], 
              rot[1] + rotation[1], 
              rot[2] + rotation[2]
            ] as [number, number, number]
          : rot
      )
    );
  };
  
  const updateCameraPosition = (id: number, position: [number, number, number]) => {
    setCameraPositionsState(prev => 
      prev.map((pos, index) => 
        index === id 
          ? [
              pos[0] + position[0], 
              pos[1] + position[1], 
              pos[2] + position[2]
            ] as [number, number, number]
          : pos
      )
    );
  };
  
  const updateCameraRotation = (id: number, rotation: [number, number, number]) => {
    setCameraRotations(prev => 
      prev.map((rot, index) => 
        index === id 
          ? [
              rot[0] + rotation[0], 
              rot[1] + rotation[1], 
              rot[2] + rotation[2]
            ] as [number, number, number]
          : rot
      )
    );
  };

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
        onClick={(event) => {
          const threeEvent = event as unknown as ThreeEvent<MouseEvent>;
          
          if (!threeEvent.intersections || threeEvent.intersections.length === 0) {
            console.log("Deselecting all components - no intersections");
            setSelectedComponentType(null);
            setSelectedInverterId(null);
            setSelectedTransformerId(null);
            setSelectedCameraId(null);
            if (selectPanel) {
              selectPanel(null);
            }
            return;
          }
          
          const hitNonSelectable = threeEvent.intersections.every(
            intersection => !intersection.object.userData?.type || 
                           intersection.object.userData?.type !== 'selectable'
          );
          
          if (hitNonSelectable) {
            console.log("Deselecting all components - hit non-selectable");
            setSelectedComponentType(null);
            setSelectedInverterId(null);
            setSelectedTransformerId(null);
            setSelectedCameraId(null);
            if (selectPanel) {
              selectPanel(null);
            }
          }
        }}
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
          
          {inverterPositionsState.map((position, index) => (
            <Inverter 
              key={`inverter-${index}`}
              position={new THREE.Vector3(...position)}
              rotation={new THREE.Euler(...(inverterRotations[index] || [0,0,0]))}
              inverterIndex={index}
              isSelected={selectedInverterId === index}
              onSelect={() => handleSelectInverter(index)}
            />
          ))}
          
          {cameraPositions.map((position, index) => (
            <Camera 
              key={`camera-${index}`}
              position={new THREE.Vector3(...position)}
              rotation={new THREE.Euler(...(cameraRotations[index] || [0,0,0]))}
              cameraIndex={index}
              isSelected={selectedCameraId === index}
              onSelect={() => handleSelectCamera(index)}
            />
          ))}
          
          {transformerPositions.map((position, index) => (
            <TransformerStation 
              key={`transformer-${index}`}
              position={new THREE.Vector3(...position)}
              rotation={new THREE.Euler(...(transformerRotations[index] || [0,0,0]))}
              transformerIndex={index}
              isSelected={selectedTransformerId === index}
              onSelect={() => handleSelectTransformer(index)}
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
        
        selectedComponentType={selectedComponentType}
        selectedInverterId={selectedInverterId}
        onUpdateInverterPosition={updateInverterPosition}
        onUpdateInverterRotation={updateInverterRotation}
        
        selectedTransformerId={selectedTransformerId}
        onUpdateTransformerPosition={updateTransformerPosition}
        onUpdateTransformerRotation={updateTransformerRotation}
        
        selectedCameraId={selectedCameraId}
        onUpdateCameraPosition={updateCameraPosition}
        onUpdateCameraRotation={updateCameraRotation}
        
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
