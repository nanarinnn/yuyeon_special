import React from 'react';
import { ActiveView } from '../types';

interface HomeViewProps {
  onNavigate: (view: ActiveView) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-[#120d1c] text-[#f4f0ff] flex flex-col items-center justify-center p-6 sm:p-12 select-none">
      {/* Header Container */}
      <div className="text-center mb-12 max-w-xl flex flex-col items-center gap-3">
        <div className="text-xs uppercase tracking-[0.25em] text-[#c084fc] font-bold">
          SPECIAL ARCHIVE
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#f4f0ff] leading-tight">
          YUYEON BIRTHDAY<br />SPECIAL ARCHIVE
        </h1>
      </div>

      {/* Navigation Buttons - StudioBlank Primary Buttons */}
      <div className="flex flex-col gap-4 w-full max-w-[360px]">
        <button
          onClick={() => onNavigate('summerflip')}
          className="w-full bg-[#1c142b] hover:bg-[#c084fc] hover:text-[#0e0817] hover:border-[#c084fc] text-[#f4f0ff] border border-[#523d75] py-4 px-6 rounded-none text-base font-bold tracking-wider transition-all duration-150 cursor-pointer text-center active:scale-[0.98]"
          id="btn-summerflip"
        >
          PHOTO FLIP
        </button>

        <button
          onClick={() => onNavigate('miniroom')}
          className="w-full bg-[#1c142b] hover:bg-[#c084fc] hover:text-[#0e0817] hover:border-[#c084fc] text-[#f4f0ff] border border-[#523d75] py-4 px-6 rounded-none text-base font-bold tracking-wider transition-all duration-150 cursor-pointer text-center active:scale-[0.98]"
          id="btn-miniroom"
        >
          BIRTHDAY CAFE
        </button>

        <button
          onClick={() => onNavigate('minigame')}
          className="w-full bg-[#1c142b] hover:bg-[#c084fc] hover:text-[#0e0817] hover:border-[#c084fc] text-[#f4f0ff] border border-[#523d75] py-4 px-6 rounded-none text-base font-bold tracking-wider transition-all duration-150 cursor-pointer text-center active:scale-[0.98]"
          id="btn-minigame"
        >
          MINIGAME
        </button>

        <button
          onClick={() => onNavigate('visit2026')}
          className="w-full bg-[#1c142b] hover:bg-[#c084fc] hover:text-[#0e0817] hover:border-[#c084fc] text-[#f4f0ff] border border-[#523d75] py-4 px-6 rounded-none text-base font-bold tracking-wider transition-all duration-150 cursor-pointer text-center active:scale-[0.98]"
          id="btn-visit2026"
        >
          2026 ROLLING PAPER
        </button>

        <button
          onClick={() => onNavigate('visit')}
          className="w-full bg-[#1c142b] hover:bg-[#c084fc] hover:text-[#0e0817] hover:border-[#c084fc] text-[#f4f0ff] border border-[#523d75] py-4 px-6 rounded-none text-base font-bold tracking-wider transition-all duration-150 cursor-pointer text-center active:scale-[0.98]"
          id="btn-visit"
        >
          2027 ROLLING PAPER
        </button>
      </div>

      {/* Developer Notes & Minimal Footer Stamp (Small and subtle) */}
      <div className="mt-12 flex flex-col items-center gap-2">
        <button
          onClick={() => onNavigate('devnotes')}
          className="text-[10px] tracking-widest text-[#c084fc]/70 hover:text-[#c084fc] uppercase underline decoration-dotted transition-colors cursor-pointer"
        >
          Developer Notes / 개발자 노트
        </button>
        <div className="text-[11px] uppercase tracking-[0.2em] text-[#9d8ba6] text-center">
          YUYEON 2026
        </div>
      </div>
    </div>
  );
};

