
import React, { useEffect, useState, Suspense } from 'react';
import { message } from 'antd';
import { ErrorBoundary } from 'react-error-boundary';

// Lazy load the SceneContainer component to ensure all Three.js dependencies are loaded first
const SceneContainer = React.lazy(() => 
  import('@/components/Scene/SceneContainer')
    .catch(error => {
      console.error("Failed to load SceneContainer:", error);
      message.error("Failed to load 3D visualization. Please refresh the page.");
      return Promise.reject(error);
    })
);

// Error fallback component
const ErrorFallback = ({ error }: { error: Error }) => {
  useEffect(() => {
    console.error("Scene rendering error:", error);
  }, [error]);

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center p-4 text-center">
      <h2 className="text-xl font-bold text-red-600 mb-2">Something went wrong rendering the 3D scene</h2>
      <p className="text-gray-600 mb-4">Error: {error.message}</p>
      <pre className="text-xs bg-gray-100 p-4 rounded max-w-full overflow-auto mb-4 max-h-40">
        {error.stack}
      </pre>
      <button 
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        Reload Application
      </button>
    </div>
  );
};

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<Error | null>(null);

  useEffect(() => {
    // Ensure Three.js is loaded before rendering the scene
    const preloadThree = async () => {
      try {
        console.log("Preloading Three.js...");
        await import('three');
        console.log("Three.js loaded successfully");
        
        // Add a small delay to ensure smooth transition to the scene
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error("Failed to load Three.js:", error);
        setLoadingError(error instanceof Error ? error : new Error("Failed to load Three.js"));
        message.error("Failed to initialize 3D engine");
      }
    };

    preloadThree();

    return () => {
      // Cleanup
    };
  }, []);

  if (loadingError) {
    return <ErrorFallback error={loadingError} />;
  }

  return (
    <div className="w-full h-screen overflow-hidden">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <div className="text-lg font-medium">Initializing Solar Power Station...</div>
          <div className="text-sm text-muted-foreground mt-2">Preparing 3D visualization</div>
        </div>
      ) : (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={
            <div className="flex items-center justify-center h-full">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <div className="ml-4 text-lg">Loading 3D scene...</div>
            </div>
          }>
            <SceneContainer />
          </Suspense>
        </ErrorBoundary>
      )}
    </div>
  );
};

export default Index;
