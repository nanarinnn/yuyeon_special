import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy Gemini AI initialization
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      aiClient = new GoogleGenAI({ apiKey });
    }
  }
  return aiClient;
}

// 1. OAuth URL Endpoint
app.get("/api/auth/github/url", (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const appUrl = process.env.APP_URL || `${req.protocol}://${req.get("host")}`;
  const redirectUri = `${appUrl.replace(/\/$/, "")}/auth/github/callback`;

  if (!clientId) {
    return res.json({
      configured: false,
      redirectUri,
      message: "GITHUB_CLIENT_ID environment variable is not configured.",
    });
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "read:user,repo,user:email,notifications",
  });

  const authUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;
  res.json({
    configured: true,
    redirectUri,
    url: authUrl,
  });
});

// 2. OAuth Callback Handler
const handleCallback = async (req: express.Request, res: express.Response) => {
  const { code } = req.query;
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!code || typeof code !== "string") {
    return res.status(400).send("Missing authorization code from GitHub.");
  }

  try {
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      return res.status(400).send(`GitHub OAuth Error: ${tokenData.error_description || tokenData.error}`);
    }

    const accessToken = tokenData.access_token;

    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>GitHub Connection Successful</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              background-color: #0d1117;
              color: #c9d1d9;
            }
            .card {
              background: #161b22;
              border: 1px solid #30363d;
              padding: 24px 32px;
              border-radius: 12px;
              text-align: center;
              box-shadow: 0 8px 24px rgba(0,0,0,0.5);
            }
            .icon { font-size: 48px; margin-bottom: 16px; }
            h2 { margin: 0 0 8px 0; color: #58a6ff; }
            p { color: #8b949e; font-size: 14px; margin: 0; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="icon">🐙</div>
            <h2>GitHub Connected!</h2>
            <p>Closing window and returning to application...</p>
          </div>
          <script>
            if (window.opener) {
              window.opener.postMessage({
                type: 'OAUTH_AUTH_SUCCESS',
                provider: 'github',
                token: ${JSON.stringify(accessToken)}
              }, '*');
              setTimeout(() => { window.close(); }, 1200);
            } else {
              window.location.href = '/';
            }
          </script>
        </body>
      </html>
    `);
  } catch (err: any) {
    console.error("OAuth callback error:", err);
    res.status(500).send(`Authentication failed: ${err?.message || err}`);
  }
};

app.get("/auth/github/callback", handleCallback);
app.get("/auth/github/callback/", handleCallback);

// 3. Gemini AI Endpoint
app.post("/api/github/ai-summary", async (req, res) => {
  const { prompt, userData, repoData, language = "ko" } = req.body;
  const gemini = getGeminiClient();

  if (!gemini) {
    return res.status(500).json({
      error: "Gemini API key is missing or not configured in environment.",
    });
  }

  try {
    const systemInstruction = `You are a GitHub portfolio and repository AI expert analyst.
Your task is to analyze GitHub profiles, repository code, commit logs, or activity and provide insightful, structured summaries in ${language === "ko" ? "Korean (한국어)" : "English"}.
Use markdown formatting with key bullet points, concise technical badges, and actionable suggestions.`;

    const fullPrompt = `${systemInstruction}\n\nContext Data:\nUser: ${JSON.stringify(userData || {})}\nRepo Context: ${JSON.stringify(repoData || {})}\n\nUser Request: ${prompt}`;

    const response = await gemini.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fullPrompt,
    });

    res.json({ result: response.text });
  } catch (err: any) {
    res.status(500).json({ error: `Gemini AI error: ${err.message}` });
  }
});

// 4. Google Cloud Storage Proxy Endpoint (Secure Private Data Retrieval)
app.get("/api/gcs/rolling-paper-2026", async (req, res) => {
  try {
    const { Storage } = await import("@google-cloud/storage");
    const fs = await import("fs");

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
      const fs = await import("fs");
      const fallbackPath = path.join(process.cwd(), "public", "rolling_paper_2026.json");
      if (fs.existsSync(fallbackPath)) {
        const content = fs.readFileSync(fallbackPath, "utf-8");
        res.setHeader("Content-Type", "application/json");
        return res.send(content);
      }
    } catch (e) {}
    res.status(500).json({ error: "GCS 데이터를 로드하는 중 서버 내부 오류가 발생했습니다." });
  }
});

// Vite Middleware for development / static serving for production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
  } else {
    // Vercel Serverless 환경 및 일반 Node.js 호스팅 환경 모두에서 dist 정적 파일 서빙 활성화
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });

    if (!process.env.VERCEL) {
      app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running on http://0.0.0.0:${PORT}`);
      });
    }
  }
}

startServer();

export default app;
