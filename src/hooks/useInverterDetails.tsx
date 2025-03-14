
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
    setSelectedInverterData(inverterData);
    setIsDetailsPopupOpen(true);
  };

  const closeInverterDetails = () => {
    setIsDetailsPopupOpen(false);
  };

  const handleInverterClick = (event: any) => {
    // Extract inverter data from userData if available
    const userData = event.object?.userData;
    
    if (userData?.type === 'inverter' && userData.details) {
      openInverterDetails(userData.details);
    }
  };

  return {
    isDetailsPopupOpen,
    selectedInverterData,
    openInverterDetails,
    closeInverterDetails,
    handleInverterClick
  };
}
