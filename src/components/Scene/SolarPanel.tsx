
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { ThreeEvent } from '@react-three/fiber';
import { Instance, Instances } from '@react-three/drei';
import { InstanceData } from '@/lib/instancedMesh';
import { useDraggable } from '@/hooks/useDraggable';

export interface SolarPanelsProps {
  panelPositions: InstanceData[];
  selectedPanelId: number | null;
  onPanelSelected?: (id: number | null) => void;
  onPanelPositionUpdate?: (id: number, position: [number, number, number]) => void;
  onPanelRotationUpdate?: (id: number, rotation: [number, number, number]) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

function PanelInstance({
  id,
  position,
  rotation,
  scale,
  isSelected,
  onSelected,
  onPositionChange,
  onDragStart,
  onDragEnd
}: InstanceData & {
  isSelected: boolean;
  onSelected: (id: number) => void;
  onPositionChange?: (id: number, position: THREE.Vector3) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}) {
  const meshRef = useRef<THREE.Group>(null);
  
  // Convert array position to Vector3
  const positionVector = new THREE.Vector3(position[0], position[1], position[2]);
  const eulerRotation = new THREE.Euler(rotation[0], rotation[1], rotation[2]);
  
  const { bind } = useDraggable({
    enabled: isSelected,
    onDragStart,
    onDragEnd: (newPosition) => {
      if (onPositionChange) {
        onPositionChange(id, newPosition);
      }
      if (onDragEnd) {
        onDragEnd();
      }
    }
  });
  
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (e.nativeEvent) {
      e.nativeEvent.stopPropagation();
    }
    onSelected(id);
  };
  
  return (
    <group 
      position={positionVector}
      rotation={eulerRotation}
      onClick={handleClick}
      onPointerDown={bind.onPointerDown}
      userData={{ type: 'selectable', id, category: 'panel' }}
      ref={bind.ref}
    >
      {/* Fixed the color prop to use a string color value instead of object */}
      <Instance 
        scale={scale} 
        color={isSelected ? '#88ccff' : '#3388cc'} 
      />
      
      {isSelected && (
        <mesh position={[0, 1, 0]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshBasicMaterial color="#ffaa00" wireframe />
        </mesh>
      )}
    </group>
  );
}

export default function SolarPanels({
  panelPositions,
  selectedPanelId,
  onPanelSelected,
  onPanelPositionUpdate,
  onPanelRotationUpdate,
  onDragStart,
  onDragEnd
}: SolarPanelsProps) {
  const handleSelect = (id: number) => {
    if (onPanelSelected) {
      if (id === selectedPanelId) {
        onPanelSelected(null);
      } else {
        onPanelSelected(id);
      }
    }
  };
  
  const handlePositionChange = (id: number, newPosition: THREE.Vector3) => {
    if (onPanelPositionUpdate) {
      onPanelPositionUpdate(id, [newPosition.x, newPosition.y, newPosition.z]);
    }
  };
  
  return (
    <Instances limit={5000} castShadow receiveShadow>
      <boxGeometry args={[1.6, 0.1, 1]} />
      <meshStandardMaterial roughness={0.5} metalness={0.8} />
      
      {panelPositions.map((panel) => (
        <PanelInstance
          key={`panel-${panel.id}`}
          {...panel}
          isSelected={selectedPanelId === panel.id}
          onSelected={handleSelect}
          onPositionChange={handlePositionChange}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        />
      ))}
    </Instances>
  );
}
