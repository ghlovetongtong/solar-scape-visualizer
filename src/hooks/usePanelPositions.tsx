
import { useState, useCallback, useEffect } from 'react';
import { type InstanceData } from '@/lib/instancedMesh';
import { getHeightAtPosition } from '@/components/Scene/Ground';

// 根据电站分布图精确定义布局常量
const PANEL_SPACING_X = 1.2; // 光伏板水平间距
const PANEL_SPACING_Z = 3.0; // 光伏板垂直间距（行间距）
const ROW_SPACING = 16;      // 每组行之间的间距
const PANELS_PER_ROW = 20;   // 每行的面板数量
const ROWS_IN_SECTION_1 = 14; // 左侧区域行数
const ROWS_IN_SECTION_2 = 16; // 右侧区域行数

export function usePanelPositions(initialCount: number = 2000) {
  const [panelPositions, setPanelPositions] = useState<InstanceData[]>([]);
  const [selectedPanelId, setSelectedPanelId] = useState<number | null>(null);
  const [initialPositions, setInitialPositions] = useState<InstanceData[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // 初始化面板位置，更精确地模拟电站图中的布局
  useEffect(() => {
    console.log(`按照电站实际分布图初始化 ${initialCount} 个光伏板`);
    try {
      const instances: InstanceData[] = [];
      
      // 根据图片，整体旋转约15度
      const totalRotation = Math.PI * 0.083; // 约15度的旋转
      
      // 绘制第一个区域（左侧区域）- 根据图片显示为较小的区域
      const startX1 = -70;
      const startZ1 = -40;
      let panelId = 0;
      
      // 左侧区域排列 - 每行的面板数量略有减少，形状更为不规则
      for (let row = 0; row < ROWS_IN_SECTION_1 && panelId < initialCount; row++) {
        // 每行末端根据图片显示应该是不齐的，有特定形状
        const isEdgeRow = row < 2 || row > ROWS_IN_SECTION_1 - 3;
        const rowPanelCount = isEdgeRow ? PANELS_PER_ROW - 4 : PANELS_PER_ROW;
        
        // 左上和左下角特有的形状处理
        const rowOffset = row * 0.2; // 轻微的错位效果
        const startColOffset = row < 3 ? 2 : (row > ROWS_IN_SECTION_1 - 4 ? 2 : 0);
        
        for (let col = startColOffset; col < rowPanelCount; col++) {
          // 根据图片显示，光伏板排列不是完全规则的
          const rawX = startX1 + col * PANEL_SPACING_X + rowOffset;
          const rawZ = startZ1 + row * PANEL_SPACING_Z;
          
          // 旋转坐标以匹配图片中的方向
          const x = rawX * Math.cos(totalRotation) - rawZ * Math.sin(totalRotation);
          const z = rawX * Math.sin(totalRotation) + rawZ * Math.cos(totalRotation);
          
          // 获取该位置的地面高度
          const groundHeight = getHeightAtPosition(x, z);
          
          // 根据图片显示，面板有轻微的旋转变化
          const rowRotationY = (Math.random() - 0.5) * 0.02 + totalRotation;
          
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
      
      // 根据图片中显示的间隙设置中间通道宽度
      const middleGap = 25;
      
      // 绘制第二个区域（右侧区域）
      const startX2 = startX1 + middleGap;
      const startZ2 = startZ1 - 5; // 根据图片，右侧区域位置应该更靠上
      
      // 右侧区域排列 - 根据图片显示为较大的区域，但形状仍然不规则
      for (let row = 0; row < ROWS_IN_SECTION_2 && panelId < initialCount; row++) {
        // 根据图片处理右侧区域特有的形状
        const isTopRow = row < 3;
        const isBottomRow = row > ROWS_IN_SECTION_2 - 4;
        const isMiddleRow = row >= 5 && row <= ROWS_IN_SECTION_2 - 6;
        
        // 根据图片确定每行面板数量
        let rowPanelCount = PANELS_PER_ROW + 6; // 右侧区域比左侧宽
        let startColOffset = 0;
        
        if (isTopRow) {
          // 右上角有特殊形状
          rowPanelCount -= 8;
          startColOffset = 4;
        } else if (isBottomRow) {
          // 右下角有特殊形状
          rowPanelCount -= 4;
        } else if (isMiddleRow) {
          // 中间区域最宽
          rowPanelCount += 2;
        }
        
        const rowOffset = row * 0.2; // 轻微的错位效果
        
        for (let col = startColOffset; col < rowPanelCount; col++) {
          // 根据图片显示的不规则排列
          const rawX = startX2 + col * PANEL_SPACING_X + rowOffset;
          const rawZ = startZ2 + row * PANEL_SPACING_Z;
          
          // 旋转坐标以匹配图片中的方向
          const x = rawX * Math.cos(totalRotation) - rawZ * Math.sin(totalRotation);
          const z = rawX * Math.sin(totalRotation) + rawZ * Math.cos(totalRotation);
          
          // 获取该位置的地面高度
          const groundHeight = getHeightAtPosition(x, z);
          
          // 根据图片显示，面板有轻微的旋转变化
          const rowRotationY = (Math.random() - 0.5) * 0.02 + totalRotation;
          
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
      console.log(`成功初始化了 ${instances.length} 个光伏板，按照电站精确布局图排列`);
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
