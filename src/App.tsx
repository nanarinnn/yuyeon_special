import React, { useState } from 'react';
import { ActiveView } from './types';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { CardFlipView } from './components/CardFlipView';
import { MiniroomView } from './components/MiniroomView';
import { GuestbookView } from './components/GuestbookView';
import { MinigameView } from './components/MinigameView';
import { Guestbook2026View } from './components/Guestbook2026View';
import { DevNotesView } from './components/DevNotesView';

export default function App() {
  const [currentView, setCurrentView] = useState<ActiveView>('home');

  const handleNavigateHome = () => {
    setCurrentView('home');
  };

  return (
    <div className="min-h-screen bg-[#120d1c] text-[#f4f0ff] font-sans selection:bg-[#9d4edd] selection:text-white">
      {/* Top Navbar Back Button */}
      <Navbar currentView={currentView} onNavigateHome={handleNavigateHome} />

      {/* Main Views */}
      <main className="w-full">
        {currentView === 'home' && (
          <HomeView onNavigate={(view) => setCurrentView(view)} />
        )}
        {currentView === 'summerflip' && <CardFlipView />}
        {currentView === 'miniroom' && <MiniroomView />}
        {currentView === 'visit' && <GuestbookView />}
        {currentView === 'visit2026' && <Guestbook2026View />}
        {currentView === 'minigame' && <MinigameView />}
        {currentView === 'devnotes' && <DevNotesView />}
      </main>
    </div>
  );
}
