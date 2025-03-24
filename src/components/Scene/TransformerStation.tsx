
import React, { useRef, useState, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { useThree, useFrame } from '@react-three/fiber';

interface TransformerStationProps {
  position: THREE.Vector3;
  transformerIndex: number;
  isDragging?: boolean;
  onDragStart?: (index: number) => void;
  onDragEnd?: (index: number, position: [number, number, number]) => void;
  onDrag?: (index: number, position: [number, number, number]) => void;
  onClick?: (index: number) => void;
}

export default function TransformerStation({ 
  position, 
  transformerIndex,
  isDragging = false,
  onDragStart,
  onDragEnd,
  onDrag,
  onClick
}: TransformerStationProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [dragOffset, setDragOffset] = useState<THREE.Vector3 | null>(null);
  const { raycaster, camera, mouse, gl } = useThree();
  const [hovered, setHovered] = useState(false);
  
  useEffect(() => {
    if (!isDragging) return;
    
    const handleGlobalMouseMove = () => {
      if (isDragging && onDrag && dragOffset) {
        const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -position.y);
        
        raycaster.setFromCamera(mouse, camera);
        
        const intersection = new THREE.Vector3();
        raycaster.ray.intersectPlane(dragPlane, intersection);
        
        if (intersection) {
          intersection.sub(dragOffset);
          
          const newPosition: [number, number, number] = [
            intersection.x,
            position.y,
            intersection.z
          ];
          
          onDrag(transformerIndex, newPosition);
        }
      }
    };
    
    const handleGlobalMouseUp = () => {
      if (isDragging && onDragEnd) {
        const newPosition: [number, number, number] = [position.x, position.y, position.z];
        onDragEnd(transformerIndex, newPosition);
        setDragOffset(null);
      }
    };
    
    const domElement = gl.domElement;
    domElement.addEventListener('mousemove', handleGlobalMouseMove);
    domElement.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    
    return () => {
      domElement.removeEventListener('mousemove', handleGlobalMouseMove);
      domElement.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, onDrag, onDragEnd, camera, mouse, raycaster, position.y, transformerIndex, dragOffset, gl.domElement]);
  
  const handlePointerDown = (e: THREE.Event) => {
    e.stopPropagation();
    
    if (e.button === 0) { // Left click
      if (onClick) {
        onClick(transformerIndex);
      }
    }
    
    if (onDragStart) {
      onDragStart(transformerIndex);
      
      if (groupRef.current) {
        const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -position.y);
        raycaster.setFromCamera(mouse, camera);
        
        const intersection = new THREE.Vector3();
        raycaster.ray.intersectPlane(dragPlane, intersection);
        
        if (intersection) {
          setDragOffset(intersection.clone().sub(new THREE.Vector3(position.x, position.y, position.z)));
        }
      }
    }
  };
  
  const handlePointerOver = (e: THREE.Event) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'pointer';
  };
  
  const handlePointerOut = (e: THREE.Event) => {
    e.stopPropagation();
    setHovered(false);
    document.body.style.cursor = 'auto';
  };

  const transformerLabel = useMemo(() => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) return null;
    
    canvas.width = 512; // Increased from 256 to make it wider
    canvas.height = 256; // Increased from 128 to accommodate larger font
    
    context.font = 'bold 72px Arial, sans-serif'; // Increased from 48px
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = '#ffffff';
    context.fillText(`Transformer ${transformerIndex + 1}`, canvas.width / 2, canvas.height / 2);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    
    return texture;
  }, [transformerIndex]);

  return (
    <group 
      position={position} 
      ref={groupRef}
      onPointerDown={handlePointerDown}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      userData={{ type: 'transformer', transformerIndex }}
      frustumCulled={false}
    >
      <mesh 
        receiveShadow 
        position={[0, 0.3, 0]}
      >
        <boxGeometry args={[10, 0.6, 8]} />
        <meshStandardMaterial 
          color={hovered ? "#777777" : (isDragging ? "#aaaaaa" : "#555555")} 
          roughness={0.8} 
        />
      </mesh>
      
      <mesh 
        castShadow 
        receiveShadow 
        position={[0, 2.5, 0]}
      >
        <boxGeometry args={[6, 4, 4]} />
        <meshStandardMaterial 
          color={hovered ? "#b9b8cc" : (isDragging ? "#a9a8bc" : "#8a898c")} 
          roughness={0.5} 
          metalness={0.4} 
        />
      </mesh>
      
      <mesh 
        castShadow 
        position={[-3.01, 2.5, 0]}
      >
        <boxGeometry args={[0.2, 3.5, 3.5]} />
        <meshStandardMaterial 
          color={hovered ? "#aaaaaa" : (isDragging ? "#999999" : "#777777")} 
          roughness={0.3} 
          metalness={0.6} 
        />
      </mesh>
      
      <mesh 
        castShadow 
        position={[3.01, 2.5, 0]}
      >
        <boxGeometry args={[0.2, 3.5, 3.5]} />
        <meshStandardMaterial 
          color={hovered ? "#aaaaaa" : (isDragging ? "#999999" : "#777777")} 
          roughness={0.3} 
          metalness={0.6} 
        />
      </mesh>
      
      <mesh position={[0, 2.5, 2.01]}>
        <planeGeometry args={[2, 1.5]} />
        <meshBasicMaterial 
          color={hovered ? "#ffff66" : "#ffff00"}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      <mesh position={[0, 3.3, 2.02]}>
        <planeGeometry args={[1, 0.5]} />
        <meshBasicMaterial 
          color="#000000"
          side={THREE.DoubleSide}
        />
      </mesh>
      
      <mesh 
        castShadow 
        position={[2, 5, 0]}
      >
        <cylinderGeometry args={[0.1, 0.1, 3, 8]} />
        <meshStandardMaterial color="#dddddd" roughness={0.4} />
      </mesh>
      
      <mesh 
        castShadow 
        position={[0, 5, 0]}
      >
        <cylinderGeometry args={[0.1, 0.1, 3, 8]} />
        <meshStandardMaterial color="#dddddd" roughness={0.4} />
      </mesh>
      
      <mesh 
        castShadow 
        position={[-2, 5, 0]}
      >
        <cylinderGeometry args={[0.1, 0.1, 3, 8]} />
        <meshStandardMaterial color="#dddddd" roughness={0.4} />
      </mesh>
      
      {transformerLabel && (
        <mesh position={[0, 7, 2.5]} rotation={[0, 0, 0]}> {/* Raised position from 5 to 7 */}
          <planeGeometry args={[8, 4]} /> {/* Increased from [5, 2.5] to make it larger */}
          <meshBasicMaterial 
            map={transformerLabel} 
            transparent={true}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}
