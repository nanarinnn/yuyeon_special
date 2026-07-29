import React, { useState, useEffect } from "react";

// Supabase 접속 정보 (REST API 직접 연동)
const SUPABASE_URL = "https://tuqwintstnimajksseir.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1cXdpbnRzdG5pbWFqa3NzZWlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyMjM5OTEsImV4cCI6MjEwMDc5OTk5MX0.EhvBzznSEbf9WgWabcA6Sfx4Qfz5-7Sw_1rRzPFaJO8";

interface GuestbookEntry {
  id?: number;
  name: string;
  message: string;
  created_at?: string;
}

export const GuestbookView: React.FC = () => {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // 1. Supabase에서 방명록 데이터 불러오기
  const fetchEntries = async () => {
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
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  // 2. Supabase로 새 방명록 작성하기
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      alert("이름과 작성 내용을 모두 입력해주세요.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

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
          name: name.trim(),
          message: message.trim(),
        }),
      });

      if (res.ok) {
        setName("");
        setMessage("");
        fetchEntries(); // 새 글 등록 후 목록 갱신
      } else {
        const errData = await res.json();
        alert(`방명록 등록 실패: ${errData.message || "오류가 발생했습니다."}`);
      }
    } catch (err: any) {
      console.error("방명록 작성 오류:", err);
      alert("방명록 작성 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
        📖 방명록
      </h2>

      {/* 작성 폼 */}
      <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div>
          <input
            type="text"
            placeholder="이름 (닉네임)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={20}
          />
        </div>
        <div>
          <textarea
            placeholder="남기실 말씀을 적어주세요..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? "등록하는 중..." : "방명록 남기기"}
        </button>
      </form>

      {/* 오류 메시지 표시 */}
      {errorMsg && (
        <p className="text-red-500 text-sm text-center">{errorMsg}</p>
      )}

      {/* 방명록 목록 */}
      <div className="space-y-3">
        {entries.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            아직 작성된 방명록이 없습니다. 첫 마디를 남겨보세요!
          </div>
        ) : (
          entries.map((item) => (
            <div
              key={item.id || item.created_at}
              className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-2"
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {item.name}
                </span>
                <span className="text-xs text-gray-400">
                  {item.created_at
                    ? new Date(item.created_at).toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">
                {item.message}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GuestbookView;
