const SYSTEM_MESSAGE =
  "You are a helpful L'Oréal routine advisor. Keep responses focused on the user's selected routine, skincare, haircare, makeup, fragrance, and related beauty topics. Be clear and practical.";
const MAX_REQUEST_BODY_CHARS = 16000;
const MAX_CONTEXT_MESSAGES = 12;
const MAX_MESSAGE_CHARS = 2000;
const MAX_COMPLETION_TOKENS = 500;

// Rate limiting: wait 1.5 seconds between OpenAI API requests to avoid rate limit errors
const API_REQUEST_DELAY_MS = 1500;
let lastOpenAiRequestTime = 0;

// Helper function: Wait for a specified number of milliseconds
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Helper function: Enforce rate limiting before OpenAI API calls
async function enforceApiRateLimit() {
  const now = Date.now();
  const timeSinceLastRequest = now - lastOpenAiRequestTime;

  // If less than 1.5 seconds have passed, wait for the remaining time
  if (timeSinceLastRequest < API_REQUEST_DELAY_MS) {
    const delayNeeded = API_REQUEST_DELAY_MS - timeSinceLastRequest;
    await sleep(delayNeeded);
  }

  // Update the last request time
  lastOpenAiRequestTime = Date.now();
}

function buildCorsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Max-Age": "86400",
  };
}

function clampText(text, maxChars) {
  if (text.length <= maxChars) {
    return text;
  }

  return `${text.slice(0, maxChars)}…`;
}

function buildSafeMessages(messages) {
  if (!Array.isArray(messages)) {
    throw new Error("messages must be an array");
  }

  const safeMessages = [
    {
      role: "system",
      content: SYSTEM_MESSAGE,
    },
  ];

  const recentMessages = messages
    .filter(
      (message) =>
        message &&
        (message.role === "user" || message.role === "assistant") &&
        typeof message.content === "string",
    )
    .slice(-MAX_CONTEXT_MESSAGES);

  for (const message of recentMessages) {
    safeMessages.push({
      role: message.role,
      content: clampText(message.content, MAX_MESSAGE_CHARS),
    });
  }

  return safeMessages;
}

var worker_default = {
  async fetch(request, env) {
    const corsHeaders = buildCorsHeaders();

    // Handle preflight requests.
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    // Keep a simple health check for GET requests.
    if (request.method === "GET") {
      return new Response(
        JSON.stringify({
          message: "Worker is running.",
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        },
      );
    }

    // This worker only forwards chat requests.
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
      const requestText = await request.text();

      if (requestText.length > MAX_REQUEST_BODY_CHARS) {
        return new Response(
          JSON.stringify({ error: "Request body is too large." }),
          {
            status: 413,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders,
            },
          },
        );
      }

      const body = JSON.parse(requestText);
      const messages = buildSafeMessages(body.messages);

      // Apply rate limiting before making the OpenAI API request
      await enforceApiRateLimit();

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
            messages,
            max_tokens: MAX_COMPLETION_TOKENS,
          }),
        },
      );

      const responseText = await openaiResponse.text();

      if (!openaiResponse.ok) {
        return new Response(
          JSON.stringify({
            error: `OpenAI request failed with status ${openaiResponse.status}.`,
            details: responseText,
          }),
          {
            status: openaiResponse.status,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders,
            },
          },
        );
      }

      return new Response(responseText, {
        status: 200,
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

export { worker_default as default };
