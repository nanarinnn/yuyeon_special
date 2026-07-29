import React, { useState, useEffect } from "react";
import { Send, MessageSquare, User, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";

// Supabase 접속 정보 (REST API 직접 연동)
const SUPABASE_URL = "https://tuqwintstnimajksseir.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1cXdpbnRzdG5pbWFqa3NzZWlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyMjM5OTEsImV4cCI6MjEwMDc5OTk5MX0.EhvBzznSEbf9WgWabcA6Sfx4Qfz5-7Sw_1rRzPFaJO8";

interface GuestbookEntry {
  id?: number;
  page_id?: string;
  nickname: string;
  content: string;
  created_at?: string;
}

export const GuestbookView: React.FC = () => {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // 1. Supabase에서 방명록 데이터 불러오기
  const fetchEntries = async () => {
    setIsFetching(true);
    setErrorMsg("");
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/guestbook?select=*&order=created_at.desc`,
        {
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("데이터를 가져오는 데 실패했습니다.");
      }

      const data = await res.json();
      setEntries(data);
    } catch (err: any) {
      console.error("방명록 로딩 오류:", err);
      setErrorMsg("방명록을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  // 2. Supabase로 새 방명록 작성하기 (기존 Supabase 테이블 컬럼: nickname, content, page_id 연동)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      setErrorMsg("이름과 작성 내용을 모두 입력해 주세요.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/guestbook`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          nickname: name.trim(),
          content: message.trim(),
          page_id: "yuyeon_special",
        }),
      });

      if (res.ok) {
        setName("");
        setMessage("");
        setSuccessMsg("방명록이 성공적으로 남겨졌습니다!");
        fetchEntries(); // 새 글 등록 후 목록 갱신
        setTimeout(() => setSuccessMsg(""), 4000);
      } else {
        const errData = await res.json();
        setErrorMsg(`방명록 등록 실패: ${errData.message || "오류가 발생했습니다."}`);
      }
    } catch (err: any) {
      console.error("방명록 작성 오류:", err);
      setErrorMsg("방명록 작성 중 네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#120d1c] text-[#f4f0ff] pt-16 pb-20 px-4 sm:px-8 select-none">
      <div className="max-w-2xl mx-auto space-y-10">
        
        {/* Header Section */}
        <div className="text-center space-y-3 pt-6">
          <div className="text-xs uppercase tracking-[0.25em] text-[#c084fc] font-bold">
            ROLLING PAPER ARCHIVE
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#f4f0ff] uppercase">
            2026 진유연 생일기념 롤링페이퍼
          </h1>
          <p className="text-[#d8b4fe] text-xs sm:text-sm tracking-wide max-w-md mx-auto">
            유연이에게 응원과 축하의 메시지를 남겨주세요! (●'◡'●)
          </p>
        </div>

        {/* Form Card (Purple-Black Design with Higher Contrast & Brightness) */}
        <form
          onSubmit={handleSubmit}
          className="bg-[#1c142b] border border-[#523d75] p-5 sm:p-8 rounded-none space-y-5 shadow-lg shadow-purple-950/20"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold tracking-widest text-[#d8b4fe] uppercase mb-2">
                WRITER NAME / 닉네임
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9d8ba6]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="이름 또는 닉네임을 입력하세요"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#120d1c] border border-[#523d75] text-[#f4f0ff] placeholder-[#7d678f] rounded-none text-sm focus:outline-none focus:border-[#c084fc] transition-colors"
                  maxLength={20}
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold tracking-widest text-[#d8b4fe] uppercase mb-2">
                MESSAGE / 남기실 말씀
              </label>
              <textarea
                placeholder="축하와 응원의 메시지를 자유롭게 남겨주세요..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full p-3.5 bg-[#120d1c] border border-[#523d75] text-[#f4f0ff] placeholder-[#7d678f] rounded-none text-sm focus:outline-none focus:border-[#c084fc] transition-colors resize-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2a1b42] hover:bg-[#c084fc] hover:text-[#0e0817] hover:border-[#c084fc] text-[#f4f0ff] border border-[#6b4c9a] py-3.5 px-6 rounded-none text-sm font-bold tracking-wider uppercase transition-all duration-150 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.99]"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>등록 진행 중...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>롤링페이퍼 남기기</span>
              </>
            )}
          </button>
        </form>

        {/* State Alerts */}
        {errorMsg && (
          <div className="p-4 bg-[#1c142b] border border-red-500/50 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-4 bg-[#1c142b] border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Guestbook List Header */}
        <div className="flex items-center justify-between border-b border-[#3b2d54] pb-3 pt-2">
          <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-[#f4f0ff] uppercase">
            <MessageSquare className="w-4 h-4 text-[#c084fc]" />
            <span>MESSAGES ({entries.length})</span>
          </div>
          <button
            onClick={fetchEntries}
            disabled={isFetching}
            className="flex items-center gap-1.5 text-xs text-[#d8b4fe] hover:text-[#c084fc] transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-[#c084fc]" : ""}`} />
            <span>새로고침</span>
          </button>
        </div>

        {/* Guestbook Entries List */}
        <div className="space-y-4">
          {isFetching && entries.length === 0 ? (
            <div className="text-center py-16 text-[#9d8ba6] space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#c084fc]" />
              <p className="text-xs tracking-widest uppercase">LOADING MESSAGES...</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-16 border border-[#523d75] bg-[#1c142b] text-[#d8b4fe] space-y-2 p-6">
              <MessageSquare className="w-8 h-8 mx-auto text-[#7d678f] mb-2" />
              <p className="text-sm font-semibold text-[#f4f0ff]">작성된 롤링페이퍼가 없습니다.</p>
              <p className="text-xs text-[#9d8ba6]">첫 번째 메시지를 기록해 보세요.</p>
            </div>
          ) : (
            entries.map((item, idx) => {
              const displayName = item.nickname || (item as any).name || "익명";
              const displayContent = item.content || (item as any).message || "";
              return (
                <div
                  key={item.id || `${item.created_at}-${idx}`}
                  className="p-5 bg-[#1c142b] border border-[#523d75] hover:border-[#6b4c9a] rounded-none transition-colors space-y-3 shadow-sm"
                >
                  <div className="flex justify-between items-center border-b border-[#3b2d54] pb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-[#2e1d47] border border-[#6b4c9a] text-[#e9d5ff] flex items-center justify-center text-xs font-bold">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-sm text-[#f4f0ff]">
                        {displayName}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#b29cc2]">
                      {item.created_at
                        ? new Date(item.created_at).toLocaleDateString("ko-KR", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </span>
                  </div>
                  <p className="text-[#e2d5f0] text-sm leading-relaxed whitespace-pre-wrap break-words pt-1">
                    {displayContent}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default GuestbookView;
