import { useState, useEffect } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import Sidebar from '../components/Sidebar';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [pinnedChats, setPinnedChats] = useState([]);
  const [activeTab, setActiveTab] = useState('main');
  const [tabs, setTabs] = useState([{ id: 'main', name: 'Chat', pinned: false }]);

  useHotkeys('cmd+k', () => {
    document.getElementById('global-search')?.focus();
  });

  useHotkeys('cmd+shift+s', () => {
    setSidebarOpen(!sidebarOpen);
  });

  useEffect(() => {
    const saved = localStorage.getItem('pinnedChats');
    if (saved) setPinnedChats(JSON.parse(saved));
  }, []);

  return (
    <>
      <style>{`
        html, body, #__next {
          background-color: #111827;
          color: #f3f4f6;
          height: 100%;
          width: 100%;
          margin: 0;
          padding: 0;
        }
      `}</style>
      <div style={{ display: 'flex', height: '100vh', backgroundColor: '#111827', color: '#f3f4f6' }} className="flex h-screen bg-gray-900 text-gray-100">
        <Sidebar
          isOpen={sidebarOpen}
          pinnedChats={pinnedChats}
          setPinnedChats={setPinnedChats}
          tabs={tabs}
          setTabs={setTabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
        <main className="flex-1 flex flex-col">
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