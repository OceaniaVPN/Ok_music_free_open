import { DurableObject } from "cloudflare:workers";
import { handleApi } from "./api/index.js";
import { handleTelegramWebhook } from "./bot/telegram.js";
import { renderApp } from "./web/app.js";

// Compatibility export for the already-provisioned AuthCodes Durable Object.
// The current application no longer calls it, but Cloudflare requires the
// existing Durable Object class to remain exported on every new Worker version.
export class AuthCodes extends DurableObject {
  async fetch() {
    return new Response("AuthCodes compatibility endpoint", { status: 404 });
  }
}

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
