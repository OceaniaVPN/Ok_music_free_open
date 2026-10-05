const HITMOTOP_BASES=["https://rus.hitmotop.com","https://hitmotop.com","https://hitmos.me","https://hitmos.fm","https://eu.hitmoz.com","https://ru.hitmoz.org","https://rus.hitmoz.org"];
export const HITMOTOP_HEADERS={
  accept:"text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "accept-language":"ru-RU,ru;q=0.8,en-US;q=0.5,en;q=0.3",
  "cache-control":"no-cache",
  "user-agent":"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36"
};

function stripHtml(value){
  return String(value||"")
    .replace(/<script[\s\S]*?<\/script>/gi," ")
    .replace(/<style[\s\S]*?<\/style>/gi," ")
    .replace(/<[^>]+>/g," ")
    .replace(/&nbsp;/gi," ")
    .replace(/&amp;/gi,"&")
    .replace(/&quot;/gi,'"')
    .replace(/&#39;/gi,"'")
    .replace(/&lt;/gi,"<")
    .replace(/&gt;/gi,">")
    .replace(/\s+/g," ")
    .trim();
}
function cleanTitle(value){
  return stripHtml(value).replace(/[/\\:*?"<>|]/g,"").trim();
}
function parseDuration(value){
  const parts=String(value||"").trim().split(":").map(Number);
  if(parts.some(Number.isNaN))return 0;
  if(parts.length===3)return parts[0]*3600+parts[1]*60+parts[2];
  if(parts.length===2)return parts[0]*60+parts[1];
  return parts[0]||0;
}
function absoluteUrl(value,base){
  const raw=String(value||"").trim();
  if(!raw)return "";
  try{return new URL(raw,base).href}catch{return ""}
}
function htmlAttr(tag,name){
  for(const match of String(tag||"").matchAll(/([A-Za-z0-9:-]+)\s*=\s*(["'])(.*?)\2/g)){
    if(String(match[1]).toLowerCase()===String(name).toLowerCase())return match[3];
  }
  return "";
}
export function hitmotopCookieHeader(response){
  try{
    const values=typeof response.headers.getSetCookie==="function"
      ? response.headers.getSetCookie()
      : [response.headers.get("set-cookie")||""];
    return values
      .flatMap(value=>String(value||"").split(/,(?=[^;,=]+=[^;,]+)/))
      .map(value=>value.trim().split(";",1)[0])
      .filter(value=>/^[^=;]+=[^=;]*$/.test(value))
      .join("; ");
  }catch{return ""}
}
function extractImage(tag,base){
  const style=htmlAttr(tag,"style");
  const direct=htmlAttr(tag,"src")||htmlAttr(tag,"data-src")||htmlAttr(tag,"data-original");
  const candidate=style.match(/url\(\s*["']?([^"')]+)["']?\s*\)/i)?.[1]||direct;
  return candidate?absoluteUrl(candidate,base):"";
}
function hashId(value){
  let hash=2166136261;
  for(const ch of String(value)){
    hash^=ch.charCodeAt(0);
    hash=Math.imul(hash,16777619);
  }
  return (hash>>>0).toString(16);
}
function filenameMeta(url,base){
  try{
    const pathname=new URL(url,base).pathname;
    let name=decodeURIComponent(pathname.split("/").pop()||"").replace(/\.[a-z0-9]{2,5}$/i,"");
    name=name.replace(/(?:[_-]?\d{6,})$/,"").replace(/_/g," ").trim();
    const parts=name.split(/\s+-\s+|_-_|—/).map(x=>x.trim()).filter(Boolean);
    if(parts.length<2)return {artist:"",title:name};
    return {artist:parts[0],title:parts.slice(1).join(" - ").trim()};
  }catch{return {artist:"",title:""}}
}
function buildTrack({title,artist,duration,image,download,info},base){
  const downloadUrl=absoluteUrl(htmlAttr(download,"href")||download,base);
  if(!downloadUrl)return null;
  const pageUrl=absoluteUrl(htmlAttr(info,"href")||info,base);
  const fileMeta=filenameMeta(downloadUrl,base);
  let trackTitle=cleanTitle(title)||fileMeta.title||"Без названия";
  let trackArtist=stripHtml(artist)||fileMeta.artist||"Неизвестный исполнитель";
  if(trackTitle===trackArtist&&fileMeta.title&&fileMeta.title!==fileMeta.artist)trackTitle=fileMeta.title;
  const durationText=String(duration||"").match(/\b\d{1,2}:\d{2}(?::\d{2})?\b/)?.[0]||"";
  const sourceUrl=pageUrl||downloadUrl;
  return {
    id:"hitmotop-"+hashId(sourceUrl),
    title:trackTitle,
    artist:trackArtist,
    album:"",
    image:extractImage(image,base),
    audio:"/api/hitmotop/play?url="+encodeURIComponent(downloadUrl)+"&page="+encodeURIComponent(pageUrl),
    duration:parseDuration(durationText),
    license:"",
    source:"Hitmotop",
    sourceUrl,
    genre:"",
    downloadUrl
  };
}
function extractElementTexts(source,tagName,className){
  const re=new RegExp("<"+tagName+"\\b[^>]*class=[\\\"']([^\\\"']*\\b"+className+"\\b[^\\\"']*)[\\\"'][^>]*>([\\s\\S]*?)</"+tagName+">","gi");
  return [...String(source||"").matchAll(re)].map(match=>match[2]);
}
function extractElementTags(source,tagName,className){
  const re=new RegExp("<"+tagName+"\\b[^>]*class=[\\\"']([^\\\"']*\\b"+className+"\\b[^\\\"']*)[\\\"'][^>]*>","gi");
  return [...String(source||"").matchAll(re)].map(match=>match[0]);
}

export function parseHitmotopSearch(html,base,limit=10){
  const source=String(html||"");

  // Match the Python parser: collect the actual track fields by class name
  // instead of depending on a particular parent element such as <li>.
  const titles=extractElementTexts(source,"div","track__title");
  const artists=extractElementTexts(source,"div","track__desc");
  const durations=extractElementTexts(source,"div","track__fulltime");
  const images=extractElementTags(source,"div","track__img");
  const downloads=extractElementTags(source,"a","track__download-btn");
  const infos=extractElementTags(source,"a","track__info-l");

  const count=Math.min(limit,titles.length,downloads.length,infos.length);
  const out=[];
  const seen=new Set();
  for(let idx=0;idx<count;idx++){
    const track=buildTrack({
      title:titles[idx],
      artist:artists[idx]||"",
      duration:durations[idx]||"",
      image:images[idx]||"",
      download:downloads[idx]||"",
      info:infos[idx]||""
    },base);
    if(track&&!seen.has(track.id)){
      seen.add(track.id);
      out.push(track);
    }
  }
  return out;
}
async function searchOnBase(base,q,limit){
  const origin = new URL(base).origin;
  let cookie="";
  let referer=origin+"/";

  // Some mirrors return 403 for their landing page while the public
  // search endpoint remains available. The landing-page request is only
  // best-effort for session cookies and must not block search.
  try{
    const home=await fetch(origin+"/",{
      headers:HITMOTOP_HEADERS,
      redirect:"follow",
      signal:AbortSignal.timeout(3500)
    });
    if(home.ok){
      referer=new URL(home.url||origin).origin+"/";
      cookie=hitmotopCookieHeader(home);
    }
  }catch{}

  const headers={...HITMOTOP_HEADERS,referer};
  if(cookie)headers.cookie=cookie;

  const search=new URL("/search",origin);
  search.searchParams.set("q",q);
  const response=await fetch(search.href,{
    headers,
    redirect:"follow",
    signal:AbortSignal.timeout(6500)
  });
  const html=await response.text();
  if(!response.ok)throw Error("Hitmo search HTTP "+response.status);
  const tracks=parseHitmotopSearch(html,new URL(response.url||search.href).origin,limit);
  if(!tracks.length)throw Error("Hitmo search returned no parsable tracks");
  return tracks;
}
export async function searchHitmotop(q,limit=10){
  const query=String(q||"").trim();
  if(!query)return [];
  let lastError=null;
  for(const base of HITMOTOP_BASES){
    try{
      const tracks=await searchOnBase(base,query,limit);
      if(tracks.length)return tracks;
    }catch(error){lastError=error}
  }
  throw lastError||Error("Hitmo unavailable");
}
export async function resolveHitmotopPlaybackUrl(rawUrl){
  let target;
  try{target=new URL(rawUrl)}catch{throw Error("Invalid Hitmotop audio URL")}
  const host=target.hostname.toLowerCase();
  const allowed=[
    "rus.hitmotop.com","hitmotop.com","hitmos.me","hitmos.fm","eu.hitmoz.com","ru.hitmoz.org","rus.hitmoz.org"
  ].some(base=>host===base||host.endsWith("."+base));
  if(!allowed||!/^https?:$/.test(target.protocol))throw Error("Hitmotop audio host is not allowed");

  // Mirror the Python parser: the download request is made through the same
  // session that first opens the site. A fresh request without the sid cookie
  // can return a page/403 instead of the actual MP3 redirect.
  let cookie="";
  let referer=target.origin+"/";
  try{
    const home=await fetch(target.origin+"/",{
      headers:HITMOTOP_HEADERS,
      redirect:"follow",
      signal:AbortSignal.timeout(4500)
    });
    referer=new URL(home.url||target.origin).origin+"/";
    cookie=hitmotopCookieHeader(home);
  }catch{}

  const headers={
    ...HITMOTOP_HEADERS,
    accept:"audio/mpeg,audio/*,*/*;q=0.8",
    referer
  };
  if(cookie)headers.cookie=cookie;

  try{
    const probe=await fetch(target.href,{
      method:"HEAD",
      headers,
      redirect:"follow",
      signal:AbortSignal.timeout(4500)
    });
    if(probe.ok)return probe.url||target.href;
  }catch{}

  try{
    const probe=await fetch(target.href,{
      headers:{...headers,range:"bytes=0-0"},
      redirect:"follow",
      signal:AbortSignal.timeout(4500)
    });
    const finalUrl=probe.url||target.href;
    const contentType=(probe.headers.get("content-type")||"").toLowerCase();
    const audioLike=probe.ok && (
      contentType.startsWith("audio/") ||
      contentType.includes("mpeg") ||
      contentType.includes("octet-stream") ||
      !contentType
    );
    try{await probe.body?.cancel()}catch{}
    if(audioLike)return finalUrl;
  }catch{}

  // Keep the same fallback semantics as the Python implementation: the
  // original download endpoint is still the best candidate when probing is
  // blocked by a mirror.
  return target.href;
}
