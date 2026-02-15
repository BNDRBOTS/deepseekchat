import { useState } from 'react';
import VisualHighlights from './VisualHighlights';
import SourcePanel from './SourcePanel';

export default function MessageList({ messages, loading, messagesEndRef }) {
  const [selectedHighlight, setSelectedHighlight] = useState(null);

  // Detect entities for highlighting [citation:5]
  const extractHighlights = (text) => {
    const highlights = [];
    // People detection (simple pattern - in production use NLP)
    const peopleMatch = text.match(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g);
    if (peopleMatch) {
      peopleMatch.forEach(person => {
        highlights.push({
          text: person,
          type: 'person',
          start: text.indexOf(person),
          end: text.indexOf(person) + person.length
        });
      });
    }
    
    // Organization detection
    const orgMatch = text.match(/\b[A-Z][a-z]+ (Inc|Corp|LLC|Company|Ltd)\b/g);
    if (orgMatch) {
      orgMatch.forEach(org => {
        highlights.push({
          text: org,
          type: 'organization',
          start: text.indexOf(org),
          end: text.indexOf(org) + org.length
        });
      });
    }

    // Product detection
    const productMatch = text.match(/\b(DeepSeek|ChatGPT|Perplexity|Claude|Gemini)\b/g);
    if (productMatch) {
      productMatch.forEach(prod => {
        highlights.push({
          text: prod,
          type: 'product',
          start: text.indexOf(prod),
          end: text.indexOf(prod) + prod.length
        });
      });
    }

    return highlights.sort((a, b) => a.start - b.start);
  };

  // Render message with highlights [citation:5]
  const renderMessageWithHighlights = (content) => {
    const highlights = extractHighlights(content);
    if (highlights.length === 0) return <span>{content}</span>;

    const parts = [];
    let lastIndex = 0;

    highlights.forEach((h, i) => {
      // Add text before highlight
      if (h.start > lastIndex) {
        parts.push(content.substring(lastIndex, h.start));
      }
      
      // Add highlighted text
      parts.push(
        <mark
          key={i}
          onClick={() => setSelectedHighlight(h)}
          className="bg-deepseek-500/20 text-deepseek-300 cursor-pointer hover:bg-deepseek-500/30 rounded px-0.5 transition"
        >
          {h.text}
        </mark>
      );
      
      lastIndex = h.end;
    });

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex));
    }

    return <span>{parts}</span>;
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((msg, idx) => (
        <div
          key={idx}
          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-2xl rounded-lg p-4 ${
              msg.role === 'user'
                ? 'bg-deepseek-600 text-white'
                : msg.error
                ? 'bg-red-900/50 text-red-200'
                : 'bg-gray-800 text-gray-100'
            }`}
          >
            {msg.role === 'assistant' ? (
              <>
                <div className="prose prose-invert max-w-none">
                  {renderMessageWithHighlights(msg.content)}
                </div>
                
                {/* Memory recall indicator [citation:2] */}
                {msg.memoryRecall && (
                  <div className="mt-2 text-xs text-gray-400 border-t border-gray-700 pt-2">
                    Recalled {msg.memoryRecall.count} past conversations 
                    ({(msg.memoryRecall.confidence * 100).toFixed(0)}% confidence)
                  </div>
                )}

                {/* Verification results [citation:3][citation:7] */}
                {msg.verification && (
                  <div className={`mt-2 text-xs ${msg.verification.passed ? 'text-green-400' : 'text-yellow-400'}`}>
                    {msg.verification.passed ? '✓ Verified' : '⚠ Validation issues'}
                  </div>
                )}
              </>
            ) : (
              msg.content
            )}
            
            <div className="mt-1 text-xs opacity-50">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>
      ))}

      {loading && (
        <div className="flex justify-start">
          <div className="bg-gray-800 text-gray-100 rounded-lg p-4">
            <span className="animate-pulse">▌</span>
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />

      {/* Source panel for highlights [citation:5] */}
      {selectedHighlight && (
        <SourcePanel 
          highlight={selectedHighlight} 
          onClose={() => setSelectedHighlight(null)} 
        />
      )}
    </div>
  );
}
