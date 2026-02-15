import { useState, useRef, useEffect } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import MessageList from '../components/MessageList';
import InputBar from '../components/InputBar';
import ModelSelector from '../components/ModelSelector';
import { memoryStore } from '../lib/memoryStore';

export default function Home({ pinnedChats, setPinnedChats, activeTab }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('chat'); // chat, learn, research, council [citation:2]
  const [selectedModel, setSelectedModel] = useState('deepseek-chat');
  const [temperature, setTemperature] = useState(0.15); // deterministic by default [citation:7]
  const [structuredMode, setStructuredMode] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Command+K for search [citation:1]
  useHotkeys('cmd+k', () => {
    document.getElementById('message-input')?.focus();
  });

  const sendMessage = async (e) => {
    e.preventDefault();
    const input = document.getElementById('message-input')?.value;
    if (!input?.trim() || loading) return;

    const userMessage = { role: 'user', content: input, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMessage]);
    document.getElementById('message-input').value = '';
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          userId: 'current-user',
          mode: mode,
          structuredOutput: structuredMode,
          temperature: temperature
        }),
      });

      const data = await res.json();
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.reply,
        structured: data.structured,
        verification: data.verification,
        memoryRecall: data.memoryRecall,
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, an error occurred.',
        error: true,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const pinCurrentChat = () => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && messages.length > 1) {
      const newPin = {
        id: Date.now().toString(),
        title: messages[0]?.content?.substring(0, 30) + '...',
        preview: lastMessage.content?.substring(0, 50),
        timestamp: new Date().toISOString()
      };
      const updated = [...pinnedChats, newPin];
      setPinnedChats(updated);
      localStorage.setItem('pinnedChats', JSON.stringify(updated));
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-gray-100">
      {/* Header with tabs and pin */}
      <header className="border-b border-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">DeepSeek</h1>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400">Tab:</span>
            <span className="px-2 py-1 bg-gray-800 rounded">{activeTab}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={pinCurrentChat}
            className="text-gray-400 hover:text-white px-3 py-1.5 rounded-lg border border-gray-700 hover:border-gray-600 transition text-sm flex items-center gap-1"
            title="Pin this chat"
          >
            📌 Pin
          </button>
          <ModelSelector 
            mode={mode} 
            setMode={setMode}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            temperature={temperature}
            setTemperature={setTemperature}
            structuredMode={structuredMode}
            setStructuredMode={setStructuredMode}
          />
        </div>
      </header>

      {/* Messages */}
      <MessageList 
        messages={messages} 
        loading={loading} 
        messagesEndRef={messagesEndRef}
      />

      {/* Input */}
      <InputBar 
        onSubmit={sendMessage}
        loading={loading}
        mode={mode}
      />
    </div>
  );
}
