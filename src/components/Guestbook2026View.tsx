import React, { useState, useEffect } from "react";
import { MessageSquare, RefreshCw, Info } from "lucide-react";

interface RollingEntry2026 {
  id?: number;
  nickname: string;
  content: string;
  created_at?: string;
}

export const Guestbook2026View: React.FC = () => {
  const [entries, setEntries] = useState<RollingEntry2026[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // ⭐️ 2026년 데이터 로드 (현재는 로컬 public JSON 파일에서 가져오고, 차후 구글 클라우드 스토리지 URL로 대체 가능)
  const fetchEntries = async () => {
    setIsFetching(true);
    setErrorMsg("");
    try {
      // ⭐️ 보안 유지를 위해 프론트엔드가 GCS에 직접 접근하지 않고, 
      // credentials 키를 가진 로컬 Express 백엔드 Proxy API를 통해 데이터를 받아옵니다.
      const res = await fetch("/api/gcs/rolling-paper-2026");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          data.sort((a, b) => {
            const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
            const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
            return timeB - timeA;
          });
          setEntries(data);
        } else {
          setErrorMsg("데이터 형식이 올바르지 않습니다.");
        }
      } else {
        const errJson = await res.json().catch(() => ({}));
        setErrorMsg(errJson.error || `서버 에러: ${res.status} ${res.statusText}`);
      }
    } catch (err: any) {
      console.error("2026 롤링페이퍼 로드 오류:", err);
      setErrorMsg(`네트워크 오류가 발생했습니다: ${err.message || err}`);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  return (
    <div className="min-h-screen bg-[#120d1c] text-[#f4f0ff] pt-16 pb-20 px-4 sm:px-8 select-none">
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="text-center flex flex-col items-center gap-3 pt-6">
          <div className="text-xs uppercase tracking-[0.25em] text-[#c084fc] font-bold">
            2026 ROLLING PAPER ARCHIVE
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#f4f0ff] uppercase">
            2026년 ROLLING PAPER
          </h1>
          <p className="text-[#d8b4fe] text-xs sm:text-sm tracking-wide max-w-md mx-auto">
            2026년 진유연 생일에 남겨주신 소중한 메시지 아카이브입니다.
          </p>
        </div>

        {/* 안내 카드 */}
        <div className="p-4 bg-[#1c142b] border border-[#523d75] text-[#d8b4fe] text-xs flex gap-2.5 items-start">
          <Info className="w-4 h-4 text-[#c084fc] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-[#f4f0ff]">클라우드 데이터 보관 안내</p>
            <p className="leading-relaxed">
              이 페이지는 구글 클라우드 스토리지에 보관된 읽기 전용 JSON 파일 데이터를 연동하여 보여줍니다. (작성은 지원하지 않는 아카이브 전용입니다.)
            </p>
          </div>
        </div>

        {/* 롤링페이퍼 목록 헤더 */}
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

        {/* 에러 알림 */}
        {errorMsg && (
          <div className="p-4 bg-[#1c142b] border border-red-500/50 text-red-300 text-xs">
            {errorMsg}
          </div>
        )}

        {/* 롤링페이퍼 목록 */}
        <div className="space-y-4">
          {isFetching ? (
            <div className="text-center py-16 text-[#9d8ba6] space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#c084fc]" />
              <p className="text-xs tracking-widest uppercase">LOADING MESSAGES...</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-16 border border-[#523d75] bg-[#1c142b] text-[#d8b4fe] p-6">
              <p className="text-base font-bold text-[#f4f0ff]">메시지가 없습니다.</p>
            </div>
          ) : (
            entries.map((item, idx) => {
              const displayName = item.nickname || "익명";
              const displayContent = item.content || "";
              return (
                <div
                  key={item.id ? `gb26-id-${item.id}` : `gb26-idx-${idx}`}
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
                    {item.created_at && (
                      <span className="text-[11px] text-[#b29cc2]">
                        {new Date(item.created_at).toLocaleDateString("ko-KR", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        })}
                      </span>
                    )}
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
