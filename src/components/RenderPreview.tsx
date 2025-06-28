import React from 'react';
import { Eye, RefreshCw, Image } from 'lucide-react';

interface RenderPreviewProps {
  image: string | null;
  onRender: () => void;
  isConnected: boolean;
}

const RenderPreview: React.FC<RenderPreviewProps> = ({ image, onRender, isConnected }) => {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
        Render Preview
      </h2>
      
      <div className="space-y-4">
        <div className="aspect-square bg-black/30 border border-white/20 rounded-xl overflow-hidden">
          {image ? (
            <img 
              src={image} 
              alt="Blender Render" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center text-gray-400">
                <Image className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-sm">No render available</p>
                <p className="text-xs mt-1">Create an object and request a render</p>
              </div>
            </div>
          )}
        </div>
        
        <button
          onClick={onRender}
          disabled={!isConnected}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-xl py-3 px-6 font-semibold transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <RefreshCw className="w-5 h-5" />
          Request Render
        </button>
        
        <div className="text-xs text-gray-400 space-y-1">
          <p>• Renders show your current Blender scene</p>
          <p>• Updates automatically after object creation</p>
          <p>• Click to manually refresh the view</p>
        </div>
      </div>
    </div>
  );
};

export default RenderPreview;