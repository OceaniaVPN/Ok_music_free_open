import { LOCAL_MUSIC } from "../local-music.js";
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
    const idm=trackLink[1].match(/\/(\d+)\.shtml(?:[?#]|$)/);if(!idm)continue;
    const id=idm[1];if(seen.has(id))continue;
    const texts=links.map(x=>stripHtml(x[2])).filter(Boolean);
    const title=stripHtml(trackLink[2])||"Без названия";
    const artist=texts.find(x=>x!==title&&x.length<160)||"Неизвестный исполнитель";
    const imgTag=chunk.match(/<(?:img|source)\b[^>]*>/i);
    const attrs=imgTag?imgTag[0]:"";
    const imageMatch=attrs.match(/(?:data-src|data-original|data-lazy-src|poster|src)=["']([^"']+)["']/i);
    const srcsetMatch=attrs.match(/(?:data-srcset|srcset)=["']([^"']+)["']/i);
    const imageCandidates=[imageMatch?.[1],srcsetMatch?srcsetMatch[1].split(",").pop().trim().split(/\s+/)[0]:""].filter(Boolean);
    const image=imageCandidates.find(x=>/cdnimg\.zaycev\.net\/commonImage\/album\//i.test(x)||/\/album\//i.test(x))||imageCandidates[0]||"";
    const dm=stripHtml(chunk).match(/\b(\d{1,2}:\d{2})\b/);
    seen.add(id);out.push({id,title,artist,image,duration:dm?parseDuration(dm[1]):0,sourceUrl:new URL(trackLink[1],ZAYCEV_BASE).href});
    if(out.length>=limit)break;
  }
  if(!out.length){
    for(const m of String(html||"").matchAll(/href=["']([^"']*\/pages\/\d+\/\d+\.shtml[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi)){
      const idm=m[1].match(/\/(\d+)\.shtml/);if(!idm||seen.has(idm[1]))continue;
      seen.add(idm[1]);out.push({id:idm[1],title:stripHtml(m[2])||"Без названия",artist:"Неизвестный исполнитель",image:"",duration:0,sourceUrl:new URL(m[1],ZAYCEV_BASE).href});
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
  return found.map(t=>({id:"zaycev-"+t.id,zaycevId:Number(t.id),title:t.title,artist:t.artist,album:"",image:t.image?(new URL(t.image,ZAYCEV_BASE).href):"",audio:"/api/zaycev/play?id="+encodeURIComponent(t.id),duration:t.duration||0,license:"",source:"Zaycev.net",sourceUrl:t.sourceUrl,genre:""}));
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

const HITMOTOP_BASES=["https://eu.hitmoz.com","https://ru.hitmoz.org","https://rus.hitmoz.org","https://hitmos.fm","https://hitmos.me"];
// Public deployment of the open-source Shukurov777/hitmoz-parser project.
// It runs the original Python + BeautifulSoup parser outside the Cloudflare Worker.
const HITMOZ_PARSER_API_BASE="https://bakha.me/";
const HITMOTOP_HEADERS={
  "accept":"text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "accept-language":"ru-RU,ru;q=0.8,en-US;q=0.5,en;q=0.3",
  "cache-control":"no-cache",
  "user-agent":"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36"
};

function hitmotopAbsoluteUrl(value,base){
  const raw=String(value||"").trim();
  if(!raw)return "";
  try{return new URL(raw,base).href}catch{return ""}
}

function hitmotopCookieHeader(response){
  try{
    const values=typeof response.headers.getSetCookie==="function"?response.headers.getSetCookie():[response.headers.get("set-cookie")||""];
    return values
      .flatMap(value=>String(value||"").split(/,(?=[^;,=]+=[^;,]+)/))
      .map(value=>value.trim().split(";",1)[0])
      .filter(value=>/^[^=;]+=[^=;]*$/.test(value))
      .join("; ");
  }catch{return ""}
}

function hitmotopExtractAttr(tag,name){
  const wanted=String(name||"").toLowerCase();
  for(const match of String(tag||"").matchAll(/([A-Za-z0-9:-]+)\s*=\s*["']([^"']+)["']/g)){
    if(String(match[1]).toLowerCase()===wanted)return match[2];
  }
  return "";
}

function hitmotopExtractImageFromTag(tag,base){
  const style=hitmotopExtractAttr(tag,"style");
  const direct=hitmotopExtractAttr(tag,"src")||hitmotopExtractAttr(tag,"data-src")||hitmotopExtractAttr(tag,"data-original");
  const fromStyle=style.match(/url\(\s*["']?([^"')]+)["']?\s*\)/i);
  const image=fromStyle?.[1]||direct;
  return image?hitmotopAbsoluteUrl(image,base):"";
}

function parseHitmotopSearch(html,base,limit){
  const source=String(html||"");
  const collect=(re)=>[...source.matchAll(re)].map(match=>match[1]);
  const titles=collect(/<div\b[^>]*class=["'][^"']*\btrack__title\b[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi);
  const artists=collect(/<div\b[^>]*class=["'][^"']*\btrack__desc\b[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi);
  const durations=collect(/<div\b[^>]*class=["'][^"']*\btrack__fulltime\b[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi);
  const images=collect(/<div\b[^>]*class=["'][^"']*\btrack__img\b[^"']*["'][^>]*>/gi);
  const downloads=collect(/<a\b[^>]*class=["'][^"']*\btrack__download-btn\b[^"']*["'][^>]*>/gi);
  const infoLinks=collect(/<a\b[^>]*class=["'][^"']*\btrack__info-l\b[^"']*["'][^>]*>/gi);
  const count=Math.min(limit,titles.length,artists.length,durations.length,downloads.length,infoLinks.length);
  const out=[];
  const seen=new Set();

  for(let i=0;i<count;i++){
    const downloadHref=hitmotopExtractAttr(downloads[i],"href");
    const infoHref=hitmotopExtractAttr(infoLinks[i],"href");
    const urlDown=hitmotopAbsoluteUrl(downloadHref,base);
    const pageUrl=hitmotopAbsoluteUrl(infoHref,base);
    if(!urlDown)continue;

    const title=stripHtml(titles[i]).replace(/[/\\:*?"<>|]/g,"").trim()||"Без названия";
    const artist=stripHtml(artists[i])||"Неизвестный исполнитель";
    const durationText=stripHtml(durations[i]);
    const duration=parseDuration(durationText.match(/\b\d{1,2}:\d{2}(?::\d{2})?\b/)?.[0]||"");
    const image=hitmotopExtractImageFromTag(images[i]||"",base);
    const key=pageUrl||urlDown;
    const idPart=(key.match(/\/([^/?#]+)(?:[?#]|$)/)?.[1]||key).replace(/[^a-zA-Z0-9_-]/g,"-").slice(-140);
    const id="hitmotop-"+idPart;
    if(seen.has(id))continue;
    seen.add(id);
    out.push({
      id,
      title,
      artist,
      album:"",
      image,
      audio:"/api/hitmotop/play?url="+encodeURIComponent(urlDown),
      duration,
      license:"",
      source:"Hitmotop",
      sourceUrl:pageUrl||urlDown,
      genre:"",
      downloadUrl:urlDown
    });
  }
  // HitMoz's current HTML can expose the real MP3 as /get/music/*.mp3
  // without the older track__download-btn markup. Parse those links as a fallback.
  if(out.length<limit){
    const seenUrls=new Set(out.map(t=>t.downloadUrl).filter(Boolean));
    // Simple href scan avoids complex regex escaping inside the generated Worker source.
    const links=[...source.matchAll(/href=["']([^"']+)["']/gi)];
    for(const match of links){
      if(out.length>=limit)break;
      const rawHref=match[1]||"";
      if(!rawHref.toLowerCase().includes("/get/music/")||!rawHref.toLowerCase().includes(".mp3"))continue;
      const urlDown=hitmotopAbsoluteUrl(rawHref,base);
      if(!urlDown||seenUrls.has(urlDown))continue;
      seenUrls.add(urlDown);
      let filename=urlDown.split("/").pop().split("?")[0];
      try{filename=decodeURIComponent(filename)}catch{}
      if(filename.toLowerCase().endsWith(".mp3"))filename=filename.slice(0,-4);
      const clean=filename.replace(/_/g," ").trim();
      let artist="Неизвестный исполнитель", title=clean||"Без названия";
      const parts=clean.split(" - ");
      if(parts.length>=2){artist=parts[0].trim()||artist;title=parts.slice(1).join(" - ").trim()||title}
      const idPart=filename.split("_").pop()||"";
      const id=/^\d{6,}$/.test(idPart)?"hitmotop-"+idPart:"hitmotop-"+Math.abs([...urlDown].reduce((h,c)=>((h<<5)-h+c.charCodeAt(0))|0,0));
      out.push({id,title,artist,album:"",image:"",audio:"/api/hitmotop/play?url="+encodeURIComponent(urlDown),duration:0,license:"",source:"Hitmotop",sourceUrl:urlDown,genre:"",downloadUrl:urlDown});
    }
    }
  return out;
}

async function hitmotopSearchRequest(searchUrl,headers,limit){
  const response=await fetch(searchUrl,{headers,redirect:"follow"});
  const html=await response.text();
  if(!response.ok)throw Error("Hitmo search HTTP "+response.status);
  const finalBase=new URL(response.url||searchUrl).origin;
  const tracks=parseHitmotopSearch(html,finalBase,limit);
  if(!tracks.length)throw Error("Hitmo search returned no parsable tracks");
  return tracks;
}

async function fetchHitmozParserApi(q,limit){
  const api=new URL(HITMOZ_PARSER_API_BASE);
  api.searchParams.set("search",q);
  const response=await fetch(api.href,{headers:{
    accept:"application/json",
    "accept-language":"ru-RU,ru;q=0.9,en;q=0.7",
    "user-agent":HITMOTOP_HEADERS["user-agent"]
  },redirect:"follow"});
  const body=await response.text();
  if(!response.ok)throw Error("HitMoz parser API HTTP "+response.status);
  let data;
  try{data=JSON.parse(body)}catch{throw Error("HitMoz parser API returned invalid JSON")}
  if(data?.success!==true||!Array.isArray(data.songs))throw Error(data?.error||"HitMoz parser API returned no songs");

  const out=[],seen=new Set();
  for(const song of data.songs.slice(0,limit)){
    const downloadUrl=hitmotopAbsoluteUrl(song?.download,"https://eu.hitmoz.com");
    const sourceUrl=hitmotopAbsoluteUrl(song?.link,"https://eu.hitmoz.com");
    if(!downloadUrl||seen.has(downloadUrl))continue;
    const host=new URL(downloadUrl).hostname.toLowerCase();
    const audioAllowed=host==="eu.hitmoz.com"||host.endsWith(".eu.hitmoz.com")||host==="ru.hitmoz.org"||host.endsWith(".ru.hitmoz.org")||host==="rus.hitmoz.org"||host.endsWith(".rus.hitmoz.org")||host==="hitmos.me"||host.endsWith(".hitmos.me")||host==="hitmos.fm"||host.endsWith(".hitmos.fm");
    if(!audioAllowed||!/\/get\/music\/[^/?#]+\.mp3(?:[?#].*)?$/i.test(new URL(downloadUrl).pathname+new URL(downloadUrl).search+new URL(downloadUrl).hash))continue;
    seen.add(downloadUrl);
    let idMatch=sourceUrl.match(/\/song\/(\d+)/i),id=idMatch?.[1]||downloadUrl.match(/_(\d{6,})\.mp3(?:$|[?#])/i)?.[1]||String(out.length+1);
    const cover=String(song?.cover||"").trim();
    let image="";
    if(cover){
      try{
        const u=new URL(cover,downloadUrl),h=u.hostname.toLowerCase();
        if(h==="eu.hitmoz.com"||h.endsWith(".eu.hitmoz.com")||h==="statcore.hitmcdn.com"||h.endsWith(".hitmcdn.com"))image=u.href;
      }catch{}
    }
    const title=stripHtml(song?.title)||"Без названия";
    const artist=stripHtml(song?.artist)||"Неизвестный исполнитель";
    const duration=parseDuration(String(song?.duration||""));
    out.push({
      id:"hitmotop-"+id,
      title,
      artist,
      album:"",
      image,
      audio:"/api/hitmotop/play?url="+encodeURIComponent(downloadUrl),
      duration,
      license:"",
      source:"Hitmotop",
      sourceUrl:sourceUrl||downloadUrl,
      genre:"",
      downloadUrl
    });
  }
  if(!out.length)throw Error("HitMoz parser API returned no usable tracks");
  return out;
}

async function fetchHitmotopSearch(q,limit){
  let lastError=null;
  // Prefer the independently working deployment of the open-source parser.
  // The Worker then keeps the native HTML parser as a fallback.
  try{return await fetchHitmozParserApi(q,limit)}catch(error){lastError=error}
  for(const configuredBase of HITMOTOP_BASES){
    try{
      // Follow the current pars-hitmotop flow: establish the Hitmo session
      // first, persist the returned sid cookie, then call /search?q=...
      const home=await fetch(configuredBase+"/",{headers:HITMOTOP_HEADERS,redirect:"follow"});
      const base=new URL(home.url||configuredBase).origin;
      let cookie=hitmotopCookieHeader(home);

      // pars-hitmotop explicitly performs a second GET after a successful
      // landing-page response. This is important for Hitmo's session cookie.
      const sessionHeaders={...HITMOTOP_HEADERS,referer:base+"/"};
      if(cookie)sessionHeaders.cookie=cookie;
      const warm=await fetch(base+"/",{headers:sessionHeaders,redirect:"follow"});
      const warmCookie=hitmotopCookieHeader(warm);
      if(warmCookie)cookie=warmCookie;

      const headers={...HITMOTOP_HEADERS,referer:base+"/"};
      if(cookie)headers.cookie=cookie;

      const search=new URL("/search",base);
      search.searchParams.set("q",q);

      // Keep the browser-like navigation headers used by the package's
      // requests session. We do not attempt to bypass a 403.
      headers["sec-fetch-dest"]="document";
      headers["sec-fetch-mode"]="navigate";
      headers["sec-fetch-site"]="same-origin";
      headers["upgrade-insecure-requests"]="1";

      return await hitmotopSearchRequest(search.href,headers,limit);
    }catch(error){
      lastError=error;
    }
  }
  throw lastError||Error("Hitmo unavailable");
}

async function hitmotopPlaybackUrl(rawUrl){
  let target;
  try{target=new URL(rawUrl)}catch{throw Error("Invalid Hitmotop audio URL")}
  const host=target.hostname.toLowerCase();
  const allowed=host==="eu.hitmoz.com"||host.endsWith(".eu.hitmoz.com")||host==="ru.hitmoz.org"||host.endsWith(".ru.hitmoz.org")||host==="rus.hitmoz.org"||host.endsWith(".rus.hitmoz.org")||host==="hitmos.me"||host.endsWith(".hitmos.me")||host==="hitmos.fm"||host.endsWith(".hitmos.fm")||host==="hitmotop.com"||host.endsWith(".hitmotop.com");
  if(!allowed||!/^https?:$/.test(target.protocol))throw Error("Hitmotop audio host is not allowed");
  return target.href;
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
  if(url.pathname==="/api/local-music")return Response.json({ok:true,source:"🔐 Ключник",tracks:LOCAL_MUSIC});
  if(url.pathname==="/api/health")return Response.json({ok:true,service:env.APP_NAME||"Ok Music",version:"7.0",providers:["Zaycev.net","Jamendo","Hitmotop","🔐 Ключник"],zaycev:{configured:true,mode:"current-web-api"},jamendo:{configured:Boolean(String(env.JAMENDO_CLIENT_ID||"").trim())},hitmotop:{configured:true,mode:"open-source HitMoz parser API + HTML fallback"}});
  if(url.pathname==="/api/hitmotop/test"){
    const q=(url.searchParams.get("q")||"Linkin Park").trim().slice(0,160);
    try{
      const tracks=await fetchHitmotopSearch(q,5);
      return Response.json({
        ok:true,
        provider:"Hitmotop",
        query:q,
        count:tracks.length,
        tracks:tracks.map(t=>({id:t.id,title:t.title,artist:t.artist,duration:t.duration,sourceUrl:t.sourceUrl,hasAudio:Boolean(t.audio),hasImage:Boolean(t.image)}))
      });
    }catch(error){
      return Response.json({ok:false,provider:"Hitmotop",query:q,error:error?.message||"unknown error"},{status:502});
    }
  }

  if(url.pathname==="/api/search"){
    const q=(url.searchParams.get("q")||"").trim(),limit=Math.min(Math.max(Number(url.searchParams.get("limit")||24),1),50);
    if(!q)return Response.json({ok:true,query:"",tracks:[],providers:[]});
    const [z,j,h]=await Promise.allSettled([fetchZaycevSearch(q,limit),searchJamendo(q,Math.max(6,Math.ceil(limit/3)),env),fetchHitmotopSearch(q,limit)]);
    const zTracks=z.status==="fulfilled"?z.value:[],jTracks=j.status==="fulfilled"?j.value:[],hTracks=h.status==="fulfilled"?h.value:[],tracks=uniqueTracks([...zTracks,...jTracks,...hTracks],limit);
    const errors=[...(z.status==="rejected"?["Zaycev.net: "+(z.reason?.message||"ошибка")]:[]),...(j.status==="rejected"?["Jamendo: "+(j.reason?.message||"ошибка")]:[]),...(h.status==="rejected"?["Hitmotop: "+(h.reason?.message||"ошибка")]:[])];
    if(!tracks.length)return Response.json({ok:false,error:errors.length?"Музыкальные каталоги недоступны":"Ничего не найдено",details:errors,query:q,tracks:[],diagnostics:{zaycevConfigured:true,jamendoConfigured:Boolean(String(env.JAMENDO_CLIENT_ID||"").trim()),hitmotopConfigured:true,errors}},{status:errors.length?502:200});
    return Response.json({ok:true,query:q,providers:[...(zTracks.length?["Zaycev.net"]:[]),...(jTracks.length?["Jamendo"]:[]),...(hTracks.length?["Hitmotop"]:[])],tracks});
  }
  if(url.pathname==="/api/artwork"){
    const raw=(url.searchParams.get("url")||"").trim();
    let target;
    try{target=new URL(raw)}catch{return Response.json({ok:false,error:"Invalid artwork URL"},{status:400})}
    const host=target.hostname.toLowerCase();
    const allowed=host==="zaycev.net"||host.endsWith(".zaycev.net")||host==="jamendo.com"||host.endsWith(".jamendo.com")||host==="eu.hitmoz.com"||host.endsWith(".eu.hitmoz.com")||host==="ru.hitmoz.org"||host.endsWith(".ru.hitmoz.org")||host==="rus.hitmoz.org"||host.endsWith(".rus.hitmoz.org")||host==="hitmos.me"||host.endsWith(".hitmos.me")||host==="static.hitmos.fm"||host==="hitmos.fm"||host.endsWith(".hitmos.fm")||host==="statcore.hitmcdn.com"||host.endsWith(".hitmcdn.com");
    if(!allowed||!/^https?:$/.test(target.protocol))return Response.json({ok:false,error:"Artwork host is not allowed"},{status:403});
    try{
      const upstream=await fetch(target,{headers:{
        accept:"image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        referer:host.endsWith("zaycev.net")?ZAYCEV_BASE+"/":host.endsWith("jamendo.com")?"https://www.jamendo.com/":"https://"+host+"/",
        "user-agent":ZAYCEV_HEADERS["user-agent"]
      }});
      if(!upstream.ok)throw Error("Artwork HTTP "+upstream.status);
      const headers=new Headers();
      headers.set("content-type",upstream.headers.get("content-type")||"image/jpeg");
      headers.set("cache-control","public,max-age=86400");
      headers.set("access-control-allow-origin","*");
      return new Response(upstream.body,{status:200,headers});
    }catch(e){
      return Response.json({ok:false,error:e?.message||"Artwork unavailable"},{status:502});
    }
  }

  if(url.pathname==="/api/hitmotop/play"){
    const raw=(url.searchParams.get("url")||"").trim();
    try{
      const target=await hitmotopPlaybackUrl(raw);
      const range=request.headers.get("range")||"";
      const targetUrl=new URL(target);
      const baseHeaders={
        "accept":"*/*",
        "accept-language":"ru-RU,ru;q=0.9,en;q=0.7",
        "user-agent":HITMOTOP_HEADERS["user-agent"],
        "referer":targetUrl.origin+"/"
      };
      if(range)baseHeaders.range=range;
      let upstream=await fetch(target,{headers:baseHeaders,redirect:"follow"});
      let contentType=(upstream.headers.get("content-type")||"").toLowerCase();
      if(contentType.includes("text/html")||contentType.includes("application/xhtml")){
        const html=await upstream.text();
        const patterns=[
          /["'](\/get\/[^"']+\.mp3(?:\?[^"']*)?)["']/i,
          /["'](https?:\/\/[^"']+\/get\/[^"']+\.mp3(?:\?[^"']*)?)["']/i,
          /href=["']([^"']+\.mp3(?:\?[^"']*)?)["']/i
        ];
        let direct="";
        for(const pattern of patterns){
          const match=html.match(pattern);
          if(match?.[1]){direct=hitmotopAbsoluteUrl(match[1],targetUrl.origin);if(direct)break;}
        }
        if(!direct){
          const button=html.match(/<a\b[^>]*class=["'][^"']*track__download-btn[^"']*["'][^>]*>/i);
          direct=hitmotopAbsoluteUrl(hitmotopExtractAttr(button?.[0],"href"),targetUrl.origin);
        }
        if(!direct)throw Error("Hitmotop audio URL not found");
        upstream=await fetch(direct,{headers:{...baseHeaders,referer:targetUrl.origin+"/"},redirect:"follow"});
        contentType=(upstream.headers.get("content-type")||"").toLowerCase();
      }
      if(!upstream.ok&&upstream.status!==206)throw Error("Hitmotop audio HTTP "+upstream.status);
      if(contentType.includes("text/html"))throw Error("Hitmotop returned HTML instead of audio");
      const headers=new Headers(upstream.headers);
      headers.set("cache-control","no-store");
      headers.set("access-control-allow-origin","*");
      headers.set("accept-ranges",headers.get("accept-ranges")||"bytes");
      headers.set("content-type",headers.get("content-type")||"audio/mpeg");
      return new Response(upstream.body,{status:upstream.status,headers});
    }catch(e){return Response.json({ok:false,error:e?.message||"Hitmotop playback unavailable"},{status:502})}
  }

  if(url.pathname==="/api/zaycev/play"){
    const id=(url.searchParams.get("id")||"").trim();
    if(!/^\d+$/.test(id))return Response.json({ok:false,error:"Invalid Zaycev track id"},{status:400});
    try{
      const target=await zaycevPlay(id);
      const range=request.headers.get("range")||"";
      const upstream=await fetch(target,{headers:{...(range?{range}:{}),"user-agent":ZAYCEV_HEADERS["user-agent"],"referer":ZAYCEV_BASE+"/"}});
      if(!upstream.ok&&upstream.status!==206)throw Error("Zaycev audio HTTP "+upstream.status);
      const headers=new Headers(upstream.headers);
      headers.set("cache-control","no-store");
      headers.set("access-control-allow-origin","*");
      headers.set("accept-ranges",headers.get("accept-ranges")||"bytes");
      headers.set("content-type",headers.get("content-type")||"audio/mpeg");
      return new Response(upstream.body,{status:upstream.status,headers});
    }catch(e){return Response.json({ok:false,error:e?.message||"Zaycev playback unavailable"},{status:502})}
  }

  if(url.pathname==="/api/recommendations"){
    const seed=(url.searchParams.get("seed")||"").trim(),
      mood=(url.searchParams.get("mood")||"").trim(),
      genres=(url.searchParams.get("genres")||"").trim(),
      moods=(url.searchParams.get("moods")||"").trim(),
      artists=(url.searchParams.get("artists")||"").trim(),
      likedArtistsRaw=(url.searchParams.get("likedArtists")||"").trim(),
      now=(url.searchParams.get("now")||"").trim(),
      liked=(url.searchParams.get("liked")||"").trim(),
      excludeRaw=(url.searchParams.get("exclude")||"").trim(),
      refresh=(url.searchParams.get("refresh")||"").trim(),
      limit=Math.min(Math.max(Number(url.searchParams.get("limit")||16),6),40);
    const preferredArtists=[...new Set([...artists.split(/[,;]+/),...likedArtistsRaw.split(/[,;]+/)].map(x=>x.trim()).filter(Boolean))].slice(0,12);
    const artistQueries=preferredArtists.slice(0,8);
    const tasteTerms=[genres,moods,now].filter(Boolean).join(" ");
    const base=[preferredArtists.join(", "),genres,moods,now,liked,seed].filter(Boolean).join(", ");
    const queries=[...artistQueries,...artistQueries.map(a=>a+" "+tasteTerms),genres+" "+moods,preferredArtists.join(" ")+" "+now,base,mood+" "+genres+" "+preferredArtists.join(" ")].map(x=>x.replace(/\s+/g," ").trim()).filter(Boolean);
    const refreshTail=refresh?refresh.slice(-6):"";
    const refreshQueries=refresh?[...queries,...artistQueries.map(a=>a+" "+genres+" "+refreshTail),genres+" "+moods+" "+refreshTail,now+" "+refreshTail]:queries;
    const uniqueQueries=[...new Set(refreshQueries)].filter(Boolean).slice(0,4);
    const fetchLimit=Math.min(24,Math.max(12,limit*2));
    const [zr,jr,hr]=await Promise.all([
      Promise.allSettled(uniqueQueries.map(q=>fetchZaycevSearch(q,fetchLimit))),
      Promise.allSettled(uniqueQueries.slice(0,3).map(q=>searchJamendo(q,8,env))),
      Promise.allSettled(uniqueQueries.slice(0,3).map(q=>fetchHitmotopSearch(q,Math.min(12,fetchLimit))))
    ]);
    const zaycev=zr.flatMap(r=>r.status==="fulfilled"?r.value:[]),
      jam=jr.flatMap(r=>r.status==="fulfilled"?r.value:[]),
      hitmotop=hr.flatMap(r=>r.status==="fulfilled"?r.value:[]),
      local=Array.isArray(LOCAL_MUSIC)?LOCAL_MUSIC.filter(t=>t?.audio):[];
    const pool=[],seen=new Set();
    for(const list of [zaycev,jam,hitmotop,local]) for(const t of list){
      if(!t||!t.id||seen.has(t.id))continue;
      seen.add(t.id);pool.push(t);
    }
    const excluded=new Set(excludeRaw.split(",").map(x=>x.trim()).filter(Boolean));
    const wanted=preferredArtists.map(x=>x.toLowerCase());
    const genreTerms=genres.split(/[,;]+/).map(x=>x.trim().toLowerCase()).filter(Boolean);
    const moodTerms=moods.split(/[,;]+/).map(x=>x.trim().toLowerCase()).filter(Boolean);
    const nowTerms=now.toLowerCase().split(/\s+/).filter(x=>x.length>2);
    const likedText=liked.toLowerCase();
    const score=(t)=>{
      if(excluded.has(t.id))return -100000;
      const artist=String(t.artist||"").toLowerCase(), title=String(t.title||"").toLowerCase(), genre=String(t.genre||"").toLowerCase();
      let s=0;
      for(const a of wanted){
        if(!a)continue;
        if(artist===a)s+=140;
        else if(artist.startsWith(a))s+=110;
        else if(artist.includes(a))s+=80;
        else if(title.includes(a))s+=20;
      }
      for(const g of genreTerms)if(g&&(genre.includes(g)||title.includes(g)||artist.includes(g)))s+=18;
      for(const m of moodTerms)if(m&&(title.includes(m)||artist.includes(m)||genre.includes(m)))s+=8;
      for(const n of nowTerms)if(title.includes(n)||artist.includes(n)||genre.includes(n))s+=3;
      if(likedText.includes(artist)&&artist)s+=20;
      if(t.source==="Zaycev.net")s+=3;
      return s;
    };
    let h=0;for(const ch of (refresh||seed||"okmusic"))h=(h*31+ch.charCodeAt(0))>>>0;
    const jitter=(t)=>{let n=h;for(const c of String(t.id))n=(n*33+c.charCodeAt(0))>>>0;return (n%1000)/100000};
    const ranked=pool.filter(t=>score(t)>-100000).map(t=>({t,s:score(t)+jitter(t)})).sort((a,b)=>b.s-a.s);
    const preferred=ranked.filter(x=>wanted.some(a=>a&&String(x.t.artist||"").toLowerCase().includes(a)));
    const zaycevRanked=ranked.filter(x=>x.t.source==="Zaycev.net");
    const jamRanked=ranked.filter(x=>x.t.source==="Jamendo");
    const hitmotopRanked=ranked.filter(x=>x.t.source==="Hitmotop");
    const localRanked=ranked.filter(x=>x.t.source==="🔐 Ключник");
    const rest=ranked.filter(x=>!wanted.some(a=>a&&String(x.t.artist||"").toLowerCase().includes(a)));
    const final=[];
    const used=new Set();
    const add=(t)=>{
      if(!t||used.has(t.id))return false;
      used.add(t.id);final.push(t);return true;
    };
    // The wave is a cross-source mix: seed it with one track from every working provider.
    for(const sourceList of [preferred,zaycevRanked,jamRanked,hitmotopRanked,localRanked]){
      const candidate=sourceList.find(x=>!used.has(x.t.id));
      if(candidate)add(candidate.t);
    }
    const preferredTarget=Math.min(Math.ceil(limit/2),preferred.length);
    for(const x of preferred.slice(0,preferredTarget))if(final.length<limit)add(x.t);
    const sourceBuckets=[zaycevRanked,jamRanked,hitmotopRanked,localRanked];
    let sourceCursor=0;
    while(final.length<limit&&sourceBuckets.some(list=>list.some(x=>!used.has(x.t.id)))){
      const list=sourceBuckets[sourceCursor%sourceBuckets.length];sourceCursor++;
      const candidate=list.find(x=>!used.has(x.t.id));
      if(candidate)add(candidate.t);
    }
    const buckets=new Map();
    for(const x of [...preferred.slice(preferredTarget),...rest]){
      const key=String(x.t.artist||"Неизвестный").toLowerCase();
      if(!buckets.has(key))buckets.set(key,[]);
      buckets.get(key).push(x.t);
    }
    while(final.length<limit){
      let added=false;
      for(const list of buckets.values()){
        const t=list.shift();
        if(add(t)){added=true;if(final.length>=limit)break;}
      }
      if(!added)break;
    }
    const errors=[...zr.filter(r=>r.status==="rejected").map(r=>"Zaycev.net: "+(r.reason?.message||"ошибка")),...jr.filter(r=>r.status==="rejected").map(r=>"Jamendo: "+(r.reason?.message||"ошибка")),...hr.filter(r=>r.status==="rejected").map(r=>"Hitmotop: "+(r.reason?.message||"ошибка"))];
    return Response.json({ok:true,mode:base?"personalized":"discovery",profile:{genres,moods,artists:preferredArtists.join(", "),now},providers:[...(zaycev.length?["Zaycev.net"]:[]),...(jam.length?["Jamendo"]:[]),...(hitmotop.length?["Hitmotop"]:[]),...(local.length?["🔐 Ключник"]:[])],tracks:final,errors});
  }
  return Response.json({ok:false,error:"Not found"},{status:404});
}
