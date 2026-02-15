import { useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

export default function Sidebar({ 
  isOpen, 
  pinnedChats, 
  setPinnedChats,
  tabs,
  setTabs,
  activeTab,
  setActiveTab 
}) {
  const [showPinned, setShowPinned] = useState(true);
  const [showTabs, setShowTabs] = useState(true);

  // Tab grouping [citation:1][citation:9]
  const createTabGroup = (tabIds, groupName) => {
    const updated = tabs.map(tab => 
      tabIds.includes(tab.id) 
        ? { ...tab, group: groupName, groupEmoji: '📁' } 
        : tab
    );
    setTabs(updated);
  };

  return (
    <aside className={`${isOpen ? 'w-64' : 'w-0'} bg-gray-800 border-r border-gray-700 transition-all duration-300 overflow-hidden flex flex-col`}>
      {/* App directory section [citation:5] */}
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Apps</h3>
        <div className="space-y-1">
          <button className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-gray-700 flex items-center gap-2">
            <span className="text-deepseek-400">📋</span> Tasks
          </button>
          <button className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-gray-700 flex items-center gap-2">
            <span className="text-deepseek-400">❤️</span> Health
          </button>
          <button className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-gray-700 flex items-center gap-2">
            <span className="text-deepseek-400">📊</span> Finance
          </button>
        </div>
      </div>

      {/* Pinned chats [citation:5] */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pinned</h3>
          <button onClick={() => setShowPinned(!showPinned)} className="text-gray-400 hover:text-white">
            {showPinned ? '−' : '+'}
          </button>
        </div>
        {showPinned && (
          <div className="space-y-1">
            {pinnedChats.map(chat => (
              <div key={chat.id} className="group flex items-center justify-between px-2 py-1.5 text-sm rounded hover:bg-gray-700">
                <span className="truncate">📌 {chat.title}</span>
                <button 
                  onClick={() => {
                    const updated = pinnedChats.filter(c => c.id !== chat.id);
                    setPinnedChats(updated);
                    localStorage.setItem('pinnedChats', JSON.stringify(updated));
                  }}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabs with groups [citation:1][citation:9] */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tabs</h3>
          <button 
            onClick={() => {
              const newTab = { id: Date.now().toString(), name: 'New Chat', pinned: false };
              setTabs([...tabs, newTab]);
              setActiveTab(newTab.id);
            }}
            className="text-gray-400 hover:text-white text-sm"
          >
            +
          </button>
        </div>
        
        {/* Group by tab groups */}
        {Object.entries(
          tabs.reduce((acc, tab) => {
            const group = tab.group || 'Ungrouped';
            if (!acc[group]) acc[group] = [];
            acc[group].push(tab);
            return acc;
          }, {})
        ).map(([groupName, groupTabs]) => (
          <div key={groupName} className="mb-3">
            {groupName !== 'Ungrouped' && (
              <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                <span>{groupTabs[0].groupEmoji || '📁'}</span> {groupName}
              </div>
            )}
            <div className="space-y-1">
              {groupTabs.map(tab => (
                <div
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group flex items-center justify-between px-2 py-1.5 text-sm rounded cursor-pointer ${
                    activeTab === tab.id ? 'bg-gray-700 text-white' : 'hover:bg-gray-700'
                  }`}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    const groupName = prompt('Enter group name (or leave empty to remove from group):');
                    if (groupName !== null) {
                      const updated = tabs.map(t => 
                        t.id === tab.id 
                          ? { ...t, group: groupName || undefined, groupEmoji: groupName ? '📁' : undefined }
                          : t
                      );
                      setTabs(updated);
                    }
                  }}
                >
                  <span className="truncate">{tab.name}</span>
                  <button className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white ml-2">
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
