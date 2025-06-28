export interface BlenderCommand {
  action: string;
  description: string;
  parameters: Record<string, any>;
}

export class AIAgent {
  private context: string[] = [];

  async interpretCommand(userCommand: string, lastCommand?: string): Promise<BlenderCommand> {
    // Add command to context for future reference
    this.context.push(userCommand);
    
    // Simple AI interpretation logic (in a real implementation, this would use an LLM API)
    const command = userCommand.toLowerCase();
    
    // Object creation patterns
    if (this.matchesPattern(command, ['create', 'make', 'add']) && this.matchesPattern(command, ['sphere', 'ball'])) {
      return this.createSphere(command);
    }
    
    if (this.matchesPattern(command, ['create', 'make', 'add']) && this.matchesPattern(command, ['cube', 'box'])) {
      return this.createCube(command);
    }
    
    if (this.matchesPattern(command, ['create', 'make', 'add']) && this.matchesPattern(command, ['cylinder'])) {
      return this.createCylinder(command);
    }
    
    // Scene creation patterns
    if (this.matchesPattern(command, ['forest', 'trees'])) {
      return this.createForest(command);
    }
    
    if (this.matchesPattern(command, ['landscape', 'terrain'])) {
      return this.createLandscape(command);
    }
    
    // Transformation patterns
    if (this.matchesPattern(command, ['rotate', 'turn'])) {
      return this.rotateObject(command);
    }
    
    if (this.matchesPattern(command, ['scale', 'resize', 'size'])) {
      return this.scaleObject(command);
    }
    
    if (this.matchesPattern(command, ['move', 'position'])) {
      return this.moveObject(command);
    }
    
    // Lighting patterns
    if (this.matchesPattern(command, ['light', 'lighting', 'spotlight', 'lamp'])) {
      return this.addLight(command);
    }
    
    // Material patterns
    if (this.matchesPattern(command, ['material', 'texture', 'color', 'shiny', 'metallic'])) {
      return this.applyMaterial(command);
    }
    
    // Delete patterns
    if (this.matchesPattern(command, ['delete', 'remove'])) {
      return this.deleteObject(command);
    }
    
    // Fallback for unrecognized commands
    return {
      action: 'unknown',
      description: `Unable to interpret command: "${userCommand}". Try being more specific about what you want to create or modify.`,
      parameters: { originalCommand: userCommand }
    };
  }

  private matchesPattern(text: string, keywords: string[]): boolean {
    return keywords.some(keyword => text.includes(keyword));
  }

  private extractColor(command: string): string {
    const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'white', 'black', 'gray'];
    const foundColor = colors.find(color => command.includes(color));
    return foundColor || 'gray';
  }

  private extractNumber(command: string, context: string): number {
    const regex = new RegExp(`(\\d+(?:\\.\\d+)?)\\s*(?:${context})?`, 'i');
    const match = command.match(regex);
    return match ? parseFloat(match[1]) : 1;
  }

  private createSphere(command: string): BlenderCommand {
    const color = this.extractColor(command);
    const size = this.extractNumber(command, 'size|scale|radius');
    const isShiny = command.includes('shiny') || command.includes('metallic');
    
    return {
      action: 'create_sphere',
      description: `Creating a ${isShiny ? 'shiny ' : ''}${color} sphere`,
      parameters: {
        type: 'sphere',
        color: color,
        size: size,
        material: isShiny ? 'metallic' : 'basic',
        location: [0, 0, 0]
      }
    };
  }

  private createCube(command: string): BlenderCommand {
    const color = this.extractColor(command);
    const size = this.extractNumber(command, 'size|scale');
    const material = command.includes('wood') ? 'wood' : 'basic';
    
    return {
      action: 'create_cube',
      description: `Creating a ${material} ${color} cube`,
      parameters: {
        type: 'cube',
        color: color,
        size: size,
        material: material,
        location: [2, 0, 0]
      }
    };
  }

  private createCylinder(command: string): BlenderCommand {
    const color = this.extractColor(command);
    const height = this.extractNumber(command, 'height|tall');
    
    return {
      action: 'create_cylinder',
      description: `Creating a ${color} cylinder`,
      parameters: {
        type: 'cylinder',
        color: color,
        height: height,
        location: [-2, 0, 0]
      }
    };
  }

  private createForest(command: string): BlenderCommand {
    const treeCount = this.extractNumber(command, 'trees?|count') || 5;
    
    return {
      action: 'create_forest',
      description: `Creating a forest scene with ${treeCount} trees`,
      parameters: {
        type: 'forest',
        tree_count: Math.min(treeCount, 20), // Limit for performance
        area_size: 10,
        tree_types: ['pine', 'oak']
      }
    };
  }

  private createLandscape(command: string): BlenderCommand {
    const isAlien = command.includes('alien') || command.includes('strange');
    
    return {
      action: 'create_landscape',
      description: `Creating ${isAlien ? 'an alien' : 'a natural'} landscape`,
      parameters: {
        type: 'landscape',
        style: isAlien ? 'alien' : 'natural',
        size: 20,
        height_variation: isAlien ? 3 : 1.5
      }
    };
  }

  private rotateObject(command: string): BlenderCommand {
    const angle = this.extractNumber(command, 'degrees?|deg') || 90;
    const axis = command.includes('x') ? 'X' : command.includes('y') ? 'Y' : 'Z';
    
    return {
      action: 'rotate_object',
      description: `Rotating object ${angle} degrees on ${axis} axis`,
      parameters: {
        target: 'last_created',
        axis: axis,
        angle: angle
      }
    };
  }

  private scaleObject(command: string): BlenderCommand {
    const factor = this.extractNumber(command, 'times?|scale|factor') || 2;
    
    return {
      action: 'scale_object',
      description: `Scaling object by factor of ${factor}`,
      parameters: {
        target: 'last_created',
        factor: factor
      }
    };
  }

  private moveObject(command: string): BlenderCommand {
    const distance = this.extractNumber(command, 'units?|distance') || 2;
    
    return {
      action: 'move_object',
      description: `Moving object ${distance} units`,
      parameters: {
        target: 'last_created',
        offset: [distance, 0, 0]
      }
    };
  }

  private addLight(command: string): BlenderCommand {
    const isSpotlight = command.includes('spot');
    const intensity = this.extractNumber(command, 'bright|intensity') || 10;
    
    return {
      action: 'add_light',
      description: `Adding ${isSpotlight ? 'spotlight' : 'point light'}`,
      parameters: {
        type: isSpotlight ? 'spot' : 'point',
        intensity: intensity,
        location: [0, -5, 5],
        target: 'scene_center'
      }
    };
  }

  private applyMaterial(command: string): BlenderCommand {
    const color = this.extractColor(command);
    const isShiny = command.includes('shiny') || command.includes('metallic');
    const material = command.includes('wood') ? 'wood' : 
                    command.includes('metal') ? 'metal' : 
                    command.includes('glass') ? 'glass' : 'basic';
    
    return {
      action: 'apply_material',
      description: `Applying ${isShiny ? 'shiny ' : ''}${material} material in ${color}`,
      parameters: {
        target: 'last_created',
        material_type: material,
        color: color,
        metallic: isShiny,
        roughness: isShiny ? 0.1 : 0.5
      }
    };
  }

  private deleteObject(command: string): BlenderCommand {
    const target = command.includes('all') ? 'all' : 'last_created';
    
    return {
      action: 'delete_object',
      description: `Deleting ${target === 'all' ? 'all objects' : 'last created object'}`,
      parameters: {
        target: target
      }
    };
  }
}