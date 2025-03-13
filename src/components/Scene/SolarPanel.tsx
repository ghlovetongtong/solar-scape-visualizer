
import React, { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { createInstancedMesh, updateInstancedMesh, type InstanceData } from '@/lib/instancedMesh';

interface SolarPanelsProps {
  panelPositions: InstanceData[];
  selectedPanelId: number | null;
  onSelectPanel: (id: number | null) => void;
}

export default function SolarPanels({ panelPositions, selectedPanelId, onSelectPanel }: SolarPanelsProps) {
  // Create panel geometry and materials
  const panelGeometry = useMemo(() => {
    const baseGeometry = new THREE.BoxGeometry(3, 0.1, 2);
    return baseGeometry;
  }, []);
  
  const materials = useMemo(() => {
    const panelMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#1a1f2c'),
      metalness: 0.8,
      roughness: 0.2,
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
  
  // For selection, we need a custom raycaster function
  const handleClick = (event: any) => {
    if (event.intersections.length > 0) {
      const intersection = event.intersections[0];
      if (intersection.instanceId !== undefined) {
        onSelectPanel(intersection.instanceId);
      } else if (intersection.object.userData.panelId !== undefined) {
        onSelectPanel(intersection.object.userData.panelId);
      }
    } else {
      onSelectPanel(null);
    }
    
    event.stopPropagation();
  };
  
  // Render each panel individually to avoid the instancing issue
  return (
    <group onClick={handleClick}>
      {panelPositions.map((panel) => (
        <mesh
          key={panel.id}
          position={new THREE.Vector3(...panel.position)}
          rotation={new THREE.Euler(...panel.rotation)}
          scale={new THREE.Vector3(...panel.scale)}
          castShadow
          receiveShadow
          userData={{ panelId: panel.id }}
        >
          <boxGeometry args={[3, 0.1, 2]} />
          <meshStandardMaterial 
            color={panel.id === selectedPanelId ? '#0ea5e9' : '#1a1f2c'}
            metalness={0.8}
            roughness={0.2}
            emissive={panel.id === selectedPanelId ? '#0ea5e9' : '#000000'}
            emissiveIntensity={panel.id === selectedPanelId ? 0.5 : 0}
          />
        </mesh>
      ))}
    </group>
  );
}
