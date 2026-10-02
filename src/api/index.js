export async function handleApi(request, env) {
  const url = new URL(request.url);

  if (url.pathname === "/api/health") {
    return Response.json({ ok: true, service: env.APP_NAME || "Ok Music", version: "2.0" });
  }

  if (url.pathname === "/api/search") {
    const q = (url.searchParams.get("q") || "").trim();
    const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || 24), 1), 50);
    if (!q) return Response.json({ ok: true, query: "", source: "Jamendo", tracks: [] });

    const clientId = env.JAMENDO_CLIENT_ID;
    if (!clientId) return Response.json({ ok: false, error: "Jamendo client_id is not configured" }, { status: 500 });

    const api = new URL("https://api.jamendo.com/v3.0/tracks/");
    api.searchParams.set("client_id", clientId);
    api.searchParams.set("format", "json");
    api.searchParams.set("limit", String(limit));
    api.searchParams.set("search", q);
    api.searchParams.set("type", "single albumtrack");
    api.searchParams.set("imagesize", "300");
    api.searchParams.set("audioformat", "mp32");
    api.searchParams.set("include", "musicinfo");
    api.searchParams.set("order", "popularity_total");

    try {
      const response = await fetch(api, { headers: { accept: "application/json" } });
      if (!response.ok) return Response.json({ ok: false, error: `Jamendo returned HTTP ${response.status}` }, { status: 502 });
      const data = await response.json();

      const tracks = (data.results || [])
        .map(t => ({
          id: "jamendo-" + t.id,
          title: t.name || "Без названия",
          artist: t.artist_name || "Неизвестный исполнитель",
          album: t.album_name || "",
          image: t.image || t.album_image || "",
          audio: t.audio || "",
          duration: Number(t.duration || 0),
          license: t.license_ccurl || "",
          source: "Jamendo",
          sourceUrl: t.shareurl || ("https://www.jamendo.com/track/" + t.id),
          genre: t.musicinfo?.tags?.genres?.[0] || ""
        }))
        .filter(t => t.audio);

      return Response.json({ ok: true, query: q, source: "Jamendo", tracks });
    } catch (error) {
      return Response.json({ ok: false, error: "Не удалось связаться с музыкальным каталогом" }, { status: 502 });
    }
  }

  if (url.pathname === "/api/recommendations") {
    return Response.json({ ok: true, tracks: [] });
  }

  return Response.json({ ok: false, error: "Not found" }, { status: 404 });
}
