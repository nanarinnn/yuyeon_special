import React from "react";
import { Info, Code, ShieldCheck, Cpu } from "lucide-react";

export const DevNotesView: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#120d1c] text-[#f4f0ff] pt-16 pb-20 px-4 sm:px-8 select-none">
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="text-center flex flex-col items-center gap-3 pt-6">
          <div className="text-xs uppercase tracking-[0.25em] text-[#c084fc] font-bold">
            ARCHIVE SYSTEM LOG
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#f4f0ff] uppercase">
            Developer Notes
          </h1>
          <p className="text-[#d8b4fe] text-xs sm:text-sm tracking-wide max-w-md mx-auto">
            생일 기념 아카이브의 기술 사양 및 개발 로그입니다.
          </p>
        </div>

        {/* Notes Grid */}
        <div className="space-y-6">
          

          {/* Note 2: Database Sync */}
          <div className="p-6 bg-[#1c142b] border border-[#523d75] rounded-none space-y-3">
            <div className="flex items-center gap-2.5 border-b border-[#3b2d54] pb-2">
              <ShieldCheck className="w-5 h-5 text-[#c084fc]" />
              <h2 className="font-bold text-base text-[#f4f0ff]">데이터 스토리지 운영 및 관리</h2>
            </div>
            <div className="text-sm text-[#e2d5f0] space-y-3 leading-relaxed">
              <p>
                <strong>2027년 롤링페이퍼 (현재):</strong> 실시간 메시지 소통을 위해 <strong>Supabase PostgreSQL</strong> DB와 REST API 방식으로 직접 연동되어 즉시 작성 및 조회가 가능합니다.
              </p>
              <p>
                <strong>2026년 롤링페이퍼 (아카이브):</strong> 과거 축하 메시지의 안전한 영구 보존을 위해 <strong>Google Cloud Storage(GCS)</strong>에 JSON 파일 포맷으로 데이터를 분리 배치하여 정적 파일 상태로 안정적으로 읽어옵니다.
              </p>
            </div>
          </div>

          {/* Note 3: Developer Info */}
          <div className="p-6 bg-[#1c142b] border border-[#523d75] rounded-none space-y-3">
            <div className="flex items-center gap-2.5 border-b border-[#3b2d54] pb-2">
              <Code className="w-5 h-5 text-[#c084fc]" />
              <h2 className="font-bold text-base text-[#f4f0ff]">개발 후기 & 안내</h2>
            </div>
            <p className="text-sm text-[#e2d5f0] leading-relaxed">
              유연이의 소중한 생일 축하 기록들을 안전하게 영구 저장하기 위해 데이터의 생성 시기별 스토리지 이중화를 시도하였습니다. 추후 데이터 보존 비용 및 서비스 상태에 따라 최적의 아키텍처를 유지하고자 합니다. 방문해 주신 모든 분들께 감사드립니다!
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
export default DevNotesView;
