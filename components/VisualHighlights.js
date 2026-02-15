export default function VisualHighlights({ highlights, onSelect }) {
  if (!highlights || highlights.length === 0) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {highlights.map((h, i) => (
        <button
          key={i}
          onClick={() => onSelect(h)}
          className={`text-xs px-2 py-1 rounded-full border ${
            h.type === 'person' ? 'border-purple-500 text-purple-300' :
            h.type === 'organization' ? 'border-blue-500 text-blue-300' :
            'border-green-500 text-green-300'
          } hover:bg-gray-700 transition`}
        >
          {h.text}
        </button>
      ))}
    </div>
  );
}
