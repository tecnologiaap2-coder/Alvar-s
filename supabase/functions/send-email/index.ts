import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Trata requisições OPTIONS (CORS preflight)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { assunto, corpo } = await req.json();
    
    const username = Deno.env.get("GMAIL_USER");
    const password = Deno.env.get("GMAIL_APP_PASSWORD");
    
    if (!username || !password) {
      throw new Error("As variáveis GMAIL_USER ou GMAIL_APP_PASSWORD não estão configuradas nos Secrets do Supabase.");
    }
    
    // Importa o cliente SMTP de Deno em tempo de execução
    const { SMTPClient } = await import("https://deno.land/x/smtp@v1.2.0/mod.ts");
    
    const client = new SMTPClient({
      connection: {
        hostname: "smtp.gmail.com",
        port: 465,
        tls: true,
        auth: {
          username: username,
          password: password,
        },
      },
    });

    await client.send({
      from: username,
      to: [
        "felipe@arosopontinadvogados.com.br", 
        "escritorio@arosopontinadvogados.com.br"
      ],
      subject: assunto,
      content: corpo,
    });
    
    return new Response(JSON.stringify({ success: true, message: "E-mail de protocolo enviado!" }), {
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
