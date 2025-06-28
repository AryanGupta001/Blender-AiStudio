import React, { useEffect, useRef } from 'react';
import { AlertTriangle, CheckCircle, Info, Loader } from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: Date;
  type: 'info' | 'success' | 'error' | 'processing';
  message: string;
}

interface StatusLogProps {
  logs: LogEntry[];
}

const StatusLog: React.FC<StatusLogProps> = ({ logs }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'processing':
        return <Loader className="w-4 h-4 text-blue-400 animate-spin" />;
      default:
        return <Info className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTextColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'success':
        return 'text-green-300';
      case 'error':
        return 'text-red-300';
      case 'processing':
        return 'text-blue-300';
      default:
        return 'text-gray-300';
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 h-96">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        Activity Log
      </h2>
      
      <div 
        ref={scrollRef}
        className="h-80 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
      >
        {logs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>No activity yet. Send your first command to get started!</p>
          </div>
        ) : (
          logs.map((log) => (
            <div 
              key={log.id}
              className="flex items-start gap-3 p-3 bg-black/20 rounded-lg border border-white/10 animate-fadeIn"
            >
              {getIcon(log.type)}
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${getTextColor(log.type)} break-words`}>
                  {log.message}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {log.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StatusLog;