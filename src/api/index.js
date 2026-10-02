function normalizeJamendo(t) {
  return {
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
  };
}


function normalizeYouTube(t) {
  const id = String(t?.id?.videoId || "").trim();
  if (!id) return null;
  const snippet = t.snippet || {};
  const title = String(snippet.title || "Без названия");
  const artist = String(snippet.channelTitle || "YouTube");
  return {
    id: "youtube-" + id,
    youtubeId: id,
    title,
    artist,
    album: "",
    image: String(snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url || ""),
    audio: "",
    duration: 0,
    license: "",
    source: "YouTube Music",
    sourceUrl: "https://www.youtube.com/watch?v=" + encodeURIComponent(id),
    genre: ""
  };
}

async function searchYouTube(q, limit, env) {
  const key = String(env.YOUTUBE_API_KEY || "").trim();
  if (!key) throw new Error("YOUTUBE_API_KEY не задан");

  const api = new URL("https://www.googleapis.com/youtube/v3/search");
  api.searchParams.set("key", key);
  api.searchParams.set("part", "snippet");
  api.searchParams.set("type", "video");
  api.searchParams.set("videoCategoryId", "10");
  api.searchParams.set("maxResults", String(Math.min(Math.max(limit, 1), 50)));
  api.searchParams.set("q", q);

  const response = await fetch(api, { headers: { accept: "application/json" } });
  if (!response.ok) throw new Error("YouTube HTTP " + response.status);
  const data = await response.json();
  if (data?.error) {
    const message = data.error?.message || "YouTube API error";
    throw new Error("YouTube: " + message);
  }

  return uniqueTracks((data.items || []).map(normalizeYouTube).filter(Boolean), limit);
}

async function searchJamendo(q, limit, env) {
  const clientId = env.JAMENDO_CLIENT_ID;
  if (!clientId) return [];

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

  const response = await fetch(api, { headers: { accept: "application/json" } });
  if (!response.ok) throw new Error("Jamendo HTTP " + response.status);
  const data = await response.json();
  return (data.results || []).map(normalizeJamendo).filter(t => t.audio);
}

export async function handleApi(request, env) {
  const url = new URL(request.url);

  if (url.pathname === "/api/health") {
    return Response.json({
      ok: true,
      service: env.APP_NAME || "Ok Music",
      version: "4.0",
      providers: ["YouTube Music", "Jamendo"],
      youtube: { configured: Boolean(String(env.YOUTUBE_API_KEY || "").trim()) }
    });
  }

  if (url.pathname === "/api/search") {
    const q = (url.searchParams.get("q") || "").trim();
    const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || 24), 1), 50);
    if (!q) return Response.json({ ok: true, query: "", tracks: [], providers: [] });

    const [youtubeResult, jamendoResult] = await Promise.allSettled([
      searchYouTube(q, limit, env),
      searchJamendo(q, Math.max(6, Math.ceil(limit / 3)), env)
    ]);

    const youtubeTracks = youtubeResult.status === "fulfilled" ? youtubeResult.value : [];
    const jamendoTracks = jamendoResult.status === "fulfilled" ? jamendoResult.value : [];
    const tracks = [...youtubeTracks, ...jamendoTracks].slice(0, limit);

    if (!tracks.length) {
      const errors = [
        youtubeResult.status === "rejected" ? "YouTube: " + (youtubeResult.reason?.message || "ошибка") : "",
        jamendoResult.status === "rejected" ? "Jamendo: " + (jamendoResult.reason?.message || "ошибка") : ""
      ].filter(Boolean);

      return Response.json({
        ok: false,
        error: errors.length ? "Музыкальные каталоги недоступны" : "Ничего не найдено",
        details: errors,
        query: q,
        tracks: [],
        diagnostics: {
          youtubeConfigured: Boolean(String(env.YOUTUBE_API_KEY || "").trim()),
          jamendoConfigured: Boolean(String(env.JAMENDO_CLIENT_ID || "").trim()),
          errors
        }
      }, { status: errors.length ? 502 : 200 });
    }

    return Response.json({
      ok: true,
      query: q,
      providers: [
        ...(youtubeTracks.length ? ["YouTube Music"] : []),
        ...(jamendoTracks.length ? ["Jamendo"] : [])
      ],
      tracks
    });
  }

  if (url.pathname === "/api/recommendations") {
    const seed = (url.searchParams.get("seed") || "").trim();
    const mood = (url.searchParams.get("mood") || "").trim();
    const query = [seed, mood].filter(Boolean).join(" ").trim() || "популярная музыка";
    const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || 12), 6), 30);

    const [youtubeResult, jamendoResult] = await Promise.allSettled([
      searchYouTube(query, limit, env),
      searchJamendo(query, Math.max(4, Math.ceil(limit / 3)), env)
    ]);

    const youtubeTracks = youtubeResult.status === "fulfilled" ? youtubeResult.value : [];
    const jamendoTracks = jamendoResult.status === "fulfilled" ? jamendoResult.value : [];
    const tracks = [...youtubeTracks, ...jamendoTracks].slice(0, limit);

    return Response.json({
      ok: true,
      query,
      mode: seed || mood ? "personalized" : "discovery",
      providers: [
        ...(youtubeTracks.length ? ["YouTube Music"] : []),
        ...(jamendoTracks.length ? ["Jamendo"] : [])
      ],
      tracks,
      errors: [
        ...(youtubeResult.status === "rejected" ? ["YouTube: " + (youtubeResult.reason?.message || "ошибка")] : []),
        ...(jamendoResult.status === "rejected" ? ["Jamendo: " + (jamendoResult.reason?.message || "ошибка")] : [])
      ]
    });
  }

  return Response.json({ ok: false, error: "Not found" }, { status: 404 });
}
