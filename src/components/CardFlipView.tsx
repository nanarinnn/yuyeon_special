import React, { useState } from 'react';
import { CARD_FLIP_ITEMS, CardItemData } from '../cardImages';

export function CardFlipView() {
  const [flippedCards, setFlippedCards] = useState<{ [key: number]: boolean }>({});

  const toggleFlip = (id: number) => {
    setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const flipAll = (isFlipped: boolean) => {
    const newState: { [key: number]: boolean } = {};
    CARD_FLIP_ITEMS.forEach((item) => {
      newState[item.id] = isFlipped;
    });
    setFlippedCards(newState);
  };

  return (
    <div className="py-12 px-4 max-w-7xl mx-auto flex flex-col items-center">
      {/* 타이틀 및 버튼 헤더 */}
      <div className="text-center mb-10">
        <p className="text-purple-400 text-xs font-bold tracking-widest uppercase mb-1">
          SUMMER SPECIAL ARCHIVE
        </p>
        <h2 className="text-3xl font-extrabold mb-6">카드를 눌러보세요</h2>
        
        <div className="flex justify-center gap-3">
          <button
            onClick={() => flipAll(true)}
            className="px-4 py-2 bg-[#6c5ce7] hover:bg-[#5b4bc4] text-white text-sm font-semibold rounded-lg transition"
          >
            🔄 전체 뒤집기
          </button>
          <button
            onClick={() => flipAll(false)}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white text-sm font-semibold rounded-lg transition"
          >
            🔄 원상복구
          </button>
        </div>
      </div>

      {/* 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-5xl">
        {CARD_FLIP_ITEMS.map((card: CardItemData) => {
          const isFlipped = !!flippedCards[card.id];

          return (
            <div
              key={card.id}
              onClick={() => toggleFlip(card.id)}
              className="cursor-pointer perspective-1000 flex flex-col items-center"
            >
              {/* 3D 플립 카드 프레임 */}
              <div
                className={`relative w-full transition-transform duration-700 transform-style-3d ${
                  isFlipped ? 'rotate-y-180' : ''
                }`}
                /* ⭐️ 핵심: orientation이 'horizontal'이면 16/9(가로), 세로면 3/4 비율 적용 */
                style={{
                  aspectRatio: card.orientation === 'horizontal' ? '16 / 9' : '3 / 4',
                }}
              >
                {/* 카드 앞면 (3~6번은 가로 비율로 보임) */}
                <div className="absolute inset-0 w-full h-full backface-hidden rounded-xl overflow-hidden border border-purple-500/20 shadow-lg bg-[#18181c]">
                  <img
                    src={card.frontImageUrl}
                    alt={card.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                    <span className="text-[10px] font-bold text-purple-400">
                      0{card.id}
                    </span>
                    <h3 className="text-sm font-bold text-white">{card.title}</h3>
                  </div>
                </div>

                {/* 카드 뒷면 (세로 이미지가 프레임 안을 채움) */}
                <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-xl overflow-hidden border border-purple-500/40 shadow-lg bg-[#18181c]">
                  <img
                    src={card.backImageUrl}
                    alt={`${card.title} Back`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
