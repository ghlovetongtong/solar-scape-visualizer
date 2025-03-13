
import React, { useEffect, useState } from 'react';
import SceneContainer from '@/components/Scene/SceneContainer';
import { toast } from 'sonner';

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading resources
    const timer = setTimeout(() => {
      setIsLoading(false);
      toast.success("Solar Station visualization loaded successfully", {
        duration: 5000,
      });
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full h-screen overflow-hidden">
      {isLoading ? (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <div className="text-lg font-medium">Initializing Solar Power Station...</div>
          <div className="text-sm text-muted-foreground mt-2">Preparing 3D visualization</div>
        </div>
      ) : (
        <SceneContainer />
      )}
    </div>
  );
};

export default Index;
