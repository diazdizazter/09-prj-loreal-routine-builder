export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "POST requests only" }), {
        status: 405,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }

    try {
      const body = await request.json();

      const openaiResponse = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: body.messages,
          }),
        },
      );

      const data = await openaiResponse.json();

      return new Response(JSON.stringify(data), {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }
  },
};
