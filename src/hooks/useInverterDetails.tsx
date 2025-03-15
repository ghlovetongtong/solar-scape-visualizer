
import { useState } from 'react';

interface InverterData {
  name: string;
  power: number;
  efficiency: number;
  mpptChannels: number;
  status: 'online' | 'offline' | 'warning' | 'error';
  temperature: number;
  dailyEnergy: number;
  totalEnergy: number;
  serialNumber: string;
  manufacturer: string;
  model: string;
  position: [number, number, number];
}

export default function useInverterDetails() {
  const [isDetailsPopupOpen, setIsDetailsPopupOpen] = useState(false);
  const [selectedInverterData, setSelectedInverterData] = useState<InverterData | null>(null);

  const openInverterDetails = (inverterData: InverterData) => {
    console.log("Opening inverter details with data:", inverterData);
    setSelectedInverterData(inverterData);
    setIsDetailsPopupOpen(true);
  };

  const closeInverterDetails = () => {
    console.log("Closing inverter details popup");
    setIsDetailsPopupOpen(false);
  };

  // Removed handleInverterClick functionality which triggered the control page

  return {
    isDetailsPopupOpen,
    selectedInverterData,
    openInverterDetails,
    closeInverterDetails
  };
}
