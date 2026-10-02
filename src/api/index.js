export async function handleApi(request, env) {
  const url = new URL(request.url);

  if (url.pathname === "/api/health") {
    return Response.json({ ok: true, service: env.APP_NAME || "Ok Music" });
  }

  if (url.pathname === "/api/search") {
    const q = (url.searchParams.get("q") || "").trim();
    if (!q) return Response.json({ ok: true, query: "", source: "Jamendo", tracks: [] });

    const clientId = env.JAMENDO_CLIENT_ID;
    if (!clientId) {
      return Response.json({ ok: false, error: "Jamendo client_id is not configured" }, { status: 500 });
    }

    const api = new URL("https://api.jamendo.com/v3.0/tracks/");
    api.searchParams.set("client_id", clientId);
    api.searchParams.set("format", "json");
    api.searchParams.set("limit", "12");
    api.searchParams.set("search", q);
    api.searchParams.set("type", "single albumtrack");
    api.searchParams.set("imagesize", "200");
    api.searchParams.set("audioformat", "mp32");
    api.searchParams.set("include", "licenses");

    const response = await fetch(api);
    if (!response.ok) {
      return Response.json({ ok: false, error: "Jamendo API request failed" }, { status: 502 });
    }

    const data = await response.json();
    const tracks = (data.results || []).map(t => ({
      id: "jamendo-" + t.id,
      title: t.name,
      artist: t.artist_name,
      image: t.image || t.album_image || "",
      audio: t.audio || "",
      duration: Number(t.duration || 0),
      license: t.license_ccurl || "",
      source: "Jamendo",
      sourceUrl: t.shareurl || ("https://www.jamendo.com/track/" + t.id)
    })).filter(t => t.audio);

    return Response.json({ ok: true, query: q, source: "Jamendo", tracks });
  }

  if (url.pathname === "/api/recommendations") {
    return Response.json({ ok: true, tracks: [] });
  }

  return Response.json({ ok: false, error: "Not found" }, { status: 404 });
}
