
import React, { useState } from 'react';
import { Button, Slider, Switch, Divider, Typography, Input } from 'antd';
import { message } from 'antd';

const { Title, Text } = Typography;

interface InverterControlsProps {
  selectedInverterIndex: number;
  onDeselectInverter: () => void;
  onUpdateInverterPosition: (index: number, position: [number, number, number]) => void;
}

export default function InverterControls({
  selectedInverterIndex,
  onDeselectInverter,
  onUpdateInverterPosition
}: InverterControlsProps) {
  const [adjustValue, setAdjustValue] = useState(0.5);
  const [manualX, setManualX] = useState('');
  const [manualY, setManualY] = useState('');
  const [manualZ, setManualZ] = useState('');

  const handleInverterAdjustment = (axis: 'x' | 'y' | 'z') => {
    if (selectedInverterIndex === null) {
      message.error("No inverter selected");
      return;
    }
    
    const scaledValue = (adjustValue - 0.5) * 2;
    
    const position: [number, number, number] = [0, 0, 0];
    if (axis === 'x') position[0] = scaledValue;
    if (axis === 'y') position[1] = scaledValue;
    if (axis === 'z') position[2] = scaledValue;
    
    onUpdateInverterPosition(selectedInverterIndex, position);
  };

  const handleManualPositionUpdate = () => {
    if (selectedInverterIndex === null) {
      message.error("No inverter selected");
      return;
    }

    const x = manualX ? parseFloat(manualX) : 0;
    const y = manualY ? parseFloat(manualY) : 0;
    const z = manualZ ? parseFloat(manualZ) : 0;

    if (isNaN(x) || isNaN(y) || isNaN(z)) {
      message.error("Please enter valid numbers for position");
      return;
    }

    onUpdateInverterPosition(selectedInverterIndex, [x, y, z]);
    message.success(`Inverter ${selectedInverterIndex + 1} position set to X:${x} Y:${y} Z:${z}`);
    
    // Clear inputs after update
    setManualX('');
    setManualY('');
    setManualZ('');
  };

  return (
    <div className="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-2">
      <div className="text-sm font-medium">Selected Inverter: #{selectedInverterIndex + 1}</div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Text strong>Adjustment Amount</Text>
          <Text type="secondary">{(adjustValue - 0.5) * 2}</Text>
        </div>
        <Slider
          value={adjustValue}
          min={0}
          max={1}
          step={0.01}
          onChange={(value) => setAdjustValue(value)}
        />
      </div>
      
      <div className="grid grid-cols-3 gap-1">
        <Button size="small" onClick={() => handleInverterAdjustment('x')}>Move X</Button>
        <Button size="small" onClick={() => handleInverterAdjustment('y')}>Move Y</Button>
        <Button size="small" onClick={() => handleInverterAdjustment('z')}>Move Z</Button>
      </div>
      
      <div className="space-y-2 mt-2">
        <div className="text-sm font-medium">Set Exact Position</div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <Text strong>X Position</Text>
            <Input 
              placeholder="X" 
              value={manualX} 
              onChange={(e) => setManualX(e.target.value)}
            />
          </div>
          <div>
            <Text strong>Y Position</Text>
            <Input 
              placeholder="Y" 
              value={manualY} 
              onChange={(e) => setManualY(e.target.value)}
            />
          </div>
          <div>
            <Text strong>Z Position</Text>
            <Input 
              placeholder="Z" 
              value={manualZ} 
              onChange={(e) => setManualZ(e.target.value)}
            />
          </div>
        </div>
        <Button 
          size="small" 
          style={{ width: '100%' }}
          onClick={handleManualPositionUpdate}
        >
          Set Position
        </Button>
      </div>
      
      <Button 
        size="small" 
        style={{ width: '100%', marginTop: '8px' }}
        danger
        onClick={onDeselectInverter}
      >
        Deselect Inverter
      </Button>
    </div>
  );
}
