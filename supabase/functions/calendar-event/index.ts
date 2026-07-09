import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Funções utilitárias para geração de JWT e OAuth2 com Google
async function importPrivateKey(pem: string): Promise<CryptoKey> {
  const pemHeader = "-----BEGIN PRIVATE KEY-----";
  const pemFooter = "-----END PRIVATE KEY-----";
  const pemContents = pem
    .replace(pemHeader, "")
    .replace(pemFooter, "")
    .replace(/\s+/g, "");
  
  const binaryDerString = atob(pemContents);
  const binaryDer = new Uint8Array(binaryDerString.length);
  for (let i = 0; i < binaryDerString.length; i++) {
    binaryDer[i] = binaryDerString.charCodeAt(i);
  }
  
  return await crypto.subtle.importKey(
    "pkcs8",
    binaryDer,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["sign"]
  );
}

function base64url(source: ArrayBuffer | string): string {
  let encoded = "";
  if (typeof source === "string") {
    encoded = btoa(source);
  } else {
    const bytes = new Uint8Array(source);
    for (let i = 0; i < bytes.byteLength; i++) {
      encoded += String.fromCharCode(bytes[i]);
    }
    encoded = btoa(encoded);
  }
  return encoded
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function getAccessToken(clientEmail: string, privateKeyPem: string): Promise<string> {
  const header = JSON.stringify({ alg: "RS256", typ: "JWT" });
  const now = Math.floor(Date.now() / 1000);
  const claim = JSON.stringify({
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/calendar",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now
  });

  const tokenInput = `${base64url(header)}.${base64url(claim)}`;
  const key = await importPrivateKey(privateKeyPem);
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(tokenInput)
  );

  const jwt = `${tokenInput}.${base64url(signature)}`;

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  });

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error_description || data.error);
  }
  return data.access_token;
}

serve(async (req) => {
  // Trata requisições OPTIONS (CORS preflight)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action, titulo, data, descricao, query } = body;

    const credsStr = Deno.env.get("GOOGLE_CALENDAR_CREDENTIALS");

    // MODO TESTE/MOCK caso não existam credenciais salvas
    if (!credsStr) {
      console.warn("⚠️ GOOGLE_CALENDAR_CREDENTIALS não configurado nos Secrets. Usando modo MOCK/TESTES.");
      return new Response(JSON.stringify({ 
        success: true, 
        mode: "mock", 
        message: "Evento simulado com sucesso. Para ativar a API real, configure GOOGLE_CALENDAR_CREDENTIALS nos Secrets do Supabase." 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Modo de Integração Real
    const creds = JSON.parse(credsStr);
    const accessToken = await getAccessToken(creds.client_email, creds.private_key);

    const calendarId = Deno.env.get("CALENDAR_ID") || Deno.env.get("GMAIL_USER") || "primary";

    if (action === "upsert") {
      // Cria um evento no Google Calendar
      const event = {
        summary: titulo,
        description: descricao,
        start: {
          date: data, // Evento de dia inteiro (padrão YYYY-MM-DD)
        },
        end: {
          date: data,
        },
      };

      const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error?.message || "Erro ao criar evento");

      return new Response(JSON.stringify({ success: true, eventId: resData.id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });

    } else if (action === "delete") {
      // Busca eventos existentes que correspondam ao termo/query
      const searchRes = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?q=${encodeURIComponent(query)}`,
        {
          headers: { "Authorization": `Bearer ${accessToken}` },
        }
      );

      const searchData = await searchRes.json();
      if (!searchRes.ok) throw new Error(searchData.error?.message || "Erro ao buscar eventos");

      const items = searchData.items || [];
      let count = 0;

      for (const item of items) {
        if (item.id) {
          const delRes = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${item.id}`,
            {
              method: "DELETE",
              headers: { "Authorization": `Bearer ${accessToken}` },
            }
          );
          if (delRes.ok) count++;
        }
      }

      return new Response(JSON.stringify({ success: true, deletedCount: count }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    throw new Error("Ação inválida ou não especificada.");
  } catch (err: any) {
    console.error("Erro na integração com Google Calendar:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
