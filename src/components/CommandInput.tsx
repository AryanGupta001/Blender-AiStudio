import React from 'react';
import { Send, Loader } from 'lucide-react';

interface CommandInputProps {
  command: string;
  setCommand: (command: string) => void;
  onSubmit: () => void;
  isProcessing: boolean;
  isConnected: boolean;
}

const CommandInput: React.FC<CommandInputProps> = ({
  command,
  setCommand,
  onSubmit,
  isProcessing,
  isConnected
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      onSubmit();
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
        Command Center
      </h2>
      
      <div className="space-y-4">
        <textarea
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Describe what you want to create or modify in Blender...&#10;&#10;Examples:&#10;• Create a shiny blue sphere&#10;• Add a forest scene with tall trees&#10;• Rotate the last object 90 degrees&#10;• Add a spotlight pointing at the object"
          className="w-full h-32 bg-black/20 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
          disabled={isProcessing}
        />
        
        <button
          onClick={onSubmit}
          disabled={!command.trim() || isProcessing || !isConnected}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-xl py-3 px-6 font-semibold transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {isProcessing ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Send to Blender
            </>
          )}
        </button>
        
        <p className="text-xs text-gray-400 text-center">
          Press Ctrl+Enter (Cmd+Enter on Mac) to send quickly
        </p>
      </div>
    </div>
  );
};

export default CommandInput;