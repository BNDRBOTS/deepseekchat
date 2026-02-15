import { useState, useRef, useEffect } from 'react';

export default function InputBar({ onSubmit, loading, mode }) {
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-focus
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Handle file upload
      console.log('File selected:', file.name);
      // In production, upload to server and get reference
    }
    setShowPlusMenu(false);
  };

  const getPlaceholder = () => {
    switch(mode) {
      case 'learn': return 'Ask to learn step by step...';
      case 'research': return 'Enter a research question...';
      case 'council': return 'Ask with multiple models...';
      default: return 'Type your message... (⌘K to focus)';
    }
  };

  return (
    <form onSubmit={onSubmit} className="border-t border-gray-700 p-4">
      <div className="max-w-3xl mx-auto relative">
        <div className="flex items-center bg-gray-800 rounded-lg border border-gray-700 focus-within:border-deepseek-500 transition">
          {/* + menu for files/modes [citation:2] */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowPlusMenu(!showPlusMenu)}
              className="px-3 py-2 text-gray-400 hover:text-white"
            >
              <span className="text-xl">+</span>
            </button>
            
            {showPlusMenu && (
              <div className="absolute bottom-full left-0 mb-2 w-48 bg-gray-800 rounded-lg border border-gray-700 shadow-xl">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full text-left px-4 py-2 hover:bg-gray-700 text-sm"
                >
                  📎 Upload file
                </button>
                <button
                  type="button"
                  className="w-full text-left px-4 py-2 hover:bg-gray-700 text-sm"
                  onClick={() => {
                    // Switch to research mode
                    setShowPlusMenu(false);
                  }}
                >
                  🔍 Deep Research
                </button>
                <button
                  type="button"
                  className="w-full text-left px-4 py-2 hover:bg-gray-700 text-sm"
                  onClick={() => {
                    // Switch to council mode
                    setShowPlusMenu(false);
                  }}
                >
                  👥 Model Council
                </button>
                <button
                  type="button"
                  className="w-full text-left px-4 py-2 hover:bg-gray-700 text-sm"
                  onClick={() => {
                    // Switch to learn mode
                    setShowPlusMenu(false);
                  }}
                >
                  📚 Learn step by step
                </button>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          {/* Model indicator [citation:2] */}
          <div className="flex items-center gap-1 px-2 text-sm text-gray-400 border-l border-gray-700">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>DeepSeek</span>
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            id="message-input"
            type="text"
            placeholder={getPlaceholder()}
            className="flex-1 bg-transparent px-3 py-2 focus:outline-none text-gray-100"
            disabled={loading}
            autoComplete="off"
          />

          {/* Send button */}
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-deepseek-400 hover:text-white disabled:opacity-50"
          >
            {loading ? '...' : '→'}
          </button>
        </div>

        {/* Mode indicator [citation:2] */}
        {mode !== 'chat' && (
          <div className="absolute right-0 -top-6 text-xs text-deepseek-400">
            {mode === 'learn' && 'Step-by-step learning mode'}
            {mode === 'research' && 'Deep Research mode'}
            {mode === 'council' && 'Model Council mode'}
          </div>
        )}
      </div>
    </form>
  );
}
