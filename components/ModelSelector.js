import { useState } from 'react';

export default function ModelSelector({ 
  mode, setMode,
  selectedModel, setSelectedModel,
  temperature, setTemperature,
  structuredMode, setStructuredMode
}) {
  const [showSettings, setShowSettings] = useState(false);
  const [warmth, setWarmth] = useState(3); // 1-5 scale [citation:5]
  const [enthusiasm, setEnthusiasm] = useState(3);
  const [useEmojis, setUseEmojis] = useState(true);

  return (
    <div className="relative">
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="text-gray-400 hover:text-white px-3 py-1.5 rounded-lg border border-gray-700 hover:border-gray-600 transition text-sm"
      >
        ⚙️ Settings
      </button>

      {showSettings && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-gray-800 rounded-lg border border-gray-700 shadow-xl p-4 z-50">
          <h3 className="text-sm font-semibold mb-3">Model Settings</h3>
          
          {/* Mode selector [citation:2] */}
          <div className="mb-4">
            <label className="block text-xs text-gray-400 mb-1">Mode</label>
            <select 
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm"
            >
              <option value="chat">Chat</option>
              <option value="learn">Step-by-step Learning</option>
              <option value="research">Deep Research</option>
              <option value="council">Model Council</option>
            </select>
          </div>

          {/* Warmth control (1-5) [citation:5] */}
          <div className="mb-4">
            <label className="block text-xs text-gray-400 mb-1">
              Warmth: {warmth}/5
            </label>
            <input 
              type="range" 
              min="1" 
              max="5" 
              value={warmth}
              onChange={(e) => setWarmth(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Enthusiasm control [citation:5] */}
          <div className="mb-4">
            <label className="block text-xs text-gray-400 mb-1">
              Enthusiasm: {enthusiasm}/5
            </label>
            <input 
              type="range" 
              min="1" 
              max="5" 
              value={enthusiasm}
              onChange={(e) => setEnthusiasm(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Temperature (deterministic vs creative) [citation:7] */}
          <div className="mb-4">
            <label className="block text-xs text-gray-400 mb-1">
              Temperature: {temperature} {temperature === 0.15 && '(deterministic)'}
            </label>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.05"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Toggles */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <input 
                type="checkbox" 
                checked={useEmojis}
                onChange={(e) => setUseEmojis(e.target.checked)}
              />
              Use emojis [citation:5]
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input 
                type="checkbox" 
                checked={structuredMode}
                onChange={(e) => setStructuredMode(e.target.checked)}
              />
              Structured output (JSON) [citation:7]
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
