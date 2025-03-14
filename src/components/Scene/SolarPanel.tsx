
import React, { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { createInstancedMesh, updateInstancedMesh, type InstanceData, getShadowIntensity } from '@/lib/instancedMesh';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

interface SolarPanelsProps {
  panelPositions: InstanceData[];
  selectedPanelId: number | null;
  onSelectPanel: (id: number | null) => void;
}

export default function SolarPanels({ panelPositions, selectedPanelId, onSelectPanel }: SolarPanelsProps) {
  const panelGeometry = useMemo(() => {
    const baseGeometry = new THREE.BoxGeometry(3, 0.1, 2);
    return baseGeometry;
  }, []);
  
  const bracketGeometry = useMemo(() => {
    const bracketGroup = new THREE.Group();
    
    const pole = new THREE.CylinderGeometry(0.1, 0.1, 1.5, 8);
    const poleMesh = new THREE.Mesh(pole);
    poleMesh.position.y = -0.75;
    bracketGroup.add(poleMesh);
    
    const beam = new THREE.BoxGeometry(2.8, 0.1, 0.1);
    const beamMesh = new THREE.Mesh(beam);
    beamMesh.position.y = -0.05;
    bracketGroup.add(beamMesh);
    
    const base = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 16);
    const baseMesh = new THREE.Mesh(base);
    baseMesh.position.y = -1.5;
    bracketGroup.add(baseMesh);
    
    const bracketBufferGeometry = new THREE.BufferGeometry();
    const meshes: THREE.BufferGeometry[] = [];
    
    bracketGroup.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.updateMatrix();
        meshes.push(child.geometry.clone().applyMatrix4(child.matrix));
      }
    });
    
    const mergedGeometry = mergeGeometries(meshes);
    
    return mergedGeometry;
  }, []);
  
  const panelTexture = useTexture('https://i.imgur.com/kDucSwd.jpeg');
  
  useMemo(() => {
    if (panelTexture) {
      panelTexture.wrapS = panelTexture.wrapT = THREE.RepeatWrapping;
      panelTexture.repeat.set(1, 1);
    }
  }, [panelTexture]);
  
  const sunDirection = useRef<THREE.Vector3>(new THREE.Vector3(0, 1, 0));
  
  useFrame(({ scene }) => {
    let foundDirectionalLight = false;
    scene.traverse((object) => {
      if (object instanceof THREE.DirectionalLight && !foundDirectionalLight) {
        sunDirection.current.copy(object.position).normalize();
        foundDirectionalLight = true;
      }
    });
  });
  
  const materials = useMemo(() => {
    const sunlitPanelMaterial = new THREE.MeshStandardMaterial({
      map: panelTexture,
      color: new THREE.Color('#60A5FA'),
      metalness: 0.8,
      roughness: 0.2,
      emissive: new THREE.Color('#3F6CA3'),
      emissiveIntensity: 0.2
    });
    
    const shadowedPanelMaterial = new THREE.MeshStandardMaterial({
      map: panelTexture,
      color: new THREE.Color('#353638'),
      metalness: 0.5,
      roughness: 0.4,
      emissive: new THREE.Color('#F1F1F1'),
      emissiveIntensity: 0.05
    });
    
    const frameMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#8e9196'),
      roughness: 0.4,
      metalness: 0.6
    });
    
    const bracketMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#565c64'),
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
    
    return { 
      sunlitPanelMaterial, 
      shadowedPanelMaterial, 
      frameMaterial, 
      bracketMaterial, 
      selectedMaterial 
    };
  }, [panelTexture]);
  
  const batchSize = 500;
  const panelBatches = useMemo(() => {
    const batches = [];
    for (let i = 0; i < panelPositions.length; i += batchSize) {
      batches.push(panelPositions.slice(i, i + batchSize));
    }
    return batches;
  }, [panelPositions, batchSize]);
  
  const handleClick = (event: any) => {
    event.stopPropagation(); // 阻止事件冒泡
    
    if (event.intersections.length > 0) {
      const intersection = event.intersections[0];
      
      if (intersection.instanceId !== undefined && intersection.object.userData.batchIndex !== undefined) {
        const batchIndex = Math.floor(intersection.object.userData.batchIndex);
        const panelId = batchIndex * batchSize + intersection.instanceId;
        
        // 确保索引在有效范围内
        if (panelId < panelPositions.length) {
          const actualPanelId = panelPositions[panelId].id;
          console.log(`Panel clicked: instanceId=${intersection.instanceId}, batchIndex=${batchIndex}, panelId=${actualPanelId}`);
          onSelectPanel(actualPanelId);
        }
      } else if (intersection.object.userData.panelId !== undefined) {
        const panelId = intersection.object.userData.panelId;
        console.log(`Selected panel clicked: panelId=${panelId}`);
        onSelectPanel(panelId);
      } else {
        // 如果点击的不是面板，保持选中状态不变
        console.log('Clicked on panel group but not a specific panel');
      }
    }
  };
  
  const selectedPanel = useMemo(() => {
    if (selectedPanelId === null) return null;
    return panelPositions.find(panel => panel.id === selectedPanelId) || null;
  }, [panelPositions, selectedPanelId]);
  
  const sunlitPanelRefs = useRef<THREE.InstancedMesh[]>([]);
  const shadowedPanelRefs = useRef<THREE.InstancedMesh[]>([]);
  const bracketInstancedMeshRefs = useRef<THREE.InstancedMesh[]>([]);
  
  useEffect(() => {
    panelBatches.forEach((batch, batchIndex) => {
      const sunlitPanelMesh = sunlitPanelRefs.current[batchIndex];
      const shadowedPanelMesh = shadowedPanelRefs.current[batchIndex];
      const bracketMesh = bracketInstancedMeshRefs.current[batchIndex];
      
      if (!sunlitPanelMesh || !shadowedPanelMesh || !bracketMesh) return;
      
      batch.forEach((panel, index) => {
        const matrix = new THREE.Matrix4();
        const position = new THREE.Vector3(...panel.position);
        const rotation = new THREE.Euler(...panel.rotation);
        const quaternion = new THREE.Quaternion().setFromEuler(rotation);
        const scale = new THREE.Vector3(1, 1, 1);
        
        matrix.compose(position, quaternion, scale);
        
        if (panel.id === selectedPanelId) {
          const invisibleMatrix = new THREE.Matrix4().makeScale(0, 0, 0);
          sunlitPanelMesh.setMatrixAt(index, invisibleMatrix);
          shadowedPanelMesh.setMatrixAt(index, invisibleMatrix);
          bracketMesh.setMatrixAt(index, invisibleMatrix);
        } else {
          const shadowIntensity = getShadowIntensity(panel.rotation, sunDirection.current);
          const isInShadow = shadowIntensity < 0.15;
          
          if (isInShadow) {
            shadowedPanelMesh.setMatrixAt(index, matrix);
            sunlitPanelMesh.setMatrixAt(index, new THREE.Matrix4().makeScale(0, 0, 0));
          } else {
            sunlitPanelMesh.setMatrixAt(index, matrix);
            shadowedPanelMesh.setMatrixAt(index, new THREE.Matrix4().makeScale(0, 0, 0));
          }
          
          bracketMesh.setMatrixAt(index, matrix);
        }
      });
      
      sunlitPanelMesh.instanceMatrix.needsUpdate = true;
      shadowedPanelMesh.instanceMatrix.needsUpdate = true;
      bracketMesh.instanceMatrix.needsUpdate = true;
    });
  }, [panelBatches, selectedPanelId, panelPositions]);
  
  return (
    <group onClick={handleClick} userData={{ type: 'panel-group' }}>
      {panelBatches.map((batch, batchIndex) => (
        <group key={`batch-${batchIndex}`}>
          <instancedMesh
            ref={(mesh) => {
              if (mesh) sunlitPanelRefs.current[batchIndex] = mesh;
            }}
            args={[panelGeometry, materials.sunlitPanelMaterial, batch.length]}
            castShadow
            receiveShadow
            userData={{ batchIndex, type: 'panel-instance' }}
          />
          
          <instancedMesh
            ref={(mesh) => {
              if (mesh) shadowedPanelRefs.current[batchIndex] = mesh;
            }}
            args={[panelGeometry, materials.shadowedPanelMaterial, batch.length]}
            castShadow
            receiveShadow
            userData={{ batchIndex, type: 'panel-instance' }}
          />
          
          <instancedMesh
            ref={(mesh) => {
              if (mesh) bracketInstancedMeshRefs.current[batchIndex] = mesh;
            }}
            args={[bracketGeometry, materials.bracketMaterial, batch.length]}
            castShadow
            receiveShadow
            userData={{ batchIndex, type: 'panel-instance' }}
          />
        </group>
      ))}
      
      {selectedPanel && (
        <group>
          <mesh
            position={new THREE.Vector3(...selectedPanel.position)}
            rotation={new THREE.Euler(...selectedPanel.rotation)}
            scale={new THREE.Vector3(1, 1, 1)}
            castShadow
            receiveShadow
            userData={{ type: 'panel', panelId: selectedPanel.id }}
          >
            <boxGeometry args={[3, 0.1, 2]} />
            <meshStandardMaterial 
              map={panelTexture}
              color='#38BDF8'
              metalness={0.8}
              roughness={0.2}
              emissive='#38BDF8'
              emissiveIntensity={0.6}
            />
          </mesh>
          
          <mesh
            position={[selectedPanel.position[0], selectedPanel.position[1] - 0.75, selectedPanel.position[2]]}
            rotation={new THREE.Euler(...selectedPanel.rotation)}
            userData={{ type: 'panel', panelId: selectedPanel.id }}
            castShadow
            receiveShadow
          >
            <primitive object={bracketGeometry} />
            <meshStandardMaterial 
              color='#565c64'
              emissive='#222222'
              emissiveIntensity={0.3}
              metalness={0.7}
              roughness={0.3}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}
