import express from 'express';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import cors from 'cors';
import WebSocket from 'ws';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Store active connections
const connections = new Map();
let blenderWs = null;

// Connect to Blender MCP server
function connectToBlender() {
  try {
    blenderWs = new WebSocket('ws://localhost:8080');
    
    blenderWs.on('open', () => {
      console.log('Connected to Blender MCP server on localhost:8080');
      broadcastStatus('Connected to Blender MCP server');
    });

    blenderWs.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        console.log('Message from Blender:', message);
        
        // Forward message to all connected clients
        connections.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: 'blender_message',
              data: message
            }));
          }
        });
      } catch (error) {
        console.error('Error parsing Blender message:', error);
      }
    });

    blenderWs.on('close', () => {
      console.log('Disconnected from Blender MCP server');
      broadcastStatus('Disconnected from Blender MCP server');
      blenderWs = null;
      
      // Attempt to reconnect after 5 seconds
      setTimeout(connectToBlender, 5000);
    });

    blenderWs.on('error', (error) => {
      console.error('Blender WebSocket error:', error);
      broadcastError('Failed to connect to Blender MCP server. Please ensure it is running on localhost:8080');
    });
  } catch (error) {
    console.error('Failed to connect to Blender:', error);
    setTimeout(connectToBlender, 5000);
  }
}

// Broadcast status to all connected clients
function broadcastStatus(message) {
  connections.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'status',
        message: message
      }));
    }
  });
}

// Broadcast error to all connected clients
function broadcastError(error) {
  connections.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'error',
        error: error
      }));
    }
  });
}

// Handle WebSocket connections from frontend
wss.on('connection', (ws) => {
  const connectionId = Date.now().toString();
  connections.set(connectionId, ws);
  
  console.log(`Frontend client connected: ${connectionId}`);
  
  // Send connection status
  ws.send(JSON.stringify({
    type: 'connection_status',
    connected: blenderWs && blenderWs.readyState === WebSocket.OPEN
  }));

  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log('Message from frontend:', message);
      
      if (message.type === 'command') {
        await handleBlenderCommand(message, ws);
      } else if (message.type === 'render') {
        await handleRenderRequest(message, ws);
      }
    } catch (error) {
      console.error('Error handling frontend message:', error);
      ws.send(JSON.stringify({
        id: message?.id,
        type: 'error',
        error: 'Invalid message format'
      }));
    }
  });

  ws.on('close', () => {
    console.log(`Frontend client disconnected: ${connectionId}`);
    connections.delete(connectionId);
  });

  ws.on('error', (error) => {
    console.error(`WebSocket error for client ${connectionId}:`, error);
  });
});

// Handle Blender commands using MCP protocol
async function handleBlenderCommand(message, clientWs) {
  if (!blenderWs || blenderWs.readyState !== WebSocket.OPEN) {
    clientWs.send(JSON.stringify({
      id: message.id,
      type: 'error',
      error: 'Not connected to Blender MCP server'
    }));
    return;
  }

  try {
    // Convert AI command to MCP format
    const mcpCommand = convertToMCP(message.data);
    
    // Send MCP command to Blender
    blenderWs.send(JSON.stringify(mcpCommand));
    
    // Set up response handler
    const responseHandler = (data) => {
      try {
        const response = JSON.parse(data.toString());
        
        // Check if this is the response to our command
        if (response.id === mcpCommand.id) {
          clientWs.send(JSON.stringify({
            id: message.id,
            type: 'success',
            data: response.result || response
          }));
          
          blenderWs.removeListener('message', responseHandler);
        }
      } catch (error) {
        clientWs.send(JSON.stringify({
          id: message.id,
          type: 'error',
          error: 'Invalid response from Blender'
        }));
      }
    };
    
    blenderWs.on('message', responseHandler);
    
    // Timeout after 15 seconds
    setTimeout(() => {
      blenderWs.removeListener('message', responseHandler);
      clientWs.send(JSON.stringify({
        id: message.id,
        type: 'error',
        error: 'Command timeout'
      }));
    }, 15000);
    
  } catch (error) {
    console.error('Error handling Blender command:', error);
    clientWs.send(JSON.stringify({
      id: message.id,
      type: 'error',
      error: error.message
    }));
  }
}

