
import React, { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { createInstancedMesh, updateInstancedMesh, type InstanceData } from '@/lib/instancedMesh';
import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

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
  
  // Create bracket geometry
  const bracketGeometry = useMemo(() => {
    const bracketGroup = new THREE.Group();
    
    // Main support pole
    const pole = new THREE.CylinderGeometry(0.1, 0.1, 1.5, 8);
    const poleMesh = new THREE.Mesh(pole);
    poleMesh.position.y = -0.75;
    bracketGroup.add(poleMesh);
    
    // Horizontal support beam
    const beam = new THREE.BoxGeometry(2.8, 0.1, 0.1);
    const beamMesh = new THREE.Mesh(beam);
    beamMesh.position.y = -0.05;
    bracketGroup.add(beamMesh);
    
    // Bottom base plate
    const base = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 16);
    const baseMesh = new THREE.Mesh(base);
    baseMesh.position.y = -1.5;
    bracketGroup.add(baseMesh);
    
    // Convert group to buffer geometry
    const bracketBufferGeometry = new THREE.BufferGeometry();
    const meshes: THREE.BufferGeometry[] = [];
    
    bracketGroup.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.updateMatrix();
        meshes.push(child.geometry.clone().applyMatrix4(child.matrix));
      }
    });
    
    // Merge all geometries into one buffer geometry
    const mergedGeometry = mergeBufferGeometries(meshes);
    
    return mergedGeometry;
  }, []);
  
  // Load solar panel texture for the grid pattern
  const panelTexture = useTexture('https://i.imgur.com/kDucSwd.jpeg');
  
  // Configure texture properties
  useMemo(() => {
    if (panelTexture) {
      panelTexture.wrapS = panelTexture.wrapT = THREE.RepeatWrapping;
      panelTexture.repeat.set(1, 1);
    }
  }, [panelTexture]);
  
  const materials = useMemo(() => {
    const panelMaterial = new THREE.MeshStandardMaterial({
      map: panelTexture,
      color: new THREE.Color('#1a1f2c'),  // Dark blue-black color for the panel
      metalness: 0.8,
      roughness: 0.2,
    });
    
    const frameMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#8e9196'),  // Light gray for frame
      roughness: 0.4,
      metalness: 0.6
    });
    
    const bracketMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#565c64'),  // Darker gray for bracket
      roughness: 0.3,
      metalness: 0.7
    });
    
    const selectedMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#0ea5e9'),
      emissive: new THREE.Color('#0ea5e9'),
      emissiveIntensity: 0.5,
      roughness: 0.3,
      metalness: 0.8
    });
    
    return { panelMaterial, frameMaterial, bracketMaterial, selectedMaterial };
  }, [panelTexture]);
  
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
  
  const panelInstancedMeshRefs = useRef<THREE.InstancedMesh[]>([]);
  const bracketInstancedMeshRefs = useRef<THREE.InstancedMesh[]>([]);
  
  // Update the matrices for all instances using useEffect
  useEffect(() => {
    panelBatches.forEach((batch, batchIndex) => {
      const panelMesh = panelInstancedMeshRefs.current[batchIndex];
      const bracketMesh = bracketInstancedMeshRefs.current[batchIndex];
      
      if (!panelMesh || !bracketMesh) return;
      
      batch.forEach((panel, index) => {
        const matrix = new THREE.Matrix4();
        const position = new THREE.Vector3(...panel.position);
        const rotation = new THREE.Euler(...panel.rotation);
        const quaternion = new THREE.Quaternion().setFromEuler(rotation);
        const scale = new THREE.Vector3(...panel.scale);
        
        // Set matrix for panel
        matrix.compose(position, quaternion, scale);
        
        // Hide the panel if it's the selected one (we'll render it separately)
        if (panel.id === selectedPanelId) {
          // Make it invisible by scaling to zero
          const invisibleMatrix = new THREE.Matrix4().makeScale(0, 0, 0);
          panelMesh.setMatrixAt(index, invisibleMatrix);
          bracketMesh.setMatrixAt(index, invisibleMatrix);
        } else {
          panelMesh.setMatrixAt(index, matrix);
          
          // Calculate bracket position (slightly below the panel)
          const bracketPosition = position.clone();
          const bracketQuaternion = quaternion.clone();
          
          bracketMesh.setMatrixAt(index, matrix);
        }
      });
      
      // Mark the instance matrices as needing update
      panelMesh.instanceMatrix.needsUpdate = true;
      bracketMesh.instanceMatrix.needsUpdate = true;
    });
  }, [panelBatches, selectedPanelId]);
  
  return (
    <group onClick={handleClick}>
      {/* Render panel-bracket pairs in batches using instancing for performance */}
      {panelBatches.map((batch, batchIndex) => (
        <group key={`batch-${batchIndex}`}>
          <instancedMesh
            ref={(mesh) => {
              if (mesh) panelInstancedMeshRefs.current[batchIndex] = mesh;
            }}
            args={[panelGeometry, materials.panelMaterial, batch.length]}
            castShadow
            receiveShadow
            userData={{ batchIndex }}
          />
          <instancedMesh
            ref={(mesh) => {
              if (mesh) bracketInstancedMeshRefs.current[batchIndex] = mesh;
            }}
            args={[bracketGeometry, materials.bracketMaterial, batch.length]}
            castShadow
            receiveShadow
            userData={{ batchIndex }}
          />
        </group>
      ))}
      
      {/* Render selected panel separately with highlight material */}
      {selectedPanel && (
        <group>
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
              map={panelTexture}
              color='#0ea5e9'
              metalness={0.8}
              roughness={0.2}
              emissive='#0ea5e9'
              emissiveIntensity={0.5}
            />
          </mesh>
          
          {/* Selected bracket */}
          <mesh
            position={[selectedPanel.position[0], selectedPanel.position[1] - 0.75, selectedPanel.position[2]]}
            rotation={new THREE.Euler(...selectedPanel.rotation)}
            userData={{ panelId: selectedPanel.id }}
            castShadow
            receiveShadow
          >
            <primitive object={bracketGeometry} />
            <meshStandardMaterial 
              color='#565c64' 
              emissive='#0ea5e9'
              emissiveIntensity={0.2}
              metalness={0.7}
              roughness={0.3}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}
