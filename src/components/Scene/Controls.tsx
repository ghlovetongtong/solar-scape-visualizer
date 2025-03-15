
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button, Slider, Switch, Divider, Typography } from 'antd';
import { BoundaryPoint } from '@/hooks/useDrawBoundary';

const { Title, Text } = Typography;

interface ControlsProps {
  showStats: boolean;
  setShowStats: (show: boolean) => void;
  timeOfDay: number;
  setTimeOfDay: (time: number) => void;
  onResetPanels: () => void;
  selectedPanelId: number | null;
  onUpdatePanelPosition: (id: number, position: [number, number, number]) => void;
  onUpdatePanelRotation: (id: number, rotation: [number, number, number]) => void;
  drawingMode: boolean;
  setDrawingMode: (mode: boolean) => void;
  onSaveBoundary: () => void;
  onClearBoundary: () => void;
  onClearAllBoundaries?: () => void;
  onClearAllPanels?: () => void;
  onGenerateNewPanelsInBoundary?: () => void;
  onSaveLayout?: () => void;
}

export default function Controls({
  showStats,
  setShowStats,
  timeOfDay,
  setTimeOfDay,
  onResetPanels,
  selectedPanelId,
  onUpdatePanelPosition,
  onUpdatePanelRotation,
  drawingMode,
  setDrawingMode,
  onSaveBoundary,
  onClearBoundary,
  onClearAllBoundaries,
  onClearAllPanels,
  onGenerateNewPanelsInBoundary,
  onSaveLayout
}: ControlsProps) {
  const [adjustValue, setAdjustValue] = useState(0.5);
  
  const handlePanelAdjustment = (axis: 'x' | 'y' | 'z', isRotation: boolean = false) => {
    if (selectedPanelId === null) {
      toast.error("No panel selected");
      return;
    }
    
    const scaledValue = (adjustValue - 0.5) * (isRotation ? 0.2 : 2);
    
    if (isRotation) {
      const rotation: [number, number, number] = [0, 0, 0];
      if (axis === 'x') rotation[0] = scaledValue;
      if (axis === 'y') rotation[1] = scaledValue;
      if (axis === 'z') rotation[2] = scaledValue;
      
      onUpdatePanelRotation(selectedPanelId, rotation);
    } else {
      const position: [number, number, number] = [0, 0, 0];
      if (axis === 'x') position[0] = scaledValue;
      if (axis === 'y') position[1] = scaledValue;
      if (axis === 'z') position[2] = scaledValue;
      
      onUpdatePanelPosition(selectedPanelId, position);
    }
  };
  
  const getTimeLabel = (timeValue: number) => {
    const hoursFloat = 5 + timeValue * 14;
    const hours = Math.floor(hoursFloat);
    const minutes = Math.floor((hoursFloat - hours) * 60);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 === 0 ? 12 : hours % 12;
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };
  
  return (
    <div className="absolute left-4 bottom-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg max-w-xs space-y-4 border border-gray-200 dark:border-gray-700">
      <Title level={5} style={{ margin: 0 }}>Solar Panel Controls</Title>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Text strong>Time of Day</Text>
          <Text type="secondary">{getTimeLabel(timeOfDay)}</Text>
        </div>
        <Slider
          value={timeOfDay}
          min={0}
          max={1}
          step={0.01}
          onChange={(value) => setTimeOfDay(value)}
        />
      </div>
      
      {selectedPanelId !== null && (
        <>
          <Divider style={{ margin: '12px 0' }} />
          <div className="space-y-2">
            <Text strong>Selected Panel: #{selectedPanelId}</Text>
            <Slider
              value={adjustValue}
              min={0}
              max={1}
              step={0.01}
              onChange={(value) => setAdjustValue(value)}
            />
            <div className="grid grid-cols-3 gap-1">
              <Button size="small" onClick={() => handlePanelAdjustment('x')}>Move X</Button>
              <Button size="small" onClick={() => handlePanelAdjustment('y')}>Move Y</Button>
              <Button size="small" onClick={() => handlePanelAdjustment('z')}>Move Z</Button>
              <Button size="small" onClick={() => handlePanelAdjustment('x', true)}>Rotate X</Button>
              <Button size="small" onClick={() => handlePanelAdjustment('y', true)}>Rotate Y</Button>
              <Button size="small" onClick={() => handlePanelAdjustment('z', true)}>Rotate Z</Button>
            </div>
          </div>
        </>
      )}
      
      <Divider style={{ margin: '12px 0' }} />
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Text strong>Boundary Drawing Mode</Text>
          <Switch
            checked={drawingMode}
            onChange={setDrawingMode}
          />
        </div>
        
        {drawingMode && (
          <>
            <div className="grid grid-cols-2 gap-1 mt-2">
              <Button size="small" onClick={onSaveBoundary}>Save Boundary</Button>
              <Button size="small" danger onClick={onClearBoundary}>Clear Drawing</Button>
            </div>
            
            <div className="grid grid-cols-1 gap-1 mt-2">
              {onGenerateNewPanelsInBoundary && (
                <Button 
                  type="primary"
                  style={{ width: '100%' }}
                  onClick={onGenerateNewPanelsInBoundary}
                >
                  Generate Panels in All Boundaries
                </Button>
              )}
              {onClearAllBoundaries && (
                <Button 
                  danger
                  style={{ width: '100%' }}
                  onClick={onClearAllBoundaries}
                >
                  Clear All Boundaries
                </Button>
              )}
            </div>
          </>
        )}
      </div>
      
      <Divider style={{ margin: '12px 0' }} />
      <div className="space-y-2">
        <Text strong>Panel Management</Text>
        <div className="grid grid-cols-2 gap-1">
          <Button size="small" onClick={onResetPanels}>Reset Panels</Button>
          {onClearAllPanels && (
            <Button 
              size="small" 
              danger
              onClick={onClearAllPanels}
            >
              Clear All Panels
            </Button>
          )}
        </div>
        
        {onSaveLayout && (
          <Button 
            type="primary"
            style={{ width: '100%', marginTop: '8px' }}
            onClick={onSaveLayout}
          >
            Save Complete Layout
          </Button>
        )}
      </div>
      
      <Divider style={{ margin: '12px 0' }} />
      <div className="flex items-center space-x-2">
        <Switch
          checked={showStats}
          onChange={setShowStats}
        />
        <Text>Stats</Text>
      </div>
    </div>
  );
}
