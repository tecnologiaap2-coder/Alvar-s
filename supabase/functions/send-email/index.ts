import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Obtém um Access Token válido usando o Refresh Token do OAuth2
async function getGmailAccessToken(): Promise<string> {
  const clientId = Deno.env.get("GMAIL_CLIENT_ID");
  const clientSecret = Deno.env.get("GMAIL_CLIENT_SECRET");
  const refreshToken = Deno.env.get("GMAIL_REFRESH_TOKEN");

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("As variáveis GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET ou GMAIL_REFRESH_TOKEN não estão configuradas nos Secrets do Supabase.");
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const data = await response.json();
  if (data.error) {
    throw new Error(`Erro ao obter token Gmail: ${data.error_description || data.error}`);
  }
  return data.access_token;
}

// Monta uma mensagem de e-mail no formato RFC 2822 e codifica em base64url
function buildRawEmail(from: string, to: string[], subject: string, body: string): string {
  const toHeader = to.join(", ");
  const raw = [
    `From: ${from}`,
    `To: ${toHeader}`,
    `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
    `MIME-Version: 1.0`,
    `Content-Type: text/plain; charset=UTF-8`,
    `Content-Transfer-Encoding: base64`,
    ``,
    btoa(unescape(encodeURIComponent(body))),
  ].join("\r\n");

  // Codifica em base64url (padrão exigido pela Gmail API)
  return btoa(raw)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

serve(async (req) => {
  // Trata requisições OPTIONS (CORS preflight)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { assunto, corpo } = await req.json();

    const accessToken = await getGmailAccessToken();

    const from = Deno.env.get("GMAIL_USER") || "felipe@arosopontinadvogados.com.br";
    const to = [
      "felipe@arosopontinadvogados.com.br",
      "escritorio@arosopontinadvogados.com.br"
    ];

    const rawMessage = buildRawEmail(from, to, assunto, corpo);

    // Envia o e-mail via Gmail API REST (HTTP, sem SMTP)
    const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ raw: rawMessage }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error?.message || JSON.stringify(result));
    }

    return new Response(JSON.stringify({ success: true, message: "E-mail enviado via Gmail API!", messageId: result.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err: any) {
    console.error("Erro no envio de e-mail:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
