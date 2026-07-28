import React, { useState, useEffect } from 'react';

// Supabase 직접 연동 설정
const SUPABASE_URL = "https://tuqwintstnimajksseir.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1cXdpbnRzdG5pbWFqa3NzZWlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyMjM5OTEsImV4cCI6MjEwMDc5OTk5MX0.EhvBzznSEbf9WgWabcA6Sfx4Qfz5-7Sw_1rRzPFaJO8";
const PAGE_ID = "yuyeon_birthday_external";

interface GuestbookItem {
  id?: string;
  page_id: string;
  nickname: string;
  content: string;
  created_at: string;
}

export const GuestbookView: React.FC = () => {
  const [messages, setMessages] = useState<GuestbookItem[]>([]);
  const [nickname, setNickname] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  // 1. Supabase REST API로 방명록 데이터 불러오기
  const fetchMessages = async () => {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/guestbook?page_id=eq.${PAGE_ID}&order=created_at.desc`,
        {
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            Accept: "application/json",
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      } else {
        console.error("방명록 로딩 실패:", await res.text());
      }
    } catch (err) {
      console.error("방명록 요청 에러:", err);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // 2. Supabase REST API로 방명록 작성하기
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim() || !content.trim()) {
      alert("닉네임과 내용을 모두 입력해 주세요!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/guestbook`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=representation", // 작성 완료 후 생성된 데이터 반환
        },
        body: JSON.stringify({
          page_id: PAGE_ID,
          nickname: nickname.trim(),
          content: content.trim(),
        }),
      });

      if (res.ok) {
        setNickname('');
        setContent('');
        fetchMessages(); // 작성 완료 후 방명록 목록 즉시 새로고침
      } else {
        const errText = await res.text();
        alert(`저장 실패: ${errText}`);
      }
    } catch (err) {
      console.error("방명록 작성 에러:", err);
      alert("방명록을 저장하지 못했습니다. 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#FAFAFA] flex flex-col items-center justify-start pt-20 sm:pt-24 pb-16 px-4 select-none">
      {/* 타이틀 헤더 */}
      <div className="text-center mb-8 max-w-xl px-2">
        <div className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#c084fc] mb-1 font-bold">
          GUESTBOOK
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#FAFAFA] mb-2">
          방명록을 남겨주세요
        </h1>
        <p className="text-[11px] sm:text-xs text-[#A1A1AA] leading-normal break-keep">
          유연이의 생일을 축하하는 한마디를 자유롭게 남겨주세요!
        </p>
      </div>

      {/* 방명록 작성 폼 */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl bg-[#18181B] border border-[#3F3F46] p-4 sm:p-6 mb-8 space-y-4 shadow-xl"
      >
        <div>
          <label className="block text-xs font-bold text-[#A1A1AA] mb-1 uppercase tracking-wider">
            닉네임
          </label>
          <input
            type="text"
            placeholder="닉네임을 입력하세요"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={20}
            className="w-full bg-[#0A0A0A] border border-[#3F3F46] focus:border-[#c084fc] text-xs text-[#FAFAFA] px-3 py-2.5 outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#A1A1AA] mb-1 uppercase tracking-wider">
            메시지
          </label>
          <textarea
            placeholder="축하 메시지를 입력하세요 (최대 200자)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={200}
            rows={4}
            className="w-full bg-[#0A0A0A] border border-[#3F3F46] focus:border-[#c084fc] text-xs text-[#FAFAFA] p-3 outline-none transition-colors resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-[#a855f7] hover:bg-[#c084fc] text-[#FAFAFA] font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer active:scale-95"
        >
          {loading ? "등록 중..." : "메시지 남기기"}
        </button>
      </form>

      {/* 방명록 데이터 목록 */}
      <div className="w-full max-w-xl space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-12 bg-[#18181B] border border-[#27272A] text-[#71717A] text-xs">
            첫 번째 축하 메시지를 남겨보세요!
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={msg.id || idx}
              className="bg-[#18181B] border border-[#27272A] p-4 hover:border-[#3F3F46] transition-colors"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-xs text-[#c084fc]">
                  {msg.nickname}
                </span>
                <span className="text-[10px] text-[#71717A] font-mono">
                  {new Date(msg.created_at).toLocaleString('ko-KR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <p className="text-xs text-[#E4E4E7] leading-relaxed whitespace-pre-wrap break-words">
                {msg.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
