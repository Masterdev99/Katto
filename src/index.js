export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Notification webhook endpoint
    if (url.pathname === '/webhook/update-complete' && request.method === 'POST') {
      return handleUpdateNotification(request, env, corsHeaders);
    }

    // Health check
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok' }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Serve landing page
    if (url.pathname === '/' || url.pathname === '/index.html') {
      return serveFile('index.html', 'text/html', env);
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders });
  },
};

async function handleUpdateNotification(request, env, corsHeaders) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.system || !data.timestamp) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: system, timestamp' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const { system, timestamp, version = '2.0.0', userId = 'anonymous' } = data;

    // Build notification message
    const message = buildNotificationMessage(system, timestamp, version, userId);

    // Send to Telegram
    const telegramResponse = await sendTelegramNotification(
      env.TELEGRAM_BOT_TOKEN,
      env.TELEGRAM_CHAT_ID,
      message
    );

    if (!telegramResponse.ok) {
      console.error('Telegram API error:', await telegramResponse.text());
      return new Response(
        JSON.stringify({ error: 'Failed to send notification' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Log to KV for tracking
    await logUpdateEvent(env, { system, timestamp, version, userId });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Update notification received and processed',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error) {
    console.error('Error processing notification:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
}

function buildNotificationMessage(system, timestamp, version, userId) {
  const systemEmoji = system.toLowerCase() === 'windows' ? '🪟' : '🍎';
  const date = new Date(timestamp).toLocaleString();

  return `${systemEmoji} System Update Completed

Platform: ${system}
Version: ${version}
User: ${userId}
Time: ${date}

✅ Update installation successful on this machine.`;
}

async function sendTelegramNotification(botToken, chatId, message) {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML',
    }),
  });
}

async function logUpdateEvent(env, eventData) {
  if (!env.UPDATE_LOGS) return;

  const key = `update-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  await env.UPDATE_LOGS.put(key, JSON.stringify(eventData), {
    expirationTtl: 86400 * 30, // 30 days
  });
}

async function serveFile(filename, contentType, env) {
  // This would serve static files from R2 or inline assets
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
  };

  if (filename === 'index.html') {
    // For development, return a placeholder
    // In production, serve from your R2 bucket
    return new Response('Static file serving - configure R2 bucket', {
      status: 501,
      headers: { 'Content-Type': contentType, ...corsHeaders },
    });
  }

  return new Response('Not Found', { status: 404, headers: corsHeaders });
}
