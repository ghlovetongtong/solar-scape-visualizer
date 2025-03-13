
import React, { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Instances, Instance } from '@react-three/drei';
import { createInstancedMesh, updateInstancedMesh, type InstanceData } from '@/lib/instancedMesh';

interface SolarPanelsProps {
  panelPositions: InstanceData[];
  selectedPanelId: number | null;
  onSelectPanel: (id: number | null) => void;
}

export default function SolarPanels({ panelPositions, selectedPanelId, onSelectPanel }: SolarPanelsProps) {
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null);
  
  // Create panel geometry and materials
  const panelGeometry = useMemo(() => {
    const baseGeometry = new THREE.BoxGeometry(3, 0.1, 2);
    return baseGeometry;
  }, []);
  
  const materials = useMemo(() => {
    const panelMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#1a1f2c'),
      metalness: 0.8,
      roughness: 0.2,
      envMapIntensity: 0.5,
    });
    
    const frameMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#8e9196'), 
      roughness: 0.4,
      metalness: 0.6
    });
    
    const selectedMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#0ea5e9'),
      emissive: new THREE.Color('#0ea5e9'),
      emissiveIntensity: 0.5,
      roughness: 0.3,
      metalness: 0.8
    });
    
    return { panelMaterial, frameMaterial, selectedMaterial };
  }, []);
  
  // Update instance matrices
  useEffect(() => {
    if (instancedMeshRef.current && panelPositions.length > 0) {
      updateInstancedMesh(instancedMeshRef.current, panelPositions);
    }
  }, [panelPositions]);
  
  // For selection, we need a custom raycaster function
  const handleClick = (event: any) => {
    if (event.intersections.length > 0) {
      const intersection = event.intersections[0];
      if (intersection.instanceId !== undefined) {
        onSelectPanel(intersection.instanceId);
      }
    } else {
      onSelectPanel(null);
    }
    
    event.stopPropagation();
  };
  
  // Instead of InstancedMesh, we'll use drei's Instances for easier interaction
  return (
    <Instances
      limit={6000}
      range={6000}
      geometry={panelGeometry}
      material={materials.panelMaterial}
      onClick={handleClick}
    >
      {panelPositions.map((panel) => (
        <Instance
          key={panel.id}
          position={panel.position}
          rotation={panel.rotation}
          scale={panel.scale}
          color={panel.id === selectedPanelId ? '#0ea5e9' : undefined}
        />
      ))}
    </Instances>
  );
}
