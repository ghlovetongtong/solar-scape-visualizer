
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

  const handleInverterClick = (event: any) => {
    // Extract inverter data from userData if available
    console.log("handleInverterClick called with event:", event);
    const userData = event.object?.userData;
    console.log("userData:", userData);
    
    if (userData?.type === 'inverter' && userData.details) {
      console.log("Inverter clicked, calling openInverterDetails with:", userData.details);
      openInverterDetails(userData.details);
    } else {
      console.log("Inverter click criteria not met:", {
        type: userData?.type,
        hasDetails: !!userData?.details
      });
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
