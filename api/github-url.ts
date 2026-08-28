import { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const appUrl = process.env.APP_URL || `https://${req.headers.host}`;
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
}
