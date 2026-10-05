const HITMOTOP_BASES=["https://hitmos.fm","https://hitmos.me"];
export const HITMOTOP_HEADERS={
  accept:"text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "accept-language":"ru-RU,ru;q=0.8,en-US;q=0.5,en;q=0.3",
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

function cookieJarFromHeader(value){
  const jar=new Map();
  for(const part of String(value||"").split(/;\\s*/)){
    const idx=part.indexOf("=");
    if(idx<=0)continue;
    const name=part.slice(0,idx).trim();
    const cookieValue=part.slice(idx+1).trim();
    if(name)jar.set(name,cookieValue);
  }
  return jar;
}

function mergeHitmotopResponseCookies(jar,response){
  try{
    const values=typeof response.headers.getSetCookie==="function"
      ? response.headers.getSetCookie()
      : [response.headers.get("set-cookie")||""];
    for(const raw of values.flatMap(value=>String(value||"").split(/,(?=[^;,=]+=[^;,]+)/))){
      const pair=String(raw||"").trim().split(";",1)[0];
      const idx=pair.indexOf("=");
      if(idx<=0)continue;
      const name=pair.slice(0,idx).trim();
      const value=pair.slice(idx+1).trim();
      if(!name)continue;
      if(value)jar.set(name,value);
      else jar.delete(name);
    }
  }catch{}
}

function hitmotopCookieHeaderFromJar(jar){
  return [...jar.entries()].map(([name,value])=>name+"="+value).join("; ");
}

async function fetchHitmotopSession(url,jar,allowedOrigin,options={}){
  const baseOptions={...options};
  delete baseOptions.redirect;
  let currentUrl=String(url);
  for(let redirects=0;redirects<=8;redirects++){
    const cookie=hitmotopCookieHeaderFromJar(jar);
    const headers={...(baseOptions.headers||{})};
    if(cookie)headers.cookie=cookie;
    const response=await fetch(currentUrl,{
      ...baseOptions,
      headers,
      redirect:"manual"
    });
    mergeHitmotopResponseCookies(jar,response);
    
    const location=response.headers.get("location");
    if(response.status>=300&&response.status<400&&location){
      const nextUrl=new URL(location,currentUrl);
      if(nextUrl.origin===allowedOrigin){
        currentUrl=nextUrl.href;
        continue;
      }
      // Do not leak the session cookie to another origin such as a CDN.
      const crossOriginHeaders={...headers};
      delete crossOriginHeaders.cookie;
      return await fetch(nextUrl.href,{
        ...baseOptions,
        headers:crossOriginHeaders,
        redirect:"follow"
      });
    }
    return response;
  }
  throw Error("Hitmo redirect limit exceeded");
}

const HITMOTOP_SESSIONS=new Map();
const HITMOTOP_SIDS=new Map();

function rememberHitmotopSid(origin,jar){
  const sid=jar.get("sid");
  if(sid)HITMOTOP_SIDS.set(origin,sid);
}

async function createHitmotopSession(base,{refresh=false}={}){
  const origin=new URL(base).origin;
  if(refresh)HITMOTOP_SESSIONS.delete(origin);
  const cached=HITMOTOP_SESSIONS.get(origin);
  if(cached)return cached;

  let lastError=null;
  for(let attempt=0;attempt<2;attempt++){
    const jar=new Map();
    const storedSid=HITMOTOP_SIDS.get(origin);
    if(storedSid)jar.set("sid",storedSid);

    try{
      // Match BaseSessionHandlerInputTracks.create_session():
      // create a fresh requests.Session(), open /, and keep its cookies.
      let response=await fetchHitmotopSession(origin+"/",jar,origin,{
        headers:HITMOTOP_HEADERS,
        signal:AbortSignal.timeout(5000)
      });

      if(response.status===200){
        // The Python implementation performs a second GET through the
        // same requests.Session() and only succeeds once the session has
        // actually received cookies.
        response=await fetchHitmotopSession(response.url||origin+"/",jar,origin,{
          headers:HITMOTOP_HEADERS,
          signal:AbortSignal.timeout(5000)
        });
        // Keep the Python lifecycle: the same session performs both GETs.
        // Do not reject the session only because the Worker hides Set-Cookie.
        rememberHitmotopSid(origin,jar);
        const session={
          origin,
          jar,
          referer:new URL(response.url||origin+"/").href
        };
        HITMOTOP_SESSIONS.set(origin,session);
        return session;
      }

      // For the 403/non-200 path Python retries / with the same Session,
      // allowing the sid from the first response to be reused.
      response=await fetchHitmotopSession(origin+"/",jar,origin,{
        headers:HITMOTOP_HEADERS,
        signal:AbortSignal.timeout(5000)
      });
      if(response.status===200){
        rememberHitmotopSid(origin,jar);
        const session={
          origin,
          jar,
          referer:new URL(response.url||origin+"/").href
        };
        HITMOTOP_SESSIONS.set(origin,session);
        return session;
      }
    }catch(error){
      lastError=error;
    }
  }

  throw lastError||Error("Hitmo session bootstrap failed");
}

export async function getHitmotopSessionInfo(rawUrl){
  let target;
  try{target=new URL(rawUrl)}catch{throw Error("Invalid Hitmotop URL")}
  const allowed=[
    "rus.hitmotop.com","hitmotop.com","hitmos.me","hitmos.fm","rus.hitmos.fm","eu.hitmoz.com","ru.hitmoz.org","rus.hitmoz.org"
  ].some(base=>target.hostname.toLowerCase()===base||target.hostname.toLowerCase().endsWith("."+base));
  if(!allowed||!/^https?:$/.test(target.protocol))throw Error("Hitmotop URL host is not allowed");
  const session=await createHitmotopSession(target.origin);
  return {
    origin:session.origin,
    cookie:hitmotopCookieHeaderFromJar(session.jar),
    referer:session.referer
  };
}

async function directHitmotopSearch(base,q,limit){
  const origin=new URL(base).origin;
  const search=new URL("/search",origin);
  search.searchParams.set("q",q);
  const response=await fetch(search.href,{
    headers:{...HITMOTOP_HEADERS,referer:origin+"/"},
    redirect:"follow",
    signal:AbortSignal.timeout(6500)
  });
  const html=await response.text();
  if(!response.ok)throw Error("Hitmo search HTTP "+response.status);
  const tracks=parseHitmotopSearch(html,new URL(response.url||search.href).origin,limit);
  if(!tracks.length)throw Error("Hitmo search returned no parsable tracks");
  return tracks;
}

async function searchOnBase(base,q,limit){
  const origin=new URL(base).origin;
  const search=new URL("/search",origin);
  search.searchParams.set("q",q);

  // The Python parser uses a persistent requests.Session(), but a Cloudflare
  // Worker may be unable to complete that bootstrap because Set-Cookie is
  // hidden or the edge returns 403. Search itself does not need us to fail
  // hard on that bootstrap, so try the direct search endpoint first.
  try{
    return await directHitmotopSearch(base,q,limit);
  }catch(directError){
    try{
      let session=await createHitmotopSession(origin);
      let response=await fetchHitmotopSession(search.href,session.jar,origin,{
        headers:{...HITMOTOP_HEADERS,referer:session.referer},
        signal:AbortSignal.timeout(6500)
      });

      if(response.status===403){
        session=await createHitmotopSession(origin,{refresh:true});
        response=await fetchHitmotopSession(search.href,session.jar,origin,{
          headers:{...HITMOTOP_HEADERS,referer:session.referer},
          signal:AbortSignal.timeout(6500)
        });
      }

      const html=await response.text();
      if(!response.ok)throw Error("Hitmo search HTTP "+response.status);
      const tracks=parseHitmotopSearch(html,new URL(response.url||search.href).origin,limit);
      if(!tracks.length)throw Error("Hitmo search returned no parsable tracks");
      return tracks;
    }catch(sessionError){
      throw Error((directError?.message||"Hitmo direct search failed")+"; "+(sessionError?.message||"Hitmo session failed"));
    }
  }
}
export async function searchHitmotop(q,limit=10){
  const query=String(q||"").trim();
  if(!query)return [];
  const errors=[];
  for(const base of HITMOTOP_BASES){
    try{
      const tracks=await searchOnBase(base,query,limit);
      if(tracks.length)return tracks;
    }catch(error){
      errors.push(new URL(base).hostname+": "+(error?.message||"request failed"));
    }
  }
  throw Error("Hitmo unavailable ("+errors.join("; ")+")");
}
export async function resolveHitmotopPlaybackUrl(rawUrl){
  let target;
  try{target=new URL(rawUrl)}catch{throw Error("Invalid Hitmotop audio URL")}
  const host=target.hostname.toLowerCase();
  const allowed=[
    "rus.hitmotop.com","hitmotop.com","hitmos.me","hitmos.fm","rus.hitmos.fm","eu.hitmoz.com","ru.hitmoz.org","rus.hitmoz.org"
  ].some(base=>host===base||host.endsWith("."+base));
  if(!allowed||!/^https?:$/.test(target.protocol))throw Error("Hitmotop audio host is not allowed");

  let session=await createHitmotopSession(target.origin);
  const headers={
    ...HITMOTOP_HEADERS,
    accept:"audio/mpeg,audio/*,*/*;q=0.8",
    referer:session.referer
  };

  try{
    let probe=await fetchHitmotopSession(target.href,session.jar,target.origin,{
      method:"HEAD",
      headers,
      signal:AbortSignal.timeout(4500)
    });
    if(probe.status===403){
      session=await createHitmotopSession(target.origin,{refresh:true});
      probe=await fetchHitmotopSession(target.href,session.jar,target.origin,{
        method:"HEAD",
        headers:{...headers,referer:session.referer},
        signal:AbortSignal.timeout(4500)
      });
    }
    if(probe.ok)return probe.url||target.href;
  }catch{}

  try{
    const probe=await fetchHitmotopSession(target.href,session.jar,target.origin,{
      headers:{
        ...HITMOTOP_HEADERS,
        accept:"audio/mpeg,audio/*,*/*;q=0.8",
        range:"bytes=0-0",
        referer:session.referer
      },
      signal:AbortSignal.timeout(4500)
    });
    const finalUrl=probe.url||target.href;
    const contentType=(probe.headers.get("content-type")||"").toLowerCase();
    const audioLike=probe.ok&&(
      contentType.startsWith("audio/")||
      contentType.includes("mpeg")||
      contentType.includes("octet-stream")||
      !contentType
    );
    try{await probe.body?.cancel()}catch{}
    if(audioLike)return finalUrl;
  }catch{}

  return target.href;
}
