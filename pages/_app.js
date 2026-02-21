import { useState, useEffect } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import Sidebar from '../components/Sidebar';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [pinnedChats, setPinnedChats] = useState([]);
  const [activeTab, setActiveTab] = useState('main');
  const [tabs, setTabs] = useState([{ id: 'main', name: 'Chat', pinned: false }]);

  // Command+K for search, Command+Shift+S for sidebar [citation:1]
  useHotkeys('cmd+k', () => {
    document.getElementById('global-search')?.focus();
  });
  
  useHotkeys('cmd+shift+s', () => {
    setSidebarOpen(!sidebarOpen);
  });

  // Load pinned chats from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('pinnedChats');
    if (saved) setPinnedChats(JSON.parse(saved));
  }, []);

  return (
    <>
      <style dangerouslySetRef={{ __html: `html, body { background-color: #111827; margin: 0; padding: 0; height: 100%; width: 100%; }` }} />
      <div className="flex h-screen w-full bg-gray-900 text-gray-100 overflow-hidden font-sans">
        <Sidebar 
          isOpen={sidebarOpen} 
          pinnedChats={pinnedChats}
          setPinnedChats={setPinnedChats}
          tabs={tabs}
          setTabs={setTabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
        <main className="flex-1 flex flex-col h-full overflow-hidden relative">
          <Component 
            {...pageProps} 
            pinnedChats={pinnedChats}
            setPinnedChats={setPinnedChats}
            activeTab={activeTab}
            tabs={tabs}
          />
        </main>
      </div>
    </>
  );
}

export default MyApp;