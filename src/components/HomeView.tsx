import React from 'react';
import { ActiveView } from '../types';

interface HomeViewProps {
  onNavigate: (view: ActiveView) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-[#120d1c] text-[#f4f0ff] flex flex-col items-center justify-center p-6 sm:p-12 select-none">
      {/* Header Container */}
      <div className="text-center mb-16 max-w-xl">
        <div className="text-xs uppercase tracking-[0.25em] text-[#c084fc] mb-4 font-bold">
          SPECIAL ARCHIVE
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#f4f0ff] leading-tight mb-4">
          YUYEON BIRTHDAY<br />SPECIAL ARCHIVE
        </h1>
        <div className="text-[#d8b4fe] text-sm sm:text-base font-normal tracking-wide">
          2026 진유연 생일 기념 스페셜 아카이브
        </div>
      </div>

      {/* Navigation Buttons - StudioBlank Primary Buttons */}
      <div className="flex flex-col gap-4 w-full max-w-[360px]">
        <button
          onClick={() => onNavigate('summerflip')}
          className="w-full bg-[#1c142b] hover:bg-[#c084fc] hover:text-[#0e0817] hover:border-[#c084fc] text-[#f4f0ff] border border-[#523d75] py-4 px-6 rounded-none text-base font-bold tracking-wider transition-all duration-150 cursor-pointer text-center active:scale-[0.98]"
          id="btn-summerflip"
        >
          카드 뒤집기
        </button>

        <button
          onClick={() => onNavigate('miniroom')}
          className="w-full bg-[#1c142b] hover:bg-[#c084fc] hover:text-[#0e0817] hover:border-[#c084fc] text-[#f4f0ff] border border-[#523d75] py-4 px-6 rounded-none text-base font-bold tracking-wider transition-all duration-150 cursor-pointer text-center active:scale-[0.98]"
          id="btn-miniroom"
        >
          생일카페
        </button>

        <button
          onClick={() => onNavigate('visit')}
          className="w-full bg-[#1c142b] hover:bg-[#c084fc] hover:text-[#0e0817] hover:border-[#c084fc] text-[#f4f0ff] border border-[#523d75] py-4 px-6 rounded-none text-base font-bold tracking-wider transition-all duration-150 cursor-pointer text-center active:scale-[0.98]"
          id="btn-visit"
        >
          2026 진유연 생일기념 롤링페이퍼
        </button>
      </div>

      {/* Minimal Footer Stamp */}
      <div className="absolute bottom-8 text-[11px] uppercase tracking-[0.2em] text-[#9d8ba6]">
        STUDIOBLANK / YUYEON 2026
      </div>
    </div>
  );
};

