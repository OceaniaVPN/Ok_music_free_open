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

function walkVk(value, out = []) {
  if (!value || typeof value !== "object") return out;
  if (Array.isArray(value)) {
    for (const item of value) walkVk(item, out);
    return out;
  }

  const audio = value.url || value.audio_url || value.stream_url;
  const title = value.title || value.name;
  const artist = value.artist || value.performer;
  if (audio && title && artist && (value.duration || value.id || value.track_id)) {
    out.push({
      id: "vk-" + String(value.owner_id ?? value.oid ?? "0") + "-" + String(value.id ?? value.track_id),
      title: String(title),
      artist: String(artist),
      album: String(value.album?.title || value.album_name || ""),
      image: String(value.thumb?.photo_600 || value.thumb?.photo_300 || value.image || ""),
      audio: String(audio),
      duration: Number(value.duration || 0),
      license: "",
      source: "VK",
      sourceUrl: value.url || "https://vk.ru/",
      genre: String(value.genre || "")
    });
  }

  for (const [key, child] of Object.entries(value)) {
    if (key !== "url" && key !== "audio_url" && key !== "stream_url") walkVk(child, out);
  }
  return out;
}

async function searchVk(q, limit) {
  const response = await fetch("https://vk.ru/al_audio.php", {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      "accept": "application/json, text/plain, */*",
      "x-requested-with": "XMLHttpRequest",
      "user-agent": "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/150 Mobile Safari/537.36"
    },
    body: new URLSearchParams({
      al: "1",
      act: "section",
      claim: "0",
      is_layer: "0",
      owner_id: "0",
      section: "search",
      q
    })
  });

  if (!response.ok) throw new Error("VK HTTP " + response.status);
  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text.replace(/^<!--/, "").replace(/-->$/, ""));
  } catch {
    throw new Error("VK returned non-JSON");
  }

  const found = walkVk(data)
    .filter(t => t.audio)
    .filter((t, i, arr) => arr.findIndex(x => x.id === t.id) === i)
    .slice(0, limit);

  return found;
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
      version: "3.0",
      providers: ["VK", "Jamendo"]
    });
  }

  if (url.pathname === "/api/search") {
    const q = (url.searchParams.get("q") || "").trim();
    const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || 24), 1), 50);
    if (!q) return Response.json({ ok: true, query: "", tracks: [], providers: [] });

    const [vkResult, jamendoResult] = await Promise.allSettled([
      searchVk(q, limit),
      searchJamendo(q, Math.max(6, Math.ceil(limit / 3)), env)
    ]);

    const vkTracks = vkResult.status === "fulfilled" ? vkResult.value : [];
    const jamendoTracks = jamendoResult.status === "fulfilled" ? jamendoResult.value : [];
    const tracks = [...vkTracks, ...jamendoTracks].slice(0, limit);

    if (!tracks.length) {
      const errors = [
        vkResult.status === "rejected" ? "VK: " + vkResult.reason?.message : "",
        jamendoResult.status === "rejected" ? "Jamendo: " + jamendoResult.reason?.message : ""
      ].filter(Boolean);
      return Response.json({
        ok: false,
        error: errors.length ? "Музыкальные каталоги недоступны" : "Ничего не найдено",
        details: errors,
        query: q,
        tracks: []
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
    return Response.json({ ok: true, tracks: [], providers: ["VK", "Jamendo"] });
  }

  return Response.json({ ok: false, error: "Not found" }, { status: 404 });
}
