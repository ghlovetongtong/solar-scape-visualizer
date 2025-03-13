
import { useState, useCallback, useEffect } from 'react';
import { type InstanceData } from '@/lib/instancedMesh';
import { getHeightAtPosition } from '@/components/Scene/Ground';

// 根据电站分布图定义布局常量
const PANEL_SPACING_X = 1.2; // 光伏板水平间距
const PANEL_SPACING_Z = 3.8; // 光伏板垂直间距（行间距）
const ROW_SPACING = 16;      // 每组行之间的间距
const PANELS_PER_ROW = 26;   // 每行的面板数量
const ROWS_IN_SECTION_1 = 12; // 左侧区域行数
const ROWS_IN_SECTION_2 = 18; // 右侧区域行数

export function usePanelPositions(initialCount: number = 2000) {
  const [panelPositions, setPanelPositions] = useState<InstanceData[]>([]);
  const [selectedPanelId, setSelectedPanelId] = useState<number | null>(null);
  const [initialPositions, setInitialPositions] = useState<InstanceData[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // 初始化面板位置，模拟电站图中的布局
  useEffect(() => {
    console.log(`按照真实电站图初始化 ${initialCount} 个光伏板`);
    try {
      const instances: InstanceData[] = [];
      
      // 创建一个模拟斜向的区域，整体旋转约15度
      const totalRotation = Math.PI * 0.08; // 约15度的旋转
      
      // 绘制第一个区域（左侧矩形区域）
      const startX1 = -80;
      const startZ1 = -40;
      let panelId = 0;
      
      // 计算左侧区域行数（约为总面板的1/3）
      for (let row = 0; row < ROWS_IN_SECTION_1 && panelId < initialCount; row++) {
        // 每行稍微错开，形成不完全的矩形
        const rowOffset = row * 0.5;
        
        // 计算这一行需要多少面板
        const panelsInThisRow = Math.min(PANELS_PER_ROW, initialCount - panelId);
        
        for (let col = 0; col < panelsInThisRow; col++) {
          // 应用整体旋转到坐标上
          const rawX = startX1 + col * PANEL_SPACING_X + rowOffset;
          const rawZ = startZ1 + row * PANEL_SPACING_Z;
          
          // 旋转坐标
          const x = rawX * Math.cos(totalRotation) - rawZ * Math.sin(totalRotation);
          const z = rawX * Math.sin(totalRotation) + rawZ * Math.cos(totalRotation);
          
          // 获取该位置的地面高度
          const groundHeight = getHeightAtPosition(x, z);
          
          // 为每组面板添加细微的随机旋转，以创造自然效果
          const groupIndex = Math.floor(row / 4);
          const rowRotationY = (Math.random() - 0.5) * 0.02 + totalRotation; // 微小随机旋转
          
          instances.push({
            id: panelId,
            position: [
              x, 
              1.0 + groundHeight,
              z
            ],
            rotation: [
              -Math.PI / 8, // 标准倾斜角度
              rowRotationY,
              0
            ],
            scale: [1, 1, 1]
          });
          
          panelId++;
        }
      }
      
      // 留出一条中间的通道
      const middleGap = 30;
      
      // 绘制第二个区域（右侧矩形区域，稍大于左侧）
      const startX2 = startX1 + middleGap;
      const startZ2 = startZ1 + 20; // 稍微错开
      
      // 计算右侧区域的行数（约为总面板的2/3）
      for (let row = 0; row < ROWS_IN_SECTION_2 && panelId < initialCount; row++) {
        // 每行稍微错开，形成不完全的矩形
        const rowOffset = row * 0.5;
        
        // 第二区域的行长度略有变化
        const rowLength = PANELS_PER_ROW + (row % 5 === 0 ? -2 : 0); // 部分行略短
        const panelsInThisRow = Math.min(rowLength, initialCount - panelId);
        
        for (let col = 0; col < panelsInThisRow; col++) {
          // 应用整体旋转到坐标上
          const rawX = startX2 + col * PANEL_SPACING_X + rowOffset;
          const rawZ = startZ2 + row * PANEL_SPACING_Z;
          
          // 旋转坐标
          const x = rawX * Math.cos(totalRotation) - rawZ * Math.sin(totalRotation);
          const z = rawX * Math.sin(totalRotation) + rawZ * Math.cos(totalRotation);
          
          // 获取该位置的地面高度
          const groundHeight = getHeightAtPosition(x, z);
          
          // 为每组面板添加细微的随机旋转，以创造自然效果
          const groupIndex = Math.floor(row / 4);
          const rowRotationY = (Math.random() - 0.5) * 0.02 + totalRotation; // 微小随机旋转
          
          instances.push({
            id: panelId,
            position: [
              x, 
              1.0 + groundHeight,
              z
            ],
            rotation: [
              -Math.PI / 8, // 标准倾斜角度
              rowRotationY,
              0
            ],
            scale: [1, 1, 1]
          });
          
          panelId++;
        }
      }
      
      setPanelPositions(instances);
      setInitialPositions(instances);
      setIsInitialized(true);
      console.log(`成功初始化了 ${instances.length} 个光伏板，按照电站布局图排列`);
    } catch (error) {
      console.error("初始化面板位置时出错:", error);
    }
  }, [initialCount]);

  // Function to update a single panel's position
  const updatePanelPosition = useCallback((id: number, position: [number, number, number]) => {
    setPanelPositions(prev => 
      prev.map(panel => 
        panel.id === id 
          ? { ...panel, position } 
          : panel
      )
    );
  }, []);

  // Function to update a single panel's rotation
  const updatePanelRotation = useCallback((id: number, rotation: [number, number, number]) => {
    setPanelPositions(prev => 
      prev.map(panel => 
        panel.id === id 
          ? { ...panel, rotation } 
          : panel
      )
    );
  }, []);

  // Function to select a panel
  const selectPanel = useCallback((id: number | null) => {
    setSelectedPanelId(id);
  }, []);

  // Function to reset all panels to initial positions
  const resetPanelPositions = useCallback(() => {
    setPanelPositions(initialPositions);
  }, [initialPositions]);

  return {
    panelPositions,
    selectedPanelId,
    updatePanelPosition,
    updatePanelRotation,
    selectPanel,
    resetPanelPositions,
    isInitialized
  };
}
