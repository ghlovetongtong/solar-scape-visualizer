
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
  
  // For large numbers of panels, we need to use instanced rendering
  // Group panels into batches to avoid performance issues
  const batchSize = 500; // Render panels in batches of 500
  const panelBatches = useMemo(() => {
    const batches = [];
    for (let i = 0; i < panelPositions.length; i += batchSize) {
      batches.push(panelPositions.slice(i, i + batchSize));
    }
    return batches;
  }, [panelPositions, batchSize]);
  
  // For selection, we need a custom raycaster function
  const handleClick = (event: any) => {
    if (event.intersections.length > 0) {
      const intersection = event.intersections[0];
      if (intersection.instanceId !== undefined) {
        const batchIndex = Math.floor(intersection.object.userData.batchIndex || 0);
        const panelId = batchIndex * batchSize + intersection.instanceId;
        onSelectPanel(panelId);
      } else if (intersection.object.userData.panelId !== undefined) {
        onSelectPanel(intersection.object.userData.panelId);
      }
    } else {
      onSelectPanel(null);
    }
    
    event.stopPropagation();
  };
  
  // For performance reasons with 3000 panels, use a combination approach:
  // - Use instancing for most panels
  // - Render the selected panel individually for highlighting
  
  const selectedPanel = useMemo(() => {
    if (selectedPanelId === null) return null;
    return panelPositions.find(panel => panel.id === selectedPanelId) || null;
  }, [panelPositions, selectedPanelId]);
  
  const instancedMeshRefs = useRef<THREE.InstancedMesh[]>([]);
  
  // Update the matrices for all instances using useEffect
  useEffect(() => {
    panelBatches.forEach((batch, batchIndex) => {
      const mesh = instancedMeshRefs.current[batchIndex];
      if (!mesh) return;
      
      batch.forEach((panel, index) => {
        const matrix = new THREE.Matrix4();
        const position = new THREE.Vector3(...panel.position);
        const rotation = new THREE.Euler(...panel.rotation);
        const quaternion = new THREE.Quaternion().setFromEuler(rotation);
        const scale = new THREE.Vector3(...panel.scale);
        
        matrix.compose(position, quaternion, scale);
        
        // Hide the panel if it's the selected one (we'll render it separately)
        if (panel.id === selectedPanelId) {
          // Make it invisible by scaling to zero
          const invisibleMatrix = new THREE.Matrix4().makeScale(0, 0, 0);
          mesh.setMatrixAt(index, invisibleMatrix);
        } else {
          mesh.setMatrixAt(index, matrix);
        }
      });
      
      // Mark the instance matrix as needing update
      mesh.instanceMatrix.needsUpdate = true;
    });
  }, [panelBatches, selectedPanelId]);
  
  return (
    <group onClick={handleClick}>
      {/* Render panels in batches using instancing for performance */}
      {panelBatches.map((batch, batchIndex) => (
        <instancedMesh
          key={`batch-${batchIndex}`}
          ref={(mesh) => {
            if (mesh) instancedMeshRefs.current[batchIndex] = mesh;
          }}
          args={[panelGeometry, materials.panelMaterial, batch.length]}
          castShadow
          receiveShadow
          userData={{ batchIndex }}
        />
      ))}
      
      {/* Render selected panel separately with highlight material */}
      {selectedPanel && (
        <mesh
          position={new THREE.Vector3(...selectedPanel.position)}
          rotation={new THREE.Euler(...selectedPanel.rotation)}
          scale={new THREE.Vector3(...selectedPanel.scale)}
          castShadow
          receiveShadow
          userData={{ panelId: selectedPanel.id }}
        >
          <boxGeometry args={[3, 0.1, 2]} />
          <meshStandardMaterial 
            color='#0ea5e9'
            metalness={0.8}
            roughness={0.2}
            emissive='#0ea5e9'
            emissiveIntensity={0.5}
          />
        </mesh>
      )}
    </group>
  );
}
