
import React from 'react';
import Inverter from './Inverter';
import useInverterDetails from '@/hooks/useInverterDetails';
import { Vector3 } from 'three';

interface InverterContainerProps {
  inverters: Array<{
    position: [number, number, number];
    index: number;
    power?: number;
    efficiency?: number;
    mpptChannels?: number;
    status?: 'online' | 'offline' | 'warning' | 'error';
    temperature?: number;
    dailyEnergy?: number;
    totalEnergy?: number;
    serialNumber?: string;
    manufacturer?: string;
    model?: string;
  }>;
  selectedInverterIndex?: number | null;
  onSelectInverter?: (index: number) => void;
  onDragStart?: (index: number) => void;
  onDragEnd?: (index: number, position: [number, number, number]) => void;
  onDrag?: (index: number, position: [number, number, number]) => void;
}

export default function InverterContainer({
  inverters,
  selectedInverterIndex,
  onSelectInverter,
  onDragStart,
  onDragEnd,
  onDrag
}: InverterContainerProps) {
  // Use the hook to manage inverter details popup
  const { openInverterDetails } = useInverterDetails();

  const handleInverterSelect = (event: any, index: number) => {
    // First handle the selection for parent component
    if (onSelectInverter) {
      onSelectInverter(index);
    }
    
    // Extract the inverter data from the clicked object
    const userData = event.object?.userData;
    
    // Then show the details popup
    if (userData?.type === 'inverter' && userData.details) {
      openInverterDetails(userData.details);
    }
  };

  return (
    <>
      {/* Render all inverters */}
      {inverters.map((inverter) => (
        <Inverter
          key={`inverter-${inverter.index}`}
          position={new Vector3(...inverter.position)}
          inverterIndex={inverter.index}
          isSelected={selectedInverterIndex === inverter.index}
          onClick={(event) => handleInverterSelect(event, inverter.index)}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDrag={onDrag}
          // Pass through all the technical properties
          power={inverter.power}
          efficiency={inverter.efficiency}
          mpptChannels={inverter.mpptChannels}
          status={inverter.status}
          temperature={inverter.temperature}
          dailyEnergy={inverter.dailyEnergy}
          totalEnergy={inverter.totalEnergy}
          serialNumber={inverter.serialNumber}
          manufacturer={inverter.manufacturer}
          model={inverter.model}
        />
      ))}
    </>
  );
}
