import React from 'react';
import { Wifi, WifiOff, Settings } from 'lucide-react';

interface ConnectionStatusProps {
  isConnected: boolean;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ isConnected }) => {
  return (
    <div className="mb-8">
      <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-full border ${
        isConnected 
          ? 'bg-green-500/20 border-green-400/50 text-green-300' 
          : 'bg-red-500/20 border-red-400/50 text-red-300'
      }`}>
        {isConnected ? (
          <>
            <Wifi className="w-4 h-4" />
            <span className="text-sm font-medium">Connected to Blender MCP</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span className="text-sm font-medium">Disconnected from Blender MCP</span>
          </>
        )}
      </div>
      
      {!isConnected && (
        <div className="mt-4 p-4 bg-amber-500/20 border border-amber-400/50 rounded-xl">
          <div className="flex items-start gap-3">
            <Settings className="w-5 h-5 text-amber-400 mt-0.5" />
            <div className="text-sm text-amber-200">
              <p className="font-medium mb-2">Setup Required:</p>
              <ol className="space-y-1 text-xs">
                <li>1. Start the backend proxy server: <code className="bg-black/30 px-1 rounded">npm run server</code></li>
                <li>2. Ensure Blender MCP server is running on localhost:8080</li>
                <li>3. Refresh this page once both servers are running</li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;