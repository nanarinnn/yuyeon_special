import React, { useState } from 'react';
import { CARD_FLIP_ITEMS, CardItemData } from './cardImages'; // cardImages.ts 파일 경로에 맞게 확인해주세요!

export default function CardFlipView() {
  // 각 카드가 뒤집혔는지 상태 관리 (id: isFlipped)
  const [flippedCards, setFlippedCards] = useState<{ [key: number]: boolean }>({});

  // 전체 뒤집기 / 원상복구 상태
  const toggleFlip = (id: number) => {
    setFlippedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const flipAll = (isFlipped: boolean) => {
    const newState: { [key: number]: boolean } = {};
    CARD_FLIP_ITEMS.forEach((item) => {
      newState[item.id] = isFlipped;
    });
    setFlippedCards(newState);
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white p-6 flex flex-col items-center">
      {/* 헤더 영역 */}
      <header className="text-center my-8">
        <p className="text-purple-400 font-bold tracking-widest text-sm mb-1">
          SUMMER SPECIAL ARCHIVE
        </p>
        <h1 className="text-4xl font-extrabold mb-4">카드를 눌러보세요</h1>
        
        {/* 상단 컨트롤 버튼 */}
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={() => flipAll(true)}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition"
          >
            🔄 전체 뒤집기
          </button>
          <button
            onClick={() => flipAll(false)}
            className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 text-white rounded-lg font-semibold transition"
          >
            🔄 원상복구
          </button>
        </div>
      </header>

      {/* 카드 그리드 영역 */}
      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl w-full px-4">
        {CARD_FLIP_ITEMS.map((card: CardItemData) => {
          const isFlipped = !!flippedCards[card.id];

          return (
            <div
              key={card.id}
              onClick={() => toggleFlip(card.id)}
              className="cursor-pointer group perspective-1000 flex flex-col items-center"
            >
              {/* 3D 플립 카드 래퍼 */}
              <div
                className={`relative w-full transition-transform duration-700 transform-style-3d ${
                  isFlipped ? 'rotate-y-180' : ''
                }`}
                // 앞면이 horizontal이면 가로 비율(16/9), vertical이면 세로 비율(3/4)
                style={{
                  aspectRatio: card.orientation === 'horizontal' ? '16 / 9' : '3 / 4',
                }}
              >
                {/* 1. 카드 앞면 (Front) */}
                <div className="absolute inset-0 w-full h-full backface-hidden rounded-xl overflow-hidden border border-purple-500/30 shadow-lg bg-neutral-800">
                  <img
                    src={card.frontImageUrl}
                    alt={card.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                    <span className="text-xs font-bold text-purple-300">
                      #{card.id} ({card.orientation})
                    </span>
                    <h3 className="text-sm font-semibold">{card.title}</h3>
                  </div>
                </div>

                {/* 2. 카드 뒷면 (Back - 뒤집혔을 때 세로 이미지 채움) */}
                <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-xl overflow-hidden border border-purple-500/50 shadow-lg bg-neutral-800">
                  <img
                    src={card.backImageUrl}
                    alt={`${card.title} Back`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* 카드 하단 캡션 */}
              <p className="mt-3 text-xs text-neutral-400 group-hover:text-purple-300 transition">
                {isFlipped ? '◀ 클릭하여 앞면 보기' : '▶ 클릭하여 뒷면 보기'}
              </p>
            </div>
          );
        })}
      </main>
    </div>
  );
}
