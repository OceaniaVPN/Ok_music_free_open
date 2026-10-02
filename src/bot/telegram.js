function appUrl(request, env) {
  return String(env.TELEGRAM_WEBAPP_URL || new URL(request.url).origin).replace(/\/$/, "");
}

function commandText(update) {
  return String(update?.message?.text || update?.channel_post?.text || "")
    .trim()
    .toLowerCase();
}

function chatId(update) {
  return update?.message?.chat?.id ?? update?.channel_post?.chat?.id ?? null;
}

export async function handleTelegramWebhook(request, env) {
  try {
    const update = await request.json();
    const id = chatId(update);

    if (id === null) return Response.json({ ok: true });

    const text = commandText(update);
    const isStart = /^\/(start|app|music)(?:@[^\s]+)?(?:\s|$)/.test(text);

    if (!isStart) return Response.json({ ok: true });

    // Telegram allows a webhook to answer directly with a Bot API method.
    // This avoids a second network request from the Worker and makes /start
    // independent of TELEGRAM_BOT_TOKEN being available at runtime.
    return Response.json({
      method: "sendMessage",
      chat_id: id,
      text: "🎵 Ok Music\n\nОткрой музыкальный плеер прямо в Telegram.",
      reply_markup: {
        inline_keyboard: [[{
          text: "🎧 Открыть Ok Music",
          web_app: { url: appUrl(request, env) }
        }]]
      }
    });
  } catch (error) {
    // Always acknowledge Telegram so a malformed/non-message update cannot
    // turn into a webhook 500/retry loop.
    return Response.json({ ok: true });
  }
}
