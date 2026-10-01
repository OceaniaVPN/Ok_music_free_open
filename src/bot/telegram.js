export async function handleTelegramWebhook(request, env) {
  const update = await request.json();
  console.log("Telegram update", update?.update_id);
  return Response.json({ ok: true });
}
