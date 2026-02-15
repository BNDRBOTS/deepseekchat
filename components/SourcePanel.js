export default function SourcePanel({ highlight, onClose }) {
  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-gray-800 border-l border-gray-700 p-4 shadow-xl overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">
          {highlight.type === 'person' && '👤 Person'}
          {highlight.type === 'organization' && '🏢 Organization'}
          {highlight.type === 'product' && '📦 Product'}
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
      </div>
      
      <div className="mb-4">
        <div className="text-lg font-bold text-deepseek-400">{highlight.text}</div>
      </div>

      <div className="space-y-3">
        <div className="bg-gray-700 rounded p-3">
          <div className="text-xs text-gray-400 mb-1">Quick facts</div>
          <div className="text-sm">• Mentioned in current conversation</div>
          <div className="text-sm">• Type: {highlight.type}</div>
        </div>

        <div className="bg-gray-700 rounded p-3">
          <div className="text-xs text-gray-400 mb-1">Sources [citation:5]</div>
          <div className="text-sm text-deepseek-400 hover:underline cursor-pointer">
            Search for more information →
          </div>
        </div>

        <div className="bg-gray-700 rounded p-3">
          <div className="text-xs text-gray-400 mb-1">Ask about this</div>
          <button className="text-sm text-deepseek-400 hover:underline block">
            Tell me more about {highlight.text}
          </button>
          <button className="text-sm text-deepseek-400 hover:underline block mt-1">
            What's the context?
          </button>
        </div>
      </div>
    </div>
  );
}
