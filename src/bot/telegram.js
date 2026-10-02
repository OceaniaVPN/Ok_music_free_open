async function telegramApi(env, method, body) {
  const token = String(env.TELEGRAM_BOT_TOKEN || "").trim();
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not configured");

  const response = await fetch("https://api.telegram.org/bot" + token + "/" + method, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });

  const data = await response.json();
  if (!data.ok) throw new Error(data.description || ("Telegram API " + response.status));
  return data;
}

function appUrl(request, env) {
  return String(env.TELEGRAM_WEBAPP_URL || new URL(request.url).origin).replace(/\/$/, "");
}

export async function handleTelegramWebhook(request, env) {
  const update = await request.json();
  const message = update?.message;
  const chatId = message?.chat?.id;

  if (!chatId) return Response.json({ ok: true });

  const text = String(message?.text || "").trim().toLowerCase();
  if (text === "/start" || text === "/app" || text === "/music") {
    await telegramApi(env, "sendMessage", {
      chat_id: chatId,
      text: "🎵 Ok Music\n\nОткрой музыкальный плеер прямо в Telegram.",
      reply_markup: {
        inline_keyboard: [[{
          text: "🎧 Открыть Ok Music",
          web_app: { url: appUrl(request, env) }
        }]]
      }
    });
  }

  return Response.json({ ok: true });
}