// Handle render requests
async function handleRenderRequest(message, clientWs) {
  if (!blenderWs || blenderWs.readyState !== WebSocket.OPEN) {
    clientWs.send(JSON.stringify({
      id: message.id,
      type: 'error',
      error: 'Not connected to Blender MCP server'
    }));
    return;
  }

  try {
    const mcpCommand = {
      jsonrpc: "2.0",
      id: Date.now(),
      method: "tools/call",
      params: {
        name: "render_scene",
        arguments: {
          output_path: "/tmp/render.png",
          format: "PNG",
          resolution_x: message.data.resolution?.[0] || 512,
          resolution_y: message.data.resolution?.[1] || 512
        }
      }
    };
    
    blenderWs.send(JSON.stringify(mcpCommand));
    
    const responseHandler = (data) => {
      try {
        const response = JSON.parse(data.toString());
        
        if (response.id === mcpCommand.id) {
          if (response.result && response.result.content) {
            // Extract base64 image data from MCP response
            const imageData = response.result.content.find(c => c.type === 'image');
            if (imageData) {
              clientWs.send(JSON.stringify({
                id: message.id,
                type: 'render_complete',
                data: {
                  image_data: imageData.data
                }
              }));
            } else {
              // Fallback placeholder
              const placeholderImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
              clientWs.send(JSON.stringify({
                id: message.id,
                type: 'render_complete',
                data: {
                  image_data: placeholderImage
                }
              }));
            }
          }
          
          blenderWs.removeListener('message', responseHandler);
        }
      } catch (error) {
        clientWs.send(JSON.stringify({
          id: message.id,
          type: 'error',
          error: 'Invalid render response from Blender'
        }));
      }
    };
    
    blenderWs.on('message', responseHandler);
    
    // Timeout after 30 seconds for renders
    setTimeout(() => {
      blenderWs.removeListener('message', responseHandler);
      clientWs.send(JSON.stringify({
        id: message.id,
        type: 'error',
        error: 'Render timeout'
      }));
    }, 30000);
    
  } catch (error) {
    console.error('Error handling render request:', error);
    clientWs.send(JSON.stringify({
      id: message.id,
      type: 'error',
      error: error.message
    }));
  }
}

// Convert AI agent commands to MCP format
function convertToMCP(aiCommand) {
  const commandId = Date.now();
  
  switch (aiCommand.action) {
    case 'create_sphere':
      return {
        jsonrpc: "2.0",
        id: commandId,
        method: "tools/call",
        params: {
          name: "create_object",
          arguments: {
            object_type: "sphere",
            location: aiCommand.parameters.location || [0, 0, 0],
            scale: [aiCommand.parameters.size || 1, aiCommand.parameters.size || 1, aiCommand.parameters.size || 1],
            material: {
              name: `${aiCommand.parameters.color}_material`,
              color: hexToRgba(getColorHex(aiCommand.parameters.color)),
              metallic: aiCommand.parameters.material === 'metallic' ? 1.0 : 0.0,
              roughness: aiCommand.parameters.material === 'metallic' ? 0.1 : 0.5
            }
          }
        }
      };
      
    case 'create_cube':
      return {
        jsonrpc: "2.0",
        id: commandId,
        method: "tools/call",
        params: {
          name: "create_object",
          arguments: {
            object_type: "cube",
            location: aiCommand.parameters.location || [2, 0, 0],
            scale: [aiCommand.parameters.size || 1, aiCommand.parameters.size || 1, aiCommand.parameters.size || 1],
            material: {
              name: `${aiCommand.parameters.color}_material`,
              color: hexToRgba(getColorHex(aiCommand.parameters.color))
            }
          }
        }
      };
      
    case 'create_cylinder':
      return {
        jsonrpc: "2.0",
        id: commandId,
        method: "tools/call",
        params: {
          name: "create_object",
          arguments: {
            object_type: "cylinder",
            location: aiCommand.parameters.location || [-2, 0, 0],
            scale: [1, 1, aiCommand.parameters.height || 2]
          }
        }
      };
      
    case 'rotate_object':
      return {
        jsonrpc: "2.0",
        id: commandId,
        method: "tools/call",
        params: {
          name: "transform_object",
          arguments: {
            operation: "rotate",
            axis: aiCommand.parameters.axis.toLowerCase(),
            angle: aiCommand.parameters.angle,
            target: "active"
          }
        }
      };
      
    case 'scale_object':
      return {
        jsonrpc: "2.0",
        id: commandId,
        method: "tools/call",
        params: {
          name: "transform_object",
          arguments: {
            operation: "scale",
            factor: aiCommand.parameters.factor,
            target: "active"
          }
        }
      };
      
    case 'add_light':
      return {
        jsonrpc: "2.0",
        id: commandId,
        method: "tools/call",
        params: {
          name: "create_light",
          arguments: {
            light_type: aiCommand.parameters.type || "point",
            location: aiCommand.parameters.location || [0, -5, 5],
            energy: aiCommand.parameters.intensity || 10
          }
        }
      };
      
    case 'delete_object':
      return {
        jsonrpc: "2.0",
        id: commandId,
        method: "tools/call",
        params: {
          name: "delete_object",
          arguments: {
            target: aiCommand.parameters.target === 'all' ? 'all' : 'active'
          }
        }
      };
      
    default:
      throw new Error(`Unsupported command: ${aiCommand.action}`);
  }
}

// Helper functions
function getColorHex(colorName) {
  const colors = {
    red: '#FF0000',
    blue: '#0000FF',
    green: '#00FF00',
    yellow: '#FFFF00',
    purple: '#800080',
    orange: '#FFA500',
    pink: '#FFC0CB',
    white: '#FFFFFF',
    black: '#000000',
    gray: '#808080'
  };
  return colors[colorName] || '#808080';
}

function hexToRgba(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255,
    1.0
  ] : [0.5, 0.5, 0.5, 1.0];
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    blenderConnected: blenderWs && blenderWs.readyState === WebSocket.OPEN,
    activeConnections: connections.size
  });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Backend proxy server running on port ${PORT}`);
  console.log('Attempting to connect to Blender MCP server...');
  connectToBlender();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down gracefully...');
  if (blenderWs) {
    blenderWs.close();
  }
  server.close();
});