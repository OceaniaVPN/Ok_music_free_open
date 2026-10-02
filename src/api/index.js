const YT_MUSIC_API_KEY = "AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30";
const YT_MUSIC_CLIENT_VERSION = "1.20260707.12.00";
const YT_MUSIC_SEARCH_PARAMS = "Eg-KAQwIARAAGAAgACgAMABqChAEEAMQCRAFEAo%3D";

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

function collectNodes(value, key, out = []) {
  if (!value || typeof value !== "object") return out;
  if (Array.isArray(value)) {
    for (const item of value) collectNodes(item, key, out);
    return out;
  }
  if (value[key] && typeof value[key] === "object") out.push(value[key]);
  for (const child of Object.values(value)) collectNodes(child, key, out);
  return out;
}

function firstText(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(firstText).filter(Boolean).join("");
  if (typeof value === "object") {
    if (typeof value.text === "string") return value.text;
    if (value.simpleText) return value.simpleText;
    if (Array.isArray(value.runs)) return value.runs.map(firstText).join("");
  }
  return "";
}

function parseDuration(value) {
  const text = firstText(value);
  if (!text) return 0;
  const parts = text.split(":").map(Number);
  if (parts.some(Number.isNaN)) return 0;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] || 0;
}

function normalizeYTMusic(item) {
  const videoId = String(item?.playlistItemData?.videoId || "").trim();
  if (!videoId) return null;

  const columns = Array.isArray(item.flexColumns)
    ? item.flexColumns.flatMap(column => column?.musicResponsiveListItemFlexColumnRenderer?.text?.runs || [])
    : [];

  const texts = columns.map(run => ({
    text: String(run?.text || "").trim(),
    browseId: String(run?.navigationEndpoint?.browseEndpoint?.browseId || "")
  })).filter(x => x.text);

  const title = firstText(item.flexColumns?.[0]?.musicResponsiveListItemFlexColumnRenderer?.text)
    || texts[0]?.text
    || "Без названия";

  const artist = texts.find(x => x.browseId.startsWith("UC"))?.text
    || texts[1]?.text
    || "Неизвестный исполнитель";

  const album = texts.find(x => x.browseId.startsWith("MPRE"))?.text || "";

  const thumbnails = item.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails
    || item.thumbnails
    || [];

  const durationText = item.fixedColumns?.[0]?.musicResponsiveListItemFixedColumnRenderer?.text;

  return {
    id: "ytmusic-" + videoId,
    youtubeId: videoId,
    title,
    artist,
    album,
    image: String(thumbnails.at(-1)?.url || ""),
    audio: "",
    duration: parseDuration(durationText),
    license: "",
    source: "YouTube Music",
    sourceUrl: "https://music.youtube.com/watch?v=" + encodeURIComponent(videoId),
    genre: ""
  };
}

async function searchYouTubeMusic(q, limit) {
  const endpoint = new URL("https://music.youtube.com/youtubei/v1/search");
  endpoint.searchParams.set("key", YT_MUSIC_API_KEY);
  endpoint.searchParams.set("alt", "json");

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "origin": "https://music.youtube.com",
      "accept": "application/json",
      "x-youtube-client-name": "67",
      "x-youtube-client-version": YT_MUSIC_CLIENT_VERSION,
      "referer": "https://music.youtube.com/"
    },
    body: JSON.stringify({
      context: {
        client: {
          clientName: "WEB_REMIX",
          clientVersion: YT_MUSIC_CLIENT_VERSION,
          hl: "ru",
          gl: "RU",
          platform: "DESKTOP"
        }
      },
      query: q,
      params: YT_MUSIC_SEARCH_PARAMS
    })
  });

  if (!response.ok) {
    throw new Error("YouTube Music HTTP " + response.status);
  }

  const data = await response.json();
  const items = collectNodes(data, "musicResponsiveListItemRenderer");
  return uniqueTracks(items.map(normalizeYTMusic).filter(Boolean), limit);
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
      version: "6.0",
      providers: ["YouTube Music", "Jamendo"],
      youtubeMusic: { configured: true, apiKeyRequired: false, mode: "direct-inner-tube" }
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
    const seed=(url.searchParams.get("seed")||"").trim();
    const mood=(url.searchParams.get("mood")||"").trim();
    const genres=(url.searchParams.get("genres")||"").trim();
    const moods=(url.searchParams.get("moods")||"").trim();
    const artists=(url.searchParams.get("artists")||"").trim();
    const now=(url.searchParams.get("now")||"").trim();
    const liked=(url.searchParams.get("liked")||"").trim();
    const limit=Math.min(Math.max(Number(url.searchParams.get("limit")||16),6),40);
    const base=[artists,genres,moods,mood,now,liked,seed].filter(Boolean).join(", ");
    const queries=[artists+" "+genres,genres+" "+moods,artists+" "+now,base,mood+" "+genres+" "+artists]
      .map(x=>x.replace(/\\s+/g," ").trim()).filter(Boolean);
    const uniqueQueries=[...new Set(queries)].slice(0,5);
    const ytResults=await Promise.allSettled(uniqueQueries.map(q=>searchYouTubeMusic(q,Math.min(10,limit))));
    const jamResults=await Promise.allSettled(uniqueQueries.slice(0,3).map(q=>searchJamendo(q,4,env)));
    const yt=ytResults.flatMap(r=>r.status==="fulfilled"?r.value:[]);
    const jam=jamResults.flatMap(r=>r.status==="fulfilled"?r.value:[]);
    const final=[];const seen=new Set();
    for(let i=0;i<Math.max(yt.length,jam.length)&&final.length<limit;i++){
      for(const list of [yt,jam]){const t=list[i];if(t&&!seen.has(t.id)){seen.add(t.id);final.push(t)}}
    }
    const errors=[...ytResults.filter(r=>r.status==="rejected").map(r=>"YouTube Music: "+(r.reason?.message||"ошибка")),...jamResults.filter(r=>r.status==="rejected").map(r=>"Jamendo: "+(r.reason?.message||"ошибка"))];
    return Response.json({ok:true,mode:base?"personalized":"discovery",profile:{genres,moods,artists,now},providers:[...(yt.length?["YouTube Music"]:[]),...(jam.length?["Jamendo"]:[])],tracks:final.slice(0,limit),errors});
  }
  return Response.json({ ok: false, error: "Not found" }, { status: 404 });
}
