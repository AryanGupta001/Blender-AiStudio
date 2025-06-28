export class BlenderConnection {
  private ws: WebSocket | null = null;
  private backendUrl: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000;

  public onConnectionChange?: (connected: boolean) => void;
  public onMessage?: (message: string) => void;
  public onError?: (error: string) => void;

  constructor() {
    // Use environment variable if available, otherwise fall back to localhost
    this.backendUrl = import.meta.env.VITE_BACKEND_WS_URL || 'ws://localhost:3001';
  }

  connect(): void {
    try {
      this.ws = new WebSocket(this.backendUrl);
      
      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.onConnectionChange?.(true);
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          this.onError?.('Failed to parse message from server');
        }
      };

      this.ws.onclose = () => {
        this.onConnectionChange?.(false);
        this.attemptReconnect();
      };

      this.ws.onerror = () => {
        this.onError?.('WebSocket connection error');
      };
    } catch (error) {
      this.onError?.('Failed to establish connection to backend');
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  async sendCommand(command: any): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('Not connected to Blender MCP server');
    }

    return new Promise((resolve, reject) => {
      const messageId = Date.now().toString();
      const message = {
        id: messageId,
        type: 'command',
        data: command
      };

      // Set up response handler
      const responseHandler = (event: MessageEvent) => {
        try {
          const response = JSON.parse(event.data);
          if (response.id === messageId) {
            this.ws?.removeEventListener('message', responseHandler);
            if (response.type === 'success') {
              resolve();
            } else {
              reject(new Error(response.error || 'Command failed'));
            }
          }
        } catch (error) {
          reject(new Error('Invalid response from server'));
        }
      };

      this.ws.addEventListener('message', responseHandler);
      this.ws.send(JSON.stringify(message));

      // Timeout after 10 seconds
      setTimeout(() => {
        this.ws?.removeEventListener('message', responseHandler);
        reject(new Error('Command timeout'));
      }, 10000);
    });
  }

  async requestRender(): Promise<string> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('Not connected to Blender MCP server');
    }

    return new Promise((resolve, reject) => {
      const messageId = Date.now().toString();
      const message = {
        id: messageId,
        type: 'render',
        data: {
          output_path: '/tmp/render.png',
          format: 'PNG',
          resolution: [512, 512]
        }
      };

      const responseHandler = (event: MessageEvent) => {
        try {
          const response = JSON.parse(event.data);
          if (response.id === messageId) {
            this.ws?.removeEventListener('message', responseHandler);
            if (response.type === 'render_complete') {
              resolve(response.data.image_data); // Base64 encoded image
            } else {
              reject(new Error(response.error || 'Render failed'));
            }
          }
        } catch (error) {
          reject(new Error('Invalid response from server'));
        }
      };

      this.ws.addEventListener('message', responseHandler);
      this.ws.send(JSON.stringify(message));

      // Timeout after 30 seconds for renders
      setTimeout(() => {
        this.ws?.removeEventListener('message', responseHandler);
        reject(new Error('Render timeout'));
      }, 30000);
    });
  }

  private handleMessage(data: any): void {
    switch (data.type) {
      case 'status':
        this.onMessage?.(data.message);
        break;
      case 'error':
        this.onError?.(data.error);
        break;
      case 'log':
        this.onMessage?.(data.message);
        break;
      default:
        // Handle other message types as needed
        break;
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.onError?.('Maximum reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    
    setTimeout(() => {
      this.onMessage?.(`Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      this.connect();
    }, this.reconnectDelay);
  }
}