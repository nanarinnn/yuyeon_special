import React, { useState, useEffect } from 'react';
import { GuestbookMessage } from '../types';

export const GuestbookView: React.FC = () => {
  const [nickname, setNickname] = useState('');
  const [content, setContent] = useState('');
  const [messages, setMessages] = useState<GuestbookMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Fetch messages from shared backend server (which proxies and syncs with Supabase)
  const fetchMessages = async (showLoading = false) => {
    if (showLoading) setLoading(true);

    try {
      const res = await fetch('/api/guestbook');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setMessages(data);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch guestbook messages:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages(true);

    // Auto-polling every 4 seconds to sync live guestbook entries from all visitors
    const interval = setInterval(() => {
      fetchMessages(false);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim() || !content.trim()) return;

    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/guestbook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nickname: nickname.trim(),
          content: content.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setFeedback('방명록이 등록되었습니다!');
        setContent('');
        fetchMessages(false);
      } else {
        setFeedback('등록에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (err) {
      console.error('Guestbook submit error:', err);
      setFeedback('오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#FAFAFA] flex flex-col items-center justify-start pt-24 pb-16 px-4 sm:px-6">
      {/* Title */}
      <div className="text-center mb-8">
        <div className="text-xs uppercase tracking-[0.2em] text-[#c084fc] mb-2 font-bold">
          VISITOR LOG
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#FAFAFA] mb-2">
          방명록
        </h1>
        <div className="text-[#A1A1AA] text-sm font-normal">
          자유롭게 축하 메시지를 남겨주세요!
        </div>
      </div>

      {/* Guestbook Container - StudioBlank Geometric Box */}
      <div className="w-full max-w-[800px] bg-[#18181B] border border-[#3F3F46] rounded-none p-6 sm:p-8 space-y-6">
        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pb-6 border-b border-[#27272A]">
          <div className="flex gap-2">
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="닉네임"
              maxLength={20}
              required
              className="flex-1 bg-[#0A0A0A] border border-[#3F3F46] focus:border-[#c084fc] rounded-none text-[#FAFAFA] px-4 py-3 text-sm outline-none transition-colors"
            />
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="남길 메시지를 적어주세요..."
            required
            className="w-full h-28 bg-[#0A0A0A] border border-[#3F3F46] focus:border-[#c084fc] rounded-none text-[#FAFAFA] px-4 py-3 text-sm outline-none resize-y transition-colors"
          />

          <div className="flex items-center justify-between">
            {feedback && (
              <span className="text-xs font-bold uppercase tracking-wider text-[#c084fc]">
                {feedback}
              </span>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="ml-auto bg-[#a855f7] hover:bg-[#c084fc] hover:text-[#0A0A0A] text-[#FAFAFA] border border-[#a855f7] disabled:opacity-30 font-bold py-3 px-8 rounded-none text-xs sm:text-sm uppercase tracking-wider transition-colors cursor-pointer active:scale-95"
            >
              {submitting ? '작성 중...' : '작성하기'}
            </button>
          </div>
        </form>

        {/* Guestbook List */}
        <div className="flex flex-col gap-4">
          {loading && messages.length === 0 ? (
            <div className="text-center text-[#71717A] py-8 text-sm">
              방명록을 불러오는 중입니다...
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-[#71717A] py-8 text-sm">
              아직 작성된 메시지가 없습니다. 첫 번째 방명록을 남겨주세요!
            </div>
          ) : (
            messages.map((msg, idx) => {
              const formattedDate = new Date(msg.created_at).toLocaleString('ko-KR', {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={msg.id || `${msg.nickname}-${idx}`}
                  className="bg-[#121212] border border-[#27272A] rounded-none p-5 space-y-2 hover:border-[#3F3F46] transition-colors"
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-[#FAFAFA] tracking-wide">{msg.nickname}</span>
                    <span className="text-[#71717A] font-mono text-[11px]">
                      {formattedDate}
                    </span>
                  </div>
                  <div className="text-sm text-[#D4D4D8] leading-relaxed whitespace-pre-wrap break-words">
                    {msg.content}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

