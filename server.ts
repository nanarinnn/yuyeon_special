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

// 0. Guestbook Shared Backend Proxy (Connected to Supabase)
const SUPABASE_URL = "https://tuqwintstnimajksseir.supabase.co";
const SUPABASE_KEY = "sb_publishable_BDeUxFjo_f9VoNauPcov6Q_PISeqgip";
const PAGE_ID = "yuyeon_birthday_external";

interface GuestbookItem {
  id?: string;
  page_id: string;
  nickname: string;
  content: string;
  created_at: string;
}

let localGuestbookStore: GuestbookItem[] = [
  {
    page_id: PAGE_ID,
    nickname: "나나링",
    content: "테스트용입니다 ! Σ(￣□￣;)",
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
];

app.get("/api/guestbook", async (req, res) => {
  try {
    const supabaseRes = await fetch(
      `${SUPABASE_URL}/rest/v1/guestbook?page_id=eq.${PAGE_ID}`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          Accept: "application/json",
        },
      }
    );

    let supabaseData: any[] = [];
    if (supabaseRes.ok) {
      supabaseData = await supabaseRes.json();
    } else {
      console.warn("Supabase fetch error:", await supabaseRes.text());
    }

    const processedSupabase: GuestbookItem[] = supabaseData.map((item, idx) => ({
      id: item.id || `sp_${idx}`,
      page_id: item.page_id || PAGE_ID,
      nickname: item.nickname || "익명",
      content: item.content || "",
      created_at: item.created_at || new Date().toISOString(),
    }));

    const combined = [...localGuestbookStore, ...processedSupabase];
    const uniqueMap = new Map<string, GuestbookItem>();

    combined.forEach((msg) => {
      const key = `${msg.nickname.trim()}_${msg.content.trim()}`;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, msg);
      }
    });

    const resultList = Array.from(uniqueMap.values()).reverse();
    res.json(resultList);
  } catch (err: any) {
    console.error("Guestbook fetch error:", err);
    res.json(localGuestbookStore);
  }
});

app.post("/api/guestbook", async (req, res) => {
  const { nickname, content } = req.body;
  if (!nickname || !content) {
    return res.status(400).json({ error: "Nickname and content are required." });
  }

  const newItem: GuestbookItem = {
    page_id: PAGE_ID,
    nickname: nickname.trim(),
    content: content.trim(),
    created_at: new Date().toISOString(),
  };

  localGuestbookStore.push(newItem);

  let supabaseSuccess = false;
  try {
    const supabaseRes = await fetch(`${SUPABASE_URL}/rest/v1/guestbook`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        page_id: PAGE_ID,
        nickname: newItem.nickname,
        content: newItem.content,
      }),
    });

    if (supabaseRes.ok) {
      supabaseSuccess = true;
    } else {
      console.error("Supabase POST error:", await supabaseRes.text());
    }
  } catch (err: any) {
    console.error("Failed to reach Supabase:", err);
  }

  res.json({
    success: true,
    supabaseSuccess,
    message: newItem,
  });
});

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

    // Return HTML page that sends message to opener window and closes popup
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
            .icon {
              font-size: 48px;
              margin-bottom: 16px;
            }
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

// Helper for GitHub API requests
async function fetchFromGitHub(endpoint: string, token: string, options: RequestInit = {}) {
  const url = endpoint.startsWith("http") ? endpoint : `https://api.github.com${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "GitHub-Connect-Hub-App",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    let parsedMessage = errorBody;
    try {
      const parsed = JSON.parse(errorBody);
      parsedMessage = parsed.message || errorBody;
    } catch (_) {}
    throw new Error(`GitHub API Error (${response.status}): ${parsedMessage}`);
  }

  return response.json();
}

// 3. GitHub API Proxy Endpoints
app.get("/api/github/user", async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Missing GitHub access token" });

  try {
    const userData = await fetchFromGitHub("/user", token);
    res.json(userData);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/github/repos", async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Missing GitHub access token" });

  try {
    const repos = await fetchFromGitHub("/user/repos?sort=updated&per_page=100&type=all", token);
    res.json(repos);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/github/orgs", async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Missing GitHub access token" });

  try {
    const orgs = await fetchFromGitHub("/user/orgs", token);
    res.json(orgs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/github/events", async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  const username = req.query.username as string;
  if (!token) return res.status(401).json({ error: "Missing GitHub access token" });
  if (!username) return res.status(400).json({ error: "Missing username parameter" });

  try {
    const events = await fetchFromGitHub(`/users/${username}/events?per_page=30`, token);
    res.json(events);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/github/starred", async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Missing GitHub access token" });

  try {
    const starred = await fetchFromGitHub("/user/starred?per_page=50", token);
    res.json(starred);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/github/repo/details", async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  const owner = req.query.owner as string;
  const repo = req.query.repo as string;

  if (!token) return res.status(401).json({ error: "Missing GitHub access token" });
  if (!owner || !repo) return res.status(400).json({ error: "Missing owner or repo parameter" });

  try {
    const [repoInfo, commits, issues, pullRequests, readme] = await Promise.allSettled([
      fetchFromGitHub(`/repos/${owner}/${repo}`, token),
      fetchFromGitHub(`/repos/${owner}/${repo}/commits?per_page=15`, token),
      fetchFromGitHub(`/repos/${owner}/${repo}/issues?state=all&per_page=15`, token),
      fetchFromGitHub(`/repos/${owner}/${repo}/pulls?state=all&per_page=15`, token),
      fetchFromGitHub(`/repos/${owner}/${repo}/readme`, token),
    ]);

    res.json({
      info: repoInfo.status === "fulfilled" ? repoInfo.value : null,
      commits: commits.status === "fulfilled" ? commits.value : [],
      issues: issues.status === "fulfilled" ? issues.value : [],
      pullRequests: pullRequests.status === "fulfilled" ? pullRequests.value : [],
      readme: readme.status === "fulfilled" ? readme.value : null,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/github/issues", async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  const { owner, repo, title, body, labels } = req.body;

  if (!token) return res.status(401).json({ error: "Missing GitHub access token" });
  if (!owner || !repo || !title) return res.status(400).json({ error: "Missing owner, repo, or title" });

  try {
    const issue = await fetchFromGitHub(`/repos/${owner}/${repo}/issues`, token, {
      method: "POST",
      body: JSON.stringify({ title, body, labels: labels || [] }),
    });
    res.json(issue);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/github/star", async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  const { owner, repo } = req.body;

  if (!token) return res.status(401).json({ error: "Missing GitHub access token" });

  try {
    await fetchFromGitHub(`/user/starred/${owner}/${repo}`, token, { method: "PUT" });
    res.json({ success: true, starred: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/github/star", async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  const { owner, repo } = req.body;

  if (!token) return res.status(401).json({ error: "Missing GitHub access token" });

  try {
    await fetchFromGitHub(`/user/starred/${owner}/${repo}`, token, { method: "DELETE" });
    res.json({ success: true, starred: false });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Gemini AI Insights Endpoint
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

// Vite Middleware for development / static serving for production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`GitHub Connect Hub server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
