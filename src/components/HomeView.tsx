import React from 'react';
import { ActiveView } from '../types';

interface HomeViewProps {
  onNavigate: (view: ActiveView) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#FAFAFA] flex flex-col items-center justify-center p-6 sm:p-12 select-none">
      {/* Header Container */}
      <div className="text-center mb-16 max-w-xl">
        <div className="text-xs uppercase tracking-[0.25em] text-[#c084fc] mb-4 font-bold">
          SPECIAL ARCHIVE
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#FAFAFA] leading-tight mb-4">
          YUYEON BIRTHDAY<br />SPECIAL PAGE
        </h1>
        <div className="text-[#A1A1AA] text-sm sm:text-base font-normal tracking-wide">
          유연이 생일 기념 스페셜 웹페이지
        </div>
      </div>

      {/* Navigation Buttons - StudioBlank Primary Buttons */}
      <div className="flex flex-col gap-4 w-full max-w-[360px]">
        <button
          onClick={() => onNavigate('summerflip')}
          className="w-full bg-[#18181B] hover:bg-[#c084fc] hover:text-[#0A0A0A] hover:border-[#c084fc] text-[#FAFAFA] border border-[#3F3F46] py-4 px-6 rounded-none text-base font-bold tracking-wider transition-all duration-150 cursor-pointer text-center active:scale-[0.98]"
          id="btn-summerflip"
        >
          카드 뒤집기
        </button>

        <button
          onClick={() => onNavigate('miniroom')}
          className="w-full bg-[#18181B] hover:bg-[#c084fc] hover:text-[#0A0A0A] hover:border-[#c084fc] text-[#FAFAFA] border border-[#3F3F46] py-4 px-6 rounded-none text-base font-bold tracking-wider transition-all duration-150 cursor-pointer text-center active:scale-[0.98]"
          id="btn-miniroom"
        >
          생일카페
        </button>

        <button
          onClick={() => onNavigate('visit')}
          className="w-full bg-[#18181B] hover:bg-[#c084fc] hover:text-[#0A0A0A] hover:border-[#c084fc] text-[#FAFAFA] border border-[#3F3F46] py-4 px-6 rounded-none text-base font-bold tracking-wider transition-all duration-150 cursor-pointer text-center active:scale-[0.98]"
          id="btn-visit"
        >
          방명록
        </button>
      </div>

      {/* Minimal Footer Stamp */}
      <div className="absolute bottom-8 text-[11px] uppercase tracking-[0.2em] text-[#52525B]">
        STUDIOBLANK / YUYEON 2026
      </div>
    </div>
  );
};

