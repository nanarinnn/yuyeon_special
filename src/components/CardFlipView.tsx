import React, { useState } from 'react';
import { CARD_FLIP_ITEMS, CardItemData } from '../data/cardImages';
import { Link2, RotateCw, RefreshCw, Image as ImageIcon } from 'lucide-react';

interface CustomCardState extends CardItemData {
  isFlipped: boolean;
  customFrontUrl?: string;
  customBackUrl?: string;
}

export const CardFlipView: React.FC = () => {
  const [cards, setCards] = useState<CustomCardState[]>(
    CARD_FLIP_ITEMS.map((item) => ({
      ...item,
      isFlipped: false,
    }))
  );

  const [editingCardId, setEditingCardId] = useState<number | null>(null);
  const [inputUrl, setInputUrl] = useState('');
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const toggleFlip = (id: number) => {
    setCards((prev) =>
      prev.map((card) =>
        card.id === id ? { ...card, isFlipped: !card.isFlipped } : card
      )
    );
  };

  const flipAll = (status: boolean) => {
    setCards((prev) => prev.map((card) => ({ ...card, isFlipped: status })));
  };

  const openUrlModal = (e: React.MouseEvent, card: CustomCardState) => {
    e.stopPropagation();
    setEditingCardId(card.id);
    setInputUrl(card.customFrontUrl || card.frontImageUrl);
  };

  const saveImageUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCardId === null) return;
    const key = `front-${editingCardId}`;
    setImgErrors((prev) => ({ ...prev, [key]: false }));
    setCards((prev) =>
      prev.map((c) =>
        c.id === editingCardId
          ? { ...c, customFrontUrl: inputUrl.trim(), isFlipped: true }
          : c
      )
    );
    setEditingCardId(null);
    setInputUrl('');
  };

  const handleImageError = (key: string) => {
    setImgErrors((prev) => ({ ...prev, [key]: true }));
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#FAFAFA] flex flex-col items-center justify-start pt-20 sm:pt-24 pb-16 px-2 sm:px-6 select-none">
      {/* Header section */}
      <div className="text-center mb-6 sm:mb-8 max-w-2xl px-2">
        <div className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#c084fc] mb-1 font-bold">
          SUMMER SPECIAL ARCHIVE
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#FAFAFA] mb-2">
          카드를 눌러보세요
        </h1>
        <p className="text-[11px] sm:text-xs text-[#A1A1AA] leading-normal break-keep max-w-md mx-auto">
          YUYEON SPECIAL
        </p>
      </div>

      {/* Action Toolbar */}
      <div className="flex gap-2 sm:gap-3 mb-6 sm:mb-8">
        <button
          onClick={() => flipAll(true)}
          className="px-3.5 py-2 sm:px-5 sm:py-2.5 text-xs font-bold tracking-wider uppercase bg-[#a855f7] text-[#FAFAFA] hover:bg-[#c084fc] hover:text-[#0A0A0A] transition-all cursor-pointer rounded-none flex items-center gap-1.5 shadow-md whitespace-nowrap active:scale-95"
        >
          <RotateCw className="w-3.5 h-3.5 shrink-0" />
          <span className="whitespace-nowrap">전체 뒤집기</span>
        </button>
        <button
          onClick={() => flipAll(false)}
          className="px-3.5 py-2 sm:px-5 sm:py-2.5 text-xs font-bold tracking-wider uppercase bg-transparent text-[#FAFAFA] border border-[#3F3F46] hover:bg-[#27272A] hover:border-[#c084fc] transition-all cursor-pointer rounded-none flex items-center gap-1.5 whitespace-nowrap active:scale-95"
        >
          <RefreshCw className="w-3.5 h-3.5 shrink-0" />
          <span className="whitespace-nowrap">원상복구</span>
        </button>
      </div>

      {/* Image URL Edit Modal */}
      {editingCardId !== null && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <form
            onSubmit={saveImageUrl}
            className="bg-[#18181B] border border-[#3F3F46] p-5 sm:p-6 w-full max-w-md space-y-4 shadow-2xl"
          >
            <div className="flex justify-between items-center text-sm font-bold text-[#FAFAFA]">
              <span>카드 #{editingCardId} 이미지 URL 설정</span>
              <button
                type="button"
                onClick={() => setEditingCardId(null)}
                className="text-[#A1A1AA] hover:text-white p-1"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-[#A1A1AA] break-keep">
              원하는 포토 카드 이미지 URL을 입력하거나, 깃허브 코드에서 <code className="text-[#c084fc]">"image"</code> 경로를 직접 수정하세요.
            </p>
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="image 또는 https://example.com/photo.jpg"
              className="w-full bg-[#0A0A0A] border border-[#3F3F46] focus:border-[#c084fc] text-xs text-[#FAFAFA] px-3 py-2.5 outline-none transition-colors"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingCardId(null)}
                className="px-4 py-2 text-xs text-[#A1A1AA] border border-[#3F3F46] hover:bg-[#27272A]"
              >
                취소
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs bg-[#a855f7] text-[#FAFAFA] font-bold hover:bg-[#c084fc] hover:text-[#0a0a0a]"
              >
                저장
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Responsive Grid: 1~6번 카드 프레임 완벽 동일 */}
      <div className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-6 gap-2.5 sm:gap-3 lg:gap-3 xl:gap-4 w-full max-w-[1360px] justify-items-center perspective-1200 px-1">
        {cards.map((card) => {
          const frontUrl = card.customFrontUrl || card.frontImageUrl;
          const backUrl = card.customBackUrl || card.backImageUrl;

          const backKey = `back-${card.id}`;
          const frontKey = `front-${card.id}`;

          const isBackError = imgErrors[backKey] || backUrl === 'image';
          const isFrontError = imgErrors[frontKey] || frontUrl === 'image';

          const isHorizontal = card.orientation === 'horizontal';

          return (
            <div
              key={card.id}
              onClick={() => toggleFlip(card.id)}
              className="w-full max-w-[155px] sm:max-w-[170px] md:max-w-[150px] lg:max-w-[180px] xl:max-w-[200px] aspect-[2/3] perspective-1000 cursor-pointer select-none group"
              id={`card-${card.id}`}
            >
              <div
                className={`w-full h-full relative preserve-3d transition-transform duration-600 ease-in-out shadow-md group-hover:shadow-[0_0_15px_rgba(192,132,252,0.4)] ${
                  card.isFlipped ? 'rotate-y-180' : ''
                }`}
              >
                {/* DEFAULT FACE (겉면: back_summer) */}
                <div className="absolute inset-0 rounded-none backface-hidden bg-[#18181B] border border-[#3F3F46] overflow-hidden flex flex-col group-hover:border-[#c084fc] transition-colors">
                  <div className="w-full h-full relative flex flex-col items-center justify-center p-2">
                    <img
                      src={backUrl}
                      alt="Back Summer Title"
                      referrerPolicy="no-referrer"
                      onError={() => handleImageError(backKey)}
                      className={`w-full h-full object-cover absolute inset-0 ${
                        isBackError ? 'opacity-0 pointer-events-none' : 'opacity-100'
                      }`}
                    />

                    {isBackError && (
                      <div className="w-full h-full bg-[#18181B] border border-[#27272A] flex flex-col items-center justify-between p-2.5 sm:p-3 text-center">
                        <div className="w-full flex justify-between items-center text-[9px] sm:text-[10px] text-[#A1A1AA] font-mono uppercase">
                          <span>0{card.id}</span>
                          <button
                            onClick={(e) => openUrlModal(e, card)}
                            title="이미지 URL 설정"
                            className="hover:text-white p-0.5"
                          >
                            <Link2 className="w-3 h-3 text-[#c084fc]" />
                          </button>
                        </div>
                        <div className="my-auto flex flex-col items-center">
                          <div className="w-8 h-8 sm:w-9 sm:h-9 border border-[#3F3F46] bg-[#0A0A0A] flex items-center justify-center mb-1.5 sm:mb-2">
                            <ImageIcon className="w-4 h-4 text-[#c084fc]" />
                          </div>
                          <div className="text-[10px] sm:text-xs font-bold tracking-wider text-[#FAFAFA] mb-1 uppercase truncate max-w-[120px]">
                            BACK_SUMMER
                          </div>
                          <div className="text-[9px] sm:text-[10px] font-mono text-[#c084fc] bg-[#0A0A0A] px-1.5 py-0.5 border border-[#3F3F46]">
                            "image"
                          </div>
                        </div>
                        <div className="text-[9px] text-[#A1A1AA] font-mono flex items-center gap-1 whitespace-nowrap">
                          <RotateCw className="w-2.5 h-2.5 text-[#c084fc] shrink-0" />
                          <span>터치하여 뒤집기</span>
                        </div>
                      </div>
                    )}

                    {!isBackError && (
                      <>
                        <div className="absolute top-2 right-2 z-10">
                          <button
                            onClick={(e) => openUrlModal(e, card)}
                            title="이미지 URL 변경"
                            className="bg-black/60 hover:bg-black text-[#A1A1AA] hover:text-white p-1 transition-colors border border-white/20"
                          >
                            <Link2 className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-black/70 backdrop-blur-md border border-[#c084fc]/40 text-[9px] font-bold text-[#fafafa] flex items-center gap-1 uppercase tracking-wider whitespace-nowrap">
                          <RotateCw className="w-2.5 h-2.5 text-[#c084fc]" />
                          <span>터치하여 뒤집기</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* FLIPPED FACE (속면: 뒤집었을 때) */}
                <div className="absolute inset-0 rounded-none backface-hidden rotate-y-180 bg-[#121212] border border-[#c084fc] overflow-hidden flex flex-col items-center justify-center">
                  <div className="w-full h-full relative flex flex-col items-center justify-center p-1 bg-[#121212]">
                    <img
                      src={frontUrl}
                      alt={card.title}
                      referrerPolicy="no-referrer"
                      onError={() => handleImageError(frontKey)}
                      className={`w-full h-full absolute inset-0 ${
                        isHorizontal ? 'object-contain' : 'object-cover'
                      } ${isFrontError ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                    />

                    {isFrontError && (
                      <div className="w-full h-full bg-[#27272A] border border-[#3F3F46] flex flex-col items-center justify-between p-2.5 sm:p-3 text-center">
                        <div className="w-full flex justify-between items-center text-[9px] sm:text-[10px] text-[#A1A1AA] font-mono uppercase">
                          <span>0{card.id}</span>
                          <button
                            onClick={(e) => openUrlModal(e, card)}
                            title="이미지 URL 설정"
                            className="hover:text-white p-0.5"
                          >
                            <Link2 className="w-3 h-3 text-[#c084fc]" />
                          </button>
                        </div>
                        <div className="my-auto flex flex-col items-center">
                          <div className="w-8 h-8 sm:w-9 sm:h-9 border border-[#52525B] bg-[#18181B] flex items-center justify-center mb-1.5 sm:mb-2">
                            <ImageIcon className="w-4 h-4 text-[#c084fc]" />
                          </div>
                          <div className="font-bold text-[10px] sm:text-xs text-[#FAFAFA] tracking-wider uppercase mb-1 truncate max-w-[120px]">
                            PHOTO #{card.id}
                          </div>
                          <div className="text-[9px] sm:text-[10px] font-mono text-[#c084fc] bg-[#18181B] px-1.5 py-0.5 border border-[#3F3F46]">
                            "image"
                          </div>
                        </div>
                        <button
                          onClick={(e) => openUrlModal(e, card)}
                          className="text-[9px] text-[#FAFAFA] underline hover:text-[#c084fc] whitespace-nowrap"
                        >
                          이미지 URL 입력
                        </button>
                      </div>
                    )}

                    {!isFrontError && (
                      <>
                        <div className="absolute top-2 right-2 z-10 flex gap-1">
                          <button
                            onClick={(e) => openUrlModal(e, card)}
                            title="이미지 URL 변경"
                            className="bg-black/70 hover:bg-black text-white p-1 transition-colors border border-white/20"
                          >
                            <Link2 className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-2 pt-4 text-left">
                          <div className="text-[9px] text-[#c084fc] font-mono font-bold tracking-widest uppercase">
                            PHOTO #0{card.id}
                          </div>
                          <div className="text-[10px] sm:text-xs font-bold text-white truncate">
                            {card.title}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
