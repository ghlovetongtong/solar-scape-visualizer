
import React, { useState } from 'react';
import { Modal, Button, Typography } from 'antd';
import { MapPin, Volume2, VolumeX, Play, Pause } from 'lucide-react';
import cameraImg from '@/assets/camera.png';
interface CameraDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cameraId: number | null;
}

const { Title, Text } = Typography;

// Mock data for camera details
const getMockCameraData = (cameraId: number) => {
  return {
    id: `CAM-${String(cameraId + 1).padStart(3, '0')}`,
    name: `摄像头 ${cameraId + 1}`,
    model: 'TBEA-ZGSF11-Z.T-2500/35',
    manufacturer: '华为',
    location: '33kV / 120kV',
    installDate: '2024.12.12',
    lastMaintenanceDate: '2024.12.12',
    status: Math.random() > 0.2 ? '在线' : '离线',
    area: '恩大利马东湖大区'
  };
};

const CameraDetailsDialog: React.FC<CameraDetailsDialogProps> = ({ open, onOpenChange, cameraId }) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  if (cameraId === null) return null;

  const cameraData = getMockCameraData(cameraId);
  
  const toggleStreaming = () => {
    setIsStreaming(!isStreaming);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <Modal
      title={`${cameraData.name} (设备号)`}
      open={open}
      onCancel={() => onOpenChange(false)}
      width={1000}
      footer={[
        <Button key="close" onClick={() => onOpenChange(false)}>
          关闭
        </Button>
      ]}
      centered
    >
      <div className="flex flex-col md:flex-row gap-4">
        {/* Left side - Camera information */}
        <div className="w-full md:w-1/3 bg-gray-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <span className={`inline-flex items-center text-xs rounded px-2 py-0.5 ${cameraData.status === '在线' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {cameraData.status === '在线' ? '• 在线' : '• 离线'}
            </span>
          </div>
          
          <div className="flex justify-center mb-6">
            <div className="w-48 h-48 bg-white rounded-md flex items-center justify-center border border-gray-200">
              <img 
                src={cameraImg} 
                alt="Camera" 
                className="w-40 h-auto object-contain"
                onError={(e) => {
                  // Fallback if image fails to load
                  e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M22 18.5a2.5 2.5 0 0 1-2.5 2.5h-15A2.5 2.5 0 0 1 2 18.5v-11A2.5 2.5 0 0 1 4.5 5h15A2.5 2.5 0 0 1 22 7.5Z'%3E%3C/path%3E%3Cpath d='m2 9 20 6'%3E%3C/path%3E%3Cpath d='m2 15 20-6'%3E%3C/path%3E%3C/svg%3E";
                }}
              />
            </div>
          </div>
          
          <div className="text-center mb-2">
            <p className="text-sm text-gray-600">型号：{cameraData.model}</p>
          </div>
          
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-1 border-b border-gray-100 pb-2">
              <Text className="text-gray-500">Manufacturer</Text>
              <Text className="text-right">{cameraData.manufacturer}</Text>
            </div>
            
            <div className="grid grid-cols-2 gap-1 border-b border-gray-100 pb-2">
              <Text className="text-gray-500">位置</Text>
              <Text className="text-right">{cameraData.location}</Text>
            </div>
            
            <div className="grid grid-cols-2 gap-1 border-b border-gray-100 pb-2">
              <Text className="text-gray-500">安装时间</Text>
              <Text className="text-right">{cameraData.installDate}</Text>
            </div>
            
            <div className="grid grid-cols-2 gap-1 border-b border-gray-100 pb-2">
              <Text className="text-gray-500">上次维修时间</Text>
              <Text className="text-right">{cameraData.lastMaintenanceDate}</Text>
            </div>
          </div>
        </div>
        
        {/* Right side - Video feed */}
        <div className="w-full md:w-2/3 relative">
          <div className="bg-gray-100 rounded-lg overflow-hidden" style={{ height: '400px' }}>
            {/* Location label at the top */}
            <div className="absolute top-2 left-2 z-10 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full flex items-center text-sm">
              <MapPin size={14} className="mr-1" />
              {cameraData.area}
            </div>
            
            {/* Video stream placeholder */}
            <div className="w-full h-full flex items-center justify-center bg-black">
              {isStreaming ? (
                <div className="relative w-full h-full">
                  <video 
                    className="w-full h-full object-cover"
                    autoPlay
                    muted={isMuted}
                    loop
                    poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='2' y='2' width='20' height='20' rx='2.18' ry='2.18'%3E%3C/rect%3E%3Cline x1='7' y1='2' x2='7' y2='22'%3E%3C/line%3E%3Cline x1='17' y1='2' x2='17' y2='22'%3E%3C/line%3E%3Cline x1='2' y1='12' x2='22' y2='12'%3E%3C/line%3E%3Cline x1='2' y1='7' x2='7' y2='7'%3E%3C/line%3E%3Cline x1='2' y1='17' x2='7' y2='17'%3E%3C/line%3E%3Cline x1='17' y1='17' x2='22' y2='17'%3E%3C/line%3E%3Cline x1='17' y1='7' x2='22' y2='7'%3E%3C/line%3E%3C/svg%3E"
                  >
                    <source src="" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white text-opacity-80">视频流加载中...</div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 9l3-3-3-3"></path>
                    <path d="M2 15l3 3 3-3"></path>
                    <path d="m14 6-9 9"></path>
                  </svg>
                  <p className="mt-2">点击下方播放按钮开始视频流</p>
                </div>
              )}
            </div>
            
            {/* Video controls */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
              <button
                className="bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 p-2 rounded-full transition-colors"
                onClick={toggleStreaming}
              >
                {isStreaming ? <Pause size={20} /> : <Play size={20} />}
              </button>
              
              <button
                className="bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 p-2 rounded-full transition-colors"
                onClick={toggleMute}
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CameraDetailsDialog;
