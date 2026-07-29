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

  // 1. Supabase에서 방명록 데이터 불러오기 (기존/신규 모든 칼럼 호환 매핑)
  const fetchEntries = async (showLoading = true) => {
    if (showLoading) setIsFetching(true);
    setErrorMsg("");
    try {
      const cacheBuster = new Date().getTime();
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/guestbook?select=*&_t=${cacheBuster}`,
        {
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
          },
        }
      );

      if (!res.ok) {
        throw new Error("데이터를 가져오는 데 실패했습니다.");
      }

      const data = await res.json();
      if (Array.isArray(data)) {
        const normalized = data.map((item: any) => ({
          id: item.id,
          page_id: item.page_id,
          nickname: item.nickname || item.name || item.writer || "익명",
          content: item.content || item.message || item.text || "",
          created_at: item.created_at,
        }));
        setEntries(normalized);
      }
    } catch (err: any) {
      console.error("방명록 로딩 오류:", err);
    } finally {
      if (showLoading) setIsFetching(false);
    }
  };

  // 실시간 5초 동기화 타이머 설정 (다른 사용자가 남긴 글 자동 갱신)
  useEffect(() => {
    fetchEntries(true);
    const interval = setInterval(() => {
      fetchEntries(false);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // 2. Supabase로 새 방명록 작성하기 (즉시 상태 반영 + 즉시 새로고침)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      setErrorMsg("이름과 작성 내용을 모두 입력해 주세요.");
      return;
    }

    const newNickname = name.trim();
    const newContent = message.trim();

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
          nickname: newNickname,
          name: newNickname,
          content: newContent,
          message: newContent,
          page_id: "yuyeon_special",
        }),
      });

      if (res.ok) {
        const insertedData = await res.json();
        setName("");
        setMessage("");
        setSuccessMsg("롤링페이퍼가 성공적으로 남겨졌습니다!");

        // 🚀 즉시 UI 업데이트 (Optimistic Update: 서버 기다리지 않고 바로 목록 맨 위에 등록!)
        const newItem: GuestbookEntry = insertedData && insertedData[0] ? insertedData[0] : {
          id: Date.now(),
          nickname: newNickname,
          content: newContent,
          created_at: new Date().toISOString(),
        };
        setEntries((prev) => [newItem, ...prev.filter((item) => item.id !== newItem.id)]);

        // 0.3초 뒤 최신 DB 다시 조회하여 동기화 확정
        setTimeout(() => fetchEntries(false), 300);
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
        <div className="text-center flex flex-col items-center gap-3 pt-6">
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
              <MessageSquare className="w-8 h-8 mx-auto text-[#c084fc] mb-2" />
              <p className="text-base font-bold text-[#f4f0ff]">아직 작성된 메시지가 없어요!</p>
              <p className="text-xs text-[#d8b4fe]">첫 번째 축하 메시지의 주인공이 되어보세요 (●'◡'●)</p>
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
