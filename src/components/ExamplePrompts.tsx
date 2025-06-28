import React from 'react';
import { Lightbulb, Sparkles } from 'lucide-react';

interface ExamplePromptsProps {
  onExampleClick: (example: string) => void;
}

const ExamplePrompts: React.FC<ExamplePromptsProps> = ({ onExampleClick }) => {
  const examples = [
    "Create a shiny metallic sphere with a blue tint",
    "Add a wooden cube next to the sphere",
    "Make a forest scene with 5 tall pine trees",
    "Create a futuristic spaceship with glowing parts",
    "Add a red sports car in the center",
    "Rotate the last object 45 degrees on the Y axis",
    "Scale the sphere to be twice as large",
    "Add a bright white spotlight from above",
    "Create an alien landscape with strange rock formations",
    "Make the sphere bounce with keyframe animation"
  ];

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-yellow-400" />
        Example Prompts
      </h2>
      
      <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
        {examples.map((example, index) => (
          <button
            key={index}
            onClick={() => onExampleClick(example)}
            className="w-full text-left p-3 bg-black/20 hover:bg-black/30 border border-white/10 hover:border-white/20 rounded-lg transition-all duration-200 text-sm text-gray-300 hover:text-white group"
          >
            <div className="flex items-start gap-2">
              <Sparkles className="w-3 h-3 text-blue-400 mt-1 opacity-60 group-hover:opacity-100" />
              <span>{example}</span>
            </div>
          </button>
        ))}
      </div>
      
      <p className="text-xs text-gray-400 mt-4">
        Click any example to use it as a starting point for your own creations.
      </p>
    </div>
  );
};

export default ExamplePrompts;