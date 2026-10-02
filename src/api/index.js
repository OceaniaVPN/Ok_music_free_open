const ZAYCEV_BASE="https://zaycev.net";
const ZAYCEV_SEARCH="https://zaycev.net/search";
const ZAYCEV_TRACK_API="https://zaycev.net/api/external/track";
const ZAYCEV_HEADERS={
  "accept":"application/json, text/plain, */*",
  "accept-language":"ru-RU,ru;q=0.8,en-US;q=0.5,en;q=0.3",
  "content-type":"application/json;charset=utf-8",
  "origin":ZAYCEV_BASE,
  "referer":ZAYCEV_BASE+"/",
  "user-agent":"Mozilla/5.0 (X11; Linux x86_64; rv:129.0) Gecko/20100101 Firefox/129.0"
};

function stripHtml(value){
  return String(value||"").replace(/<script[\s\S]*?<\/script>/gi," ").replace(/<style[\s\S]*?<\/style>/gi," ").replace(/<[^>]+>/g," ").replace(/&nbsp;/gi," ").replace(/&amp;/gi,"&").replace(/&quot;/gi,'"').replace(/&#39;/gi,"'").replace(/&lt;/gi,"<").replace(/&gt;/gi,">").replace(/\s+/g," ").trim();
}
function parseDuration(value){
  const text=String(value||"").trim(), parts=text.split(":").map(Number);
  if(parts.some(Number.isNaN))return 0;
  if(parts.length===3)return parts[0]*3600+parts[1]*60+parts[2];
  if(parts.length===2)return parts[0]*60+parts[1];
  return parts[0]||0;
}
function parseZaycevSearch(html,limit){
  const out=[],seen=new Set();
  const chunks=String(html||"").match(/<li\b[^>]*>[\s\S]*?<\/li>/gi)||[String(html||"")];
  for(const chunk of chunks){
    const links=[...chunk.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)];
    const trackLink=links.find(x=>/\/pages\/\d+\/\d+\.shtml(?:[?#]|$)/i.test(x[1]));
    if(!trackLink)continue;
    const idm=trackLink[1].match(/\/(\d+)\.shtml(?:[?#]|$)/); if(!idm)continue;
    const id=idm[1]; if(seen.has(id))continue;
    const texts=links.map(x=>stripHtml(x[2])).filter(Boolean);
    const title=stripHtml(trackLink[2])||"Без названия";
    const artist=texts.find(x=>x!==title&&x.length<160)||"Неизвестный исполнитель";
    const dm=stripHtml(chunk).match(/\b(\d{1,2}:\d{2})\b/);
    seen.add(id);out.push({id,title,artist,duration:dm?parseDuration(dm[1]):0});
    if(out.length>=limit)break;
  }
  if(!out.length){
    for(const m of String(html||"").matchAll(/href=["']([^"']*\/pages\/\d+\/\d+\.shtml[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi)){
      const idm=m[1].match(/\/(\d+)\.shtml/);if(!idm||seen.has(idm[1]))continue;
      seen.add(idm[1]);out.push({id:idm[1],title:stripHtml(m[2])||"Без названия",artist:"Неизвестный исполнитель",duration:0});
      if(out.length>=limit)break;
    }
  }
  return out;
}
async function fetchZaycevSearch(q,limit){
  const u=new URL(ZAYCEV_SEARCH);u.searchParams.set("query_search",q);u.searchParams.set("type","track");
  const r=await fetch(u,{headers:{"accept":"text/html,application/xhtml+xml","accept-language":"ru-RU,ru;q=0.9,en;q=0.7","referer":ZAYCEV_BASE+"/","user-agent":ZAYCEV_HEADERS["user-agent"]}});
  const html=await r.text();if(!r.ok)throw Error("Zaycev search HTTP "+r.status);
  const found=parseZaycevSearch(html,limit);if(!found.length)throw Error("Zaycev search returned no parsable tracks");
  return found.map(t=>({id:"zaycev-"+t.id,zaycevId:Number(t.id),title:t.title,artist:t.artist,album:"",image:"",audio:"/api/zaycev/play?id="+encodeURIComponent(t.id),duration:t.duration||0,license:"",source:"Zaycev.net",sourceUrl:ZAYCEV_BASE+"/pages/"+Math.floor(Number(t.id)/100)+"/"+t.id+".shtml",genre:""}));
}
async function zaycevFileMeta(ids){
  const r=await fetch(ZAYCEV_TRACK_API+"/filezmeta",{method:"POST",headers:ZAYCEV_HEADERS,body:JSON.stringify({trackIds:ids.map(String),subscription:false})});
  const text=await r.text();if(!r.ok)throw Error("Zaycev filezmeta HTTP "+r.status);
  let d;try{d=JSON.parse(text)}catch{throw Error("Zaycev filezmeta returned invalid JSON")}
  return Array.isArray(d?.tracks)?d.tracks:[];
}
async function zaycevPlay(id){
  const meta=(await zaycevFileMeta([id]))[0];if(!meta)throw Error("Zaycev track metadata not found");
  if(meta.download){
    const r=await fetch(ZAYCEV_TRACK_API+"/download/"+encodeURIComponent(meta.download),{headers:{accept:"text/plain,application/json,*/*","user-agent":ZAYCEV_HEADERS["user-agent"],referer:ZAYCEV_BASE+"/"}});
    const target=(await r.text()).trim();if(r.ok&&/^https?:\/\//i.test(target))return target;
  }
  if(meta.streaming){
    const r=await fetch(ZAYCEV_TRACK_API+"/play/"+encodeURIComponent(meta.streaming),{headers:ZAYCEV_HEADERS});
    const text=await r.text();if(!r.ok)throw Error("Zaycev stream HTTP "+r.status);
    let d;try{d=JSON.parse(text)}catch{throw Error("Zaycev stream returned invalid JSON")}
    if(d?.url)return d.url;
  }
  throw Error("Zaycev playback URL missing");
}
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

export async function handleApi(request,env){
  const url=new URL(request.url);
  if(url.pathname==="/api/health")return Response.json({ok:true,service:env.APP_NAME||"Ok Music",version:"7.0",providers:["Zaycev.net","Jamendo"],zaycev:{configured:true,mode:"current-web-api"},jamendo:{configured:Boolean(String(env.JAMENDO_CLIENT_ID||"").trim())}});
  if(url.pathname==="/api/search"){
    const q=(url.searchParams.get("q")||"").trim(),limit=Math.min(Math.max(Number(url.searchParams.get("limit")||24),1),50);
    if(!q)return Response.json({ok:true,query:"",tracks:[],providers:[]});
    const [z,j]=await Promise.allSettled([fetchZaycevSearch(q,limit),searchJamendo(q,Math.max(6,Math.ceil(limit/3)),env)]);
    const zTracks=z.status==="fulfilled"?z.value:[],jTracks=j.status==="fulfilled"?j.value:[],tracks=uniqueTracks([...zTracks,...jTracks],limit);
    const errors=[...(z.status==="rejected"?["Zaycev.net: "+(z.reason?.message||"ошибка")]:[]),...(j.status==="rejected"?["Jamendo: "+(j.reason?.message||"ошибка")]:[])];
    if(!tracks.length)return Response.json({ok:false,error:errors.length?"Музыкальные каталоги недоступны":"Ничего не найдено",details:errors,query:q,tracks:[],diagnostics:{zaycevConfigured:true,jamendoConfigured:Boolean(String(env.JAMENDO_CLIENT_ID||"").trim()),errors}},{status:errors.length?502:200});
    return Response.json({ok:true,query:q,providers:[...(zTracks.length?["Zaycev.net"]:[]),...(jTracks.length?["Jamendo"]:[])],tracks});
  }
  if(url.pathname==="/api/zaycev/play"){
    const id=(url.searchParams.get("id")||"").trim();if(!/^\d+$/.test(id))return Response.json({ok:false,error:"Invalid Zaycev track id"},{status:400});
    try{return Response.redirect(await zaycevPlay(id),302)}catch(e){return Response.json({ok:false,error:e?.message||"Zaycev playback unavailable"},{status:502})}
  }
  if(url.pathname==="/api/recommendations"){
    const seed=(url.searchParams.get("seed")||"").trim(),mood=(url.searchParams.get("mood")||"").trim(),genres=(url.searchParams.get("genres")||"").trim(),moods=(url.searchParams.get("moods")||"").trim(),artists=(url.searchParams.get("artists")||"").trim(),now=(url.searchParams.get("now")||"").trim(),liked=(url.searchParams.get("liked")||"").trim(),refresh=(url.searchParams.get("refresh")||"").trim(),limit=Math.min(Math.max(Number(url.searchParams.get("limit")||16),6),40);
    const base=[artists,genres,moods,mood,now,liked,seed].filter(Boolean).join(", ");
    const queries=[artists+" "+genres,genres+" "+moods,artists+" "+now,base,mood+" "+genres+" "+artists].map(x=>x.replace(/\s+/g," ").trim()).filter(Boolean);
    const uniqueQueries=[...new Set(queries)].slice(0,5);
    const [zr,jr]=await Promise.all([Promise.allSettled(uniqueQueries.map(q=>fetchZaycevSearch(q,Math.min(10,limit)))),Promise.allSettled(uniqueQueries.slice(0,3).map(q=>searchJamendo(q,4,env)))]);
    const zaycev=zr.flatMap(r=>r.status==="fulfilled"?r.value:[]),jam=jr.flatMap(r=>r.status==="fulfilled"?r.value:[]),final=[],seen=new Set();
    for(let i=0;i<Math.max(zaycev.length,jam.length)&&final.length<limit;i++)for(const list of [zaycev,jam]){const t=list[i];if(t&&!seen.has(t.id)){seen.add(t.id);final.push(t)}}
    const errors=[...zr.filter(r=>r.status==="rejected").map(r=>"Zaycev.net: "+(r.reason?.message||"ошибка")),...jr.filter(r=>r.status==="rejected").map(r=>"Jamendo: "+(r.reason?.message||"ошибка"))];
    if(refresh&&final.length>1){let h=0;for(const ch of refresh)h=(h*31+ch.charCodeAt(0))>>>0;const shift=h%final.length;final.push(...final.splice(0,shift))}
    return Response.json({ok:true,mode:base?"personalized":"discovery",profile:{genres,moods,artists,now},providers:[...(zaycev.length?["Zaycev.net"]:[]),...(jam.length?["Jamendo"]:[])],tracks:final.slice(0,limit),errors});
  }
  return Response.json({ok:false,error:"Not found"},{status:404});
}
