import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export interface InstanceData {
  id: number;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

export function createInstancedMesh(
  geometry: THREE.BufferGeometry,
  material: THREE.Material | THREE.Material[],
  count: number
): THREE.InstancedMesh {
  const mesh = new THREE.InstancedMesh(geometry, Array.isArray(material) ? material[0] : material, count);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

export function updateInstancedMesh(
  mesh: THREE.InstancedMesh,
  instances: InstanceData[]
): void {
  const matrix = new THREE.Matrix4();
  const quaternion = new THREE.Quaternion();
  
  instances.forEach((instance, index) => {
    const position = new THREE.Vector3(...instance.position);
    const euler = new THREE.Euler(...instance.rotation);
    quaternion.setFromEuler(euler);
    const scale = new THREE.Vector3(...instance.scale);
    
    matrix.compose(position, quaternion, scale);
    mesh.setMatrixAt(index, matrix);
  });
  
  mesh.instanceMatrix.needsUpdate = true;
}

export function generateGridPositions(
  count: number,
  spacing: number = 5,
  rowSize: number = 50
): InstanceData[] {
  const instances: InstanceData[] = [];
  
  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / rowSize);
    const col = i % rowSize;
    
    instances.push({
      id: i,
      position: [col * spacing, 0, row * spacing],
      rotation: [0, 0, 0],
      scale: [1, 1, 1]
    });
  }
  
  return instances;
}

export function optimizeScene(scene: THREE.Scene): void {
  scene.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.frustumCulled = true;
      
      if (object.geometry) {
        object.geometry.computeBoundingSphere();
        object.geometry.computeBoundingBox();
      }
    }
  });
}
