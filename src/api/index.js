function md5(s){function a(x,y){return(x+y)|0}function r(x,n){return(x<<n)|(x>>>(32-n))}function c(q,x,y,z,w,n,t){return a(r(a(a(x,q),a(z,t)),n),y)}function f(x,y,z,w,q,n,t){return c((y&z)|(~y&w),x,y,q,n,t)}function g(x,y,z,w,q,n,t){return c((y&w)|(z&~w),x,y,q,n,t)}function h(x,y,z,w,q,n,t){return c(y^z^w,x,y,q,n,t)}function i(x,y,z,w,q,n,t){return c(z^(y|~w),x,y,q,n,t)}function words(s){s=unescape(encodeURIComponent(s));const n=((s.length+8>>6)+1),x=new Array(n*16).fill(0);for(let j=0;j<s.length;j++)x[j>>2]|=s.charCodeAt(j)<<((j%4)*8);x[s.length>>2]|=128<<((s.length%4)*8);x[n*16-2]=s.length*8;return x}const x=words(s);let A=1732584193,B=-271733879,C=-1732584194,D=271733878;for(let k=0;k<x.length;k+=16){const aa=A,bb=B,cc=C,dd=D;A=f(A,B,C,D,x[k],7,-680876936);D=f(D,A,B,C,x[k+1],12,-389564586);C=f(C,D,A,B,x[k+2],17,606105819);B=f(B,C,D,A,x[k+3],22,-1044525330);A=f(A,B,C,D,x[k+4],7,-176418897);D=f(D,A,B,C,x[k+5],12,1200080426);C=f(C,D,A,B,x[k+6],17,-1473231341);B=f(B,C,D,A,x[k+7],22,-45705983);A=f(A,B,C,D,x[k+8],7,1770035416);D=f(D,A,B,C,x[k+9],12,-1958414417);C=f(C,D,A,B,x[k+10],17,-42063);B=f(B,C,D,A,x[k+11],22,-1990404162);A=f(A,B,C,D,x[k+12],7,1804603682);D=f(D,A,B,C,x[k+13],12,-40341101);C=f(C,D,A,B,x[k+14],17,-1502002290);B=f(B,C,D,A,x[k+15],22,1236535329);A=g(A,B,C,D,x[k+1],5,-165796510);D=g(D,A,B,C,x[k+6],9,-1069501632);C=g(C,D,A,B,x[k+11],14,643717713);B=g(B,C,D,A,x[k],20,-373897302);A=g(A,B,C,D,x[k+5],5,-701558691);D=g(D,A,B,C,x[k+10],9,38016083);C=g(C,D,A,B,x[k+15],14,-660478335);B=g(B,C,D,A,x[k+4],20,-405537848);A=g(A,B,C,D,x[k+9],5,568446438);D=g(D,A,B,C,x[k+14],9,-1019803690);C=g(C,D,A,B,x[k+3],14,-187363961);B=g(B,C,D,A,x[k+8],20,1163531501);A=g(A,B,C,D,x[k+13],5,-1444681467);D=g(D,A,B,C,x[k+2],9,-51403784);C=g(C,D,A,B,x[k+7],14,1735328473);B=g(B,C,D,A,x[k+12],20,-1926607734);A=h(A,B,C,D,x[k+5],4,-378558);D=h(D,A,B,C,x[k+8],11,-2022574463);C=h(C,D,A,B,x[k+11],16,1839030562);B=h(B,C,D,A,x[k+14],23,-35309556);A=h(A,B,C,D,x[k+1],4,-1530992060);D=h(D,A,B,C,x[k+4],11,1272893353);C=h(C,D,A,B,x[k+7],16,-155497632);B=h(B,C,D,A,x[k+10],23,-1094730640);A=h(A,B,C,D,x[k+13],4,681279174);D=h(D,A,B,C,x[k],11,-358537222);C=h(C,D,A,B,x[k+3],16,-722521979);B=h(B,C,D,A,x[k+6],23,76029189);A=h(A,B,C,D,x[k+9],4,-640364487);D=h(D,A,B,C,x[k+12],11,-421815835);C=h(C,D,A,B,x[k+15],16,530742520);B=h(B,C,D,A,x[k+2],23,-995338651);A=i(A,B,C,D,x[k],6,-198630844);D=i(D,A,B,C,x[k+7],10,1126891415);C=i(C,D,A,B,x[k+14],15,-1416354905);B=i(B,C,D,A,x[k+5],21,-57434055);A=i(A,B,C,D,x[k+12],6,1700485571);D=i(D,A,B,C,x[k+3],10,-1894986606);C=i(C,D,A,B,x[k+10],15,-1051523);B=i(B,C,D,A,x[k+1],21,-2054922799);A=i(A,B,C,D,x[k+8],6,1873313359);D=i(D,A,B,C,x[k+15],10,-30611744);C=i(C,D,A,B,x[k+6],15,-1560198380);B=i(B,C,D,A,x[k+13],21,1309151649);A=i(A,B,C,D,x[k+4],6,-145523070);D=i(D,A,B,C,x[k+11],10,-1120210379);C=i(C,D,A,B,x[k+2],15,718787259);B=i(B,C,D,A,x[k+9],21,-343485551);A=a(A,aa);B=a(B,bb);C=a(C,cc);D=a(D,dd)}function z(n){let s="";for(let j=0;j<4;j++)s+=("0"+(n>>>j*8&255).toString(16)).slice(-2);return s}return z(A)+z(B)+z(C)+z(D)}
const ZAYCEV_BASE="https://api.zaycev.net/external";const ZAYCEV_KEYS=["kmskoNdkYHDnl3ol3","63kQw2LlpV3jv","d7DVdaELf"];let zaycevToken="",zaycevTokenAt=0;
async function zaycevJson(path,params={}){const u=new URL(ZAYCEV_BASE+path);for(const[k,v]of Object.entries(params))u.searchParams.set(k,String(v));const r=await fetch(u,{headers:{accept:"application/json","user-agent":"Ok Music/1.0"}});const text=await r.text();if(!r.ok)throw Error("Zaycev HTTP "+r.status);try{return JSON.parse(text)}catch{throw Error("Zaycev returned invalid JSON")}}
async function zaycevAuth(env){if(zaycevToken&&Date.now()-zaycevTokenAt<20*60*60*1000)return zaycevToken;const hello=await zaycevJson("/hello");if(!hello?.token)throw Error("Zaycev hello token missing");const keys=[env.ZAYCEV_STATIC_KEY,...ZAYCEV_KEYS].filter(Boolean);let last;for(const key of [...new Set(keys)])try{const auth=await zaycevJson("/auth",{code:hello.token,hash:md5(hello.token+key)});if(auth?.token){zaycevToken=auth.token;zaycevTokenAt=Date.now();return zaycevToken}}catch(e){last=e}throw last||Error("Zaycev authentication failed")}
function normalizeZaycev(t){if(!t?.id||t.block||t.phantom)return null;return{id:"zaycev-"+t.id,zaycevId:Number(t.id),title:t.track||"Без названия",artist:t.artistName||"Неизвестный исполнитель",album:"",image:t.artistImageUrlSquare250||t.artistImageUrlSquare100||"",audio:"/api/zaycev/play?id="+encodeURIComponent(t.id),duration:typeof t.duration==="number"?t.duration:0,license:"",source:"Zaycev.net",sourceUrl:"https://zaycev.net/track/"+t.id,genre:""}}
async function searchZaycev(q,limit,env){const token=await zaycevAuth(env),u=new URL(ZAYCEV_BASE+"/search");u.searchParams.set("query",q);u.searchParams.set("page","1");u.searchParams.set("access_token",token);const r=await fetch(u,{headers:{accept:"application/json","user-agent":"Ok Music/1.0"}});if(!r.ok)throw Error("Zaycev search HTTP "+r.status);const d=await r.json();return(d.tracks||[]).map(normalizeZaycev).filter(Boolean).slice(0,limit)}
async function zaycevPlay(id,env){const token=await zaycevAuth(env),d=await zaycevJson("/track/"+encodeURIComponent(id)+"/play",{access_token:token,encoded_identifier:""}),target=d?.url||d?.playUrl;if(!target)throw Error("Zaycev play URL missing");return target}
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
    youtubeResult.status === "rejected" ? "Zaycev.net: " + (youtubeResult.reason?.message || "ошибка") : "",
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
      searchZaycev(q, limit, env),
      searchJamendo(q, Math.max(6, Math.ceil(limit / 3)), env)
    ]);
    const zaycevTracks = youtubeResult.status === "fulfilled" ? youtubeResult.value : [];
    const jamendoTracks = jamendoResult.status === "fulfilled" ? jamendoResult.value : [];
    const tracks = uniqueTracks([...zaycevTracks, ...jamendoTracks], limit);
    const errors = providerErrors(youtubeResult, jamendoResult);

    if (!tracks.length) {
      return Response.json({
        ok: false,
        error: errors.length ? "Музыкальные каталоги недоступны" : "Ничего не найдено",
        details: errors,
        query: q,
        tracks: [],
        diagnostics: {
          zaycevConfigured: true,
          jamendoConfigured: Boolean(String(env.JAMENDO_CLIENT_ID || "").trim()),
          errors
        }
      }, { status: errors.length ? 502 : 200 });
    }

    return Response.json({
      ok: true,
      query: q,
      providers: [
        ...(zaycevTracks.length ? ["Zaycev.net"] : []),
        ...(jamendoTracks.length ? ["Jamendo"] : [])
      ],
      tracks
    });
  }

  if (url.pathname === "/api/zaycev/play") {
    const id=(url.searchParams.get("id")||"").trim();
    if(!/^\d+$/.test(id)) return Response.json({ok:false,error:"Invalid Zaycev track id"},{status:400});
    try{return Response.redirect(await zaycevPlay(id,env),302)}catch(e){return Response.json({ok:false,error:e?.message||"Zaycev playback unavailable"},{status:502})}
  }

  if (url.pathname === "/api/recommendations") {
    const seed=(url.searchParams.get("seed")||"").trim();
    const mood=(url.searchParams.get("mood")||"").trim();
    const genres=(url.searchParams.get("genres")||"").trim();
    const moods=(url.searchParams.get("moods")||"").trim();
    const artists=(url.searchParams.get("artists")||"").trim();
    const now=(url.searchParams.get("now")||"").trim();
    const liked=(url.searchParams.get("liked")||"").trim();
    const refresh=(url.searchParams.get("refresh")||"").trim();
    const limit=Math.min(Math.max(Number(url.searchParams.get("limit")||16),6),40);
    const base=[artists,genres,moods,mood,now,liked,seed].filter(Boolean).join(", ");
    const queries=[artists+" "+genres,genres+" "+moods,artists+" "+now,base,mood+" "+genres+" "+artists]
      .map(x=>x.replace(/\\s+/g," ").trim()).filter(Boolean);
    const uniqueQueries=[...new Set(queries)].slice(0,5);
    const zResults=await Promise.allSettled(uniqueQueries.map(q=>searchZaycev(q,Math.min(10,limit),env)));
    const jamResults=await Promise.allSettled(uniqueQueries.slice(0,3).map(q=>searchJamendo(q,4,env)));
    const zaycev=zResults.flatMap(r=>r.status==="fulfilled"?r.value:[]);
    const jam=jamResults.flatMap(r=>r.status==="fulfilled"?r.value:[]);
    const final=[];const seen=new Set();
    for(let i=0;i<Math.max(zaycev.length,jam.length)&&final.length<limit;i++){
      for(const list of [zaycev,jam]){const t=list[i];if(t&&!seen.has(t.id)){seen.add(t.id);final.push(t)}}
    }
    const errors=[...zResults.filter(r=>r.status==="rejected").map(r=>"Zaycev.net: "+(r.reason?.message||"ошибка")),...jamResults.filter(r=>r.status==="rejected").map(r=>"Jamendo: "+(r.reason?.message||"ошибка"))];
    if(refresh&&final.length>1){
      let h=0;for(const ch of refresh)h=(h*31+ch.charCodeAt(0))>>>0;
      const shift=h%final.length;final.push(...final.splice(0,shift));
    }
    return Response.json({ok:true,mode:base?"personalized":"discovery",profile:{genres,moods,artists,now},providers:[...(yt.length?["YouTube Music"]:[]),...(jam.length?["Jamendo"]:[])],tracks:final.slice(0,limit),errors});
  }
  return Response.json({ ok: false, error: "Not found" }, { status: 404 });
}
