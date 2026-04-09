export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Use POST to request a chat completion." }),
        {
          status: 405,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        },
      );
    }

    // Prefer the environment-bound secret (modern bindings). Fall back to globalThis for older dashboard bindings.
    const OPENAI_API_KEY =
      (env && env.OPENAI_API_KEY) || globalThis.OPENAI_API_KEY;

    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({
          error: "Missing OPENAI_API_KEY secret in Cloudflare.",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        },
      );
    }

    let body;

    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body." }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Keep the project locked to GPT-4o to match class instructions.
    const model = "gpt-4o";
    const messages = Array.isArray(body.messages) ? body.messages : [];

    if (messages.length === 0) {
      return new Response(JSON.stringify({ error: "messages is required." }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const openAiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({ model, messages }),
      },
    );

    const responseText = await openAiResponse.text();

    return new Response(responseText, {
      status: openAiResponse.status,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  },
};
