import { handleApi } from "./api/index.js";
import { handleTelegramWebhook } from "./bot/telegram.js";
import { renderApp } from "./web/app.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) return handleApi(request, env);
    if (url.pathname === "/telegram/webhook" && request.method === "POST") {
      return handleTelegramWebhook(request, env);
    }
    return renderApp(request, env);
  }
};
