import React from 'react';
import { ActiveView } from '../types';
import { ArrowLeft } from 'lucide-react';

interface NavbarProps {
  currentView: ActiveView;
  onNavigateHome: () => void;
}

const VIEW_TITLES: Record<ActiveView, string> = {
  home: '',
  summerflip: 'CARD FLIP ARCHIVE',
  miniroom: '3D MINIROOM',
  visit: 'GUESTBOOK',
};

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigateHome }) => {
  if (currentView === 'home') return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#27272A] px-3 sm:px-6 h-14 flex items-center justify-between shadow-lg">
      <button
        onClick={onNavigateHome}
        className="bg-[#18181B] text-[#FAFAFA] hover:bg-[#27272A] hover:border-[#c084fc] border border-[#3F3F46] px-3 sm:px-4 py-1.5 text-xs font-bold tracking-wider uppercase transition-all duration-150 cursor-pointer flex items-center gap-1.5 rounded-none whitespace-nowrap active:scale-95 shrink-0"
        id="home-back-button"
      >
        <ArrowLeft className="w-3.5 h-3.5 text-[#c084fc]" />
        <span className="whitespace-nowrap">HOME</span>
      </button>

      <span className="text-[11px] sm:text-xs font-mono font-bold tracking-widest text-[#A1A1AA] uppercase truncate pl-2">
        {VIEW_TITLES[currentView]}
      </span>
    </header>
  );
};
