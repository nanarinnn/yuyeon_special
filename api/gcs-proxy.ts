import { VercelRequest, VercelResponse } from "@vercel/node";
import { Storage } from "@google-cloud/storage";
import fs from "fs";
import path from "path";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS 헤더 설정
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    const keyPath = path.join(process.cwd(), "gcs-key.json");
    const bucketName = "yuyeon-private-bucket"; // ⭐️ GCS 버킷 이름

    let storage;
    if (fs.existsSync(keyPath)) {
      storage = new Storage({ keyFilename: keyPath });
    } else if (process.env.GCS_PRIVATE_KEY_JSON) {
      try {
        const credentials = JSON.parse(process.env.GCS_PRIVATE_KEY_JSON);
        storage = new Storage({ credentials });
      } catch (parseErr) {
        console.error("GCS Environment Key JSON Parse Error:", parseErr);
      }
    }

    if (storage) {
      const bucket = storage.bucket(bucketName);
      const file = bucket.file("rolling_paper_2026.json");

      const [exists] = await file.exists();
      if (exists) {
        const [content] = await file.download();
        res.setHeader("Content-Type", "application/json");
        return res.send(content.toString());
      }
    }
    
    // GCS 연동 실패나 키가 없을 시 로컬 폴더 백업본 폴백 반환
    const fallbackPath = path.join(process.cwd(), "public", "rolling_paper_2026.json");
    if (fs.existsSync(fallbackPath)) {
      const content = fs.readFileSync(fallbackPath, "utf-8");
      res.setHeader("Content-Type", "application/json");
      return res.send(content);
    }

    res.status(404).json({ error: "2026 롤링페이퍼 데이터를 찾을 수 없습니다." });
  } catch (err: any) {
    console.error("GCS Proxy Error:", err);
    try {
      const fallbackPath = path.join(process.cwd(), "public", "rolling_paper_2026.json");
      if (fs.existsSync(fallbackPath)) {
        const content = fs.readFileSync(fallbackPath, "utf-8");
        res.setHeader("Content-Type", "application/json");
        return res.send(content);
      }
    } catch (e) {}
    res.status(500).json({ error: `GCS 데이터를 로드하는 중 서버 내부 오류가 발생했습니다: ${err.message || err}` });
  }
}
