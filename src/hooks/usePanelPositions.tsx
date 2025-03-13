
import { useState, useCallback, useEffect } from 'react';
import { type InstanceData } from '@/lib/instancedMesh';
import { getHeightAtPosition } from '@/components/Scene/Ground';

// 根据电站分布图精确定义布局常量
const PANEL_SPACING_X = 3.0; // 光伏板水平间距，确保无间隙紧密排列
const PANEL_SPACING_Z = 2.0; // 光伏板垂直间距，确保无间隙紧密排列
const ROAD_WIDTH = 20;      // 中间公路的宽度
const PANELS_PER_ROW_LEFT = 15;   // 左侧每行的面板数量
const PANELS_PER_ROW_RIGHT = 25;  // 右侧每行的面板数量（较大区域）
const ROWS_IN_LEFT_SECTION = 12; // 左侧区域行数
const ROWS_IN_RIGHT_SECTION = 18; // 右侧区域行数

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
      
      // 计算总宽度以居中整个布局
      const totalWidthLeft = PANELS_PER_ROW_LEFT * PANEL_SPACING_X;
      const totalWidthRight = PANELS_PER_ROW_RIGHT * PANEL_SPACING_X;
      const totalWidth = Math.max(totalWidthLeft, totalWidthRight) + ROAD_WIDTH;
      
      // 居中整个布局的起始位置
      const startX1 = -totalWidth / 2;
      const startZ1 = -40;
      let panelId = 0;
      
      // 左侧区域排列 - 规则矩形区域
      for (let row = 0; row < ROWS_IN_LEFT_SECTION && panelId < initialCount; row++) {
        for (let col = 0; col < PANELS_PER_ROW_LEFT; col++) {
          // 计算位置，确保面板紧密排列（无重叠，无间隙）
          const x = startX1 + col * PANEL_SPACING_X;
          const z = startZ1 + row * PANEL_SPACING_Z;
          
          // 获取该位置的地面高度
          const groundHeight = getHeightAtPosition(x, z);
          
          instances.push({
            id: panelId,
            position: [
              x, 
              1.0 + groundHeight,
              z
            ],
            rotation: [
              0,                  // X轴旋转保持为0
              0,                  // Y轴旋转保持为0
              Math.PI/6           // Z轴旋转30度（π/6弧度 = 30度）
            ],
            scale: [1, 1, 1]
          });
          
          panelId++;
        }
      }
      
      // 中间是一条公路, 设置间隔
      
      // 绘制右侧区域 - 不规则大矩形
      const startX2 = startX1 + PANELS_PER_ROW_LEFT * PANEL_SPACING_X + ROAD_WIDTH;
      const startZ2 = startZ1 - 5; // 右侧区域位置稍微偏上
      
      // 右侧区域排列 - 不规则矩形
      for (let row = 0; row < ROWS_IN_RIGHT_SECTION && panelId < initialCount; row++) {
        // 不规则形状处理：顶部和底部行数少一些，中间行数多一些
        let rowPanelCount = PANELS_PER_ROW_RIGHT;
        let startColOffset = 0;
        
        // 上部形状处理（梯形上部）
        if (row < 3) {
          startColOffset = 6 - row * 2; // 上部收窄
          rowPanelCount -= startColOffset;
        }
        // 下部形状处理（右下角缺口）
        else if (row > ROWS_IN_RIGHT_SECTION - 5) {
          const bottomRow = row - (ROWS_IN_RIGHT_SECTION - 5);
          rowPanelCount -= bottomRow * 3; // 右下角缺口
        }
        // 右侧中部往外凸出
        else if (row >= 6 && row <= 10) {
          rowPanelCount += 3; // 中间部分向右凸出
        }
        
        for (let col = 0; col < rowPanelCount; col++) {
          // 计算位置，确保面板紧密排列（无重叠，无间隙）
          const x = startX2 + (col + startColOffset) * PANEL_SPACING_X;
          const z = startZ2 + row * PANEL_SPACING_Z;
          
          // 获取该位置的地面高度
          const groundHeight = getHeightAtPosition(x, z);
          
          instances.push({
            id: panelId,
            position: [
              x, 
              1.0 + groundHeight,
              z
            ],
            rotation: [
              0,                  // X轴旋转保持为0
              0,                  // Y轴旋转保持为0
              Math.PI/6           // Z轴旋转30度（π/6弧度 = 30度）
            ],
            scale: [1, 1, 1]
          });
          
          panelId++;
        }
      }
      
      setPanelPositions(instances);
      setInitialPositions(instances);
      setIsInitialized(true);
      console.log(`成功初始化了 ${instances.length} 个光伏板，按照电站精确布局图排列且Z轴旋转30度`);
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
