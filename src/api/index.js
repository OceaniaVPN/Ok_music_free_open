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

function normalizeVk(t) {
  const audio = t.url || t.audio_url || t.stream_url || "";
  const title = t.title || t.name || "";
  const artist = t.artist || t.performer || t.artist_name || "";
  if (!audio || !title || !artist) return null;

  return {
    id: "vk-" + String(t.owner_id ?? t.oid ?? "0") + "-" + String(t.id ?? t.track_id ?? Math.random()),
    title: String(title),
    artist: String(artist),
    album: String(t.album?.title || t.album_name || ""),
    image: String(t.thumb?.photo_600 || t.thumb?.photo_300 || t.image || ""),
    audio: String(audio),
    duration: Number(t.duration || 0),
    license: "",
    source: "VK",
    sourceUrl: String(t.url || "https://vk.ru/"),
    genre: String(t.genre || "")
  };
}

function uniqueTracks(tracks, limit) {
  const seen = new Set();
  return tracks.filter(track => {
    if (!track?.id || seen.has(track.id)) return false;
    seen.add(track.id);
    return true;
  }).slice(0, limit);
}

async function searchVk(q, limit, env) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  const token = String(env.VK_ACCESS_TOKEN || "").trim();
  const userAgent = String(
    env.VK_USER_AGENT ||
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36"
  ).trim();

  if (!token) throw new Error("VK_ACCESS_TOKEN не задан");

  const api = new URL("https://api.vk.ru/method/audio.search");
  api.searchParams.set("v", "5.199");
  api.searchParams.set("q", q);
  api.searchParams.set("count", String(Math.min(Math.max(limit, 1), 100)));
  api.searchParams.set("sort", "2");

  let response;
  try {
    response = await fetch(api, {
      headers: {
        accept: "application/json",
        authorization: `Bearer ${token}`,
        "user-agent": userAgent
      },
      signal: controller.signal
    });
  } catch (error) {
    throw new Error(error?.name === "AbortError" ? "VK timeout" : "VK network error");
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) throw new Error("VK HTTP " + response.status);

  const data = await response.json();

  if (data?.error) {
    const code = data.error.error_code ?? "unknown";
    const message = data.error.error_msg || "VK API error";
    throw new Error("VK " + code + ": " + message);
  }

  const items = Array.isArray(data?.response?.items) ? data.response.items : [];
  return uniqueTracks(items.map(normalizeVk).filter(Boolean), limit);
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
      providers: ["VK", "Jamendo"],
      vk: {
        configured: Boolean(String(env.VK_ACCESS_TOKEN || "").trim()),
        userAgent: Boolean(String(env.VK_USER_AGENT || "").trim())
      }
    });
  }

  if (url.pathname === "/api/search") {
    const q = (url.searchParams.get("q") || "").trim();
    const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || 24), 1), 50);
    if (!q) return Response.json({ ok: true, query: "", tracks: [], providers: [] });

    const [vkResult, jamendoResult] = await Promise.allSettled([
      searchVk(q, limit, env),
      searchJamendo(q, Math.max(6, Math.ceil(limit / 3)), env)
    ]);

    const vkTracks = vkResult.status === "fulfilled" ? vkResult.value : [];
    const jamendoTracks = jamendoResult.status === "fulfilled" ? jamendoResult.value : [];
    const tracks = [...vkTracks, ...jamendoTracks].slice(0, limit);

    if (!tracks.length) {
      const errors = [
        vkResult.status === "rejected" ? "VK: " + (vkResult.reason?.message || "ошибка") : "",
        jamendoResult.status === "rejected" ? "Jamendo: " + (jamendoResult.reason?.message || "ошибка") : ""
      ].filter(Boolean);

      return Response.json({
        ok: false,
        error: errors.length ? "Музыкальные каталоги недоступны" : "Ничего не найдено",
        details: errors,
        query: q,
        tracks: [],
        diagnostics: {
          vkConfigured: Boolean(String(env.VK_ACCESS_TOKEN || "").trim()),
          jamendoConfigured: Boolean(String(env.JAMENDO_CLIENT_ID || "").trim()),
          errors
        }
      }, { status: errors.length ? 502 : 200 });
    }

    return Response.json({
      ok: true,
      query: q,
      providers: [
        ...(vkTracks.length ? ["VK"] : []),
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

    const [vkResult, jamendoResult] = await Promise.allSettled([
      searchVk(query, limit, env),
      searchJamendo(query, Math.max(4, Math.ceil(limit / 3)), env)
    ]);

    const vkTracks = vkResult.status === "fulfilled" ? vkResult.value : [];
    const jamendoTracks = jamendoResult.status === "fulfilled" ? jamendoResult.value : [];
    const tracks = [...vkTracks, ...jamendoTracks].slice(0, limit);

    return Response.json({
      ok: true,
      query,
      mode: seed || mood ? "personalized" : "discovery",
      providers: [
        ...(vkTracks.length ? ["VK"] : []),
        ...(jamendoTracks.length ? ["Jamendo"] : [])
      ],
      tracks,
      errors: [
        ...(vkResult.status === "rejected" ? ["VK: " + (vkResult.reason?.message || "ошибка")] : []),
        ...(jamendoResult.status === "rejected" ? ["Jamendo: " + (jamendoResult.reason?.message || "ошибка")] : [])
      ]
    });
  }

  return Response.json({ ok: false, error: "Not found" }, { status: 404 });
}
