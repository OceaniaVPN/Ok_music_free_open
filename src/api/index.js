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
    audio: t.audio ? "/api/audio?url=" + encodeURIComponent(t.audio) : "",
    duration: Number(t.duration || 0),
    license: t.license_ccurl || "",
    source: "Jamendo",
    sourceUrl: t.shareurl || ("https://www.jamendo.com/track/" + t.id),
    genre: t.musicinfo?.tags?.genres?.[0] || ""
  };
}

async function searchJamendo(q, limit, env) {
  const clientId = String(env.JAMENDO_CLIENT_ID || "").trim();
  if (!clientId) throw new Error("JAMENDO_CLIENT_ID не задан");
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
  if (/[А-Яа-яЁё]/.test(q)) api.searchParams.set("lang", "ru");
  const response = await fetch(api, { headers: { accept: "application/json" } });
  if (!response.ok) throw new Error("Jamendo HTTP " + response.status);
  const data = await response.json();
  return uniqueTracks((data.results || []).map(normalizeJamendo).filter(t => t.audio), limit);
}

function zaycevResult(q) {
  const sourceUrl = "https://zaycev.net/search.html?query_search=" + encodeURIComponent(q);
  return {
    id: "zaycev-search-" + encodeURIComponent(q),
    title: "Открыть результаты ZAYCEV.NET",
    artist: q,
    album: "",
    image: "",
    audio: "",
    duration: 0,
    license: "",
    source: "ZAYCEV.NET",
    sourceUrl,
    genre: ""
  };
}

async function proxyAudio(url, request) {
  const target = new URL(url);
  const host = target.hostname.toLowerCase();
  const allowed = host === "api.jamendo.com" || host === "jamendo.com" || host.endsWith(".jamendo.com") || host === "storage.jamendo.com" || host.endsWith(".storage.jamendo.com");
  if (!allowed) return Response.json({ ok: false, error: "Audio host is not allowed" }, { status: 403 });
  const headers = new Headers();
  const range = request.headers.get("range");
  if (range) headers.set("range", range);
  const response = await fetch(target.toString(), { headers, redirect: "follow" });
  if (!response.ok && response.status !== 206) return Response.json({ ok: false, error: "Jamendo audio HTTP " + response.status }, { status: 502 });
  const out = new Headers(response.headers);
  out.set("access-control-allow-origin", "*");
  out.set("access-control-expose-headers", "Accept-Ranges, Content-Length, Content-Range, Content-Type");
  out.set("cache-control", "public, max-age=3600");
  out.set("accept-ranges", response.headers.get("accept-ranges") || "bytes");
  return new Response(response.body, { status: response.status, headers: out });
}

export async function handleApi(request, env) {
  const url = new URL(request.url);

  if (url.pathname === "/api/audio") {
    const raw = url.searchParams.get("url") || "";
    if (!raw) return Response.json({ ok: false, error: "Missing audio url" }, { status: 400 });
    try { return await proxyAudio(raw, request); }
    catch (e) { return Response.json({ ok: false, error: e?.message || "Audio proxy failed" }, { status: 502 }); }
  }

  if (url.pathname === "/api/health") {
    return Response.json({ ok: true, service: env.APP_NAME || "Ok Music", version: "7.0", providers: ["Jamendo", "ZAYCEV.NET"], jamendo: { configured: Boolean(String(env.JAMENDO_CLIENT_ID || "").trim()) } });
  }

  if (url.pathname === "/api/search") {
    const q = (url.searchParams.get("q") || "").trim();
    if (!q) return Response.json({ ok: true, query: "", providers: [], tracks: [] });
    const result = await Promise.allSettled([searchJamendo(q, 24, env)]);
    const jamendoTracks = result[0].status === "fulfilled" ? result[0].value : [];
    const zaycev = zaycevResult(q);
    const tracks = [...jamendoTracks, zaycev];
    const errors = result[0].status === "rejected" ? ["Jamendo: " + (result[0].reason?.message || "ошибка")] : [];
    return Response.json({ ok: tracks.length > 0, query: q, providers: [...(jamendoTracks.length ? ["Jamendo"] : []), "ZAYCEV.NET"], tracks, errors });
  }

  if (url.pathname === "/api/recommendations") {
    const seed = (url.searchParams.get("seed") || "").trim();
    const genres = (url.searchParams.get("genres") || "").trim();
    const moods = (url.searchParams.get("moods") || "").trim();
    const artists = (url.searchParams.get("artists") || "").trim();
    const now = (url.searchParams.get("now") || "").trim();
    const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || 16), 6), 40);
    const base = [seed, genres, moods, artists, now].filter(Boolean).join(", ") || "популярная музыка";
    const queries = [...new Set([base, genres, artists, now].filter(Boolean))].slice(0, 4);
    const results = await Promise.allSettled(queries.map(q => searchJamendo(q, Math.min(10, limit), env)));
    const tracks = uniqueTracks(results.flatMap(r => r.status === "fulfilled" ? r.value : []), limit);
    return Response.json({ ok: true, mode: base === "популярная музыка" ? "discovery" : "personalized", profile: { genres, moods, artists, now }, providers: tracks.length ? ["Jamendo"] : [], tracks, errors: results.filter(r => r.status === "rejected").map(r => "Jamendo: " + (r.reason?.message || "ошибка")) });
  }

  return Response.json({ ok: false, error: "Not found" }, { status: 404 });
}
