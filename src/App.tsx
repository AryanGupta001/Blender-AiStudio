import React, { useState, useEffect, useRef } from 'react';
import { Send, Zap, Eye, Loader, AlertTriangle, CheckCircle, Sparkles } from 'lucide-react';
import CommandInput from './components/CommandInput';
import StatusLog from './components/StatusLog';
import RenderPreview from './components/RenderPreview';
import ConnectionStatus from './components/ConnectionStatus';
import ExamplePrompts from './components/ExamplePrompts';
import { AIAgent } from './utils/aiAgent';
import { BlenderConnection } from './utils/blenderConnection';

interface LogEntry {
  id: string;
  timestamp: Date;
  type: 'info' | 'success' | 'error' | 'processing';
  message: string;
}

function App() {
  const [command, setCommand] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [renderImage, setRenderImage] = useState<string | null>(null);
  const [lastCommand, setLastCommand] = useState<string>('');
  
  const aiAgent = useRef(new AIAgent());
  const blenderConnection = useRef(new BlenderConnection());

  useEffect(() => {
    // Initialize connection to backend proxy
    blenderConnection.current.connect();
    
    blenderConnection.current.onConnectionChange = (connected: boolean) => {
      setIsConnected(connected);
      addLog(
        connected ? 'Connected to Blender MCP server' : 'Disconnected from Blender MCP server',
        connected ? 'success' : 'error'
      );
    };

    blenderConnection.current.onMessage = (message: string) => {
      addLog(`Blender: ${message}`, 'info');
    };

    blenderConnection.current.onError = (error: string) => {
      addLog(`Error: ${error}`, 'error');
      setIsProcessing(false);
    };

    return () => {
      blenderConnection.current.disconnect();
    };
  }, []);

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    const logEntry: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date(),
      type,
      message
    };
    setLogs(prev => [...prev, logEntry]);
  };

  const handleSubmit = async () => {
    if (!command.trim() || isProcessing || !isConnected) return;

    setIsProcessing(true);
    setLastCommand(command);
    addLog(`User: ${command}`, 'info');
    addLog('Processing command...', 'processing');

    try {
      // Use AI agent to interpret and translate command
      const blenderCommand = await aiAgent.current.interpretCommand(command, lastCommand);
      addLog(`AI Interpretation: ${blenderCommand.description}`, 'info');
      
      // Send command to Blender via backend proxy
      await blenderConnection.current.sendCommand(blenderCommand);
      addLog('Command sent to Blender successfully', 'success');
      
      setCommand('');
    } catch (error) {
      addLog(`Failed to process command: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExampleClick = (example: string) => {
    setCommand(example);
  };

  const handleRender = async () => {
    if (!isConnected) return;
    
    addLog('Requesting render from Blender...', 'processing');
    try {
      const renderData = await blenderConnection.current.requestRender();
      setRenderImage(renderData);
      addLog('Render completed successfully', 'success');
    } catch (error) {
      addLog(`Render failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 text-white">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-pulse opacity-60"></div>
        <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-purple-400 rounded-full animate-bounce opacity-40"></div>
        <div className="absolute top-1/2 right-1/4 w-3 h-3 bg-violet-400 rounded-full animate-pulse opacity-30"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl">
              <Sparkles className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Blender AI Studio
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Create and manipulate 3D objects in Blender using natural language commands.
            Powered by AI agents and real-time MCP communication.
          </p>
        </header>

        {/* Connection Status */}
        <ConnectionStatus isConnected={isConnected} />

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Input and Examples */}
          <div className="lg:col-span-1 space-y-6">
            <CommandInput 
              command={command}
              setCommand={setCommand}
              onSubmit={handleSubmit}
              isProcessing={isProcessing}
              isConnected={isConnected}
            />
            <ExamplePrompts onExampleClick={handleExampleClick} />
          </div>

          {/* Middle Column - Status Log */}
          <div className="lg:col-span-1">
            <StatusLog logs={logs} />
          </div>

          {/* Right Column - Render Preview */}
          <div className="lg:col-span-1">
            <RenderPreview 
              image={renderImage}
              onRender={handleRender}
              isConnected={isConnected}
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-400">
          <p className="flex items-center justify-center gap-2">
            <Zap className="w-4 h-4" />
            Built with Bolt.new - Creative AI meets 3D Design
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;