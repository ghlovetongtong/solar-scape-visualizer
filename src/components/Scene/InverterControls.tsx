
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from 'sonner';

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
      toast.error("No inverter selected");
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
      toast.error("No inverter selected");
      return;
    }

    const x = manualX ? parseFloat(manualX) : 0;
    const y = manualY ? parseFloat(manualY) : 0;
    const z = manualZ ? parseFloat(manualZ) : 0;

    if (isNaN(x) || isNaN(y) || isNaN(z)) {
      toast.error("Please enter valid numbers for position");
      return;
    }

    onUpdateInverterPosition(selectedInverterIndex, [x, y, z]);
    toast.success(`Inverter ${selectedInverterIndex + 1} position set to X:${x} Y:${y} Z:${z}`);
    
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
          <label className="text-sm font-medium">Adjustment Amount</label>
          <span className="text-sm text-gray-500">{(adjustValue - 0.5) * 2}</span>
        </div>
        <Slider
          value={[adjustValue]}
          min={0}
          max={1}
          step={0.01}
          onValueChange={(values) => setAdjustValue(values[0])}
        />
      </div>
      
      <div className="grid grid-cols-3 gap-1">
        <Button size="sm" onClick={() => handleInverterAdjustment('x')}>Move X</Button>
        <Button size="sm" onClick={() => handleInverterAdjustment('y')}>Move Y</Button>
        <Button size="sm" onClick={() => handleInverterAdjustment('z')}>Move Z</Button>
      </div>
      
      <div className="space-y-2 mt-2">
        <div className="text-sm font-medium">Set Exact Position</div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <Label htmlFor="position-x" className="text-xs">X Position</Label>
            <Input 
              id="position-x" 
              placeholder="X" 
              value={manualX} 
              onChange={(e) => setManualX(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="position-y" className="text-xs">Y Position</Label>
            <Input 
              id="position-y" 
              placeholder="Y" 
              value={manualY} 
              onChange={(e) => setManualY(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="position-z" className="text-xs">Z Position</Label>
            <Input 
              id="position-z" 
              placeholder="Z" 
              value={manualZ} 
              onChange={(e) => setManualZ(e.target.value)}
            />
          </div>
        </div>
        <Button 
          size="sm" 
          className="w-full"
          onClick={handleManualPositionUpdate}
        >
          Set Position
        </Button>
      </div>
      
      <Button 
        size="sm" 
        className="w-full mt-2"
        variant="outline"
        onClick={onDeselectInverter}
      >
        Deselect Inverter
      </Button>
    </div>
  );
}
