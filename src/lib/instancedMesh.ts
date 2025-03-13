
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
      rotation: [0, Math.PI/6, 0], // Y轴旋转30度
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

// 更新计算阴影逻辑，考虑面板Y轴旋转30度的情况
export function isPanelInShadow(
  panelPosition: [number, number, number],
  panelRotation: [number, number, number],
  sunDirection: THREE.Vector3
): boolean {
  // 考虑到Y轴旋转30度，我们需要计算面板的实际法线
  const panelNormal = new THREE.Vector3(0, 1, 0);
  
  // 应用面板旋转
  const rotation = new THREE.Euler(...panelRotation);
  panelNormal.applyEuler(rotation);
  
  // 计算面板法线和太阳方向之间的点积
  const dotProduct = panelNormal.dot(sunDirection);
  
  // 如果点积为负或非常小，则面板背对太阳
  return dotProduct < 0.1;
}

// 基于面板方向计算阴影强度的增强函数
export function getShadowIntensity(
  panelRotation: [number, number, number],
  sunDirection: THREE.Vector3
): number {
  // 考虑到Y轴旋转30度，更新面板法线计算
  const panelNormal = new THREE.Vector3(0, 1, 0);
  
  // 应用面板旋转
  const rotation = new THREE.Euler(...panelRotation);
  panelNormal.applyEuler(rotation);
  
  // 计算面板法线和太阳方向之间的点积
  const dotProduct = panelNormal.dot(sunDirection);
  
  // 返回一个介于0和1之间的值，表示面板直接面对太阳的程度
  // 1 = 直接面向太阳，0 = 完全背向
  return Math.max(0, Math.min(1, dotProduct));
}
