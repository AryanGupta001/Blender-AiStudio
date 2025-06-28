# Blender AI Studio

A creative, agentic AI web application that allows users to generate and manipulate 3D objects in Blender using natural language commands. Built with React, TypeScript, and WebSocket communication to a local Blender Model Context Protocol (MCP) server.

## Features

- **Natural Language 3D Creation**: Describe what you want to create in plain English
- **Real-time AI Interpretation**: Advanced AI agent translates commands into Blender actions
- **Live WebSocket Communication**: Direct connection to Blender MCP server
- **Interactive Status Updates**: Real-time feedback and error handling
- **Render Preview**: View your 3D creations directly in the browser
- **Creative Prompt Examples**: Get inspired with built-in example commands
- **Responsive Design**: Beautiful, modern interface that works on all devices

## Setup Instructions

### Prerequisites

1. **Blender** (version 3.0 or higher)
2. **Node.js** (version 16 or higher)
3. **Python** (for Blender MCP server dependencies)

### Step 1: Install Blender MCP Server

1. **Clone the Blender MCP repository**:
   ```bash
   git clone https://github.com/AryanGupta001/blender-mcp.git
   cd blender-mcp
   ```

2. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Install as Blender Add-on**:
   - Open Blender
   - Go to `Edit > Preferences > Add-ons`
   - Click "Install..." and select the `blender_mcp` folder
   - Enable the add-on by checking "Interface: Blender MCP Server"

4. **Start the MCP Server in Blender**:
   - In Blender's 3D View, press `N` to show the sidebar
   - Find the "MCP Server" panel
   - Set port to `8080` (default)
   - Click "Start Server"

### Step 2: Install Web Application

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Start the backend proxy server**:
   ```bash
   npm run server
   ```
   This starts the proxy server on `localhost:3001` that bridges communication between the frontend and Blender MCP server.

3. **Start the frontend development server**:
   ```bash
   npm run dev
   ```
   This starts the React application, typically on `localhost:5173`.

4. **Verify Connection**:
   - The application will show connection status in the UI
   - Green indicator means connected to Blender MCP server
   - Red indicator means disconnected - check that Blender MCP server is running

## Blender MCP Server Configuration

The Blender MCP server from [AryanGupta001/blender-mcp](https://github.com/AryanGupta001/blender-mcp) supports the following tools:

### Available Tools

- **create_object** - Create primitive objects (sphere, cube, cylinder, cone, plane)
- **transform_object** - Rotate, scale, and move objects
- **create_light** - Add lights to the scene (point, sun, spot)
- **delete_object** - Remove objects from the scene
- **render_scene** - Generate renders of the current scene
- **create_material** - Create and apply materials to objects

### MCP Protocol Format

The server uses JSON-RPC 2.0 format for communication:

```json
{
  "jsonrpc": "2.0",
  "id": 123,
  "method": "tools/call",
  "params": {
    "name": "create_object",
    "arguments": {
      "object_type": "sphere",
      "location": [0, 0, 0],
      "scale": [1, 1, 1]
    }
  }
}
```

## Usage

### Basic Commands

Type natural language commands in the command center:

- **Object Creation**:
  - "Create a shiny blue sphere"
  - "Add a wooden cube next to the sphere"
  - "Make a red cylinder"

- **Scene Building**:
  - "Create a forest scene with 5 tall trees"
  - "Make an alien landscape with strange rocks"
  - "Add a futuristic spaceship"

- **Transformations**:
  - "Rotate the sphere 45 degrees on the Y axis"
  - "Scale the cube to be twice as large"
  - "Move the object 2 units to the right"

- **Lighting**:
  - "Add a bright spotlight from above"
  - "Create a warm orange light"

- **Materials**:
  - "Make the sphere metallic and shiny"
  - "Apply a wood texture to the cube"

### Advanced Features

- **Contextual Commands**: The AI remembers recent actions, so you can say "make it red" or "rotate that object"
- **Creative Interpretation**: Try abstract prompts like "create something futuristic" or "make an alien world"
- **Iterative Design**: Build and refine your scene step by step through conversation

## Architecture

### Frontend (React + TypeScript)
- **CommandInput**: Natural language input interface
- **StatusLog**: Real-time activity and error logging
- **RenderPreview**: Display rendered images from Blender
- **ConnectionStatus**: Monitor MCP server connection
- **ExamplePrompts**: Predefined creative commands

### AI Agent
- **Command Interpretation**: Parses natural language into structured commands
- **Context Awareness**: Maintains conversation context for iterative design
- **Error Handling**: Provides helpful feedback for unclear commands

### Backend Proxy (Node.js + WebSocket)
- **WebSocket Bridge**: Connects browser to local Blender MCP server
- **MCP Protocol Translation**: Converts AI commands to JSON-RPC 2.0 format
- **Connection Management**: Handles reconnection and error recovery
- **CORS Handling**: Enables secure browser communication

### Communication Flow

1. User enters natural language command
2. AI agent interprets command and generates structured parameters
3. Frontend sends command to backend proxy via WebSocket
4. Proxy translates to MCP JSON-RPC format and forwards to Blender
5. Blender executes command and returns MCP response
6. Status and results flow back to frontend
7. UI updates with feedback and optional render

## Development

### Project Structure

```
src/
├── components/          # React components
│   ├── CommandInput.tsx    # Command input interface
│   ├── StatusLog.tsx       # Activity logging
│   ├── RenderPreview.tsx   # Render display
│   ├── ConnectionStatus.tsx # Connection monitoring
│   └── ExamplePrompts.tsx  # Example commands
├── utils/              # Utility modules
│   ├── aiAgent.ts         # AI command interpretation
│   └── blenderConnection.ts # WebSocket communication
└── App.tsx             # Main application component

server/
└── index.js            # Backend proxy server with MCP support
```

### Key Technologies

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide React
- **Backend**: Node.js, Express, WebSocket (ws)
- **Communication**: WebSocket, JSON-RPC 2.0 (MCP Protocol)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom animations

## Troubleshooting

### Connection Issues

1. **Backend not connecting to Blender**:
   - Verify Blender MCP server is running and started in Blender
   - Check that the MCP server is listening on `localhost:8080`
   - Look for error messages in the backend console
   - Ensure no firewall is blocking the connection

2. **Frontend not connecting to backend**:
   - Ensure backend proxy is running (`npm run server`)
   - Verify it's listening on port 3001
   - Check browser console for WebSocket errors

3. **Commands not working**:
   - Check the activity log for error messages
   - Verify the AI agent is interpreting commands correctly
   - Ensure Blender MCP server supports the required tools
   - Check Blender console for MCP server logs

### Blender MCP Server Issues

1. **Add-on not loading**:
   - Ensure all Python dependencies are installed
   - Check Blender's console for error messages
   - Verify Blender version compatibility (3.0+)

2. **Server not starting**:
   - Check if port 8080 is already in use
   - Look for error messages in Blender's system console
   - Ensure the MCP server add-on is properly enabled

### Performance Issues

- Limit complex scene operations (e.g., max 20 trees in forest scenes)
- Use smaller render resolutions for faster preview updates
- Monitor backend console for memory usage and connection health

## Contributing

This project is designed to be extensible and customizable:

1. **Add new command types**: Extend the AI agent's interpretation logic
2. **Improve UI/UX**: Enhance the React components with new features
3. **Optimize communication**: Improve the WebSocket protocol efficiency
4. **Add new AI capabilities**: Integrate with external LLM APIs for better interpretation

## License

This project is open source and available under the MIT License.