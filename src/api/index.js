import YTMusic from "ytmusic-api";

let ytmusicPromise;

function uniqueTracks(tracks, limit) {
  const seen = new Set();
  return tracks.filter(track => {
    if (!track?.id || seen.has(track.id)) return false;
    seen.add(track.id);
    return true;
  }).slice(0, limit);
}

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

function normalizeYTMusic(t) {
  const id = String(t?.videoId || "").trim();
  if (!id) return null;
  const thumbnails = Array.isArray(t.thumbnails) ? t.thumbnails : [];
  return {
    id: "ytmusic-" + id,
    youtubeId: id,
    title: String(t.name || "Без названия"),
    artist: String(t.artist?.name || "Неизвестный исполнитель"),
    album: String(t.album?.name || ""),
    image: String(thumbnails.at(-1)?.url || ""),
    audio: "",
    duration: Number(t.duration || 0),
    license: "",
    source: "YouTube Music",
    sourceUrl: "https://music.youtube.com/watch?v=" + encodeURIComponent(id),
    genre: ""
  };
}

async function getYTMusic() {
  if (!ytmusicPromise) {
    ytmusicPromise = (async () => {
      const client = new YTMusic();
      await client.initialize({ GL: "RU", HL: "ru" });
      return client;
    })();
  }
  try {
    return await ytmusicPromise;
  } catch (error) {
    ytmusicPromise = null;
    throw error;
  }
}

async function searchYouTubeMusic(q, limit) {
  const client = await getYTMusic();
  const songs = await client.searchSongs(q);
  return uniqueTracks(songs.map(normalizeYTMusic).filter(Boolean), limit);
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

function providerErrors(youtubeResult, jamendoResult) {
  return [
    youtubeResult.status === "rejected" ? "YouTube Music: " + (youtubeResult.reason?.message || "ошибка") : "",
    jamendoResult.status === "rejected" ? "Jamendo: " + (jamendoResult.reason?.message || "ошибка") : ""
  ].filter(Boolean);
}

export async function handleApi(request, env) {
  const url = new URL(request.url);

  if (url.pathname === "/api/health") {
    return Response.json({
      ok: true,
      service: env.APP_NAME || "Ok Music",
      version: "5.0",
      providers: ["YouTube Music", "Jamendo"],
      youtubeMusic: { configured: true, apiKeyRequired: false }
    });
  }

  if (url.pathname === "/api/search") {
    const q = (url.searchParams.get("q") || "").trim();
    const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || 24), 1), 50);
    if (!q) return Response.json({ ok: true, query: "", tracks: [], providers: [] });

    const [youtubeResult, jamendoResult] = await Promise.allSettled([
      searchYouTubeMusic(q, limit),
      searchJamendo(q, Math.max(6, Math.ceil(limit / 3)), env)
    ]);
    const youtubeTracks = youtubeResult.status === "fulfilled" ? youtubeResult.value : [];
    const jamendoTracks = jamendoResult.status === "fulfilled" ? jamendoResult.value : [];
    const tracks = [...youtubeTracks, ...jamendoTracks].slice(0, limit);
    const errors = providerErrors(youtubeResult, jamendoResult);

    if (!tracks.length) {
      return Response.json({
        ok: false,
        error: errors.length ? "Музыкальные каталоги недоступны" : "Ничего не найдено",
        details: errors,
        query: q,
        tracks: [],
        diagnostics: {
          youtubeMusicConfigured: true,
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
      searchYouTubeMusic(query, limit),
      searchJamendo(query, Math.max(4, Math.ceil(limit / 3)), env)
    ]);
    const youtubeTracks = youtubeResult.status === "fulfilled" ? youtubeResult.value : [];
    const jamendoTracks = jamendoResult.status === "fulfilled" ? jamendoResult.value : [];

    return Response.json({
      ok: true,
      query,
      mode: seed || mood ? "personalized" : "discovery",
      providers: [
        ...(youtubeTracks.length ? ["YouTube Music"] : []),
        ...(jamendoTracks.length ? ["Jamendo"] : [])
      ],
      tracks: [...youtubeTracks, ...jamendoTracks].slice(0, limit),
      errors: providerErrors(youtubeResult, jamendoResult)
    });
  }

  return Response.json({ ok: false, error: "Not found" }, { status: 404 });
}
